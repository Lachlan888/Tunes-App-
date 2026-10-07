import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

const library = source("components/library/LibraryList.tsx")
const actions = source("components/library/LibraryTuneCardActions.tsx")
const row = source("components/tunes/TuneRow.tsx")
const identity = source("components/tunes/TuneIdentity.tsx")
const menu = source("components/ui/ContextActionMenu.tsx")

test("catalogue uses a responsive tune grid with a title action trigger and visible relationship", () => {
  assert.match(library, /itemsClassName="grid grid-cols-1[\s\S]*?sm:grid-cols-2[\s\S]*?xl:grid-cols-3/)
  assert.match(library, /titleControl=\{selectionMode \? undefined :/)
  assert.match(library, /personalState=\{[\s\S]*?<TuneStateIndicator/)
  assert.match(identity, /metadata\.join\(" · "\)/)
  assert.match(identity, /timeSignature/)
  assert.match(identity, /break-words/)
  assert.match(identity, /titleControl/)
})

test("catalogue secondary actions retain their routes and applicable state transitions", () => {
  assert.match(actions, /id: "open"[\s\S]*?`\/library\/\$\{piece\.id\}`/)
  assert.match(actions, /id: "preview"/)
  assert.match(actions, /id: "reference"/)
  assert.match(actions, /id: "list"/)
  assert.match(actions, /id: "practice"/)
  assert.match(actions, /id: "known"/)
  assert.match(actions, /id: "stop-practice"/)
  assert.match(actions, /!isAlreadyInPractice/)
  assert.match(actions, /!isKnown/)
  assert.match(actions, /activeUserPieceId \?/)
  assert.match(library, /referenceHref=\{mediaBundle\?\.effectiveReference/)
  assert.match(library, /onOpenAddToList=\{\(\) =>/)
})

test("the adaptive menu has an explicit trigger, keyboard paths and a touch sheet", () => {
  assert.match(menu, /aria-haspopup=\{isPhone \? "dialog" : "menu"\}/)
  assert.match(menu, /aria-expanded=\{open\}/)
  assert.match(menu, /event\.key === "Escape"/)
  assert.match(menu, /"ArrowDown", "ArrowUp", "Home", "End"/)
  assert.match(menu, /event\.key === "Tab" && isPhone/)
  assert.match(menu, /triggerRef\.current\?\.focus/)
  assert.match(menu, /env\(safe-area-inset-bottom\)/)
  assert.match(menu, /min-h-11/)
  assert.match(menu, /aria-live="polite"/)
})

test("selection mode keeps its checkbox and linked titles", () => {
  assert.match(library, /titleControl=\{selectionMode \? undefined :/)
  assert.match(library, /type="checkbox"/)
  assert.match(library, /min-h-11 min-w-11/)
  assert.match(library, /Select \{piece\.title\}/)
})

test("compact catalogue rows align the single action without squeezing long titles", () => {
  assert.match(row, /grid-cols-\[minmax\(0,1fr\)_auto\] items-center/)
  assert.match(row, /md:grid-cols-\[minmax\(0,1fr\)_auto\]/)
  assert.match(row, /md:justify-end/)
  assert.match(identity, /md:hidden/)
  assert.match(identity, /hidden md:block/)
})
