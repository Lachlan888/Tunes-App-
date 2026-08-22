import "server-only"

import {
  buildAdminBroadcastEmail,
  deliverBroadcastRecipients,
  executeBroadcastOnce,
  resolveAdminTestRecipient,
  resolveBroadcastRecipients,
  type AdminEmailAudience,
  type BroadcastDeliveryStatus,
  type BroadcastInput,
  type BroadcastRecipient,
  type DigestPreference,
} from "@/lib/services/admin-email-broadcast-logic"
import { sendTransactionalEmail } from "@/lib/services/email"
import { createAdminClient } from "@/lib/supabase/admin"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types"

const AUTH_USERS_PAGE_SIZE = 1_000
const BROADCAST_CONCURRENCY = 4

export type AdminEmailRecipientCounts = Record<AdminEmailAudience, number>

export type AdminEmailBroadcastHistoryRow = {
  id: string
  audience: AdminEmailAudience
  subject: string
  recipient_count: number
  sent_count: number
  failed_count: number
  skipped_count: number
  status: "processing" | "completed" | "failed"
  created_at: string
  completed_at: string | null
}

export type AdminEmailToolData = {
  recipientCounts: AdminEmailRecipientCounts
  recentBroadcasts: AdminEmailBroadcastHistoryRow[]
}

export type AdminEmailBroadcastResult = {
  total: number
  sent: number
  failed: number
  skipped: number
}

type AuthUser = {
  id: string
  email?: string | null
}

function getCanonicalSiteUrl() {
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

function getProviderMessageId(result: unknown) {
  if (!result || typeof result !== "object") return null

  const messageId = (result as { messageId?: unknown }).messageId
  return typeof messageId === "string" ? messageId : null
}

function getSanitisedErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500)
  return "Unknown email delivery error"
}

async function loadAllAuthUsers() {
  const supabaseAdmin = createAdminClient()
  const users: AuthUser[] = []
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    })

    if (error) {
      throw new Error(`Could not load auth users: ${error.message}`)
    }

    const pageUsers = data.users.map((user) => ({
      id: user.id,
      email: user.email,
    }))
    users.push(...pageUsers)

    if (pageUsers.length < AUTH_USERS_PAGE_SIZE) break
    page += 1
  }

  return users
}

