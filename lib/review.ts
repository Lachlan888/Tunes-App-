const APP_TIME_ZONE = "Australia/Melbourne"

function getDateStringInAppTimeZone(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function normaliseToDateOnly(dateValue: string): string {
  return dateValue.slice(0, 10)
}

export function getTomorrow(): string {
  const now = new Date()
  const todayInAppTimeZone = getDateStringInAppTimeZone(now)

  const tomorrow = new Date(`${todayInAppTimeZone}T00:00:00`)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getDateStringInAppTimeZone(tomorrow)
}

export function isDueToday(nextReviewDue: string | null): boolean {
  if (!nextReviewDue) return false

  const dueDate = normaliseToDateOnly(nextReviewDue)
  const todayInAppTimeZone = getDateStringInAppTimeZone(new Date())

  return dueDate <= todayInAppTimeZone
}