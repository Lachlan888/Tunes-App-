export type TrendPeriodWeeks = 4 | 8 | 12

export type TrendEventInput = {
  date: string
  pieceId: number | null
  eventType: string
  outcome: "rough" | "shaky" | "solid" | null
}

export type WeeklyPracticeInsight = {
  weekStart: string
  weekEnd: string
  eventCount: number
  reviewCount: number
  activeDays: number
  roughCount: number
  shakyCount: number
  solidCount: number
}

function addDaysToDateOnly(dateOnly: string, days: number) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getMondayWeekStart(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return addDaysToDateOnly(dateOnly, -(weekday === 0 ? 6 : weekday - 1))
}

export function parseTrendPeriod(value?: string): TrendPeriodWeeks {
  if (value === "4" || value === "12") return Number(value) as TrendPeriodWeeks
  return 8
}

export function getTrendRange(today: string, weeks: TrendPeriodWeeks) {
  const currentWeekStart = getMondayWeekStart(today)
  return {
    startDate: addDaysToDateOnly(currentWeekStart, -(weeks - 1) * 7),
    endDate: addDaysToDateOnly(currentWeekStart, 6),
  }
}

export function buildWeeklyPracticeInsights({
  events,
  startDate,
  weeks,
}: {
  events: TrendEventInput[]
  startDate: string
  weeks: TrendPeriodWeeks
}): WeeklyPracticeInsight[] {
  return Array.from({ length: weeks }, (_, index) => {
    const weekStart = addDaysToDateOnly(startDate, index * 7)
    const weekEnd = addDaysToDateOnly(weekStart, 6)
    const weekEvents = events.filter(
      (event) => event.date >= weekStart && event.date <= weekEnd
    )

    return {
      weekStart,
      weekEnd,
      eventCount: weekEvents.length,
      reviewCount: weekEvents.filter((event) => event.eventType === "formal_review").length,
      activeDays: new Set(weekEvents.map((event) => event.date)).size,
      roughCount: weekEvents.filter((event) => event.outcome === "rough").length,
      shakyCount: weekEvents.filter((event) => event.outcome === "shaky").length,
      solidCount: weekEvents.filter((event) => event.outcome === "solid").length,
    }
  })
}

export function countRoughToSolidMovements(events: TrendEventInput[]) {
  const byPiece = new Map<number, TrendEventInput[]>()
  for (const event of events) {
    if (!event.pieceId || !event.outcome) continue
    const pieceEvents = byPiece.get(event.pieceId) ?? []
    pieceEvents.push(event)
    byPiece.set(event.pieceId, pieceEvents)
  }

  let improvedTuneCount = 0
  for (const pieceEvents of byPiece.values()) {
    const ordered = [...pieceEvents].sort((a, b) => a.date.localeCompare(b.date))
    const firstRough = ordered.findIndex((event) => event.outcome === "rough")
    if (firstRough >= 0 && ordered.slice(firstRough + 1).some((event) => event.outcome === "solid")) {
      improvedTuneCount += 1
    }
  }
  return improvedTuneCount
}

export function buildStageDistribution(stages: number[]) {
  return Array.from({ length: 10 }, (_, index) => ({
    stage: index + 1,
    count: stages.filter((stage) => stage === index + 1).length,
  })).filter((entry) => entry.count > 0)
}
