export function getTomorrow(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export function isDueToday(nextReviewDue: string | null): boolean {
  if (!nextReviewDue) return false
  return new Date(nextReviewDue) <= new Date()
}