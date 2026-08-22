import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { capAndAggregateFriendActivity, categoriseDueTunes, digestContentStart, digestDeliveryEffects, digestPeriodStart, isDigestDue } from "../lib/services/digest-logic.ts"
import { hasDigestContent } from "../lib/services/tunes-digest-template.ts"

const sunday = new Date("2026-08-23T20:00:00.000Z")

test("weekly digest is due once in its Sunday UTC week", () => {
  assert.equal(isDigestDue({ frequency: "weekly", lastSentAt: "2026-08-16T20:00:00Z", now: sunday }), true)
  assert.equal(isDigestDue({ frequency: "weekly", lastSentAt: "2026-08-23T20:00:00Z", now: sunday }), false)
  assert.equal(isDigestDue({ frequency: "weekly", lastSentAt: null, now: new Date("2026-08-24T20:00:00Z") }), false)
  assert.equal(digestPeriodStart("weekly", sunday).toISOString(), "2026-08-23T00:00:00.000Z")
  assert.equal(digestContentStart("weekly", sunday).toISOString(), "2026-08-16T00:00:00.000Z")
})

test("daily digest is due next day but not twice in one UTC day", () => {
  assert.equal(isDigestDue({ frequency: "daily", lastSentAt: "2026-08-22T20:00:00Z", now: sunday }), true)
  assert.equal(isDigestDue({ frequency: "daily", lastSentAt: "2026-08-23T01:00:00Z", now: sunday }), false)
})

test("off users are never due", () => assert.equal(isDigestDue({ frequency: "never", lastSentAt: null, now: sunday }), false))

test("due tunes are categorised and capped", () => {
  const result = categoriseDueTunes([
    { pieceId: 1, title: "Old", dueDate: "2026-08-20", stage: 2 },
    { pieceId: 2, title: "Today", dueDate: "2026-08-23", stage: 3 },
    { pieceId: 3, title: "Soon", dueDate: "2026-08-25", stage: 1 },
    { pieceId: 4, title: "Later", dueDate: "2026-09-01", stage: 1 },
  ], sunday, 1)
  assert.deepEqual(result.overdue.map((item) => item.title), ["Old"])
  assert.deepEqual(result.today.map((item) => item.title), ["Today"])
  assert.deepEqual(result.upcoming.map((item) => item.title), ["Soon"])
})

test("friend activity deduplicates repeated friend/tune events and caps", () => {
  const result = capAndAggregateFriendActivity([
    { userId: "a", eventType: "tune_reviewed", pieceId: 1 },
    { userId: "a", eventType: "tune_reviewed", pieceId: 1 },
    { userId: "b", eventType: "marked_known", pieceId: 2 },
  ], 2)
  assert.equal(result.length, 2)
})

test("empty digest is skipped while a due tune is useful", () => {
  assert.equal(hasDigestContent({ frequency: "weekly", periodLabel: "week" }), false)
  assert.equal(hasDigestContent({ frequency: "weekly", periodLabel: "week", practice: { days: 0, events: 0, distinctTunes: 0, practised: [], overdue: [{ label: "Tune" }], dueToday: [], upcoming: [] } }), true)
})

test("TypeScript and migration defaults agree on weekly/all-sections-on", () => {
  const types = readFileSync(new URL("../lib/types/profiles.ts", import.meta.url), "utf8")
  const migration = readFileSync(new URL("../supabase/migrations/20260822000000_redesign_notification_digests.sql", import.meta.url), "utf8")
  assert.match(types, /digest_frequency: "weekly"/)
  for (const field of ["practice", "friends", "community", "updates"]) {
    assert.match(types, new RegExp(`digest_include_${field}: true`))
    assert.match(migration, new RegExp(`digest_include_${field} boolean not null default true`))
  }
  assert.match(migration, /from auth\.users/)
})

test("manual test sends bypass cadence and consume no scheduled state", () => {
  assert.deepEqual(digestDeliveryEffects(true), {
    requiresCadenceEligibility: false,
    updateLastDigestSentAt: false,
    markNotificationsSent: false,
  })
  assert.deepEqual(digestDeliveryEffects(false), {
    requiresCadenceEligibility: true,
    updateLastDigestSentAt: true,
    markNotificationsSent: true,
  })
})
