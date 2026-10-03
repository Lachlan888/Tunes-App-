import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const libraryList = readFileSync(
  new URL("../components/library/LibraryList.tsx", import.meta.url),
  "utf8"
)
const libraryActions = readFileSync(
  new URL("../components/library/LibraryTuneCardActions.tsx", import.meta.url),
  "utf8"
)
const tuneIdentity = readFileSync(
  new URL("../components/tunes/TuneIdentity.tsx", import.meta.url),
  "utf8"
)
const tuneRow = readFileSync(
  new URL("../components/tunes/TuneRow.tsx", import.meta.url),
  "utf8"
)
const actionButton = readFileSync(
  new URL("../components/tunes/TuneCollectionActionButton.tsx", import.meta.url),
  "utf8"
)

test("mobile catalogue identity keeps long titles, key, time, and status compact", () => {
  assert.match(libraryList, /<TuneRow[\s\S]*?compactMobile/)
  assert.match(tuneIdentity, /min-w-0 flex-1 truncate/)
  assert.match(tuneIdentity, /title=\{title\}/)
  assert.match(tuneIdentity, /tuneKey \? `Key \$\{tuneKey\}`/)
  assert.match(tuneIdentity, /timeSignature/)
  assert.match(tuneIdentity, /shrink-0 whitespace-nowrap/)
  assert.ok(
    tuneIdentity.indexOf("{personalState ?") >
      tuneIdentity.indexOf("shrink-0 whitespace-nowrap")
  )
})

test("mobile catalogue uses one contained four-action row with touch targets", () => {
  assert.match(tuneRow, /grid min-w-0 grid-cols-4 items-center gap-1/)
  assert.match(tuneRow, /md:flex md:flex-wrap md:gap-2 md:justify-end/)
  assert.match(libraryList, /min-h-11 min-w-0 w-full/)
  assert.match(libraryActions, /min-h-11 min-w-0 w-full/)
  assert.match(libraryList, /aria-label=\{`Preview \$\{piece\.title\}`\}/)
  assert.match(libraryActions, /aria-label=\{`Add \$\{piece\.title\} to List`\}/)
  assert.match(libraryActions, /ariaLabel=\{`Start Practice for \$\{piece\.title\}`\}/)
  assert.match(libraryActions, /ariaLabel=\{`Mark \$\{piece\.title\} Known`\}/)
})

test("new, practising, and known tunes retain action and disabled semantics", () => {
  assert.match(libraryActions, /!isAlreadyInPractice && !isKnown/)
  assert.match(libraryActions, /action=\{startLearning\}/)
  assert.match(libraryActions, /action=\{markAsKnown\}/)
  assert.match(libraryActions, /disabled[\s\S]*?already in practice[\s\S]*?already known/)
  assert.equal((libraryActions.match(/md:hidden/g) ?? []).length >= 3, true)
  assert.match(actionButton, /disabled=\{isPending\}/)
  assert.match(actionButton, /aria-busy=\{isPending\}/)
  assert.match(actionButton, /mobilePendingLabel \?\? pendingLabel/)
})

test("selection mode hides row actions without weakening tune selection", () => {
  assert.match(libraryList, /actions=\{selectionMode \? null :/)
  assert.match(libraryList, /type="checkbox"/)
  assert.match(libraryList, /min-h-11 min-w-11/)
  assert.match(libraryList, /Select \{piece\.title\}/)
  assert.match(libraryList, /grid min-w-0 grid-cols-\[auto_minmax\(0,1fr\)\]/)
})

test("compact styling is mobile-only and restores desktop row presentation", () => {
  assert.match(tuneIdentity, /md:hidden/)
  assert.match(tuneIdentity, /hidden md:block/)
  assert.match(tuneRow, /md:grid-cols-\[minmax\(0,1fr\)_auto\]/)
  assert.match(tuneRow, /md:items-center md:gap-6 md:py-4/)
  assert.match(libraryActions, /md:w-auto md:px-3 md:text-sm/)
  assert.match(libraryActions, /<span className="hidden md:inline">Add to List<\/span>/)
})
