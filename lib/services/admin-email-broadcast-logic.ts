export type AdminEmailAudience = "all_users" | "digest_subscribers"

export type BroadcastRecipient = {
  userId: string
  email: string
}

export type AuthEmailUser = {
  id: string
  email?: string | null
}

export type DigestPreference = {
  user_id: string
  email_enabled?: boolean | null
  digest_frequency?: "daily" | "weekly" | "never" | null
}

export type BroadcastInput = {
  audience: AdminEmailAudience
  subject: string
  heading: string | null
  message: string
  ctaLabel: string | null
  ctaUrl: string | null
}

export type BroadcastEmailTemplate = {
  subject: string
  htmlContent: string
  textContent: string
}

export type BroadcastDeliveryStatus = "sent" | "failed" | "skipped"

export type BroadcastDeliveryResult = {
  total: number
  sent: number
  failed: number
  skipped: number
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normaliseOptional(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : ""
  return text || null
}

export function isValidBroadcastId(value: string) {
  return UUID_PATTERN.test(value)
}

export function isValidAccountEmail(value: string | null | undefined) {
  return Boolean(value && EMAIL_PATTERN.test(value.trim()))
}

export function resolveBroadcastRecipients({
  users,
  preferences,
  audience,
  defaultEmailEnabled,
  defaultDigestFrequency,
}: {
  users: AuthEmailUser[]
  preferences: DigestPreference[]
  audience: AdminEmailAudience
  defaultEmailEnabled: boolean
  defaultDigestFrequency: "daily" | "weekly" | "never"
}) {
  const preferenceByUserId = new Map(
    preferences.map((preference) => [preference.user_id, preference])
  )
  const seenEmails = new Set<string>()
  const recipients: BroadcastRecipient[] = []

  for (const user of users) {
    const email = user.email?.trim()
    if (!isValidAccountEmail(email)) continue

    if (audience === "digest_subscribers") {
      const preference = preferenceByUserId.get(user.id)
      const emailEnabled =
        preference?.email_enabled ?? defaultEmailEnabled
      const digestFrequency =
        preference?.digest_frequency ?? defaultDigestFrequency

      if (!emailEnabled || digestFrequency === "never") continue
    }

    const normalisedEmail = email!.toLowerCase()
    if (seenEmails.has(normalisedEmail)) continue

    seenEmails.add(normalisedEmail)
    recipients.push({
      userId: user.id,
      email: email!,
    })
  }

  return recipients
}

export function resolveAdminTestRecipient(user: AuthEmailUser) {
  const email = user.email?.trim()

  if (!isValidAccountEmail(email)) return null

  return {
    userId: user.id,
    email: email!,
  } satisfies BroadcastRecipient
}

export function validateBroadcastInput(formData: FormData):
  | { ok: true; value: BroadcastInput }
  | { ok: false; error: string } {
  const audienceValue = formData.get("audience")
  const audience =
    audienceValue === "all_users" || audienceValue === "digest_subscribers"
      ? audienceValue
      : null
  const subject = normaliseOptional(formData.get("subject"))
  const heading = normaliseOptional(formData.get("heading"))
  const message = normaliseOptional(formData.get("message"))
  const ctaLabel = normaliseOptional(formData.get("cta_label"))
  const ctaUrl = normaliseOptional(formData.get("cta_url"))

  if (!audience) return { ok: false, error: "Choose a valid audience." }
  if (!subject) return { ok: false, error: "Subject is required." }
  if (subject.length > 200) {
    return { ok: false, error: "Subject must be 200 characters or fewer." }
  }
  if (heading && heading.length > 200) {
    return { ok: false, error: "Heading must be 200 characters or fewer." }
  }
  if (!message) return { ok: false, error: "Message is required." }
  if (message.length > 20_000) {
    return { ok: false, error: "Message must be 20,000 characters or fewer." }
  }
  if (ctaLabel && ctaLabel.length > 100) {
    return { ok: false, error: "Button label must be 100 characters or fewer." }
  }
  if (ctaUrl && ctaUrl.length > 2_000) {
    return { ok: false, error: "Button URL must be 2,000 characters or fewer." }
  }
  if (Boolean(ctaLabel) !== Boolean(ctaUrl)) {
    return {
      ok: false,
      error: "Provide both a button label and button URL, or leave both blank.",
    }
  }
  if (ctaUrl && !isSafeCtaUrl(ctaUrl)) {
    return {
      ok: false,
      error: "Button URL must be an internal path or a valid https URL.",
    }
  }

  return {
    ok: true,
    value: {
      audience,
      subject,
      heading,
      message,
      ctaLabel,
      ctaUrl,
    },
  }
}

export function isSafeCtaUrl(value: string) {
  if (/[\u0000-\u001f\u007f]/.test(value) || value.includes("\\")) {
    return false
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return true
  }

  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function normaliseSiteUrl(value: string) {
  const url = new URL(value)

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("The site URL must use http or https.")
  }

  return url.toString().replace(/\/$/, "")
}

export function resolveEmailLink(value: string, siteUrl: string) {
  if (!isSafeCtaUrl(value)) {
    throw new Error("Unsafe email link.")
  }

  if (value.startsWith("/")) {
    return `${normaliseSiteUrl(siteUrl)}${value}`
  }

  return value
}

export function buildAdminBroadcastEmail({
  input,
  siteUrl,
}: {
  input: BroadcastInput
  siteUrl: string
}): BroadcastEmailTemplate {
  const canonicalSiteUrl = normaliseSiteUrl(siteUrl)
  const settingsUrl = `${canonicalSiteUrl}/dashboard?communication_settings=open`
  const ctaUrl = input.ctaUrl
    ? resolveEmailLink(input.ctaUrl, canonicalSiteUrl)
    : null
  const paragraphs = input.message
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const htmlParagraphs = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;color:#34372b;font-size:16px;line-height:1.65;">${escapeEmailHtml(paragraph).replaceAll("\n", "<br>")}</p>`
    )
    .join("")
  const headingHtml = input.heading
    ? `<h1 style="margin:0 0 24px;color:#25281f;font-family:Georgia,serif;font-size:30px;line-height:1.2;">${escapeEmailHtml(input.heading)}</h1>`
    : ""
  const ctaHtml =
    input.ctaLabel && ctaUrl
      ? `<p style="margin:28px 0 8px;"><a href="${escapeEmailHtml(ctaUrl)}" style="display:inline-block;border-radius:999px;background:#66733f;color:#ffffff;font-size:15px;font-weight:700;padding:12px 20px;text-decoration:none;">${escapeEmailHtml(input.ctaLabel)}</a></p>`
      : ""
  const textSections = [
    "Tunes",
    input.heading,
    paragraphs.join("\n\n"),
    input.ctaLabel && ctaUrl ? `${input.ctaLabel}: ${ctaUrl}` : null,
    `You're receiving this email because you have a Tunes account.`,
    `Communication Settings: ${settingsUrl}`,
  ].filter((section): section is string => Boolean(section))

  return {
    subject: input.subject,
    htmlContent: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeEmailHtml(input.subject)}</title>
  </head>
  <body style="margin:0;background:#f3f1e8;color:#34372b;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f1e8;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border:1px solid #d8d5c5;border-radius:20px;background:#fffdf7;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;border-bottom:1px solid #e3e0d2;color:#66733f;font-family:Georgia,serif;font-size:24px;font-weight:700;">Tunes</td>
            </tr>
            <tr>
              <td style="padding:34px 28px 28px;">
                ${headingHtml}
                ${htmlParagraphs}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;border-top:1px solid #e3e0d2;color:#747767;font-size:12px;line-height:1.6;">
                You&#39;re receiving this email because you have a Tunes account.<br>
                <a href="${escapeEmailHtml(settingsUrl)}" style="color:#66733f;">Communication Settings</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    textContent: textSections.join("\n\n"),
  }
}

