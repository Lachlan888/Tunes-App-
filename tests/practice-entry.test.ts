import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(path, "utf8")
test("Practice entry has one start/resume action and no competing administration", () => {
  const page = read("app/review/page.tsx")
  const entry = read("components/practice/PracticeEntryResolver.tsx")
  assert.match(page, /<PracticeEntryResolver/)
  assert.doesNotMatch(page, /ReviewQueueSection|ActivePracticeSection|PracticeDiaryNav|Streak/)
  assert.match(entry, /Resume practice/)
  assert.match(entry, /Start practice/)
  assert.match(entry, /session=ready&run=/)
  assert.match(entry, /getResumablePracticeHref/)
})
test("one account Diary entry leads to its three local sections", () => {
  const menu = read("components/layout/AccountMenu.tsx")
  const diaryNav = read("components/practice-diary/PracticeDiaryNav.tsx")
  assert.match(menu, /href: "\/review\/diary", label: "Practice Diary"/)
  assert.doesNotMatch(menu, /href: "\/review\/foci"|href: "\/review\/diary\/index"/)
  for (const href of ["/review/diary", "/review/foci", "/review/diary/index"]) assert.ok(diaryNav.includes(href))
})
test("entry counts and the navigation badge include all ready tunes", () => {
  assert.match(read("app/review/page.tsx"), /readyCount=\{data.dueTodayCount \+ data.catchUpCount\}/)
  assert.match(read("lib/loaders/nav.ts"), /\.lte\("next_review_due", getToday\(\)\)/)
})
