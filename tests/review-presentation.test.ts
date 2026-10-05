import assert from "node:assert/strict"
import test from "node:test"

import * as review from "../lib/review.ts"

test("practice stages expose their real review-day interval", () => {
  const getReviewIntervalDays = (
    review as typeof review & { getReviewIntervalDays(stage: number | null | undefined): number }
  ).getReviewIntervalDays

  assert.equal(getReviewIntervalDays(1), 1)
  assert.equal(getReviewIntervalDays(5), 14)
  assert.equal(getReviewIntervalDays(10), 360)
  assert.equal(getReviewIntervalDays(99), 360)
  assert.equal(getReviewIntervalDays(null), 1)
})

test("practice dates render as human date-only labels", () => {
  const formatPracticeDate = (
    review as typeof review & { formatPracticeDate(value: string | null | undefined): string | null }
  ).formatPracticeDate

  assert.equal(formatPracticeDate("2026-10-17T23:59:59.000Z"), "17 Oct")
  assert.equal(formatPracticeDate("2026-01-03"), "3 Jan")
  assert.equal(formatPracticeDate(null), null)
})
