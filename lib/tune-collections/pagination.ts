import { Buffer } from "node:buffer"
import type { Piece } from "@/lib/types"

export const TUNE_COLLECTION_PAGE_SIZE = 20
export const TUNE_COLLECTION_MAX_PAGE_SIZE = 50
export const TUNE_COLLECTION_MAX_SEARCH_LENGTH = 120
export const TUNE_COLLECTION_MAX_FILTER_VALUES = 12

export type TuneCollectionSort = "title_asc" | "newest" | "oldest"
export type TuneCollectionDirection = "initial" | "next" | "previous"

export type TuneCollectionCursor = {
  version: 1
  sort: TuneCollectionSort
  value: string
  id: number
}

export type TuneCollectionQueryState = {
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  sort: TuneCollectionSort
  after: string | null
  before: string | null
}

export type TuneCollectionPageInfo = {
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextCursor: string | null
  previousCursor: string | null
}

export type TuneCollectionScope =
  | "catalogue"
  | "known"
  | "practice"
  | "learning-queue"
  | "list-membership"
  | "profile-repertoire"
  | "compare"

export type TuneCollectionAdapter = {
  scope: TuneCollectionScope
  publicFields: readonly string[]
  privateFields: readonly string[]
  defaultSort: string
  permissionBoundary: string
  pageSize: number
}

/**
 * Query contracts for collection consumers. These are deliberately separate:
 * public/profile/compare shapes must never inherit private list or practice data.
 */
export const TUNE_COLLECTION_ADAPTERS: readonly TuneCollectionAdapter[] = [
  {
    scope: "catalogue",
    publicFields: [
      "id",
      "title",
      "alternate_titles",
      "type",
      "key",
      "style",
      "time_signature",
      "composer",
      "reference_url",
      "created_at",
    ],
    privateFields: ["personal_state", "owned_list_memberships"],
    defaultSort: "title_asc, id",
    permissionBoundary: "Public tune rows plus the current user's RLS-scoped state.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "known",
    publicFields: ["piece identity"],
    privateFields: ["current user's known membership"],
    defaultSort: "title_asc, id",
    permissionBoundary: "Current user only through user_known_pieces RLS.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "practice",
    publicFields: ["piece identity"],
    privateFields: ["stage", "next_review_due", "user_piece_id"],
    defaultSort: "title_asc, id",
    permissionBoundary: "Current user only through user_pieces RLS.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "learning-queue",
    publicFields: ["piece identity"],
    privateFields: ["owned list names", "first-added position"],
    defaultSort: "first_added_at, piece_id",
    permissionBoundary: "Derive only from lists visible to the current user.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "list-membership",
    publicFields: ["piece identity", "list position"],
    privateFields: ["viewer personal state when authenticated"],
    defaultSort: "position, piece_id",
    permissionBoundary: "List visibility/share policy first; viewer state stays RLS-scoped.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "profile-repertoire",
    publicFields: ["piece identity", "profile repertoire state"],
    privateFields: ["viewer relationship and viewer-owned list membership"],
    defaultSort: "title_asc, id",
    permissionBoundary: "Profile privacy gate before repertoire query; viewer state queried separately.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
  {
    scope: "compare",
    publicFields: ["mutual piece identity"],
    privateFields: [],
    defaultSort: "title_asc, id",
    permissionBoundary: "Friend/privacy eligibility before repertoire intersection.",
    pageSize: TUNE_COLLECTION_PAGE_SIZE,
  },
] as const

export function getTuneCollectionAdapter(scope: TuneCollectionScope) {
  return TUNE_COLLECTION_ADAPTERS.find((adapter) => adapter.scope === scope)!
}

export function normaliseTuneCollectionPageSize(value: number | undefined) {
  if (!Number.isSafeInteger(value) || Number(value) < 1) {
    return TUNE_COLLECTION_PAGE_SIZE
  }

  return Math.min(Number(value), TUNE_COLLECTION_MAX_PAGE_SIZE)
}

type RawSearchParam = string | string[] | undefined

function firstValue(value: RawSearchParam) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function cleanFilterValues(value: RawSearchParam) {
  const values = Array.isArray(value) ? value : value ? [value] : []

  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, TUNE_COLLECTION_MAX_FILTER_VALUES)
    )
  )
}

export function parseTuneCollectionQueryState(params: {
  q?: RawSearchParam
  key?: RawSearchParam
  style?: RawSearchParam
  time_signature?: RawSearchParam
  sort?: RawSearchParam
  after?: RawSearchParam
  before?: RawSearchParam
}): TuneCollectionQueryState {
  const rawSort = firstValue(params.sort)
  const sort: TuneCollectionSort =
    rawSort === "newest" || rawSort === "oldest" ? rawSort : "title_asc"
  const after = firstValue(params.after).slice(0, 1_024) || null
  const before = after
    ? null
    : firstValue(params.before).slice(0, 1_024) || null

  return {
    searchQuery: firstValue(params.q)
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, TUNE_COLLECTION_MAX_SEARCH_LENGTH),
    selectedKeys: cleanFilterValues(params.key),
    selectedStyles: cleanFilterValues(params.style),
    selectedTimeSignatures: cleanFilterValues(params.time_signature),
    sort,
    after,
    before,
  }
}

