import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { adaptTuneCollectionItem } from "../lib/tune-collections/adapters.ts"
import {
  TUNE_COLLECTION_ADAPTERS,
  TUNE_COLLECTION_MAX_FILTER_VALUES,
  TUNE_COLLECTION_MAX_PAGE_SIZE,
  buildTuneCollectionHref,
  decodeTuneCollectionCursor,
  finaliseTuneCollectionPage,
  getTuneCollectionAdapter,
  normaliseTuneCollectionPageSize,
  parseTuneCollectionQueryState,
} from "../lib/tune-collections/pagination.ts"
import {
  applyPieceCollectionFilters,
  buildPieceCursorFilter,
  escapePostgrestFilterValue,
} from "../lib/tune-collections/query.ts"

type TestPiece = {
  id: number
  title: string
  created_at: string
}

function piece(id: number, title: string, createdAt = "2026-01-01T00:00:00Z") {
  return { id, title, created_at: createdAt } satisfies TestPiece
}

test("collection URL state is validated, bounded, and shareable", () => {
  const state = parseTuneCollectionQueryState({
    q: "  rolling   wave  ",
    key: ["D", "G", "D", "", ...Array.from({ length: 20 }, (_, i) => `K${i}`)],
    style: ["Irish", "Scottish"],
    time_signature: ["6/8"],
    sort: "newest",
    after: "next-token",
    before: "ignored-token",
  })

  assert.equal(state.searchQuery, "rolling wave")
  assert.ok(state.selectedKeys.length <= TUNE_COLLECTION_MAX_FILTER_VALUES)
  assert.deepEqual(state.selectedKeys.slice(0, 2), ["D", "G"])
  assert.equal(state.sort, "newest")
  assert.equal(state.after, "next-token")
  assert.equal(state.before, null)

  const href = buildTuneCollectionHref({
    basePath: "/library",
    state: {
      searchQuery: state.searchQuery,
      selectedKeys: state.selectedKeys.slice(0, 2),
      selectedStyles: state.selectedStyles,
      selectedTimeSignatures: state.selectedTimeSignatures,
      sort: state.sort,
    },
    after: "next-token",
  })

  assert.equal(
    href,
    "/library?q=rolling+wave&key=D&key=G&style=Irish&style=Scottish&time_signature=6%2F8&sort=newest&after=next-token"
  )
})

test("cursor pages remain deterministic when primary sort values are duplicated", () => {
  const page = finaliseTuneCollectionPage({
    rows: [piece(4, "The Banshee"), piece(9, "The Banshee"), piece(12, "The Banshee")],
    pageSize: 2,
    sort: "title_asc",
    direction: "initial",
  })

  assert.deepEqual(page.items.map((item) => item.id), [4, 9])
  assert.equal(page.pageInfo.hasNextPage, true)
  const cursor = decodeTuneCollectionCursor(
    page.pageInfo.nextCursor,
    "title_asc"
  )
  assert.deepEqual(cursor, {
    version: 1,
    sort: "title_asc",
    value: "The Banshee",
    id: 9,
  })
  assert.equal(
    buildPieceCursorFilter({
      cursor: cursor!,
      sort: "title_asc",
      direction: "next",
    }),
    'title.gt."The Banshee",and(title.eq."The Banshee",id.gt.9)'
  )
})

test("previous, final, and empty cursor pages expose correct controls", () => {
  const previous = finaliseTuneCollectionPage({
    rows: [piece(2, "B"), piece(1, "A")],
    pageSize: 2,
    sort: "title_asc",
    direction: "previous",
    requestToken: "requested-page",
  })
  assert.deepEqual(previous.items.map((item) => item.id), [1, 2])
  assert.equal(previous.pageInfo.hasPreviousPage, false)
  assert.equal(previous.pageInfo.hasNextPage, true)

  const finalPage = finaliseTuneCollectionPage({
    rows: [piece(20, "Z")],
    pageSize: 20,
    sort: "title_asc",
    direction: "next",
    requestToken: "prior-page",
  })
  assert.equal(finalPage.pageInfo.hasPreviousPage, true)
  assert.equal(finalPage.pageInfo.hasNextPage, false)

  const empty = finaliseTuneCollectionPage({
    rows: [],
    pageSize: 20,
    sort: "title_asc",
    direction: "initial",
  })
  assert.deepEqual(empty.items, [])
  assert.equal(empty.pageInfo.previousCursor, null)
  assert.equal(empty.pageInfo.nextCursor, null)
})

