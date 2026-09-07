import { requireUserContext } from "@/lib/auth/session"
import { withServerTiming } from "@/lib/server-timing"
import {
  finaliseTuneCollectionPage,
  normaliseTuneCollectionPageSize,
  resolveTuneCollectionRequest,
  TUNE_COLLECTION_PAGE_SIZE,
  type TuneCollectionQueryState,
  type TuneCollectionSort,
} from "@/lib/tune-collections/pagination"
import { applyPieceCollectionCursor } from "@/lib/tune-collections/query"
import { loadTuneMediaBundles } from "@/lib/tune-media"
import type {
  LearningListItemMembership,
  LearningListOwner,
  Piece,
  PieceFilterOption,
  StyleOption,
  UserKnownPiece,
} from "@/lib/types"

export type LibrarySort = TuneCollectionSort

type LoadLibraryDataParams = Omit<
  TuneCollectionQueryState,
  "after" | "before"
> & {
  after?: string | null
  before?: string | null
  pageSize?: number
}

type LearningListItemRow = {
  piece_id: number
  learning_list_id: number
  learning_lists: LearningListOwner | LearningListOwner[] | null
}

type PieceIdRow = {
  id?: number
  piece_id?: number
}

const PIECE_COLLECTION_SELECT = `
  id,
  title,
  alternate_titles,
  type,
  key,
  style,
  time_signature,
  composer,
  reference_url,
  created_at,
  piece_styles (
    style_id,
    styles (
      id,
      slug,
      label
    )
  )
`

// Facets are lightweight metadata, not the rendered collection. Keep the scan
// explicitly bounded until a distinct-facet RPC is justified by catalogue size.
export const FILTER_FACET_SCAN_LIMIT = 2_000
const STYLE_MATCH_SCAN_LIMIT = 5_000

function normaliseLearningListItem(
  item: LearningListItemRow
): LearningListItemMembership | null {
  const learningList = Array.isArray(item.learning_lists)
    ? item.learning_lists[0] ?? null
    : item.learning_lists

  if (!learningList) return null

  return {
    piece_id: item.piece_id,
    learning_list_id: item.learning_list_id,
    learning_lists: {
      id: learningList.id,
      name: learningList.name,
      user_id: learningList.user_id,
    },
  }
}

