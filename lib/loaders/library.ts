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
  selectedTimeSignatures?: string[]
  visibleCount?: number | "all"
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

export async function loadLibraryData({
  searchQuery,
  selectedKeys = [],
  selectedTimeSignatures = [],
  visibleCount = 20,
}: LoadLibraryDataParams = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const trimmedSearchQuery = (searchQuery ?? "").trim()

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
    piecesQuery = piecesQuery.limit(visibleCount)
  }

  const { data: pieces, error: piecesError } = await piecesQuery

  if (piecesError) {
    throw new Error(piecesError.message)
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

  const { data: filterOptionPiecesRows, error: filterOptionPiecesError } =
    await filterOptionPiecesQuery

  if (filterOptionPiecesError) {
    throw new Error(filterOptionPiecesError.message)
  }

  const displayPieceIds = (pieces ?? []).map((piece) => piece.id)

  const { data: learningLists, error: learningListsError } = await supabase
    .from("learning_lists")
    .select("id, name, description")
    .eq("user_id", user.id)
    .order("name")

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

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
    const { data: userPiecesRows, error: userPiecesError } = await supabase
      .from("user_pieces")
      .select("id, piece_id, status, next_review_due, stage")
      .eq("user_id", user.id)
      .in("piece_id", displayPieceIds)

    if (userPiecesError) {
      throw new Error(userPiecesError.message)
    }

    userPieces = userPiecesRows ?? []

    const { data: userKnownPiecesRows, error: userKnownPiecesError } =
      await supabase
        .from("user_known_pieces")
        .select("id, piece_id")
        .eq("user_id", user.id)
        .in("piece_id", displayPieceIds)

    if (userKnownPiecesError) {
      throw new Error(userKnownPiecesError.message)
    }

    userKnownPieces = (userKnownPiecesRows ?? []) as UserKnownPiece[]

    const { data: learningListItemsRows, error: learningListItemsError } =
      await supabase
        .from("learning_list_items")
        .select(
          "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
        )
        .eq("learning_lists.user_id", user.id)
        .in("piece_id", displayPieceIds)

    if (learningListItemsError) {
      throw new Error(learningListItemsError.message)
    }

    learningListItems = ((learningListItemsRows ?? []) as LearningListItemRow[])
      .map(normaliseLearningListItem)
      .filter(
        (item): item is LearningListItemMembership => item !== null
      )
  }

  const { data: styleRows, error: stylesError } = await supabase
    .from("styles")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  return {
    user,
    pieces,
    filterOptionPieces: (filterOptionPiecesRows ?? []) as PieceFilterOption[],
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
    styleOptions,
  }
}