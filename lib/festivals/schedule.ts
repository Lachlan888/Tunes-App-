import type { PublicFestivalSession } from "@/lib/loaders/festivals"

export const UNKNOWN_SESSION_DAY = "unknown"

export function sessionDayKey(session: Pick<PublicFestivalSession, "local_date">) {
  return session.local_date ?? UNKNOWN_SESSION_DAY
}

export function sortFestivalSessions(sessions: PublicFestivalSession[]) {
  return [...sessions].sort((left, right) => {
    const leftDate = left.local_date ?? "9999-12-31"
    const rightDate = right.local_date ?? "9999-12-31"
    if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)
    const leftTime = left.local_start_time ?? "99:99:99"
    const rightTime = right.local_start_time ?? "99:99:99"
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime)
    if (left.editorial_order !== right.editorial_order) {
      return left.editorial_order - right.editorial_order
    }
    return left.id - right.id
  })
}

export function festivalSessionDays(sessions: PublicFestivalSession[]) {
  return Array.from(new Set(sortFestivalSessions(sessions).map(sessionDayKey)))
}
