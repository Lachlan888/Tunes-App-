import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Piece } from "@/lib/types"

export type PublicListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: string
}

export type PublicListOwnerProfile = {
  id: string
  username: string | null
  display_name: string | null
}

export type PublicListItemWithPiece = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

export type OwnedLearningListRow = {
  id: number
  name: string
}

type PieceIdRow = {
  piece_id: number
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

export async function loadPublicListDetailData(rawListId: string) {
  const listId = Number(rawListId)

  if (Number.isNaN(listId)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: list, error: listError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description, visibility")
    .eq("id", listId)
    .eq("visibility", "public")
    .single()

  if (listError || !list) {
    notFound()
  }

  const typedList = list as PublicListRow
  const redirectTo = `/public-lists/${typedList.id}`
  const isViewingOwnPublicList = user?.id === typedList.user_id

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", typedList.user_id)
    .maybeSingle()

  const owner = (profile as PublicListOwnerProfile | null) ?? null

  const { data: items, error: itemsError } = await supabase
    .from("learning_list_items")
    .select(`
      id,
      position,
      pieces (
        id,
        title,
        key,
        style,
        time_signature,
        reference_url
      )
    `)
    .eq("learning_list_id", typedList.id)
    .order("position", { ascending: true })

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const typedItems = (items ?? []) as PublicListItemWithPiece[]

  const pieceIds = typedItems
    .map((item) => extractPiece(item.pieces)?.id ?? null)
    .filter((pieceId): pieceId is number => pieceId !== null)

  let activePieceIds = new Set<number>()
  let knownPieceIds = new Set<number>()
  let ownedLists: OwnedLearningListRow[] = []

  if (user) {
    const { data: ownedLearningLists, error: ownedLearningListsError } =
      await supabase
        .from("learning_lists")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

    if (ownedLearningListsError) {
      throw new Error(ownedLearningListsError.message)
    }

    ownedLists = (ownedLearningLists ?? []) as OwnedLearningListRow[]
  }

  if (user && pieceIds.length > 0) {
    const { data: userPieces, error: userPiecesError } = await supabase
      .from("user_pieces")
      .select("piece_id")
      .eq("user_id", user.id)
      .in("piece_id", pieceIds)

    if (userPiecesError) {
      throw new Error(userPiecesError.message)
    }

    activePieceIds = new Set(
      ((userPieces ?? []) as PieceIdRow[]).map((row) => row.piece_id)
    )

    const { data: userKnownPieces, error: userKnownPiecesError } =
      await supabase
        .from("user_known_pieces")
        .select("piece_id")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds)

    if (userKnownPiecesError) {
      throw new Error(userKnownPiecesError.message)
    }

    knownPieceIds = new Set(
      ((userKnownPieces ?? []) as PieceIdRow[]).map((row) => row.piece_id)
    )
  }

  return {
    user,
    typedList,
    owner,
    typedItems,
    ownedLists,
    activePieceIds,
    knownPieceIds,
    redirectTo,
    isViewingOwnPublicList,
  }
}