async function loadDigestPreferences() {
  const supabaseAdmin = createAdminClient()
  const preferences: DigestPreference[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("user_id,email_enabled,digest_frequency")
      .order("user_id", { ascending: true })
      .range(from, from + AUTH_USERS_PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Could not load notification preferences: ${error.message}`)
    }

    const rows = (data ?? []) as DigestPreference[]
    preferences.push(...rows)

    if (rows.length < AUTH_USERS_PAGE_SIZE) break
    from += AUTH_USERS_PAGE_SIZE
  }

  return preferences
}

function selectRecipients(
  users: AuthUser[],
  preferences: DigestPreference[],
  audience: AdminEmailAudience
) {
  return resolveBroadcastRecipients({
    users,
    preferences,
    audience,
    defaultEmailEnabled: DEFAULT_NOTIFICATION_PREFERENCES.email_enabled,
    defaultDigestFrequency:
      DEFAULT_NOTIFICATION_PREFERENCES.digest_frequency,
  })
}

export async function loadAdminEmailRecipients(
  audience: AdminEmailAudience
) {
  const [users, preferences] = await Promise.all([
    loadAllAuthUsers(),
    audience === "digest_subscribers"
      ? loadDigestPreferences()
      : Promise.resolve([]),
  ])

  return selectRecipients(users, preferences, audience)
}

async function loadRecentBroadcasts() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("admin_email_broadcasts")
    .select(
      "id,audience,subject,recipient_count,sent_count,failed_count,skipped_count,status,created_at,completed_at"
    )
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    if (error.code === "42P01") {
      console.warn(
        "Admin email broadcast history is unavailable until its migration is applied."
      )
      return []
    }

    throw new Error(`Could not load broadcast history: ${error.message}`)
  }

  return (data ?? []) as AdminEmailBroadcastHistoryRow[]
}

export async function loadAdminEmailToolData(): Promise<AdminEmailToolData> {
  const [users, preferences, recentBroadcasts] = await Promise.all([
    loadAllAuthUsers(),
    loadDigestPreferences(),
    loadRecentBroadcasts(),
  ])

  return {
    recipientCounts: {
      all_users: selectRecipients(users, preferences, "all_users").length,
      digest_subscribers: selectRecipients(
        users,
        preferences,
        "digest_subscribers"
      ).length,
    },
    recentBroadcasts,
  }
}

async function writeDeliveryLog({
  broadcastId,
  recipient,
  subject,
  status,
  providerMessageId = null,
  errorMessage = null,
  testSend,
}: {
  broadcastId: string | null
  recipient: BroadcastRecipient
  subject: string
  status: BroadcastDeliveryStatus
  providerMessageId?: string | null
  errorMessage?: string | null
  testSend: boolean
}) {
  const supabaseAdmin = createAdminClient()
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from("email_delivery_log").insert(
    {
      notification_id: null,
      recipient_user_id: recipient.userId,
      notification_type: "product_update",
      template_key: testSend
        ? "admin_product_update_test"
        : "admin_product_update",
      to_email: recipient.email,
      subject,
      provider: "brevo",
      status,
      provider_message_id: providerMessageId,
      error_message: errorMessage,
      admin_broadcast_id: broadcastId,
      created_at: now,
      sent_at: status === "sent" ? now : null,
    } as never
  )

  if (error) {
    console.error("Admin email delivery log write failed:", {
      broadcastId,
      recipientUserId: recipient.userId,
      status,
      code: error.code,
    })
  }
}

async function deliverOne({
  broadcastId,
  recipient,
  input,
  siteUrl,
  testSend,
}: {
  broadcastId: string | null
  recipient: BroadcastRecipient
  input: BroadcastInput
  siteUrl: string
  testSend: boolean
}): Promise<BroadcastDeliveryStatus> {
  const template = buildAdminBroadcastEmail({ input, siteUrl })

  try {
    const result = await sendTransactionalEmail({
      to: recipient.email,
      ...template,
    })

    await writeDeliveryLog({
      broadcastId,
      recipient,
      subject: input.subject,
      status: "sent",
      providerMessageId: getProviderMessageId(result),
      testSend,
    })
    return "sent"
  } catch (error) {
    const errorMessage = getSanitisedErrorMessage(error)
    await writeDeliveryLog({
      broadcastId,
      recipient,
      subject: input.subject,
      status: "failed",
      errorMessage,
      testSend,
    })
    console.error("Admin product-update email delivery failed:", {
      broadcastId,
      recipientUserId: recipient.userId,
      error: errorMessage,
    })
    return "failed"
  }
}

export async function sendAdminEmailTest({
  adminUser,
  input,
}: {
  adminUser: AuthUser
  input: BroadcastInput
}) {
  const recipient = resolveAdminTestRecipient(adminUser)
  if (!recipient) {
    return {
      ok: false as const,
      email: null,
      error: "Your admin account does not have a valid email address.",
    }
  }

  const siteUrl = getCanonicalSiteUrl()
  if (!siteUrl) {
    return {
      ok: false as const,
      email: recipient.email,
      error: "The site URL is not configured.",
    }
  }

  const status = await deliverOne({
    broadcastId: null,
    recipient,
    input,
    siteUrl,
    testSend: true,
  })

  return status === "sent"
    ? { ok: true as const, email: recipient.email }
    : {
        ok: false as const,
        email: recipient.email,
        error: "The test email could not be sent. Check the server logs.",
      }
}

async function claimBroadcast({
  broadcastId,
  createdByUserId,
  input,
  recipientCount,
}: {
  broadcastId: string
  createdByUserId: string
  input: BroadcastInput
  recipientCount: number
}) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("admin_email_broadcasts")
    .insert({
      id: broadcastId,
      created_by_user_id: createdByUserId,
      audience: input.audience,
      subject: input.subject,
      heading: input.heading,
      message: input.message,
      cta_label: input.ctaLabel,
      cta_url: input.ctaUrl,
      recipient_count: recipientCount,
      status: "processing",
      started_at: new Date().toISOString(),
    } as never)

  if (!error) return true
  if (error.code === "23505") return false

  throw new Error(`Could not create the broadcast record: ${error.message}`)
}

async function completeBroadcast(
  broadcastId: string,
  result: AdminEmailBroadcastResult
) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("admin_email_broadcasts")
    .update({
      sent_count: result.sent,
      failed_count: result.failed,
      skipped_count: result.skipped,
      status:
        result.failed === result.total && result.total > 0
          ? "failed"
          : "completed",
      completed_at: new Date().toISOString(),
    } as never)
    .eq("id", broadcastId)
    .eq("status", "processing")

  if (error) {
    throw new Error(`Could not complete the broadcast record: ${error.message}`)
  }
}

export async function sendAdminEmailBroadcast({
  broadcastId,
  createdByUserId,
  input,
}: {
  broadcastId: string
  createdByUserId: string
  input: BroadcastInput
}): Promise<
  | { duplicate: true; result: null }
  | { duplicate: false; result: AdminEmailBroadcastResult }
> {
  const siteUrl = getCanonicalSiteUrl()
  if (!siteUrl) {
    throw new Error("The site URL is not configured.")
  }

  const recipients = await loadAdminEmailRecipients(input.audience)

  return await executeBroadcastOnce({
    claim: () =>
      claimBroadcast({
        broadcastId,
        createdByUserId,
        input,
        recipientCount: recipients.length,
      }),
    execute: async () => {
      const result = await deliverBroadcastRecipients(
        recipients,
        (recipient) =>
          deliverOne({
            broadcastId,
            recipient,
            input,
            siteUrl,
            testSend: false,
          }),
        BROADCAST_CONCURRENCY
      )

      await completeBroadcast(broadcastId, result)
      return result
    },
  })
}