async function loadStylePieceIds({
  supabase,
  selectedStyles,
  styleOptions,
}: {
  supabase: Awaited<ReturnType<typeof requireUserContext>>["supabase"]
  selectedStyles: string[]
  styleOptions: StyleOption[]
}) {
  if (selectedStyles.length === 0) return null

  const selectedStyleIds = styleOptions
    .filter((style) => selectedStyles.includes(style.label))
    .map((style) => style.id)

  const [legacyResult, joinedResult] = await Promise.all([
    supabase
      .from("pieces")
      .select("id")
      .in("style", selectedStyles)
      .limit(STYLE_MATCH_SCAN_LIMIT),
    selectedStyleIds.length > 0
      ? supabase
          .from("piece_styles")
          .select("piece_id")
          .in("style_id", selectedStyleIds)
          .limit(STYLE_MATCH_SCAN_LIMIT)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (legacyResult.error) throw new Error(legacyResult.error.message)
  if (joinedResult.error) throw new Error(joinedResult.error.message)

  return Array.from(
    new Set([
      ...((legacyResult.data ?? []) as PieceIdRow[])
        .map((row) => row.id)
        .filter((id): id is number => typeof id === "number"),
      ...((joinedResult.data ?? []) as PieceIdRow[])
        .map((row) => row.piece_id)
        .filter((id): id is number => typeof id === "number"),
    ])
  )
}

export async function loadLibraryData({
  searchQuery = "",
  selectedKeys = [],
  selectedStyles = [],
  selectedTimeSignatures = [],
  sort = "title_asc",
  after = null,
  before = null,
  pageSize = TUNE_COLLECTION_PAGE_SIZE,
}: Partial<LoadLibraryDataParams> = {}) {
  const { supabase, user, role: currentUserRole } = await requireUserContext()
  const catalogueStartedAt = performance.now()
  const safePageSize = normaliseTuneCollectionPageSize(pageSize)

  let filterOptionPiecesQuery = supabase.from("pieces").select(`
    key,
    style,
    time_signature,
    piece_styles (
      style_id,
      styles (
        id,
        slug,
        label
      )
    )
  `)

  if (searchQuery) {
    filterOptionPiecesQuery = filterOptionPiecesQuery.ilike(
      "title",
      `%${searchQuery}%`
    )
  }
  filterOptionPiecesQuery = filterOptionPiecesQuery.limit(
    FILTER_FACET_SCAN_LIMIT
  )

  const [
    { data: filterOptionRows, error: filterOptionError },
    { data: learningLists, error: learningListsError },
    { data: styleRows, error: stylesError },
  ] = await withServerTiming("library.filters-and-lists", () =>
    Promise.all([
      filterOptionPiecesQuery,
      supabase
        .from("learning_lists")
        .select("id, name, description")
        .eq("user_id", user.id)
        .order("name"),
      supabase
        .from("styles")
        .select("id, slug, label")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ])
  )

  if (filterOptionError) throw new Error(filterOptionError.message)
  if (learningListsError) throw new Error(learningListsError.message)

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []
  const stylePieceIds = await loadStylePieceIds({
    supabase,
    selectedStyles,
    styleOptions,
  })
  const request = resolveTuneCollectionRequest({ sort, after, before })

  if (stylePieceIds?.length === 0) {
    return {
      user,
      currentUserRole,
      pieces: [] as Piece[],
      filterOptionPieces: (filterOptionRows ?? []) as PieceFilterOption[],
      totalPieceCount: 0,
      pageInfo: {
        pageSize: safePageSize,
        hasPreviousPage: false,
        hasNextPage: false,
        previousCursor: null,
        nextCursor: null,
      },
      userPieces: [],
      userKnownPieces: [] as UserKnownPiece[],
      mediaBundles: new Map(),
      learningLists,
      learningListItems: [] as LearningListItemMembership[],
      styleOptions,
      metrics: {
        collectionQueryCount: 5,
        fetchedTuneRows: 0,
        renderedTuneRows: 0,
      },
    }
  }

  let countQuery = supabase
    .from("pieces")
    .select("id", { count: "exact", head: true })
  let piecesQuery = supabase.from("pieces").select(PIECE_COLLECTION_SELECT)

  if (searchQuery) {
    countQuery = countQuery.ilike("title", `%${searchQuery}%`)
    piecesQuery = piecesQuery.ilike("title", `%${searchQuery}%`)
  }
  if (selectedKeys.length > 0) {
    countQuery = countQuery.in("key", selectedKeys)
    piecesQuery = piecesQuery.in("key", selectedKeys)
  }
  if (selectedTimeSignatures.length > 0) {
    countQuery = countQuery.in("time_signature", selectedTimeSignatures)
    piecesQuery = piecesQuery.in("time_signature", selectedTimeSignatures)
  }
  if (stylePieceIds) {
    countQuery = countQuery.in("id", stylePieceIds)
    piecesQuery = piecesQuery.in("id", stylePieceIds)
  }
  piecesQuery = applyPieceCollectionCursor({
    query: piecesQuery,
    sort,
    direction: request.direction,
    cursor: request.cursor,
    pageSize: safePageSize,
  })

  const [
    { count: totalPieceCount, error: countError },
    { data: pieceRows, error: piecesError },
  ] = await withServerTiming("library.catalogue-page", () =>
    Promise.all([countQuery, piecesQuery])
  )

  if (countError) throw new Error(countError.message)
  if (piecesError) throw new Error(piecesError.message)

  const { items: pieces, pageInfo } = finaliseTuneCollectionPage({
    rows: (pieceRows ?? []) as Piece[],
    pageSize: safePageSize,
    sort,
    direction: request.direction,
    requestToken: request.requestToken,
  })

  if (process.env.NODE_ENV === "development") {
    console.info(
      `[server-timing] library.catalogue: ${(
        performance.now() - catalogueStartedAt
      ).toFixed(1)}ms; fetched=${pieceRows?.length ?? 0}; rendered=${pieces.length}`
    )
  }

  const pieceIds = pieces.map((piece) => piece.id)
  const [mediaBundles, userState] = await withServerTiming(
    "library.media-and-user-state",
    () =>
      Promise.all([
        loadTuneMediaBundles({ supabase, pieces, userId: user.id }),
        (async () => {
          if (pieceIds.length === 0) {
            return {
              userPieces: [],
              userKnownPieces: [] as UserKnownPiece[],
              learningListItems: [] as LearningListItemMembership[],
            }
          }

          const [userPiecesResult, knownResult, listItemsResult] =
            await Promise.all([
              supabase
                .from("user_pieces")
                .select("id, piece_id, status, next_review_due, stage")
                .eq("user_id", user.id)
                .in("piece_id", pieceIds),
              supabase
                .from("user_known_pieces")
                .select("id, piece_id")
                .eq("user_id", user.id)
                .in("piece_id", pieceIds),
              supabase
                .from("learning_list_items")
                .select(
                  "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
                )
                .eq("learning_lists.user_id", user.id)
                .in("piece_id", pieceIds),
            ])

          if (userPiecesResult.error) {
            throw new Error(userPiecesResult.error.message)
          }
          if (knownResult.error) throw new Error(knownResult.error.message)
          if (listItemsResult.error) {
            throw new Error(listItemsResult.error.message)
          }

          return {
            userPieces: userPiecesResult.data ?? [],
            userKnownPieces: (knownResult.data ?? []) as UserKnownPiece[],
            learningListItems: (
              (listItemsResult.data ?? []) as LearningListItemRow[]
            )
              .map(normaliseLearningListItem)
              .filter(
                (item): item is LearningListItemMembership => item !== null
              ),
          }
        })(),
      ])
  )

  return {
    user,
    currentUserRole,
    pieces,
    filterOptionPieces: (filterOptionRows ?? []) as PieceFilterOption[],
    totalPieceCount: totalPieceCount ?? 0,
    pageInfo,
    ...userState,
    mediaBundles,
    learningLists,
    styleOptions,
    metrics: {
      collectionQueryCount: selectedStyles.length > 0 ? 14 : 12,
      fetchedTuneRows: pieceRows?.length ?? 0,
      renderedTuneRows: pieces.length,
    },
  }
}
