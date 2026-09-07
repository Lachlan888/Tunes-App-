import type {
  TuneCollectionCursor,
  TuneCollectionDirection,
  TuneCollectionSort,
} from "@/lib/tune-collections/pagination"

type PieceCollectionQuery = {
  or: (filters: string) => PieceCollectionQuery
  order: (
    column: string,
    options?: { ascending?: boolean }
  ) => PieceCollectionQuery
  limit: (count: number) => PieceCollectionQuery
}

type PieceCollectionFilterQuery = {
  ilike: (column: string, pattern: string) => PieceCollectionFilterQuery
  in: (column: string, values: readonly (string | number)[]) => PieceCollectionFilterQuery
}

export type PieceCollectionFilters = {
  searchQuery: string
  selectedKeys: string[]
  selectedTimeSignatures: string[]
  allowedPieceIds?: number[] | null
}

export function applyPieceCollectionFilters<T extends PieceCollectionFilterQuery>({
  query,
  filters,
}: {
  query: T
  filters: PieceCollectionFilters
}) {
  let nextQuery: PieceCollectionFilterQuery = query

  if (filters.searchQuery) {
    nextQuery = nextQuery.ilike("title", `%${filters.searchQuery}%`)
  }
  if (filters.selectedKeys.length > 0) {
    nextQuery = nextQuery.in("key", filters.selectedKeys)
  }
  if (filters.selectedTimeSignatures.length > 0) {
    nextQuery = nextQuery.in(
      "time_signature",
      filters.selectedTimeSignatures
    )
  }
  if (filters.allowedPieceIds) {
    nextQuery = nextQuery.in("id", filters.allowedPieceIds)
  }

  return nextQuery as T
}

export function escapePostgrestFilterValue(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`
}

export function buildPieceCursorFilter({
  cursor,
  sort,
  direction,
}: {
  cursor: TuneCollectionCursor
  sort: TuneCollectionSort
  direction: Exclude<TuneCollectionDirection, "initial">
}) {
  const primaryColumn = sort === "title_asc" ? "title" : "created_at"
  const ascending = sort !== "newest"
  const movingForward = direction === "next"
  const greaterThan = movingForward ? ascending : !ascending
  const operator = greaterThan ? "gt" : "lt"
  const value = escapePostgrestFilterValue(cursor.value)

  // The public piece id is the deterministic tie-breaker for duplicate titles
  // and timestamps. No private membership identifier is placed in the URL.
  return `${primaryColumn}.${operator}.${value},and(${primaryColumn}.eq.${value},id.${operator}.${cursor.id})`
}

export function applyPieceCollectionCursor<T extends PieceCollectionQuery>({
  query,
  sort,
  direction,
  cursor,
  pageSize,
}: {
  query: T
  sort: TuneCollectionSort
  direction: TuneCollectionDirection
  cursor: TuneCollectionCursor | null
  pageSize: number
}) {
  let nextQuery: PieceCollectionQuery = query

  if (cursor && direction !== "initial") {
    nextQuery = nextQuery.or(
      buildPieceCursorFilter({ cursor, sort, direction })
    )
  }

  const normalAscending = sort !== "newest"
  const queryAscending =
    direction === "previous" ? !normalAscending : normalAscending
  const primaryColumn = sort === "title_asc" ? "title" : "created_at"

  return nextQuery
    .order(primaryColumn, { ascending: queryAscending })
    .order("id", { ascending: queryAscending })
    .limit(pageSize + 1) as T
}
