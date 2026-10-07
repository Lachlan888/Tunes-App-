import assert from "node:assert/strict"
import test from "node:test"
import { getFestivalSetupSummary } from "../lib/festivals/setup.ts"

test("setup summary distinguishes missing optional sections from review holds", () => {
  const summary = getFestivalSetupSummary(
    { name: "Partner Festival", slug: "partner-festival", timezone: "Australia/Melbourne", branding_image_url: null, programme_url: null, programme_snapshot_date: null },
    [],
    []
  )
  assert.deepEqual(summary, {
    details: "Saved",
    branding: "Not added",
    programme: "Not added",
    repertoire: "No public lists attached",
    sessions: "No sessions added",
    heldSessions: 0,
    publicContentCount: 0,
  })

  const withContent = getFestivalSetupSummary(
    { name: "Partner Festival", slug: "partner-festival", timezone: "Australia/Melbourne", branding_image_url: "https://example.com/banner.png", programme_url: "https://example.com/programme", programme_snapshot_date: "2026-10-08" },
    [{ id: 1 }, { id: 2 }],
    [{ id: 3, needs_review: true }, { id: 4, needs_review: false }]
  )
  assert.equal(withContent.programme, "Link and snapshot date added")
  assert.equal(withContent.repertoire, "2 public lists attached")
  assert.equal(withContent.sessions, "2 sessions · 1 held for review")
  assert.equal(withContent.heldSessions, 1)
  assert.equal(withContent.publicContentCount, 3)
})
