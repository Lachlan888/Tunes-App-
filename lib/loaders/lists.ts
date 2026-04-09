import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import { createClient } from "@/lib/supabase/server"
import type {
  FilterableLearningList,
  LearningList,
  MyTuneRow,
  Piece,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"
import { redirect } from "next/navigation"

type LearningListMembershipRow = {
  piece_id: number
}

type LearningListItemWithPieceRow = {
  learning_list_id: number
  pieces: Piece | Piece[] | null
}

function extractPieceTitle(
  piece:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
) {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0]?.title ?? null
  }
  return piece.title
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0] ?? null
  }
  return piece
}

export async function loadListsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningLists, error } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility, is_imported")
    .eq("user_id", user.id)
    .order("id", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const { data: userPieces } = await supabase
    .from("user_pieces")
    .select(`
      id,
      piece_id,
      stage,
      pieces (
        id,
        title
      )
    `)
    .eq("user_id", user.id)

  const { data: userKnownPieces } = await supabase
    .from("user_known_pieces")
    .select(`
      id,
      piece_id,
      pieces (
        id,
        title
      )
    `)
    .eq("user_id", user.id)

  const { data: learningListMemberships } = await supabase
    .from("learning_list_items")
    .select("piece_id, learning_lists!inner(user_id)")
    .eq("learning_lists.user_id", user.id)

  const { data: learningListItemsWithPieces } = await supabase
    .from("learning_list_items")
    .select(`
      learning_list_id,
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
      ),
      learning_lists!inner(user_id)
    `)
    .eq("learning_lists.user_id", user.id)
    .order("position", { ascending: true })

  const typedLearningLists = (learningLists ?? []) as LearningList[]
  const typedUserPieces = (userPieces ?? []) as UserPieceWithPiece[]
  const typedUserKnownPieces = (userKnownPieces ?? []) as UserKnownPieceWithPiece[]
  const typedLearningListMemberships =
    (learningListMemberships ?? []) as LearningListMembershipRow[]
  const typedLearningListItemsWithPieces =
    (learningListItemsWithPieces ?? []) as LearningListItemWithPieceRow[]

  const listedPieceIds = new Set(
    typedLearningListMemberships.map((item) => item.piece_id)
  )

  const unlistedPracticeTunes = typedUserPieces.filter(
    (userPiece) => !listedPieceIds.has(userPiece.piece_id)
  )

  const unlistedKnownTunes = typedUserKnownPieces.filter(
    (userKnownPiece) => !listedPieceIds.has(userKnownPiece.piece_id)
  )

  const myTunesMap = new Map<number, MyTuneRow>()

  for (const userPiece of typedUserPieces) {
    const title = extractPieceTitle(userPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userPiece.piece_id)

    myTunesMap.set(userPiece.piece_id, {
      piece_id: userPiece.piece_id,
      title,
      inPractice: true,
      known: existing?.known ?? false,
    })
  }

  for (const userKnownPiece of typedUserKnownPieces) {
    const title = extractPieceTitle(userKnownPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userKnownPiece.piece_id)

    myTunesMap.set(userKnownPiece.piece_id, {
      piece_id: userKnownPiece.piece_id,
      title,
      inPractice: existing?.inPractice ?? false,
      known: true,
    })
  }

  const myTunes = Array.from(myTunesMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  )

  const tunesByListId = new Map<number, Piece[]>()

  for (const item of typedLearningListItemsWithPieces) {
    const piece = extractPiece(item.pieces)
    if (!piece) continue

    const existingTunes = tunesByListId.get(item.learning_list_id) ?? []
    existingTunes.push(piece)
    tunesByListId.set(item.learning_list_id, existingTunes)
  }

  const listOverviews: FilterableLearningList[] = typedLearningLists.map((list) => {
    const tunes = tunesByListId.get(list.id) ?? []
    const stylesPresent = Array.from(
      new Set(tunes.flatMap((tune) => getStyleLabelsFromPiece(tune)))
    ).sort()

    return {
      id: list.id,
      name: list.name,
      description: list.description,
      visibility: list.visibility ?? "private",
      is_imported: Boolean(list.is_imported),
      tunes,
      tuneCount: tunes.length,
      stylesPresent,
      source: list.is_imported ? "imported" : "mine",
    }
  })

  return {
    user,
    learningLists: typedLearningLists,
    listOverviews,
    myTunes,
    unlistedPracticeTunes,
    unlistedKnownTunes,
  }
}