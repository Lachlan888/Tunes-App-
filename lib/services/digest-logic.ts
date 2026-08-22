import type { NotificationDigestFrequency } from "@/lib/types"

export const DIGEST_TIME_ZONE = "UTC"
export const WEEKLY_DIGEST_DAY = 0 // Sunday, matching the existing 20:00 UTC cron.

export type DigestDueItem = {
  pieceId: number
  title: string
  dueDate: string
  stage: number | null
  mediaUrl?: string | null
}

export function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function startOfUtcWeek(date: Date) {
  const start = startOfUtcDay(date)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  return start
}

export function digestPeriodStart(frequency: Exclude<NotificationDigestFrequency, "never">, now: Date) {
  return frequency === "daily" ? startOfUtcDay(now) : startOfUtcWeek(now)
}

export function digestContentStart(frequency: Exclude<NotificationDigestFrequency, "never">, now: Date) {
  const start = digestPeriodStart(frequency, now)
  if (frequency === "weekly") start.setUTCDate(start.getUTCDate() - 7)
  return start
}

export function isDigestDue({
  frequency,
  lastSentAt,
  now,
}: {
  frequency: NotificationDigestFrequency
  lastSentAt: string | null | undefined
  now: Date
}) {
  if (frequency === "never") return false
  if (frequency === "weekly" && now.getUTCDay() !== WEEKLY_DIGEST_DAY) return false
  if (!lastSentAt) return true

  const lastSent = new Date(lastSentAt)
  if (Number.isNaN(lastSent.getTime())) return true
  return lastSent < digestPeriodStart(frequency, now)
}

export function categoriseDueTunes(items: DigestDueItem[], now: Date, cap = 5) {
  const today = utcDateKey(now)
  const soon = new Date(startOfUtcDay(now))
  soon.setUTCDate(soon.getUTCDate() + 3)
  const soonKey = utcDateKey(soon)
  const ordered = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return {
    overdue: ordered.filter((item) => item.dueDate < today).slice(0, cap),
    today: ordered.filter((item) => item.dueDate === today).slice(0, cap),
    upcoming: ordered.filter((item) => item.dueDate > today && item.dueDate <= soonKey).slice(0, cap),
  }
}

export function capAndAggregateFriendActivity<T extends { userId: string; eventType: string; pieceId: number | null }>(
  items: T[],
  cap = 8
) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.userId}:${item.eventType}:${item.pieceId ?? "none"}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, cap)
}

export function digestDeliveryEffects(testSend: boolean) {
  return {
    requiresCadenceEligibility: !testSend,
    updateLastDigestSentAt: !testSend,
    markNotificationsSent: !testSend,
  }
}
