import assert from "node:assert/strict"
import test from "node:test"
import { resolveFestivalWorkspace, festivalWorkspaceHref } from "../lib/festivals/workspace.ts"

const festivals = [{ id: 4 }, { id: 9 }]

test("workspace URL chooses an existing festival and a known tab", () => {
  assert.deepEqual(resolveFestivalWorkspace({ festival: "9", tab: "sessions" }, 4, festivals), {
    festivalId: 9,
    tab: "sessions",
  })
  assert.equal(festivalWorkspaceHref(9, "review"), "/dev/festivals?festival=9&tab=review")
})

test("invalid or stale workspace URLs return to the selected festival and Details", () => {
  assert.deepEqual(resolveFestivalWorkspace({ festival: "999", tab: "unknown" }, 4, festivals), {
    festivalId: 4,
    tab: "details",
  })
  assert.deepEqual(resolveFestivalWorkspace({}, null, festivals), { festivalId: 4, tab: "details" })
  assert.deepEqual(resolveFestivalWorkspace({}, null, []), { festivalId: null, tab: "details" })
})
