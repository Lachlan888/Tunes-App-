import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  countPieceFilterDraftMatches,
  formatTuneResultsStatement,
} from "../lib/tune-collections/filter-drafts.ts"
import {
  MAX_CATALOGUE_SELECTION,
  parseStoredCatalogueSelection,
  toggleCatalogueSelection,
} from "../lib/tune-collections/selection.ts"
import {
  findExactTuneDuplicate,
  getTuneDuplicateSuggestions,
  type TuneDuplicateCandidate,
} from "../lib/tunes/duplicate-suggestions.ts"
import type { PieceFilterOption } from "../lib/types.ts"

const filterPieces: PieceFilterOption[] = [
  {
    key: "D",
    style: "Irish",
    time_signature: "6/8",
    piece_styles: [],
  },
  {
    key: "G",
    style: null,
    time_signature: "4/4",
    piece_styles: [
      {
        style_id: 2,
        styles: { id: 2, slug: "old-time", label: "Old-time" },
      },
    ],
  },
  {
    key: "D",
    style: "Scottish",
    time_signature: "4/4",
    piece_styles: [],
  },
]

test("filter drafts count prospective matches without mutating applied URL state", () => {
  assert.equal(
    countPieceFilterDraftMatches(filterPieces, {
      keys: ["D"],
      styles: [],
      timeSignatures: [],
    }),
    2
  )
  assert.equal(
    countPieceFilterDraftMatches(filterPieces, {
      keys: ["G"],
      styles: ["Old-time"],
      timeSignatures: ["4/4"],
    }),
    1
  )
  assert.equal(formatTuneResultsStatement(124, 3), "124 tunes · 3 filters")
})

test("catalogue selection is reversible, private, deduplicated, and bounded", () => {
  assert.deepEqual(toggleCatalogueSelection([], 7), [7])
  assert.deepEqual(toggleCatalogueSelection([7, 9], 7), [9])
  assert.deepEqual(
    parseStoredCatalogueSelection('[7,"9",7,-2,"bad"]'),
    [7, 9]
  )
  assert.deepEqual(parseStoredCatalogueSelection("not-json"), [])

  const fullSelection = Array.from(
    { length: MAX_CATALOGUE_SELECTION },
    (_, index) => index + 1
  )
  assert.deepEqual(
    toggleCatalogueSelection(fullSelection, MAX_CATALOGUE_SELECTION + 1),
    fullSelection
  )
})

test("duplicate suggestions explain exact titles, aliases, and likely matches", () => {
  const candidates: TuneDuplicateCandidate[] = [
    {
      id: 1,
      title: "The Banshee",
      alternate_titles: "McMahon's Reel; James McMahon's",
      type: "tune",
      key: "G",
      style: "Irish",
      time_signature: "4/4",
      composer: null,
    },
    {
      id: 2,
      title: "Banish Misfortune",
      alternate_titles: null,
      type: "tune",
      key: "D",
      style: "Irish",
      time_signature: "6/8",
      composer: null,
    },
  ]

  const exact = getTuneDuplicateSuggestions("Banshee!", candidates)
  assert.equal(exact[0]?.id, 1)
  assert.equal(exact[0]?.confidence, "exact")
  assert.match(exact[0]?.reason ?? "", /Same title/)

  const alias = getTuneDuplicateSuggestions("McMahons Reel", candidates)
  assert.equal(alias[0]?.id, 1)
  assert.equal(alias[0]?.confidence, "exact")
  assert.match(alias[0]?.reason ?? "", /alternate title/)

  assert.equal(findExactTuneDuplicate("The Banshee", candidates)?.id, 1)
  assert.deepEqual(getTuneDuplicateSuggestions("xy", candidates), [])
})

test("catalogue UI wires staged filters, selection dock, and progressive creation", () => {
  const filters = readFileSync(
    new URL("../components/library/PieceSearchFilters.tsx", import.meta.url),
    "utf8"
  )
  const workspace = readFileSync(
    new URL("../components/library/CatalogueWorkspace.tsx", import.meta.url),
    "utf8"
  )
  const libraryList = readFileSync(
    new URL("../components/library/LibraryList.tsx", import.meta.url),
    "utf8"
  )
  const cataloguePreview = readFileSync(
    new URL("../components/library/CataloguePreview.tsx", import.meta.url),
    "utf8"
  )
  const createTune = readFileSync(
    new URL("../components/library/CreateTuneForm.tsx", import.meta.url),
    "utf8"
  )

  assert.match(filters, /setDraftKeys/)
  assert.match(filters, /handleApplyFilters/)
  assert.match(filters, /cancelPanel/)
  assert.match(filters, /router\.push\(href\)/)
  assert.match(
    filters,
    /onChange=\{\(event\) =>\s*handleMultiCheckboxChange\(/
  )
  assert.match(workspace, /context: "catalogue-selection"/)
  assert.match(workspace, /sessionStorage/)
  assert.match(workspace, /Add to List/)
  assert.doesNotMatch(libraryList, /CardPager/)
  assert.match(cataloguePreview, /grid grid-cols-2/)
  assert.match(cataloguePreview, /max-w-80/)
  assert.match(cataloguePreview, /key=\{piece\.id\}/)
  assert.match(cataloguePreview, /event\.key === "Escape"/)
  assert.ok(
    cataloguePreview.indexOf("Open Tune Detail") <
      cataloguePreview.indexOf("<dl className=")
  )
  assert.match(createTune, /"identity" \| "details"/)
  assert.match(createTune, /duplicate-suggestions/)
  assert.match(createTune, /I checked these matches/)
})