export async function mapWithConcurrency<T, TResult>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<TResult>
) {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("Concurrency must be a positive integer.")
  }

  const results = new Array<TResult>(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(items[index], index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, runWorker)
  )

  return results
}

export async function deliverBroadcastRecipients(
  recipients: BroadcastRecipient[],
  deliver: (
    recipient: BroadcastRecipient
  ) => Promise<BroadcastDeliveryStatus>,
  concurrency = 4
): Promise<BroadcastDeliveryResult> {
  const statuses = await mapWithConcurrency(
    recipients,
    concurrency,
    async (recipient) => {
      try {
        return await deliver(recipient)
      } catch {
        return "failed" as const
      }
    }
  )

  return statuses.reduce<BroadcastDeliveryResult>(
    (result, status) => ({
      ...result,
      [status]: result[status] + 1,
    }),
    {
      total: recipients.length,
      sent: 0,
      failed: 0,
      skipped: 0,
    }
  )
}

export async function executeBroadcastOnce<TResult>({
  claim,
  execute,
}: {
  claim: () => Promise<boolean>
  execute: () => Promise<TResult>
}): Promise<
  | { duplicate: true; result: null }
  | { duplicate: false; result: TResult }
> {
  const claimed = await claim()

  if (!claimed) {
    return { duplicate: true, result: null }
  }

  return {
    duplicate: false,
    result: await execute(),
  }
}
