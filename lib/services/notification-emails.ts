import "server-only"

import { sendTransactionalEmail } from "@/lib/services/email"
import {
  buildNotificationEmailTemplate,
  type NotificationEmailTemplateKey,
} from "@/lib/services/email-templates"
import {
  createAdminClient,
  getUserEmailForNotificationRecipient,
} from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type NotificationEmailStatus = "skipped" | "sent" | "failed"

type NotificationEmailResult = {
  ok: boolean
  status: NotificationEmailStatus
  reason?: string
  notificationId?: number | null
  providerMessageId?: string | null
}

type UserNotificationRow = {
  id: number
  recipient_user_id: string
  actor_user_id: string | null
  notification_type: string
  activity_event_id: number | null
  activity_reaction_id: number | null
  activity_reply_id: number | null
  direct_message_id: number | null
  piece_id: number | null
  learning_list_id: number | null
  setlist_id: number | null
  setlist_item_id: number | null
  comment_id: number | null
  badge_id: number | null
  body_preview: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type ContextRows = {
  actor: ProfileRow | null
  piece: { id: number; title: string } | null
  learningList: { id: number; name: string } | null
  setlist: { id: number; name: string } | null
  badge: { id: number; name: string; slug: string } | null
}

const notificationSelect = `
  id,
  recipient_user_id,
  actor_user_id,
  notification_type,
  activity_event_id,
  activity_reaction_id,
  activity_reply_id,
  direct_message_id,
  piece_id,
  learning_list_id,
  setlist_id,
  setlist_item_id,
  comment_id,
  badge_id,
  body_preview,
  created_at
`

const preferenceFieldByNotificationType: Partial<
  Record<string, keyof NotificationPreferences>
> = {
  friend_request_received: "email_friend_requests",
  direct_message: "email_direct_messages",
  comment_reply: "email_comment_replies",
  activity_reply: "email_activity_replies",
  setlist_invite: "email_setlist_invites",
  badge_awarded: "email_badges",
  badge_request_received: "email_badges",
  practice_reminder_due: "email_practice_reminders",
  weekly_practice_summary: "email_weekly_summary",
  public_list_activity: "email_public_list_activity",
  product_update: "email_product_updates",
}

const templateKeyByNotificationType: Partial<
  Record<string, NotificationEmailTemplateKey>
> = {
  friend_request_received: "friend_request_received",
  direct_message: "direct_message",
  comment_reply: "comment_reply",
  activity_reply: "activity_reply",
  setlist_invite: "setlist_invite",
  badge_awarded: "badge_awarded",
}

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

function absoluteUrl(path: string | null) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path

  const siteUrl = getSiteUrl()
  if (!siteUrl) return null

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function getActorName(actor: ProfileRow | null) {
  return actor?.display_name || actor?.username || "Someone"
}

function getTemplateKey(notificationType: string): NotificationEmailTemplateKey {
  return templateKeyByNotificationType[notificationType] ?? "generic_notification"
}

function getPreferenceField(notificationType: string) {
  return preferenceFieldByNotificationType[notificationType] ?? null
}

function normalisePreferences(
  recipientUserId: string,
  preferences: Partial<NotificationPreferences> | null
): NotificationPreferences {
  return {
    user_id: recipientUserId,
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(preferences ?? {}),
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

function getProviderMessageId(result: unknown) {
  if (!result || typeof result !== "object") return null

  const maybeMessageId = (result as { messageId?: unknown }).messageId
  return typeof maybeMessageId === "string" ? maybeMessageId : null
}

async function insertDeliveryLog({
  supabase,
  notification,
  templateKey,
  toEmail,
  status,
  providerMessageId = null,
  errorMessage = null,
}: {
  supabase: SupabaseServerClient
  notification: UserNotificationRow
  templateKey: NotificationEmailTemplateKey
  toEmail?: string | null
  status: NotificationEmailStatus
  providerMessageId?: string | null
  errorMessage?: string | null
}) {
  const now = new Date().toISOString()

  const { error } = await supabase.from("email_delivery_log").insert({
    notification_id: notification.id,
    recipient_user_id: notification.recipient_user_id,
    notification_type: notification.notification_type,
    template_key: templateKey,
    to_email: toEmail ?? null,
    status,
    provider: "brevo",
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    created_at: now,
    sent_at: status === "sent" ? now : null,
  })

  if (error) {
    console.error("Error inserting email delivery log:", {
      notificationId: notification.id,
      status,
      error,
    })
  }
}

async function loadNotification(
  supabase: SupabaseServerClient,
  notificationId: number
) {
  const { data, error } = await supabase
    .from("user_notifications")
    .select(notificationSelect)
    .eq("id", notificationId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as UserNotificationRow | null) ?? null
}

async function loadNotificationPreferences(
  supabase: SupabaseServerClient,
  recipientUserId: string
) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      `
        user_id,
        email_enabled,
        email_friend_requests,
        email_direct_messages,
        email_comment_replies,
        email_setlist_invites,
        email_badges,
        email_activity_replies,
        email_practice_reminders,
        email_weekly_summary,
        email_public_list_activity,
        email_product_updates,
        digest_frequency,
        created_at,
        updated_at
      `
    )
    .eq("user_id", recipientUserId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return normalisePreferences(
    recipientUserId,
    (data as Partial<NotificationPreferences> | null) ?? null
  )
}

async function loadProfile(
  supabase: SupabaseServerClient,
  userId: string | null
) {
  if (!userId) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error loading profile for notification email:", error)
    return null
  }

  return (data as ProfileRow | null) ?? null
}

async function loadContextRows(
  supabase: SupabaseServerClient,
  notification: UserNotificationRow
): Promise<ContextRows> {
  const [actor, piece, learningList, setlist, badge] = await Promise.all([
    loadProfile(supabase, notification.actor_user_id),
    notification.piece_id
      ? supabase
          .from("pieces")
          .select("id, title")
          .eq("id", notification.piece_id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error loading piece for notification email:", error)
            }
            return (data as ContextRows["piece"]) ?? null
          })
      : Promise.resolve(null),
    notification.learning_list_id
      ? supabase
          .from("learning_lists")
          .select("id, name")
          .eq("id", notification.learning_list_id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error(
                "Error loading list for notification email:",
                error
              )
            }
            return (data as ContextRows["learningList"]) ?? null
          })
      : Promise.resolve(null),
    notification.setlist_id
      ? supabase
          .from("setlists")
          .select("id, name")
          .eq("id", notification.setlist_id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error(
                "Error loading setlist for notification email:",
                error
              )
            }
            return (data as ContextRows["setlist"]) ?? null
          })
      : Promise.resolve(null),
    notification.badge_id
      ? supabase
          .from("badges")
          .select("id, name, slug")
          .eq("id", notification.badge_id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error loading badge for notification email:", error)
            }
            return (data as ContextRows["badge"]) ?? null
          })
      : Promise.resolve(null),
  ])

  return {
    actor,
    piece,
    learningList,
    setlist,
    badge,
  }
}

