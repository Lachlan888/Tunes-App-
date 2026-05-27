import { getCurrentUserRole } from "@/lib/auth/roles"
import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type {
  LearningListItemMembership,
  LearningListOwner,
  PieceFilterOption,
  StyleOption,
  UserPieceMediaLoop,
  UserKnownPiece,
} from "@/lib/types"

type LearningListItemRow = {
  piece_id: number
  learning_list_id: number
  learning_lists: LearningListOwner | LearningListOwner[] | null
}

export type LibraryUserPieceMetadata = {
  piece_id: number
  preferred_reference_url: string | null
  preferred_reference_label: string | null
}

export type LibraryPieceMediaLink = {
  id: number
  piece_id: number
  url: string
  label: string | null
}

export type LibrarySort = "title_asc" | "newest" | "oldest"

type LoadLibraryDataParams = {
  searchQuery?: string
  selectedKeys?: string[]
  selectedStyles?: string[]
  selectedTimeSignatures?: string[]
  visibleCount?: number | "all"
  page?: number
  sort?: LibrarySort
}

function normaliseLearningListItem(
  item: LearningListItemRow
): LearningListItemMembership | null {
  const learningList = Array.isArray(item.learning_lists)
    ? item.learning_lists[0] ?? null
    : item.learning_lists

  if (!learningList) {
    return null
  }

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

function normalisePage(value: number | undefined) {
  if (!value || Number.isNaN(value) || value < 1) return 1
  return Math.floor(value)
}

function normaliseSort(value: LibrarySort | undefined): LibrarySort {
  if (value === "newest") return "newest"
  if (value === "oldest") return "oldest"

  return "title_asc"
}

function getTotalPages(totalCount: number, visibleCount: number | "all") {
  if (visibleCount === "all") return 1
  return Math.max(1, Math.ceil(totalCount / visibleCount))
}

function getRangeForPage(page: number, visibleCount: number) {
  const from = (page - 1) * visibleCount
  const to = from + visibleCount - 1

  return { from, to }
}

function sortPieceRows<
  T extends { title: string; created_at?: string | null; id: number },
>(rows: T[], sort: LibrarySort) {
  const sortedRows = [...rows]

  if (sort === "newest") {
    return sortedRows.sort((a, b) => {
      const firstDate = a.created_at ? Date.parse(a.created_at) : 0
      const secondDate = b.created_at ? Date.parse(b.created_at) : 0

      if (secondDate !== firstDate) return secondDate - firstDate

      return b.id - a.id
    })
  }

  if (sort === "oldest") {
    return sortedRows.sort((a, b) => {
      const firstDate = a.created_at ? Date.parse(a.created_at) : 0
      const secondDate = b.created_at ? Date.parse(b.created_at) : 0

      if (firstDate !== secondDate) return firstDate - secondDate

      return a.id - b.id
    })
  }

  return sortedRows.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  )
}

function applyPieceSort<T extends any>(
  query: T,
  sort: LibrarySort
): T {
  const sortableQuery = query as any

  if (sort === "newest") {
    return sortableQuery
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
  }

  if (sort === "oldest") {
    return sortableQuery
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
  }

  return sortableQuery.order("title")
}

function getUniquePieceIds(pieces: any[], mobilePieces: any[]) {
  return Array.from(
    new Set([
      ...(pieces ?? []).map((piece) => piece.id),
      ...(mobilePieces ?? []).map((piece) => piece.id),
    ])
  )
}

