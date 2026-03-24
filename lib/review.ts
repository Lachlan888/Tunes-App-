const REVIEW_INTERVALS = [1, 2, 3, 7, 14, 30, 60, 90, 120, 360] as const

const APP_TIME_ZONE = "Australia/Melbourne"

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

function normaliseStoredDate(dateValue: string | null | undefined) {
  if (!dateValue) return null
  return dateValue.slice(0, 10)
}

function addDaysToDateOnly(dateOnly: string, days: number) {
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

export function isDueToday(dateValue: string | null | undefined) {
  const normalised = normaliseStoredDate(dateValue)
  if (!normalised) return false
  return normalised <= getToday()
}

export function getNextReviewDateFromStage(stage: number) {
  const safeStage = Math.max(1, Math.min(stage, REVIEW_INTERVALS.length))
  const intervalDays = REVIEW_INTERVALS[safeStage - 1]
  return addDaysToDateOnly(getToday(), intervalDays)
}

export function getNextStageForSolid(currentStage: number | null | undefined) {
  const safeCurrentStage = currentStage && currentStage > 0 ? currentStage : 1
  return Math.min(safeCurrentStage + 1, REVIEW_INTERVALS.length)
}

export function getNextStageForShaky(currentStage: number | null | undefined) {
  const safeCurrentStage = currentStage && currentStage > 0 ? currentStage : 1
  return safeCurrentStage
}