import { redirectToLogin } from "@/lib/auth/login-redirect"
import { createClient } from "@/lib/supabase/server"
import {
  finaliseTuneCollectionPage,
  normaliseTuneCollectionPageSize,
  resolveTuneCollectionRequest,
  TUNE_COLLECTION_PAGE_SIZE,
  type TuneCollectionQueryState,
} from "@/lib/tune-collections/pagination"
import { applyPieceCollectionCursor } from "@/lib/tune-collections/query"
import type {
  LearningList,
  Piece,
  PieceFilterOption,
  StyleOption,
  UserPiece,
} from "@/lib/types"

type KnownMembershipRow = {
  id: number
  piece_id: number
}

type PracticeMembershipRow = UserPiece

type PieceIdRow = {
  id?: number
  piece_id?: number
}

type LearningListItemRow = {
  piece_id: number
  learning_list_id: number
  learning_lists:
    | { id: number; name: string; user_id: string }
    | { id: number; name: string; user_id: string }[]
    | null
}

export type RepertoireLearningListItem = {
  piece_id: number
  learning_list_id: number
  learning_lists: { id: number; name: string; user_id: string }
}

export type PracticeTuneItem = UserPiece & {
  piece: Piece
}

type LoadRepertoireParams = Partial<TuneCollectionQueryState> & {
  pageSize?: number
}

type RelatedMembership<T> = T | T[] | null

type RepertoirePieceRow = Piece & {
  known_membership?: RelatedMembership<KnownMembershipRow>
  practice_membership?: RelatedMembership<PracticeMembershipRow>
}

