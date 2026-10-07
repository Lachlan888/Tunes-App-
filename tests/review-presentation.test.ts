import assert from "node:assert/strict"
import test from "node:test"

import * as review from "../lib/review.ts"

test("practice stages expose their real review-day interval", () => {
  const getReviewIntervalDays = (
    review as typeof review & { getReviewIntervalDays(stage: number | null | undefined): number }
  ).getReviewIntervalDays

  assert.deepEqual(Array.from({ length: 10 }, (_, index) => getReviewIntervalDays(index + 1)), [1, 2, 3, 7, 14, 30, 60, 90, 120, 360])
  assert.equal(getReviewIntervalDays(99), 360)
  assert.equal(getReviewIntervalDays(null), 1)
})

test("review intervals have day-only display labels", () => {
  assert.equal(review.getReviewIntervalLabel(1), "1 day")
  assert.equal(review.getReviewIntervalLabel(6), "30 days")
  assert.equal(review.getReviewIntervalLabel(99), "360 days")
})

test("due status distinguishes overdue, today, future and missing dates", () => {
  assert.equal(review.formatReviewDueStatus("2026-10-02", "2026-10-05"), "Overdue since 2 Oct")
  assert.equal(review.formatReviewDueStatus("2026-10-05T23:00:00Z", "2026-10-05"), "Due today")
  assert.equal(review.formatReviewDueStatus("2026-10-17", "2026-10-05"), "Next review 17 Oct")
  assert.equal(review.formatReviewDueStatus(null, "2026-10-05"), "No review date set")
})

test("rating previews name the next interval and the Known transition", () => {
  assert.equal(review.getReviewOutcomePreview(1, "failed"), "1-day review")
  assert.equal(review.getReviewOutcomePreview(6, "failed"), "7-day review")
  assert.equal(review.getReviewOutcomePreview(6, "shaky"), "30-day review")
  assert.equal(review.getReviewOutcomePreview(6, "solid"), "60-day review")
  assert.equal(review.getReviewOutcomePreview(9, "solid"), "Moves to Known")
  assert.equal(review.getReviewOutcomePreview(10, "solid"), "Moves to Known")
})

test("practice dates render as human date-only labels", () => {
  const formatPracticeDate = (
    review as typeof review & { formatPracticeDate(value: string | null | undefined): string | null }
  ).formatPracticeDate

  assert.equal(formatPracticeDate("2026-10-17T23:59:59.000Z"), "17 Oct")
  assert.equal(formatPracticeDate("2026-01-03"), "3 Jan")
  assert.equal(formatPracticeDate(null), null)
})