test("cursor sort and page-size guards reject stale or oversized requests", () => {
  const page = finaliseTuneCollectionPage({
    rows: Array.from({ length: 60 }, (_, index) => piece(index + 1, `Tune ${index}`)),
    pageSize: 500,
    sort: "title_asc",
    direction: "initial",
  })

  assert.equal(normaliseTuneCollectionPageSize(0), 20)
  assert.equal(normaliseTuneCollectionPageSize(500), TUNE_COLLECTION_MAX_PAGE_SIZE)
  assert.equal(page.items.length, TUNE_COLLECTION_MAX_PAGE_SIZE)
  assert.equal(
    decodeTuneCollectionCursor(page.pageInfo.nextCursor, "newest"),
    null
  )
})

test("PostgREST cursor values escape reserved quote and slash characters", () => {
  assert.equal(
    escapePostgrestFilterValue('The \\ "Fox", No. 2'),
    '"The \\\\ \\"Fox\\", No. 2"'
  )
})

test("every collection consumer has an explicit permission adapter", () => {
  assert.deepEqual(
    TUNE_COLLECTION_ADAPTERS.map((adapter) => adapter.scope),
    [
      "catalogue",
      "known",
      "practice",
      "learning-queue",
      "list-membership",
      "profile-repertoire",
      "compare",
    ]
  )

  for (const adapter of TUNE_COLLECTION_ADAPTERS) {
    assert.equal(adapter.pageSize, 20)
    assert.ok(adapter.permissionBoundary.length > 20)
    assert.ok(adapter.defaultSort.includes("piece_id") || adapter.defaultSort.includes("id"))
  }

  assert.deepEqual(getTuneCollectionAdapter("compare").privateFields, [])
  assert.ok(getTuneCollectionAdapter("practice").privateFields.includes("stage"))

  const compareItem = adaptTuneCollectionItem(
    "compare",
    {
      id: 12,
      title: "Shared tune",
      key: "D",
      style: "Irish",
      time_signature: "6/8",
    },
    {}
  )
  assert.deepEqual(compareItem.privateData, {})
  assert.deepEqual(Object.keys(compareItem.identity).sort(), [
    "alternate_titles",
    "composer",
    "created_at",
    "id",
    "key",
    "piece_styles",
    "reference_url",
    "style",
    "time_signature",
    "title",
    "type",
  ])
})

test("shared query helper composes search and facet filters without offsets", () => {
  const calls: Array<[string, string, string | readonly (string | number)[]]> = []
  const query = {
    ilike(column: string, pattern: string) {
      calls.push(["ilike", column, pattern])
      return this
    },
    in(column: string, values: readonly (string | number)[]) {
      calls.push(["in", column, values])
      return this
    },
  }

  applyPieceCollectionFilters({
    query,
    filters: {
      searchQuery: "Banshee",
      selectedKeys: ["D"],
      selectedTimeSignatures: ["6/8"],
      allowedPieceIds: [2, 7],
    },
  })

  assert.deepEqual(calls, [
    ["ilike", "title", "%Banshee%"],
    ["in", "key", ["D"]],
    ["in", "time_signature", ["6/8"]],
    ["in", "id", [2, 7]],
  ])
})

test("catalogue and repertoire routes render bounded rows without per-row forms", () => {
  const libraryLoader = readFileSync("lib/loaders/library.ts", "utf8")
  const libraryList = readFileSync("components/library/LibraryList.tsx", "utf8")
  const repertoireLoader = readFileSync("lib/loaders/repertoire.ts", "utf8")
  const repertoireList = readFileSync(
    "components/repertoire/RepertoireTuneList.tsx",
    "utf8"
  )
  const tuneRow = readFileSync("components/tunes/TuneRow.tsx", "utf8")

  assert.doesNotMatch(libraryLoader, /mobilePieces|visibleCount === "all"/)
  assert.doesNotMatch(libraryList, /CardPager|<form/)
  assert.doesNotMatch(repertoireList, /TuneCard|<form/)
  assert.match(libraryLoader, /\.limit\(\s*FILTER_FACET_SCAN_LIMIT\s*\)/)
  assert.match(repertoireLoader, /\.limit\(FILTER_FACET_SCAN_LIMIT\)/)
  assert.match(repertoireLoader, /!inner/)
  assert.match(tuneRow, /<article/)
  assert.match(tuneRow, /aria-label={`Actions for \$\{piece\.title\}`}/)
})
