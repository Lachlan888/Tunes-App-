import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const reviewPage = readFileSync("app/review/page.tsx", "utf8")
const reviewQueue = readFileSync(
  "components/practice/ReviewQueueSection.tsx",
  "utf8"
)
const practiceNav = readFileSync(
  "components/practice-diary/PracticeDiaryNav.tsx",
  "utf8"
)

test("Practice entry uses the real collection and keeps the learning queue", () => {
  assert.match(reviewQueue, /href="\/learning-lists\?view=learning-queue"/)
  assert.match(reviewQueue, /href="\/library\/practice"/)
  assert.match(reviewQueue, />\s*Currently in practice\s*</)
  assert.doesNotMatch(reviewQueue, /From focus areas/)
})

test("general Practice view keeps the sidebar and deep Practice navigation", () => {
  for (const href of [
    "/review",
    "/review/diary",
    "/review/diary/index",
    "/review/foci",
  ]) {
    assert.match(practiceNav, new RegExp(`href: "${href}"`))
  }

  assert.match(reviewPage, /<PracticeDiaryNav active="review" compact \/>/)
  assert.match(reviewPage, /<ReviewQueueSection/)
  assert.match(reviewPage, /<ActivePracticeSection/)
  assert.doesNotMatch(reviewPage, /Supporting tools/)
  assert.match(practiceNav, /inline-flex w-fit max-w-full/)
})
