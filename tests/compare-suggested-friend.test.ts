import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getSuggestedCompareAction } from "../lib/compare-suggestion-action.ts"

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

test("suggested friend starts or extends the exact comparison", () => {
  assert.deepEqual(getSuggestedCompareAction([], "alice"), {
    disabled: false,
    label: "Compare",
    nextUsers: ["alice"],
  })

  assert.deepEqual(getSuggestedCompareAction(["bob"], "alice"), {
    disabled: false,
    label: "Add to comparison",
    nextUsers: ["bob", "alice"],
  })
})

test("suggested friend actions reject duplicates and full groups", () => {
  assert.deepEqual(getSuggestedCompareAction(["Alice"], "alice"), {
    disabled: true,
    label: "Already added",
    nextUsers: ["Alice"],
  })

  const fullGroup = Array.from({ length: 7 }, (_, index) => `friend-${index}`)
  assert.deepEqual(getSuggestedCompareAction(fullGroup, "alice"), {
    disabled: true,
    label: "Comparison full",
    nextUsers: fullGroup,
  })
})

test("mobile suggestions navigate directly with preserved comparison state", () => {
  const mobile = source("../components/compare/CompareMobile.tsx")
  const addSheet = source(
    "../components/compare/MobileCompareAddPersonSheet.tsx"
  )
  const pendingButton = source("../components/PendingLinkButton.tsx")

  assert.match(mobile, /getSuggestedCompareAction/)
  assert.match(mobile, /q: titleQuery/)
  assert.match(mobile, /key: selectedKeys/)
  assert.match(mobile, /style: selectedStyles/)
  assert.match(mobile, /time_signature: selectedTimeSignatures/)
  assert.match(mobile, /group: overlapGroup/)
  assert.match(mobile, /pendingLabel="Loading comparison\.\.\."/)
  assert.doesNotMatch(mobile, /onClick=\{\(\) => setIsAddSheetOpen\(true\)\}[\s\S]{0,220}>\s*Add\s*</)
  assert.match(addSheet, /getSuggestedCompareAction/)
  assert.match(addSheet, /action\.disabled \|\| isPending/)
  assert.match(addSheet, /action\.label/)
  assert.match(addSheet, /time_signature: selectedTimeSignatures/)
  assert.match(pendingButton, /disabled=\{disabled \|\| isPending\}/)
})
