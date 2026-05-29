import "server-only"

import { sendTransactionalEmail } from "@/lib/services/email"
import {
  buildNotificationDigestEmailTemplate,
  type NotificationDigestFrequency,
  type NotificationDigestItem,
} from "@/lib/services/email-templates"
import {
  createAdminClient,
  getUserEmailForNotificationRecipient,
} from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type DigestEligibleNotificationType =
  | "comment_reply"
  | "activity_reply"
  | "badge_awarded"

type DigestPreferenceRow = {
  user_id: string
  digest_frequency: NotificationDigestFrequency
  email_comment_replies: boolean
  email_activity_replies: boolean
  email_badges: boolean
}

type DigestNotificationRow = {
  id: number
  recipient_user_id: string
  actor_user_id: string | null
  notification_type: DigestEligibleNotificationType
  body_preview: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

export type NotificationDigestRunSummary = {
  ok: boolean
  usersChecked: number
  digestsSent: number
  skipped: number
  failed: number
}

const digestEligibleTypes: DigestEligibleNotificationType[] = [
  "comment_reply",
  "activity_reply",
  "badge_awarded",
]

function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "")
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`
  }

  return null
}

function absoluteUrl(path: string) {
  const siteUrl = getSiteUrl()
  if (!siteUrl) return null
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function getProviderMessageId(result: unknown) {
  if (!result || typeof result !== "object") return null

  const maybeMessageId = (result as { messageId?: unknown }).messageId
  return typeof maybeMessageId === "string" ? maybeMessageId : null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

function windowStart(frequency: NotificationDigestFrequency) {
  const now = Date.now()
  const hours = frequency === "daily" ? 24 : 24 * 7
  return new Date(now - hours * 60 * 60 * 1000).toISOString()
}

function isPreferenceEnabledForNotification(
  preferences: DigestPreferenceRow,
  notificationType: DigestEligibleNotificationType
) {
  if (notificationType === "comment_reply") {
    return preferences.email_comment_replies
  }

  if (notificationType === "activity_reply") {
    return preferences.email_activity_replies
  }

  return preferences.email_badges
}

function profileLabel(profile: ProfileRow | null | undefined) {
  return profile?.display_name || profile?.username || "Someone"
}

async function loadDigestPreferences(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      `
        user_id,
        digest_frequency,
        email_comment_replies,
        email_activity_replies,
        email_badges
      `
    )
    .eq("email_enabled", true)
    .in("digest_frequency", ["daily", "weekly"])

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as DigestPreferenceRow[]
}

async function loadDigestNotifications({
  supabase,
  preferences,
}: {
  supabase: SupabaseServerClient
  preferences: DigestPreferenceRow
}) {
  const { data, error } = await supabase
    .from("user_notifications")
    .select(
      `
        id,
        recipient_user_id,
        actor_user_id,
        notification_type,
        body_preview,
        created_at
      `
    )
    .eq("recipient_user_id", preferences.user_id)
    .in("notification_type", digestEligibleTypes)
    .gte("created_at", windowStart(preferences.digest_frequency))
    .is("digest_email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as DigestNotificationRow[]).filter((notification) =>
    isPreferenceEnabledForNotification(
      preferences,
      notification.notification_type
    )
  )
}

async function loadActorProfiles(
  supabase: SupabaseServerClient,
  notifications: DigestNotificationRow[]
) {
  const actorIds = Array.from(
    new Set(
      notifications
        .map((notification) => notification.actor_user_id)
        .filter((actorId): actorId is string => Boolean(actorId))
    )
  )

  if (actorIds.length === 0) {
    return new Map<string, ProfileRow>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", actorIds)

  if (error) {
    console.error("Error loading digest actor profiles:", error)
    return new Map<string, ProfileRow>()
  }

  return new Map(
    ((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  )
}

async function insertDigestDeliveryLog({
  supabase,
  recipientUserId,
  frequency,
  toEmail,
  status,
  providerMessageId = null,
  errorMessage = null,
}: {
  supabase: SupabaseServerClient
  recipientUserId: string
  frequency: NotificationDigestFrequency
  toEmail?: string | null
  status: "skipped" | "sent" | "failed"
  providerMessageId?: string | null
  errorMessage?: string | null
}) {
  const now = new Date().toISOString()
  const templateKey = `${frequency}_notification_digest`

  const { data, error } = await supabase
    .from("email_delivery_log")
    .insert({
      notification_id: null,
      recipient_user_id: recipientUserId,
      notification_type: "notification_digest",
      template_key: templateKey,
      to_email: toEmail ?? null,
      status,
      provider: "brevo",
      provider_message_id: providerMessageId,
      error_message: errorMessage,
      created_at: now,
      sent_at: status === "sent" ? now : null,
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("Error inserting digest email delivery log:", {
      recipientUserId,
      frequency,
      status,
      error,
    })
    return null
  }

  return data.id as number
}

async function markNotificationsDigestSent({
  supabase,
  notificationIds,
  deliveryLogId,
}: {
  supabase: SupabaseServerClient
  notificationIds: number[]
  deliveryLogId: number
}) {
  const { error } = await supabase
    .from("user_notifications")
    .update({
      digest_email_sent_at: new Date().toISOString(),
      digest_email_log_id: deliveryLogId,
    })
    .in("id", notificationIds)

  if (error) {
    throw new Error(error.message)
  }
}

async function processDigestForUser({
  supabase,
  preferences,
}: {
  supabase: SupabaseServerClient
  preferences: DigestPreferenceRow
}) {
  const notifications = await loadDigestNotifications({ supabase, preferences })

  if (notifications.length === 0) {
    return "skipped" as const
  }

  let toEmail: string | null = null

  try {
    toEmail = await getUserEmailForNotificationRecipient(preferences.user_id)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    await insertDigestDeliveryLog({
      supabase,
      recipientUserId: preferences.user_id,
      frequency: preferences.digest_frequency,
      status: "skipped",
      errorMessage: `Recipient email lookup failed: ${errorMessage}`,
    })

    console.error("Digest recipient email lookup failed:", {
      recipientUserId: preferences.user_id,
      error,
    })

    return "skipped" as const
  }

  if (!toEmail) {
    await insertDigestDeliveryLog({
      supabase,
      recipientUserId: preferences.user_id,
      frequency: preferences.digest_frequency,
      status: "skipped",
      errorMessage: "Recipient email unavailable from Supabase Auth.",
    })
    return "skipped" as const
  }

  const actorProfiles = await loadActorProfiles(supabase, notifications)
  const items: NotificationDigestItem[] = notifications.map((notification) => ({
    type: notification.notification_type,
    actorName: profileLabel(
      notification.actor_user_id
        ? actorProfiles.get(notification.actor_user_id)
        : null
    ),
    bodyPreview: notification.body_preview,
  }))
  const template = buildNotificationDigestEmailTemplate({
    frequency: preferences.digest_frequency,
    items,
    targetUrl: absoluteUrl("/inbox"),
  })

  try {
    const result = await sendTransactionalEmail({
      to: toEmail,
      ...template,
    })
    const deliveryLogId = await insertDigestDeliveryLog({
      supabase,
      recipientUserId: preferences.user_id,
      frequency: preferences.digest_frequency,
      toEmail,
      status: "sent",
      providerMessageId: getProviderMessageId(result),
    })

    if (!deliveryLogId) {
      return "failed" as const
    }

    await markNotificationsDigestSent({
      supabase,
      notificationIds: notifications.map((notification) => notification.id),
      deliveryLogId,
    })

    return "sent" as const
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    await insertDigestDeliveryLog({
      supabase,
      recipientUserId: preferences.user_id,
      frequency: preferences.digest_frequency,
      toEmail,
      status: "failed",
      errorMessage,
    })

    console.error("Notification digest failed:", {
      recipientUserId: preferences.user_id,
      frequency: preferences.digest_frequency,
      error,
    })

    return "failed" as const
  }
}

export async function processNotificationDigests(): Promise<NotificationDigestRunSummary> {
  const supabase = createAdminClient() as unknown as SupabaseServerClient
  const preferences = await loadDigestPreferences(supabase)
  const summary: NotificationDigestRunSummary = {
    ok: true,
    usersChecked: preferences.length,
    digestsSent: 0,
    skipped: 0,
    failed: 0,
  }

  for (const preference of preferences) {
    try {
      const result = await processDigestForUser({
        supabase,
        preferences: preference,
      })

      if (result === "sent") {
        summary.digestsSent += 1
      } else if (result === "failed") {
        summary.failed += 1
      } else {
        summary.skipped += 1
      }
    } catch (error) {
      summary.failed += 1
      console.error("Notification digest user processing failed:", {
        recipientUserId: preference.user_id,
        error,
      })
    }
  }

  summary.ok = summary.failed === 0
  return summary
}