function buildTargetPath(notification: UserNotificationRow, context: ContextRows) {
  if (context.badge) return `/badges/${context.badge.slug}`
  if (notification.setlist_id) return `/setlists/${notification.setlist_id}`
  if (notification.piece_id) return `/library/${notification.piece_id}`
  if (notification.learning_list_id) {
    return `/public-lists/${notification.learning_list_id}`
  }
  if (notification.notification_type === "direct_message") return "/inbox"
  if (notification.notification_type === "friend_request_received") {
    return "/friends"
  }
  return "/inbox"
}

async function sendNotificationEmail(
  supabase: SupabaseServerClient,
  notification: UserNotificationRow
): Promise<NotificationEmailResult> {
  const templateKey = getTemplateKey(notification.notification_type)

  try {
    const preferenceField = getPreferenceField(notification.notification_type)

    if (!preferenceField) {
      await insertDeliveryLog({
        supabase,
        notification,
        templateKey,
        status: "skipped",
        errorMessage: "No safe email preference mapping for notification type.",
      })

      return {
        ok: true,
        status: "skipped",
        reason: "no_safe_preference_mapping",
        notificationId: notification.id,
      }
    }

    const preferences = await loadNotificationPreferences(
      supabase,
      notification.recipient_user_id
    )

    if (!preferences.email_enabled) {
      await insertDeliveryLog({
        supabase,
        notification,
        templateKey,
        status: "skipped",
        errorMessage: "Email notifications disabled.",
      })

      return {
        ok: true,
        status: "skipped",
        reason: "email_disabled",
        notificationId: notification.id,
      }
    }

    if (!preferences[preferenceField]) {
      await insertDeliveryLog({
        supabase,
        notification,
        templateKey,
        status: "skipped",
        errorMessage: `${String(preferenceField)} disabled.`,
      })

      return {
        ok: true,
        status: "skipped",
        reason: "preference_disabled",
        notificationId: notification.id,
      }
    }

    let toEmail: string | null = null

    try {
      toEmail = await getUserEmailForNotificationRecipient(
        notification.recipient_user_id
      )
    } catch (error) {
      const errorMessage = getErrorMessage(error)

      await insertDeliveryLog({
        supabase,
        notification,
        templateKey,
        status: "skipped",
        errorMessage: `Recipient email lookup failed: ${errorMessage}`,
      })

      console.error("Recipient email lookup failed:", {
        notificationId: notification.id,
        recipientUserId: notification.recipient_user_id,
        error,
      })

      return {
        ok: true,
        status: "skipped",
        reason: "recipient_email_lookup_failed",
        notificationId: notification.id,
      }
    }

    if (!toEmail) {
      await insertDeliveryLog({
        supabase,
        notification,
        templateKey,
        status: "skipped",
        errorMessage: "Recipient email unavailable from Supabase Auth.",
      })

      return {
        ok: true,
        status: "skipped",
        reason: "recipient_email_unavailable",
        notificationId: notification.id,
      }
    }

    const context = await loadContextRows(supabase, notification)
    const targetUrl = absoluteUrl(buildTargetPath(notification, context))
    const template = buildNotificationEmailTemplate(templateKey, {
      actorName: getActorName(context.actor),
      bodyPreview: notification.body_preview,
      targetUrl,
    })

    const result = await sendTransactionalEmail({
      to: toEmail,
      ...template,
    })

    const providerMessageId = getProviderMessageId(result)

    await insertDeliveryLog({
      supabase,
      notification,
      templateKey,
      toEmail,
      status: "sent",
      providerMessageId,
    })

    return {
      ok: true,
      status: "sent",
      notificationId: notification.id,
      providerMessageId,
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)

    await insertDeliveryLog({
      supabase,
      notification,
      templateKey,
      status: "failed",
      errorMessage,
    })

    console.error("Notification email failed:", {
      notificationId: notification.id,
      notificationType: notification.notification_type,
      error,
    })

    return {
      ok: false,
      status: "failed",
      reason: errorMessage,
      notificationId: notification.id,
    }
  }
}

