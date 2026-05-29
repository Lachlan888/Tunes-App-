import "server-only"

export type NotificationEmailTemplateKey =
  | "friend_request_received"
  | "direct_message"
  | "comment_reply"
  | "activity_reply"
  | "setlist_invite"
  | "badge_awarded"
  | "generic_notification"

export type NotificationEmailTemplateInput = {
  actorName?: string | null
  bodyPreview?: string | null
  targetUrl?: string | null
}

export type NotificationEmailTemplate = {
  subject: string
  htmlContent: string
  textContent: string
}

const preferencesFooter =
  "You can change email preferences from your Profile page."

function cleanText(value: string | null | undefined, fallback: string) {
  const trimmed = value?.replace(/\s+/g, " ").trim()
  return trimmed || fallback
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildTemplate({
  subject,
  message,
  targetUrl,
  actionLabel = "Open Tunes App",
}: {
  subject: string
  message: string
  targetUrl?: string | null
  actionLabel?: string
}): NotificationEmailTemplate {
  const actionText = targetUrl ? `\n\n${actionLabel}: ${targetUrl}` : ""

  const htmlAction = targetUrl
    ? `<p><a href="${escapeHtml(targetUrl)}">${escapeHtml(actionLabel)}</a></p>`
    : ""

  return {
    subject,
    textContent: `${message}${actionText}\n\n${preferencesFooter}`,
    htmlContent: [
      `<p>${escapeHtml(message)}</p>`,
      htmlAction,
      `<p>${escapeHtml(preferencesFooter)}</p>`,
    ]
      .filter(Boolean)
      .join(""),
  }
}

export function buildFriendRequestReceivedEmail({
  actorName,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")

  return buildTemplate({
    subject: `${name} sent you a friend request`,
    message: `${name} sent you a friend request on Tunes App.`,
    targetUrl,
    actionLabel: "View friend request",
  })
}

export function buildDirectMessageEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You have a new direct message.")

  return buildTemplate({
    subject: `${name} sent you a message`,
    message: `${name} sent you a message: ${preview}`,
    targetUrl,
    actionLabel: "Open inbox",
  })
}

export function buildCommentReplyEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You have a new comment reply.")

  return buildTemplate({
    subject: `${name} replied to your tune comment`,
    message: `${name} replied to your tune comment: ${preview}`,
    targetUrl,
    actionLabel: "View comment",
  })
}

export function buildActivityReplyEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You have a new activity reply.")

  return buildTemplate({
    subject: `${name} replied to your activity`,
    message: `${name} replied to your activity: ${preview}`,
    targetUrl,
    actionLabel: "View activity",
  })
}

export function buildSetlistInviteEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You were invited to a setlist.")

  return buildTemplate({
    subject: `${name} invited you to a setlist`,
    message: `${name} invited you to a setlist. ${preview}`,
    targetUrl,
    actionLabel: "View setlist invite",
  })
}

export function buildBadgeAwardedEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You received a badge.")

  return buildTemplate({
    subject: `${name} awarded you a badge`,
    message: `${name} awarded you a badge. ${preview}`,
    targetUrl,
    actionLabel: "View badge",
  })
}

export function buildGenericNotificationEmail({
  actorName,
  bodyPreview,
  targetUrl,
}: NotificationEmailTemplateInput) {
  const name = cleanText(actorName, "Someone")
  const preview = cleanText(bodyPreview, "You have a new notification.")

  return buildTemplate({
    subject: "New Tunes App notification",
    message: `${name}: ${preview}`,
    targetUrl,
    actionLabel: "Open notification",
  })
}

export function buildNotificationEmailTemplate(
  templateKey: NotificationEmailTemplateKey,
  input: NotificationEmailTemplateInput
) {
  if (templateKey === "friend_request_received") {
    return buildFriendRequestReceivedEmail(input)
  }

  if (templateKey === "direct_message") {
    return buildDirectMessageEmail(input)
  }

  if (templateKey === "comment_reply") {
    return buildCommentReplyEmail(input)
  }

  if (templateKey === "activity_reply") {
    return buildActivityReplyEmail(input)
  }

  if (templateKey === "setlist_invite") {
    return buildSetlistInviteEmail(input)
  }

  if (templateKey === "badge_awarded") {
    return buildBadgeAwardedEmail(input)
  }

  return buildGenericNotificationEmail(input)
}
