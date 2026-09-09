import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  buildStageDistribution,
  buildWeeklyPracticeInsights,
  countRoughToSolidMovements,
  getTrendRange,
  parseTrendPeriod,
} from "../lib/trends-insights.ts"

test("trend periods are URL-safe and default to eight weeks", () => {
  assert.equal(parseTrendPeriod("4"), 4)
  assert.equal(parseTrendPeriod("12"), 12)
  assert.equal(parseTrendPeriod("99"), 8)
  assert.deepEqual(getTrendRange("2026-09-08", 4), {
    startDate: "2026-08-17",
    endDate: "2026-09-13",
  })
})

test("weekly insights retain sparse and empty weeks", () => {
  const weeks = buildWeeklyPracticeInsights({
    startDate: "2026-08-17",
    weeks: 4,
    events: [
      { date: "2026-08-17", pieceId: 1, eventType: "formal_review", outcome: "rough" },
      { date: "2026-09-08", pieceId: 1, eventType: "practice", outcome: "solid" },
    ],
  })

  assert.deepEqual(weeks.map((week) => week.eventCount), [1, 0, 0, 1])
  assert.equal(weeks[0].reviewCount, 1)
  assert.equal(weeks[3].solidCount, 1)
})

test("Rough-to-Solid movement requires a later Solid outcome", () => {
  assert.equal(
    countRoughToSolidMovements([
      { date: "2026-08-20", pieceId: 1, eventType: "practice", outcome: "rough" },
      { date: "2026-09-01", pieceId: 1, eventType: "practice", outcome: "solid" },
      { date: "2026-09-01", pieceId: 2, eventType: "practice", outcome: "solid" },
    ]),
    1
  )
})

test("stage distribution omits zero-value stages", () => {
  assert.deepEqual(buildStageDistribution([1, 1, 4]), [
    { stage: 1, count: 2 },
    { stage: 4, count: 1 },
  ])
  assert.deepEqual(buildStageDistribution([]), [])
})

test("Trends exposes accessible data, actions and bounded server reads", () => {
  const component = readFileSync(
    new URL("../components/trends/PersonalTrendInsights.tsx", import.meta.url),
    "utf8"
  )
  const loader = readFileSync(
    new URL("../lib/loaders/trends.ts", import.meta.url),
    "utf8"
  )

  assert.match(component, /aria-label="Practice events by week"/)
  assert.match(component, /<table/)
  assert.match(component, /Start catch-up/)
  assert.match(component, /Explore tunes/)
  assert.match(loader, /TREND_EVENT_LIMIT/)
  assert.match(loader, /\.limit\(TREND_CATALOGUE_LIMIT\)/)
})