export async function sendNotificationEmailForNotificationId(
  notificationId: number
): Promise<NotificationEmailResult> {
  const supabase = createAdminClient() as unknown as SupabaseServerClient

  try {
    const notification = await loadNotification(supabase, notificationId)

    if (!notification) {
      return {
        ok: false,
        status: "failed",
        reason: "notification_not_found",
        notificationId,
      }
    }

    return await sendNotificationEmail(supabase, notification)
  } catch (error) {
    console.error("Notification email lookup failed:", {
      notificationId,
      error,
    })

    return {
      ok: false,
      status: "failed",
      reason: getErrorMessage(error),
      notificationId,
    }
  }
}

export async function sendNotificationEmailForNotification(
  notification: UserNotificationRow | { id: number }
): Promise<NotificationEmailResult> {
  const supabase = createAdminClient() as unknown as SupabaseServerClient

  try {
    const fullNotification =
      "notification_type" in notification
        ? notification
        : await loadNotification(supabase, notification.id)

    if (!fullNotification) {
      return {
        ok: false,
        status: "failed",
        reason: "notification_not_found",
        notificationId: notification.id,
      }
    }

    return await sendNotificationEmail(supabase, fullNotification)
  } catch (error) {
    console.error("Notification email failed before send:", {
      notificationId: notification.id,
      error,
    })

    return {
      ok: false,
      status: "failed",
      reason: getErrorMessage(error),
      notificationId: notification.id,
    }
  }
}
