import test from "node:test"
import assert from "node:assert/strict"
import { buildActiveSetlistPayload, buildPersonalReadiness, parseSetlistMode, resolvePerformanceItem } from "../lib/setlist-performance.ts"
import type { Setlist, SetlistItemWithCoverage } from "../lib/types/setlists.ts"

const setlist: Setlist = { id: 1, name: "Session", event_date: null, location: null, updated_at: "2026-09-09T00:00:00Z", created_by: "private-owner", description: "internal", created_at: "2026-09-09T00:00:00Z" }
const baseItem: SetlistItemWithCoverage = {
  id: 11, setlist_id: 1, piece_id: 101, position: 1, performance_key: null,
  notes: null, chart_url: null, chart_label: null, chart_type: null, added_by: "me",
  created_at: "2026-09-09T00:00:00Z", updated_at: null, piece: null, coverage: [],
}
const items: SetlistItemWithCoverage[] = [
  { ...baseItem, performance_key: "D", notes: " A shared note ",
    piece: { id: 101, title: "First tune", key: "G", type: "Reel", style: null, time_signature: null },
    coverage: [{ user_id: "me", status: "known", stage: null, user_piece_id: null }, { user_id: "other", status: "practice", stage: 2, user_piece_id: 10 }] },
  { ...baseItem, id: 12, piece_id: 102, position: 2,
    piece: { id: 102, title: "Second tune", key: "Am", style: "Irish", time_signature: null },
    coverage: [{ user_id: "me", status: "practice", stage: 1, user_piece_id: 11 }] },
  { ...baseItem, id: 13, piece_id: 103, position: 3, coverage: [{ user_id: "other", status: "known", stage: null, user_piece_id: null }] },
]

test("readiness counts only the signed-in musician, including new tunes", () => {
  assert.deepEqual(buildPersonalReadiness(items, "me"), {total:3,known:1,practice:1,newToMe:1})
  assert.deepEqual(buildPersonalReadiness(items, "other"), {total:3,known:1,practice:1,newToMe:1})
  assert.deepEqual(buildPersonalReadiness([], "me"), {total:0,known:0,practice:0,newToMe:0})
})
test("active setlist payload preserves ordered essentials and excludes private membership state", () => {
  const payload=buildActiveSetlistPayload({setlist,items})
  assert.deepEqual(JSON.parse(JSON.stringify(payload)),payload)
  assert.deepEqual(payload.items.map(i=>i.id),[11,12,13])
  assert.equal(payload.items[0].key,"D")
  assert.equal(payload.items[0].note,"A shared note")
  assert.equal(payload.items[1].type,"Irish")
  assert.equal(payload.items[2].title,"Untitled tune")
  assert.doesNotMatch(JSON.stringify(payload),/private-owner|coverage|user_id|stage|description/)
})
test("performance resumes by item identity after reordered or removed tunes", () => {
  const payload=buildActiveSetlistPayload({setlist,items})
  assert.equal(resolvePerformanceItem([...payload.items].reverse(),12)?.id,12)
  assert.equal(resolvePerformanceItem(payload.items.filter(i=>i.id!==12),12)?.id,11)
  assert.equal(resolvePerformanceItem(payload.items,999)?.id,11)
  assert.equal(resolvePerformanceItem([],11),null)
})
test("only explicit Manage and Performance mode values leave Read mode", () => {
  assert.equal(parseSetlistMode(undefined),"read")
  assert.equal(parseSetlistMode("delete"),"read")
  assert.equal(parseSetlistMode("manage"),"manage")
  assert.equal(parseSetlistMode("performance"),"performance")
})
