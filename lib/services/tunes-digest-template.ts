import type { NotificationDigestFrequency } from "@/lib/types"

export type DigestLinkItem = { label: string; url?: string | null; detail?: string | null; mediaUrl?: string | null }
export type TunesDigest = {
  frequency: Exclude<NotificationDigestFrequency, "never">
  periodLabel: string
  practice?: {
    days: number
    events: number
    distinctTunes: number
    practised: DigestLinkItem[]
    overdue: DigestLinkItem[]
    dueToday: DigestLinkItem[]
    upcoming: DigestLinkItem[]
  }
  friends?: DigestLinkItem[]
  community?: DigestLinkItem[]
  updates?: DigestLinkItem[]
}

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!)

function htmlItems(items: DigestLinkItem[]) {
  return `<ul style="padding-left:20px">${items.map((item) => {
    const label = item.url ? `<a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)
    const detail = item.detail ? ` — ${escapeHtml(item.detail)}` : ""
    const media = item.mediaUrl ? ` · <a href="${escapeHtml(item.mediaUrl)}">Reference</a>` : ""
    return `<li style="margin:8px 0">${label}${detail}${media}</li>`
  }).join("")}</ul>`
}

function textItems(items: DigestLinkItem[]) {
  return items.map((item) => `- ${item.label}${item.detail ? ` — ${item.detail}` : ""}${item.url ? `\n  ${item.url}` : ""}${item.mediaUrl ? `\n  Reference: ${item.mediaUrl}` : ""}`).join("\n")
}

export function hasDigestContent(digest: TunesDigest) {
  const practice = digest.practice
  return Boolean(
    (practice && (practice.events || practice.overdue.length || practice.dueToday.length || practice.upcoming.length)) ||
    digest.friends?.length || digest.community?.length || digest.updates?.length
  )
}

export function buildTunesDigestEmail({ digest, practiceUrl, preferencesUrl }: { digest: TunesDigest; practiceUrl: string; preferencesUrl: string }) {
  const period = digest.frequency === "daily" ? "day" : "week"
  const subject = `Your ${period} on Tunes`
  const html: string[] = [`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#202124"><p style="font-weight:700">Tunes</p><h1>${subject}</h1><p>${escapeHtml(digest.periodLabel)}</p>`]
  const text: string[] = [`Tunes\n${subject}\n${digest.periodLabel}`]

  if (digest.practice) {
    const p = digest.practice
    html.push(`<h2>Your practice</h2><p><strong>${p.days}</strong> practice ${p.days === 1 ? "day" : "days"} · <strong>${p.events}</strong> events · <strong>${p.distinctTunes}</strong> tunes</p>`)
    text.push(`Your practice\n${p.days} practice days · ${p.events} events · ${p.distinctTunes} tunes`)
    for (const [title, items] of [["What you practised", p.practised], ["Overdue", p.overdue], ["Due today", p.dueToday], ["Coming up", p.upcoming]] as const) {
      if (!items.length) continue
      html.push(`<h3>${title}</h3>${htmlItems(items)}`)
      text.push(`${title}\n${textItems(items)}`)
    }
    html.push(`<p><a href="${escapeHtml(practiceUrl)}" style="display:inline-block;padding:10px 16px;background:#1f6f5f;color:white;text-decoration:none;border-radius:6px">Open Practice</a></p>`)
    text.push(`Open Practice: ${practiceUrl}`)
  }

  for (const [title, items] of [[`Friends this ${period}`, digest.friends], ["New around Tunes", digest.community], ["Updates for you", digest.updates]] as const) {
    if (!items?.length) continue
    html.push(`<h2>${title}</h2>${htmlItems(items)}`)
    text.push(`${title}\n${textItems(items)}`)
  }

  if (!hasDigestContent(digest)) {
    html.push("<h2>Nothing to report just yet</h2><p>Your current digest period has no practice, friend, community, or personal updates.</p>")
    text.push("Nothing to report just yet\nYour current digest period has no practice, friend, community, or personal updates.")
  }

  html.push(`<hr><p style="font-size:12px;color:#666">You're receiving this because your Tunes email digest is on. <a href="${escapeHtml(preferencesUrl)}">Change email preferences</a></p></div>`)
  text.push(`You're receiving this because your Tunes email digest is on.\nChange email preferences: ${preferencesUrl}`)
  return { subject, htmlContent: html.join(""), textContent: text.join("\n\n") }
}