export async function loadLibraryData({
  searchQuery,
  selectedKeys = [],
  selectedStyles = [],
  selectedTimeSignatures = [],
  visibleCount = 20,
  page = 1,
  sort = "title_asc",
}: LoadLibraryDataParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const currentUserRole = await getCurrentUserRole(supabase, user.id)
  const trimmedSearchQuery = (searchQuery ?? "").trim()
  const requestedPage = normalisePage(page)
  const selectedSort = normaliseSort(sort)

  let pieces: any[] = []
  let mobilePieces: any[] = []
  let totalPieceCount = 0
  let currentPage = requestedPage

  if (selectedStyles.length > 0) {
    let allStyleCandidatePiecesQuery = supabase
      .from("pieces")
      .select(`
        id,
        title,
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
      `)

    if (trimmedSearchQuery) {
      allStyleCandidatePiecesQuery = allStyleCandidatePiecesQuery.ilike(
        "title",
        `%${trimmedSearchQuery}%`
      )
    }

    if (selectedKeys.length > 0) {
      allStyleCandidatePiecesQuery = allStyleCandidatePiecesQuery.in(
        "key",
        selectedKeys
      )
    }

    if (selectedTimeSignatures.length > 0) {
      allStyleCandidatePiecesQuery = allStyleCandidatePiecesQuery.in(
        "time_signature",
        selectedTimeSignatures
      )
    }

    const { data: styleCandidatePieces, error: styleCandidatePiecesError } =
      await allStyleCandidatePiecesQuery

    if (styleCandidatePiecesError) {
      throw new Error(styleCandidatePiecesError.message)
    }

    const styleFilteredPieces = (styleCandidatePieces ?? []).filter((piece) => {
      const styleLabels = getStyleLabelsFromPiece(piece as PieceFilterOption)

      return selectedStyles.some((selectedStyle) =>
        styleLabels.includes(selectedStyle)
      )
    })

    const sortedStyleFilteredPieces = sortPieceRows(
      styleFilteredPieces,
      selectedSort
    )

    totalPieceCount = sortedStyleFilteredPieces.length
    mobilePieces = sortedStyleFilteredPieces

    const totalPages = getTotalPages(totalPieceCount, visibleCount)
    currentPage =
      visibleCount === "all" ? 1 : Math.min(requestedPage, totalPages)

    if (visibleCount === "all") {
      pieces = sortedStyleFilteredPieces
    } else {
      const { from, to } = getRangeForPage(currentPage, visibleCount)
      pieces = sortedStyleFilteredPieces.slice(from, to + 1)
    }
  } else {
    let countQuery = supabase
      .from("pieces")
      .select("id", { count: "exact", head: true })

    if (trimmedSearchQuery) {
      countQuery = countQuery.ilike("title", `%${trimmedSearchQuery}%`)
    }

    if (selectedKeys.length > 0) {
      countQuery = countQuery.in("key", selectedKeys)
    }

    if (selectedTimeSignatures.length > 0) {
      countQuery = countQuery.in("time_signature", selectedTimeSignatures)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw new Error(countError.message)
    }

    totalPieceCount = count ?? 0

    const totalPages = getTotalPages(totalPieceCount, visibleCount)
    currentPage =
      visibleCount === "all" ? 1 : Math.min(requestedPage, totalPages)

    let piecesQuery = supabase
      .from("pieces")
      .select(`
        id,
        title,
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
      `)

    piecesQuery = applyPieceSort(piecesQuery, selectedSort)

    if (trimmedSearchQuery) {
      piecesQuery = piecesQuery.ilike("title", `%${trimmedSearchQuery}%`)
    }

    if (selectedKeys.length > 0) {
      piecesQuery = piecesQuery.in("key", selectedKeys)
    }

    if (selectedTimeSignatures.length > 0) {
      piecesQuery = piecesQuery.in("time_signature", selectedTimeSignatures)
    }

    if (visibleCount !== "all") {
      const { from, to } = getRangeForPage(currentPage, visibleCount)
      piecesQuery = piecesQuery.range(from, to)
    }

    const { data: pieceRows, error: piecesError } = await piecesQuery

    if (piecesError) {
      throw new Error(piecesError.message)
    }

    pieces = pieceRows ?? []

    let mobilePiecesQuery = supabase
      .from("pieces")
      .select(`
        id,
        title,
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
      `)

    mobilePiecesQuery = applyPieceSort(mobilePiecesQuery, selectedSort)

    if (trimmedSearchQuery) {
      mobilePiecesQuery = mobilePiecesQuery.ilike(
        "title",
        `%${trimmedSearchQuery}%`
      )
    }

    if (selectedKeys.length > 0) {
      mobilePiecesQuery = mobilePiecesQuery.in("key", selectedKeys)
    }

    if (selectedTimeSignatures.length > 0) {
      mobilePiecesQuery = mobilePiecesQuery.in(
        "time_signature",
        selectedTimeSignatures
      )
    }

    const { data: mobilePieceRows, error: mobilePiecesError } =
      await mobilePiecesQuery

    if (mobilePiecesError) {
      throw new Error(mobilePiecesError.message)
    }

    mobilePieces = mobilePieceRows ?? []
  }

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

  if (trimmedSearchQuery) {
    filterOptionPiecesQuery = filterOptionPiecesQuery.ilike(
      "title",
      `%${trimmedSearchQuery}%`
    )
  }

  const [
    { data: filterOptionPiecesRows, error: filterOptionPiecesError },
    { data: learningLists, error: learningListsError },
    { data: styleRows, error: stylesError },
  ] = await Promise.all([
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

  if (filterOptionPiecesError) {
    throw new Error(filterOptionPiecesError.message)
  }

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  const displayPieceIds = getUniquePieceIds(pieces, mobilePieces)

  let userPieces: {
    id: number
    piece_id: number
    status: string
    next_review_due: string | null
    stage: number
  }[] = []

  let userKnownPieces: UserKnownPiece[] = []
  let learningListItems: LearningListItemMembership[] = []
  let userPieceMetadata: LibraryUserPieceMetadata[] = []
  let mediaLinks: LibraryPieceMediaLink[] = []
  let mediaLoops: UserPieceMediaLoop[] = []

  if (displayPieceIds.length > 0) {
    const [
      { data: userPiecesRows, error: userPiecesError },
      { data: userKnownPiecesRows, error: userKnownPiecesError },
      { data: learningListItemsRows, error: learningListItemsError },
      { data: userPieceMetadataRows, error: userPieceMetadataError },
      { data: mediaLinksRows, error: mediaLinksError },
      { data: mediaLoopsRows, error: mediaLoopsError },
    ] = await Promise.all([
      supabase
        .from("user_pieces")
        .select("id, piece_id, status, next_review_due, stage")
        .eq("user_id", user.id)
        .in("piece_id", displayPieceIds),

      supabase
        .from("user_known_pieces")
        .select("id, piece_id")
        .eq("user_id", user.id)
        .in("piece_id", displayPieceIds),

      supabase
        .from("learning_list_items")
        .select(
          "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
        )
        .eq("learning_lists.user_id", user.id)
        .in("piece_id", displayPieceIds),

      supabase
        .from("user_piece_metadata")
        .select("piece_id, preferred_reference_url, preferred_reference_label")
        .eq("user_id", user.id)
        .in("piece_id", displayPieceIds),

      supabase
        .from("piece_media_links")
        .select("id, piece_id, url, label")
        .in("piece_id", displayPieceIds)
        .order("created_at", { ascending: true }),

      supabase
        .from("user_piece_media_loops")
        .select(
          "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .in("piece_id", displayPieceIds)
        .order("created_at", { ascending: true }),
    ])

    if (userPiecesError) {
      throw new Error(userPiecesError.message)
    }

    if (userKnownPiecesError) {
      throw new Error(userKnownPiecesError.message)
    }

    if (learningListItemsError) {
      throw new Error(learningListItemsError.message)
    }

    if (userPieceMetadataError) {
      throw new Error(userPieceMetadataError.message)
    }

    if (mediaLinksError) {
      throw new Error(mediaLinksError.message)
    }

    if (mediaLoopsError) {
      throw new Error(mediaLoopsError.message)
    }

    userPieces = userPiecesRows ?? []
    userKnownPieces = (userKnownPiecesRows ?? []) as UserKnownPiece[]
    userPieceMetadata =
      (userPieceMetadataRows ?? []) as LibraryUserPieceMetadata[]
    mediaLinks = (mediaLinksRows ?? []) as LibraryPieceMediaLink[]
    mediaLoops = (mediaLoopsRows ?? []) as UserPieceMediaLoop[]

    learningListItems = ((learningListItemsRows ?? []) as LearningListItemRow[])
      .map(normaliseLearningListItem)
      .filter((item): item is LearningListItemMembership => item !== null)
  }

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  return {
    user,
    currentUserRole,
    pieces,
    mobilePieces,
    filterOptionPieces: (filterOptionPiecesRows ?? []) as PieceFilterOption[],
    totalPieceCount,
    currentPage,
    userPieces,
    userKnownPieces,
    userPieceMetadata,
    mediaLinks,
    mediaLoops,
    learningLists,
    learningListItems,
    styleOptions,
  }
}