const PIECE_SELECT = `
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

export const FILTER_FACET_SCAN_LIMIT = 2_000
const STYLE_MATCH_SCAN_LIMIT = 5_000

function getRelatedMembership<T>(value: RelatedMembership<T> | undefined) {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function stripMemberships(row: RepertoirePieceRow): Piece {
  const { known_membership, practice_membership, ...piece } = row
  void known_membership
  void practice_membership
  return piece
}

function normaliseLearningListItem(
  item: LearningListItemRow
): RepertoireLearningListItem | null {
  const learningList = Array.isArray(item.learning_lists)
    ? item.learning_lists[0] ?? null
    : item.learning_lists

  if (!learningList) return null

  return {
    piece_id: item.piece_id,
    learning_list_id: item.learning_list_id,
    learning_lists: learningList,
  }
}

async function loadSharedListData({
  supabase,
  userId,
  pieceIds,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  pieceIds: number[]
}) {
  const [{ data: learningLists, error: learningListsError }, itemResult] =
    await Promise.all([
      supabase
        .from("learning_lists")
        .select("id, name, description")
        .eq("user_id", userId)
        .order("name"),
      pieceIds.length > 0
        ? supabase
            .from("learning_list_items")
            .select(
              "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
            )
            .eq("learning_lists.user_id", userId)
            .in("piece_id", pieceIds)
        : Promise.resolve({ data: [], error: null }),
    ])

  if (learningListsError) throw new Error(learningListsError.message)
  if (itemResult.error) throw new Error(itemResult.error.message)

  return {
    learningLists: (learningLists ?? []) as LearningList[],
    learningListItems: ((itemResult.data ?? []) as LearningListItemRow[])
      .map(normaliseLearningListItem)
      .filter((item): item is RepertoireLearningListItem => item !== null),
  }
}

async function loadStylePieceIds({
  supabase,
  selectedStyles,
  styleOptions,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
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

async function loadRepertoirePage(
  mode: "known" | "practice",
  {
    searchQuery = "",
    selectedKeys = [],
    selectedStyles = [],
    selectedTimeSignatures = [],
    sort = "title_asc",
    after = null,
    before = null,
    pageSize = TUNE_COLLECTION_PAGE_SIZE,
  }: LoadRepertoireParams = {}
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirectToLogin()
  const safePageSize = normaliseTuneCollectionPageSize(pageSize)
  const membershipAlias =
    mode === "known" ? "known_membership" : "practice_membership"
  const membershipTable =
    mode === "known" ? "user_known_pieces" : "user_pieces"
  const membershipSelect =
    mode === "known"
      ? `${membershipAlias}:${membershipTable}!inner(id, piece_id)`
      : `${membershipAlias}:${membershipTable}!inner(id, piece_id, status, next_review_due, stage)`

  let filterOptionQuery = supabase
    .from("pieces")
    .select(
      `key, style, time_signature, piece_styles(style_id, styles(id, slug, label)), ${membershipSelect}`
    )
    .eq(`${membershipAlias}.user_id`, user.id)
    .limit(FILTER_FACET_SCAN_LIMIT)

  if (mode === "practice") {
    filterOptionQuery = filterOptionQuery.eq(
      `${membershipAlias}.status`,
      "learning"
    )
  }

  if (searchQuery) {
    filterOptionQuery = filterOptionQuery.ilike("title", `%${searchQuery}%`)
  }

  const [filterOptionResult, stylesResult] = await Promise.all([
    filterOptionQuery,
    supabase
      .from("styles")
      .select("id, slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ])

  if (filterOptionResult.error) {
    throw new Error(filterOptionResult.error.message)
  }

  const styleOptions = stylesResult.error
    ? []
    : ((stylesResult.data ?? []) as StyleOption[])
  const stylePieceIds = await loadStylePieceIds({
    supabase,
    selectedStyles,
    styleOptions,
  })
  const request = resolveTuneCollectionRequest({ sort, after, before })

  if (stylePieceIds?.length === 0) {
    const shared = await loadSharedListData({
      supabase,
      userId: user.id,
      pieceIds: [],
    })

    return {
      user,
      pieces: [] as Piece[],
      practiceItems: [] as PracticeTuneItem[],
      totalCount: 0,
      filterOptionPieces: (filterOptionResult.data ?? []) as unknown as PieceFilterOption[],
      styleOptions,
      pageInfo: {
        pageSize: safePageSize,
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
      ...shared,
      metrics: {
        collectionQueryCount: 6,
        fetchedTuneRows: 0,
        renderedTuneRows: 0,
        facetRows: filterOptionResult.data?.length ?? 0,
      },
    }
  }

  let countQuery = supabase
      .from("pieces")
      .select(`id, ${membershipSelect}`, { count: "exact", head: true })
      .eq(`${membershipAlias}.user_id`, user.id)
  let piecesQuery = supabase
      .from("pieces")
      .select(`${PIECE_SELECT}, ${membershipSelect}`)
      .eq(`${membershipAlias}.user_id`, user.id)

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

  if (mode === "practice") {
    countQuery = countQuery.eq(`${membershipAlias}.status`, "learning")
    piecesQuery = piecesQuery.eq(`${membershipAlias}.status`, "learning")
  }

  piecesQuery = applyPieceCollectionCursor({
    query: piecesQuery,
    sort,
    direction: request.direction,
    cursor: request.cursor,
    pageSize: safePageSize,
  })

  const [countResult, pageResult] = await Promise.all([countQuery, piecesQuery])
  if (countResult.error) throw new Error(countResult.error.message)
  if (pageResult.error) throw new Error(pageResult.error.message)

  const { items: pageRows, pageInfo } = finaliseTuneCollectionPage({
    rows: (pageResult.data ?? []) as unknown as RepertoirePieceRow[],
    pageSize: safePageSize,
    sort,
    direction: request.direction,
    requestToken: request.requestToken,
  })
  const pieces = pageRows.map(stripMemberships)
  const pagePieceIds = pieces.map((piece) => piece.id)
  const practiceItems =
    mode === "practice"
      ? pageRows
          .map((row) => {
            const membership = getRelatedMembership(
              row.practice_membership
            )
            if (!membership) return null

            return {
              ...membership,
              piece: stripMemberships(row),
            } as PracticeTuneItem
          })
          .filter((item): item is PracticeTuneItem => item !== null)
      : []
  const shared = await loadSharedListData({
    supabase,
    userId: user.id,
    pieceIds: pagePieceIds,
  })

  return {
    user,
    pieces,
    practiceItems,
    totalCount: countResult.count ?? 0,
    filterOptionPieces: (filterOptionResult.data ?? []) as unknown as PieceFilterOption[],
    styleOptions,
    pageInfo,
    ...shared,
    metrics: {
      collectionQueryCount: selectedStyles.length > 0 ? 8 : 6,
      fetchedTuneRows: pageResult.data?.length ?? 0,
      renderedTuneRows: pieces.length,
      facetRows: filterOptionResult.data?.length ?? 0,
    },
  }
}

export function loadKnownTunesPageData(params: LoadRepertoireParams = {}) {
  return loadRepertoirePage("known", params)
}

export function loadPracticeTunesPageData(params: LoadRepertoireParams = {}) {
  return loadRepertoirePage("practice", params)
}
