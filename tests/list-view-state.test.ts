import assert from "node:assert/strict"
import test from "node:test"
import {
  LIST_PAGE_SIZE,
  paginateListItems,
  parseListPage,
  withListPage,
} from "../lib/list-view-state.ts"

test("list collection pagination is bounded and clamps stale pages", () => {
  const items = Array.from({ length: 45 }, (_, index) => index + 1)
  const first = paginateListItems(items, parseListPage("0"))
  const last = paginateListItems(items, 99)

  assert.equal(first.items.length, LIST_PAGE_SIZE)
  assert.equal(first.page, 1)
  assert.equal(first.hasPreviousPage, false)
  assert.equal(first.hasNextPage, true)
  assert.deepEqual(last.items, [41, 42, 43, 44, 45])
  assert.equal(last.page, 3)
})

test("list page links preserve selected URL state", () => {
  assert.equal(
    withListPage("/learning-lists?view=learning-queue&q=reel", 2),
    "/learning-lists?view=learning-queue&q=reel&page=2"
  )
  assert.equal(
    withListPage("/learning-lists?view=learning-queue&page=3", 1),
    "/learning-lists?view=learning-queue"
  )
})
