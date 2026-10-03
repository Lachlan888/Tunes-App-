import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const strip = readFileSync(
  new URL(
    "../components/reference-media/ReferencePracticeStrip.tsx",
    import.meta.url
  ),
  "utf8"
)
const dock = readFileSync(
  new URL("../components/session-dock/SessionDock.tsx", import.meta.url),
  "utf8"
)
const page = readFileSync(
  new URL("../app/library/[id]/reference-media/page.tsx", import.meta.url),
  "utf8"
)
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

test("reference playback dock is removed at every viewport size", () => {
  assert.match(dock, /model\.context === "reference-media" && "hidden"/)
  assert.doesNotMatch(strip, /md:flex/)
  assert.match(strip, /hidden max-w-4xl[\s\S]*lg:flex/)
})

test("desktop reference strip exposes tune-focused practice actions", () => {
  for (const label of [
    "Mark practised",
    "Add to Practice",
    "Add to list",
    "Back to tune",
    "Rough",
    "Shaky",
    "Solid",
    "New to me",
    "Known",
  ]) {
    assert.match(strip, new RegExp(label))
  }

  assert.match(strip, /Learning · Stage \$\{userPiece\.stage\}/)
  assert.match(strip, /action=\{userPiece \? outcome\.formalAction : logTunePracticeCheck\}/)
})

test("reference route supplies existing user state and server actions", () => {
  assert.match(page, /userPiece=\{tuneDetail\.typedUserPiece\}/)
  assert.match(page, /userKnownPiece=\{tuneDetail\.typedUserKnownPiece\}/)
  assert.match(page, /learningLists=\{tuneDetail\.typedLearningLists\}/)
  assert.match(page, /practiceDiaryEnabled=\{tuneDetail\.practiceDiaryEnabled\}/)
  assert.match(page, /startLearning=\{startLearning\}/)
  assert.match(page, /addToLearningList=\{addToLearningList\}/)
})

test("reference pages reserve no duplicate dock space on mobile", () => {
  assert.match(strip, /root\.dataset\.referencePractice = "active"/)
  assert.match(
    css,
    /html\[data-session-dock="active"\]\[data-reference-practice="active"\] \{\s*--session-dock-space: 0px;/
  )
  assert.match(
    css,
    /@media \(min-width: 64rem\)[\s\S]*--session-dock-space: 5\.25rem;/
  )
})