export function encodeTuneCollectionCursor(cursor: TuneCollectionCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")
}

export function decodeTuneCollectionCursor(
  token: string | null | undefined,
  expectedSort: TuneCollectionSort
): TuneCollectionCursor | null {
  if (!token || token.length > 1_024) return null

  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as Partial<TuneCollectionCursor>

    if (
      parsed.version !== 1 ||
      parsed.sort !== expectedSort ||
      typeof parsed.value !== "string" ||
      parsed.value.length > 256 ||
      !Number.isSafeInteger(parsed.id) ||
      Number(parsed.id) <= 0
    ) {
      return null
    }

    return {
      version: 1,
      sort: expectedSort,
      value: parsed.value,
      id: Number(parsed.id),
    }
  } catch {
    return null
  }
}

export function getTuneCursorValue(
  piece: Pick<Piece, "title" | "created_at">,
  sort: TuneCollectionSort
) {
  if (sort === "title_asc") return piece.title
  if (piece.created_at) return piece.created_at

  throw new Error(`Cannot create a ${sort} tune cursor without created_at`)
}

export function createTuneCollectionCursor(
  piece: Pick<Piece, "id" | "title" | "created_at">,
  sort: TuneCollectionSort
) {
  return encodeTuneCollectionCursor({
    version: 1,
    sort,
    value: getTuneCursorValue(piece, sort),
    id: piece.id,
  })
}

export function resolveTuneCollectionRequest(
  state: Pick<TuneCollectionQueryState, "sort" | "after" | "before">
) {
  const afterCursor = decodeTuneCollectionCursor(state.after, state.sort)
  if (afterCursor) {
    return {
      direction: "next" as const,
      cursor: afterCursor,
      requestToken: state.after,
    }
  }

  const beforeCursor = decodeTuneCollectionCursor(state.before, state.sort)
  if (beforeCursor) {
    return {
      direction: "previous" as const,
      cursor: beforeCursor,
      requestToken: state.before,
    }
  }

  return {
    direction: "initial" as const,
    cursor: null,
    requestToken: null,
  }
}

export function finaliseTuneCollectionPage<
  T extends Pick<Piece, "id" | "title" | "created_at">,
>({
  rows,
  pageSize = TUNE_COLLECTION_PAGE_SIZE,
  sort,
  direction,
  requestToken,
}: {
  rows: T[]
  pageSize?: number
  sort: TuneCollectionSort
  direction: TuneCollectionDirection
  requestToken?: string | null
}) {
  const safePageSize = normaliseTuneCollectionPageSize(pageSize)
  const hasExtraRow = rows.length > safePageSize
  const queryOrderItems = rows.slice(0, safePageSize)
  const items =
    direction === "previous" ? [...queryOrderItems].reverse() : queryOrderItems
  const hasPreviousPage =
    direction === "previous" ? hasExtraRow : direction === "next"
  const hasNextPage =
    direction === "previous" ? true : hasExtraRow
  const firstItem = items[0] ?? null
  const lastItem = items[items.length - 1] ?? null

  return {
    items,
    pageInfo: {
      pageSize: safePageSize,
      hasPreviousPage,
      hasNextPage,
      previousCursor: hasPreviousPage
        ? firstItem
          ? createTuneCollectionCursor(firstItem, sort)
          : requestToken ?? null
        : null,
      nextCursor: hasNextPage
        ? lastItem
          ? createTuneCollectionCursor(lastItem, sort)
          : requestToken ?? null
        : null,
    } satisfies TuneCollectionPageInfo,
  }
}

export function buildTuneCollectionHref({
  basePath,
  state,
  after,
  before,
  preservedParams = {},
}: {
  basePath: string
  state: Omit<TuneCollectionQueryState, "after" | "before">
  after?: string | null
  before?: string | null
  preservedParams?: Record<string, string | string[] | null | undefined>
}) {
  const params = new URLSearchParams()

  if (state.searchQuery) params.set("q", state.searchQuery)
  state.selectedKeys.forEach((value) => params.append("key", value))
  state.selectedStyles.forEach((value) => params.append("style", value))
  state.selectedTimeSignatures.forEach((value) =>
    params.append("time_signature", value)
  )
  if (state.sort !== "title_asc") params.set("sort", state.sort)
  for (const [key, rawValue] of Object.entries(preservedParams)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]
    values.filter(Boolean).forEach((value) => params.append(key, String(value)))
  }
  if (after) params.set("after", after)
  if (before) params.set("before", before)

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
