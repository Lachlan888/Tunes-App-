import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  LearningListDetail,
  LearningListItemWithPiece,
  Piece,
} from "@/lib/types"

type PieceIdRow = {
  piece_id: number
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

export async function loadLearningListDetailData(rawListId: string) {
  const listId = Number(rawListId)

  if (Number.isNaN(listId)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: list, error: listError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description, visibility, is_imported")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single()

  if (listError || !list) {
    notFound()
  }

  const typedList = list as LearningListDetail
  const redirectTo = `/learning-lists/${typedList.id}`

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
        reference_url,
        piece_styles (
          style_id,
          styles (
            id,
            slug,
            label
          )
        )
      )
    `)
    .eq("learning_list_id", typedList.id)
    .order("position", { ascending: true })

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const typedItems = (items ?? []) as LearningListItemWithPiece[]

  const tunes = typedItems
    .map((item) => extractPiece(item.pieces))
    .filter((piece): piece is Piece => Boolean(piece))

  const pieceIds = tunes.map((piece) => piece.id)

  let activePieceIds = new Set<number>()
  let knownPieceIds = new Set<number>()

  if (pieceIds.length > 0) {
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

    const { data: userKnownPieces, error: userKnownPiecesError } = await supabase
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
    typedItems,
    tunes,
    activePieceIds,
    knownPieceIds,
    redirectTo,
  }
}