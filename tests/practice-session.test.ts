import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  ACTIVE_PRACTICE_SESSION_KEY,
  canBeginPracticeRating,
  canUndoPracticeRating,
  clampPracticeSessionPosition,
  getPracticeResultCounts,
  getPracticeReflectionHref,
  getSafePracticeReturnHref,
  getPracticeSessionHref,
  getResumablePracticeHref,
  getPracticeSessionSuggestion,
  getPracticeEnrolmentStatus,
  getResultingPracticeStage,
  parsePracticeLane,
  removeRatedPracticeItem,
} from "../lib/practice-session.ts"

test("practice enrolment reports an action result without claiming a review", () => {
  assert.deepEqual(getPracticeEnrolmentStatus("added"), {
    tone: "success",
    message: "Added to Practice. Your first review is scheduled for tomorrow.",
  })
  assert.deepEqual(getPracticeEnrolmentStatus("already"), {
    tone: "neutral",
    message: "Already in Practice. No new review was recorded.",
  })
  assert.deepEqual(getPracticeEnrolmentStatus("error"), {
    tone: "error",
    message: "Couldn’t add this tune to Practice. Try again.",
  })
  assert.equal(getPracticeEnrolmentStatus("unknown"), null)
})

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

test("post-session reflection URLs stay dated, optional and local", () => {
  assert.equal(
    getPracticeReflectionHref("2026-09-25"),
    "/review/diary?date=2026-09-25&from=session&return_to=%2F"
  )
  assert.equal(getSafePracticeReturnHref("/review?session=catch-up"), "/review?session=catch-up")
  assert.equal(getSafePracticeReturnHref("https://evil.invalid"), "/")
  assert.equal(getSafePracticeReturnHref("//evil.invalid"), "/")
})

test("Practice entry resumes only a genuine same-day active session", () => {
  assert.equal(ACTIVE_PRACTICE_SESSION_KEY, "tunes.session.v1.practice.active")
  assert.equal(
    getResumablePracticeHref(
      JSON.stringify({ href: "/review?session=catch-up", lane: "catch-up", sessionDate: "2026-09-25" }),
      "2026-09-25"
    ),
    "/review?session=catch-up"
  )
  assert.equal(
    getResumablePracticeHref(
      JSON.stringify({ href: "/review?session=catch-up", lane: "catch-up", sessionDate: "2026-09-24" }),
      "2026-09-25"
    ),
    null
  )
  assert.equal(
    getResumablePracticeHref(
      JSON.stringify({ href: "/review?session=focus", lane: "focus", sessionDate: "2026-09-25" }),
      "2026-09-25"
    ),
    null
  )
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

test("Focused Practice keeps reference, ratings and session boundaries visible", () => {
  const session = readFileSync(new URL("../components/practice/FocusedPracticeSession.tsx", import.meta.url), "utf8")
  const summary = readFileSync(new URL("../components/practice/PracticeSessionSummary.tsx", import.meta.url), "utf8")
  assert.match(session, /<PracticeReferencePlayer/)
  assert.match(session, /practice-rating-bar/)
  assert.match(session, /RATING_UNDO_WINDOW_MS/)
  assert.match(session, /completeFormalReviewInPlace/)
  assert.match(session, /loadNextPracticeBatch/)
  assert.match(summary, /practiceDiaryEnabled && count > 0 && !diaryDismissed/)
  assert.match(summary, /Add a diary entry/)
  assert.doesNotMatch(session, /Reveal reference|Hide reference|<textarea|PracticeDiaryNav/)
})
test("Practice scopes and runs reset session state with their server queue", () => {
  const page = readFileSync(new URL("../app/review/page.tsx", import.meta.url), "utf8")
  assert.match(page, /key=\{`\$\{data.today\}:\$\{practiceLane\}:\$\{data.sessionKey \?\? ""\}:\$\{params\?\.run \?\? ""\}`\}/)
})

test("the diary accepts a session handoff with a safe optional return", () => {
  const page = readFileSync(new URL("../app/review/diary/page.tsx", import.meta.url), "utf8")
  assert.match(page, /fromSession/)
  assert.match(page, /Add an optional reflection/)
  assert.match(page, /Return without a reflection/)
  assert.match(page, /getSafePracticeReturnHref/)
  assert.match(page, /sessionReturnTo=\{fromSession \? returnTo : undefined\}/)
})

test('automatic practice can resume its exact run without choosing a tune', () => {
  assert.equal(parsePracticeLane('ready'), 'ready')
  assert.equal(getPracticeSessionHref('ready'), '/review?session=ready')
  const href = '/review?session=ready&run=practice-123'
  assert.equal(getResumablePracticeHref(JSON.stringify({href, lane: 'ready', sessionDate: '2026-10-03'}), '2026-10-03'), href)
})
