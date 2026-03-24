export function getTomorrow(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export function isDueToday(nextReviewDue: string | null): boolean {
  if (!nextReviewDue) return false

  const today = new Date()
  const dueDate = new Date(nextReviewDue)

  // Normalise both to midnight (ignore time of day)
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate <= today
}