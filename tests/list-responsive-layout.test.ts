import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const listsPage = readFileSync(
  new URL("../app/learning-lists/page.tsx", import.meta.url),
  "utf8"
)
const publicListsPage = readFileSync(
  new URL("../app/public-lists/page.tsx", import.meta.url),
  "utf8"
)
const listViews = readFileSync(
  new URL("../components/lists/ListsPageViews.tsx", import.meta.url),
  "utf8"
)

test("My Lists adapts from one column on phones to two on tablets and three on wide desktops", () => {
  assert.match(
    listsPage,
    /className="grid grid-cols-1 gap-x-8 border-t border-hairline md:grid-cols-2 xl:grid-cols-3"/
  )
  assert.match(
    publicListsPage,
    /className="grid grid-cols-1 gap-x-8 border-t border-hairline md:grid-cols-2 xl:grid-cols-3"/
  )
  assert.match(
    listViews,
    /return <div className="grid grid-cols-1 gap-x-8 border-t border-hairline md:grid-cols-2 xl:grid-cols-3">/
  )
})
