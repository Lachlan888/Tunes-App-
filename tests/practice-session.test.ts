import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  canBeginPracticeRating,
  canUndoPracticeRating,
  clampPracticeSessionPosition,
  getPracticeResultCounts,
  getPracticeSessionHref,
  getPracticeSessionSuggestion,
  getResultingPracticeStage,
  parsePracticeLane,
  removeRatedPracticeItem,
} from "../lib/practice-session.ts"

test("list practice is a first-class session lane", () => {
  assert.equal(parsePracticeLane("list"), "list")
  assert.equal(parsePracticeLane("anything-else"), null)
})

test("focus practice is a first-class session lane", () => {
  assert.equal(parsePracticeLane("focus"), "focus")
  assert.equal(getPracticeSessionHref("focus"), "/review?session=focus")
})

test("Diary period navigation and month outcome labels remain visible", () => {
  const page = readFileSync(new URL("../app/review/diary/page.tsx", import.meta.url), "utf8")
  const periodHeader = readFileSync(new URL("../components/practice-diary/PracticePeriodHeader.tsx", import.meta.url), "utf8")
  const month = readFileSync(new URL("../components/practice-diary/PracticeMonthView.tsx", import.meta.url), "utf8")

  assert.match(page, /PracticePeriodHeader/)
  assert.match(periodHeader, /Diary period controls/)
  assert.match(periodHeader, /Diary view/)
  assert.match(month, /R = Rough/)
  assert.match(month, /Accessible text summary/)
})

test("practice lane URLs are explicit and invalid lanes recover to entry", () => {
  assert.equal(getPracticeSessionHref("due-today"), "/review?session=due-today")
  assert.equal(getPracticeSessionHref("catch-up"), "/review?session=catch-up")
  assert.equal(parsePracticeLane("catch-up"), "catch-up")
  assert.equal(parsePracticeLane("unknown"), null)
})

test("Focused Practice preserves existing Stage rules", () => {
  assert.equal(getResultingPracticeStage(6, "failed"), 4)
  assert.equal(getResultingPracticeStage(6, "shaky"), 6)
  assert.equal(getResultingPracticeStage(6, "solid"), 7)
  assert.equal(getResultingPracticeStage(1, "failed"), 1)
  assert.equal(getResultingPracticeStage(10, "solid"), 10)
})

test("rating state prevents double submission and permits only pre-save Undo", () => {
  assert.equal(canBeginPracticeRating("idle"), true)
  assert.equal(canBeginPracticeRating("undo-window"), false)
  assert.equal(canBeginPracticeRating("submitting"), false)
  assert.equal(canUndoPracticeRating("undo-window"), true)
  assert.equal(canUndoPracticeRating("submitting"), false)
})

test("rating removes exactly one tune and advances without skipping", () => {
  const initial = [{ id: 1 }, { id: 2 }, { id: 3 }]
  assert.deepEqual(removeRatedPracticeItem(initial, 1, 0), {
    queue: [{ id: 2 }, { id: 3 }],
    index: 0,
  })
  assert.deepEqual(removeRatedPracticeItem(initial, 2, 1), {
    queue: [{ id: 1 }, { id: 3 }],
    index: 1,
  })
})

test("resume position safely clamps when the server-side queue changes", () => {
  assert.equal(clampPracticeSessionPosition(4, 2), 1)
  assert.equal(clampPracticeSessionPosition(1, 5), 1)
  assert.equal(clampPracticeSessionPosition(-1, 5), 0)
  assert.equal(clampPracticeSessionPosition(3, 0), 0)
})

test("session summaries count outcomes and make one useful suggestion", () => {
  const results = [
    { userPieceId: 1, pieceId: 1, title: "A", outcome: "failed" as const, previousStage: 5, resultingStage: 3, movedToKnown: false },
    { userPieceId: 2, pieceId: 2, title: "B", outcome: "shaky" as const, previousStage: 4, resultingStage: 4, movedToKnown: false },
    { userPieceId: 3, pieceId: 3, title: "C", outcome: "solid" as const, previousStage: 9, resultingStage: 10, movedToKnown: true },
  ]
  assert.deepEqual(getPracticeResultCounts(results), { failed: 1, shaky: 1, solid: 1 })
  assert.match(getPracticeSessionSuggestion(results), /Rough tunes/)
})

test("Focused Practice uses reduced chrome, persistent ratings, Undo and summary", () => {
  const shell = readFileSync(new URL("../components/practice/FocusModeShell.tsx", import.meta.url), "utf8")
  const session = readFileSync(new URL("../components/practice/FocusedPracticeSession.tsx", import.meta.url), "utf8")
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

  assert.match(shell, /dataset\.focusMode = "practice"/)
  assert.match(css, /data-focus-mode="practice"/)
  assert.match(session, /RATING_UNDO_WINDOW_MS/)
  assert.match(session, /Undo rating/)
  assert.match(session, /completeFormalReviewInPlace/)
  assert.match(session, /crypto\.randomUUID/)
  assert.match(session, /End session/)
  assert.match(session, /Practice complete/)
  assert.match(session, /Keyboard: 1 Rough · 2 Shaky · 3 Solid/)
})

test("Focused Practice uses one separator after reference and preserves note drafts", () => {
  const session = readFileSync(
    new URL("../components/practice/FocusedPracticeSession.tsx", import.meta.url),
    "utf8"
  )

  assert.match(session, /ref=\{referenceRegion\}[\s\S]*?className="py-3 sm:col-span-2 focus:outline-none"/)
  assert.match(session, /<details className="border-t border-hairline pt-3 sm:col-span-2">/)
  assert.doesNotMatch(session, /referenceRegion[^\n]*border-y/)
  assert.match(session, /sessionStorage\.setItem\(draftKey/)
  assert.match(session, /value=\{noteBody\}[\s\S]*?saveDraft\(\{ body: event\.target\.value \}\)/)
})
