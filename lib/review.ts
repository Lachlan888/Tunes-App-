import type { BacklogTier } from "@/lib/types"

const REVIEW_INTERVALS = [1, 2, 3, 7, 14, 30, 60, 90, 120, 360] as const

const STAGE_PROGRESS_PERCENTAGES = [18, 32, 43, 55, 65, 74, 82, 89, 95, 100] as const

export const APP_TIME_ZONE = "Australia/Melbourne"

function getAppDateParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("Could not determine app date parts")
  }

  return { year, month, day }
}

function getAppTodayDateOnly() {
  const { year, month, day } = getAppDateParts()
  return `${year}-${month}-${day}`
}

function parseDateOnlyAsUtc(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

function getSafeStage(stage: number | null | undefined) {
  if (!stage || Number.isNaN(stage) || stage < 1) {
    return 1
  }

  return Math.min(stage, REVIEW_INTERVALS.length)
}

export function normaliseStoredDate(dateValue: string | null | undefined) {
  if (!dateValue) return null
  return dateValue.slice(0, 10)
}

export function addDaysToDateOnly(dateOnly: string, days: number) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getToday() {
  return getAppTodayDateOnly()
}

export function getTomorrow() {
  return addDaysToDateOnly(getToday(), 1)
}

export function isDueOnOrBefore(
  dateValue: string | null | undefined,
  targetDate: string
) {
  const normalised = normaliseStoredDate(dateValue)
  if (!normalised) return false
  return normalised <= targetDate
}

export function isDueToday(dateValue: string | null | undefined) {
  return isDueOnOrBefore(dateValue, getToday())
}

export function isDueExactlyOn(
  dateValue: string | null | undefined,
  targetDate: string
) {
  const normalised = normaliseStoredDate(dateValue)
  if (!normalised) return false
  return normalised === targetDate
}

export function isDueExactlyToday(dateValue: string | null | undefined) {
  return isDueExactlyOn(dateValue, getToday())
}

export function isOverdue(dateValue: string | null | undefined) {
  const normalised = normaliseStoredDate(dateValue)
  if (!normalised) return false
  return normalised < getToday()
}

export function getOverdueDays(
  dateValue: string | null | undefined,
  today: string = getToday()
) {
  const normalised = normaliseStoredDate(dateValue)

  if (!normalised || normalised >= today) {
    return 0
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const diff = parseDateOnlyAsUtc(today) - parseDateOnlyAsUtc(normalised)

  return Math.floor(diff / millisecondsPerDay)
}

export function getBacklogTier(
  dateValue: string | null | undefined,
  today: string = getToday()
): BacklogTier | null {
  const overdueDays = getOverdueDays(dateValue, today)

  if (overdueDays >= 1 && overdueDays <= 7) {
    return "due_now"
  }

  if (overdueDays >= 8 && overdueDays <= 21) {
    return "overdue"
  }

  if (overdueDays >= 22) {
    return "overdue_longest"
  }

  return null
}

export function getBacklogTierLabel(tier: BacklogTier) {
  switch (tier) {
    case "due_now":
      return "Due now"
    case "overdue":
      return "Overdue"
    case "overdue_longest":
      return "Overdue (longest)"
  }
}

export function getMaxPracticeStage() {
  return REVIEW_INTERVALS.length
}

export function getNextReviewDateFromStage(stage: number) {
  const safeStage = getSafeStage(stage)
  const intervalDays = REVIEW_INTERVALS[safeStage - 1]
  return addDaysToDateOnly(getToday(), intervalDays)
}

export function getNextStageForSolid(currentStage: number | null | undefined) {
  const safeCurrentStage = getSafeStage(currentStage)
  return Math.min(safeCurrentStage + 1, REVIEW_INTERVALS.length)
}

export function getNextStageForShaky(currentStage: number | null | undefined) {
  return getSafeStage(currentStage)
}

export function getNextStageForFailed(currentStage: number | null | undefined) {
  const safeCurrentStage = getSafeStage(currentStage)
  return Math.max(safeCurrentStage - 2, 1)
}

export function getProgressTowardsKnown(stage: number | null | undefined) {
  const safeStage = getSafeStage(stage)
  return STAGE_PROGRESS_PERCENTAGES[safeStage - 1]
}