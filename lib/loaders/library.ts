import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type {
  LearningListItemMembership,
  LearningListOwner,
  PieceFilterOption,
  StyleOption,
  UserKnownPiece,
} from "@/lib/types"

type LearningListItemRow = {
  piece_id: number
  learning_list_id: number
  learning_lists: LearningListOwner | LearningListOwner[] | null
}

type LoadLibraryDataParams = {
  searchQuery?: string
  selectedKeys?: string[]
  selectedStyles?: string[]
  selectedTimeSignatures?: string[]
  visibleCount?: number | "all"
  page?: number
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

function getTotalPages(totalCount: number, visibleCount: number | "all") {
  if (visibleCount === "all") return 1
  return Math.max(1, Math.ceil(totalCount / visibleCount))
}

function getRangeForPage(page: number, visibleCount: number) {
  const from = (page - 1) * visibleCount
  const to = from + visibleCount - 1

  return { from, to }
}

export async function loadLibraryData({
  searchQuery,
  selectedKeys = [],
  selectedStyles = [],
  selectedTimeSignatures = [],
  visibleCount = 20,
  page = 1,
}: LoadLibraryDataParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const trimmedSearchQuery = (searchQuery ?? "").trim()
  const requestedPage = normalisePage(page)

  let pieces: any[] = []
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
        reference_url,
        piece_styles (
          style_id,
          styles (
            id,
            slug,
            label
          )
        )
      `)
      .order("title")

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

    totalPieceCount = styleFilteredPieces.length

    const totalPages = getTotalPages(totalPieceCount, visibleCount)
    currentPage =
      visibleCount === "all" ? 1 : Math.min(requestedPage, totalPages)

    if (visibleCount === "all") {
      pieces = styleFilteredPieces
    } else {
      const { from, to } = getRangeForPage(currentPage, visibleCount)
      pieces = styleFilteredPieces.slice(from, to + 1)
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
        reference_url,
        piece_styles (
          style_id,
          styles (
            id,
            slug,
            label
          )
        )
      `)
      .order("title")

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

  const displayPieceIds = (pieces ?? []).map((piece) => piece.id)

  let userPieces: {
    id: number
    piece_id: number
    status: string
    next_review_due: string | null
    stage: number
  }[] = []

  let userKnownPieces: UserKnownPiece[] = []
  let learningListItems: LearningListItemMembership[] = []

  if (displayPieceIds.length > 0) {
    const [
      { data: userPiecesRows, error: userPiecesError },
      { data: userKnownPiecesRows, error: userKnownPiecesError },
      { data: learningListItemsRows, error: learningListItemsError },
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

    userPieces = userPiecesRows ?? []
    userKnownPieces = (userKnownPiecesRows ?? []) as UserKnownPiece[]

    learningListItems = ((learningListItemsRows ?? []) as LearningListItemRow[])
      .map(normaliseLearningListItem)
      .filter((item): item is LearningListItemMembership => item !== null)
  }

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  return {
    user,
    pieces,
    filterOptionPieces: (filterOptionPiecesRows ?? []) as PieceFilterOption[],
    totalPieceCount,
    currentPage,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
    styleOptions,
  }
}