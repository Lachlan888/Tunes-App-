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
  id: number
  learning_list_id: number
  created_at: string | null
  pieces: Piece | Piece[] | null
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

export type LearningQueueTune = {
  piece: Piece
  firstAddedAt: string | null
  firstAddedSortValue: string
  firstListId: number
  firstListName: string
  listIds: number[]
  listNames: string[]
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

function extractList(
  list:
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
) {
  if (!list) return null
  if (Array.isArray(list)) {
    return list[0] ?? null
  }
  return list
}

function getQueueSortValue(item: LearningListItemWithPieceRow) {
  return item.created_at ?? `9999-12-31T23:59:59.999Z-${item.id}`
}

export async function loadListsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [
    { data: learningLists, error: learningListsError },
    { data: userPieces, error: userPiecesError },
    { data: userKnownPieces, error: userKnownPiecesError },
    { data: learningListMemberships, error: learningListMembershipsError },
    {
      data: learningListItemsWithPieces,
      error: learningListItemsWithPiecesError,
    },
  ] = await Promise.all([
    supabase
      .from("learning_lists")
      .select("id, name, description, visibility, is_imported")
      .eq("user_id", user.id)
      .order("id", { ascending: false }),

    supabase
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
      .eq("user_id", user.id),

    supabase
      .from("user_known_pieces")
      .select(`
        id,
        piece_id,
        pieces (
          id,
          title
        )
      `)
      .eq("user_id", user.id),

    supabase
      .from("learning_list_items")
      .select("piece_id, learning_lists!inner(user_id)")
      .eq("learning_lists.user_id", user.id),

    supabase
      .from("learning_list_items")
      .select(`
        id,
        learning_list_id,
        created_at,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
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
        learning_lists!inner(
          id,
          name,
          user_id
        )
      `)
      .eq("learning_lists.user_id", user.id)
      .order("created_at", { ascending: true })
      .order("position", { ascending: true }),
  ])

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  if (userPiecesError) {
    throw new Error(userPiecesError.message)
  }

  if (userKnownPiecesError) {
    throw new Error(userKnownPiecesError.message)
  }

  if (learningListMembershipsError) {
    throw new Error(learningListMembershipsError.message)
  }

  if (learningListItemsWithPiecesError) {
    throw new Error(learningListItemsWithPiecesError.message)
  }

  const typedLearningLists = (learningLists ?? []) as LearningList[]
  const typedUserPieces = (userPieces ?? []) as UserPieceWithPiece[]
  const typedUserKnownPieces = (userKnownPieces ??
    []) as UserKnownPieceWithPiece[]
  const typedLearningListMemberships = (learningListMemberships ??
    []) as LearningListMembershipRow[]
  const typedLearningListItemsWithPieces = (learningListItemsWithPieces ??
    []) as LearningListItemWithPieceRow[]

  const listedPieceIds = new Set(
    typedLearningListMemberships.map((item) => item.piece_id)
  )

  const practicePieceIds = new Set(
    typedUserPieces.map((userPiece) => userPiece.piece_id)
  )

  const knownPieceIds = new Set(
    typedUserKnownPieces.map((userKnownPiece) => userKnownPiece.piece_id)
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
  const learningQueueMap = new Map<number, LearningQueueTune>()

  for (const item of typedLearningListItemsWithPieces) {
    const piece = extractPiece(item.pieces)
    if (!piece) continue

    const existingTunes = tunesByListId.get(item.learning_list_id) ?? []
    existingTunes.push(piece)
    tunesByListId.set(item.learning_list_id, existingTunes)

    if (practicePieceIds.has(piece.id) || knownPieceIds.has(piece.id)) {
      continue
    }

    const list = extractList(item.learning_lists)
    if (!list) continue

    const sortValue = getQueueSortValue(item)
    const existingQueueTune = learningQueueMap.get(piece.id)

    if (!existingQueueTune) {
      learningQueueMap.set(piece.id, {
        piece,
        firstAddedAt: item.created_at,
        firstAddedSortValue: sortValue,
        firstListId: list.id,
        firstListName: list.name,
        listIds: [list.id],
        listNames: [list.name],
      })
      continue
    }

    if (!existingQueueTune.listIds.includes(list.id)) {
      existingQueueTune.listIds.push(list.id)
      existingQueueTune.listNames.push(list.name)
    }

    if (sortValue < existingQueueTune.firstAddedSortValue) {
      learningQueueMap.set(piece.id, {
        ...existingQueueTune,
        firstAddedAt: item.created_at,
        firstAddedSortValue: sortValue,
        firstListId: list.id,
        firstListName: list.name,
      })
    }
  }

  const learningQueueTunes = Array.from(learningQueueMap.values()).sort(
    (a, b) => {
      const dateCompare = a.firstAddedSortValue.localeCompare(
        b.firstAddedSortValue
      )

      if (dateCompare !== 0) return dateCompare

      return a.piece.title.localeCompare(b.piece.title)
    }
  )

  const listOverviews: FilterableLearningList[] = typedLearningLists.map(
    (list) => {
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
    }
  )

  return {
    user,
    learningLists: typedLearningLists,
    listOverviews,
    myTunes,
    learningQueueTunes,
    unlistedPracticeTunes,
    unlistedKnownTunes,
  }
}
