import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { LearningList, Piece, UserPiece } from "@/lib/types"

type PieceRow = Piece | Piece[] | null

type KnownPieceRow = {
  id: number
  piece_id: number
  pieces: PieceRow
}

type PracticePieceRow = UserPiece & {
  pieces: PieceRow
}

type LearningListItemRow = {
  piece_id: number
  learning_list_id: number
  learning_lists:
    | {
        id: number
        name: string
        user_id: string
      }
    | {
        id: number
        name: string
        user_id: string
      }[]
    | null
}

export type RepertoireLearningListItem = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

export type PracticeTuneItem = UserPiece & {
  piece: Piece
}

function getPiece(pieces: PieceRow): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
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
    learning_lists: {
      id: learningList.id,
      name: learningList.name,
      user_id: learningList.user_id,
    },
  }
}

async function loadSharedListData(userId: string, pieceIds: number[]) {
  const supabase = await createClient()

  const { data: learningLists, error: learningListsError } = await supabase
    .from("learning_lists")
    .select("id, name, description")
    .eq("user_id", userId)
    .order("name")

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  let learningListItems: RepertoireLearningListItem[] = []

  if (pieceIds.length > 0) {
    const { data: learningListItemsRows, error: learningListItemsError } =
      await supabase
        .from("learning_list_items")
        .select(
          "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
        )
        .eq("learning_lists.user_id", userId)
        .in("piece_id", pieceIds)

    if (learningListItemsError) {
      throw new Error(learningListItemsError.message)
    }

    learningListItems = ((learningListItemsRows ?? []) as LearningListItemRow[])
      .map(normaliseLearningListItem)
      .filter(
        (item): item is RepertoireLearningListItem => item !== null
      )
  }

  return {
    learningLists: (learningLists ?? []) as LearningList[],
    learningListItems,
  }
}

export async function loadKnownTunesPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: knownRows, error: knownRowsError } = await supabase
    .from("user_known_pieces")
    .select(`
      id,
      piece_id,
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
    .eq("user_id", user.id)

  if (knownRowsError) {
    throw new Error(knownRowsError.message)
  }

  const pieces = ((knownRows ?? []) as KnownPieceRow[])
    .map((row) => getPiece(row.pieces))
    .filter((piece): piece is Piece => piece !== null)
    .sort((a, b) => a.title.localeCompare(b.title))

  const pieceIds = pieces.map((piece) => piece.id)
  const { learningLists, learningListItems } = await loadSharedListData(
    user.id,
    pieceIds
  )

  return {
    user,
    pieces,
    learningLists,
    learningListItems,
  }
}

export async function loadPracticeTunesPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: practiceRows, error: practiceRowsError } = await supabase
    .from("user_pieces")
    .select(`
      id,
      piece_id,
      status,
      next_review_due,
      stage,
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
    .eq("user_id", user.id)
    .eq("status", "learning")

  if (practiceRowsError) {
    throw new Error(practiceRowsError.message)
  }

  const practiceItems = ((practiceRows ?? []) as PracticePieceRow[])
    .map((row) => {
      const piece = getPiece(row.pieces)

      if (!piece) return null

      return {
        id: row.id,
        piece_id: row.piece_id,
        status: row.status,
        next_review_due: row.next_review_due,
        stage: row.stage,
        piece,
      }
    })
    .filter((item): item is PracticeTuneItem => item !== null)
    .sort((a, b) => {
      const aDue = a.next_review_due ?? "9999-12-31"
      const bDue = b.next_review_due ?? "9999-12-31"

      if (aDue !== bDue) {
        return aDue.localeCompare(bDue)
      }

      return a.piece.title.localeCompare(b.piece.title)
    })

  const pieceIds = practiceItems.map((item) => item.piece.id)
  const { learningLists, learningListItems } = await loadSharedListData(
    user.id,
    pieceIds
  )

  return {
    user,
    practiceItems,
    learningLists,
    learningListItems,
  }
}