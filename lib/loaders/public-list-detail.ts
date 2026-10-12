import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { loadTuneMediaBundles } from "@/lib/tune-media"
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
  description: string | null
}

type PieceIdRow = {
  piece_id: number
}

function isMissingBookmarksTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("learning_list_bookmarks"))
  )
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
        alternate_titles,
        type,
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
  const publicPieces = typedItems
    .map((item) => extractPiece(item.pieces))
    .filter((piece): piece is Piece => Boolean(piece))
  const mediaBundles = await loadTuneMediaBundles({
    supabase,
    pieces: publicPieces,
    userId: null,
  })

  let activePieceStates = new Map<number, { id: number; stage: number | null }>()
  let knownPieceIds = new Set<number>()
  let ownedLists: OwnedLearningListRow[] = []
  let existingListIdsByPiece = new Map<number, number[]>()
  let isBookmarkedByCurrentUser = false
  let bookmarksTableIsAvailable = true

  if (user) {
    const [
      { data: ownedLearningLists, error: ownedLearningListsError },
      { data: bookmark, error: bookmarkError },
    ] = await Promise.all([
      supabase
        .from("learning_lists")
        .select("id, name, description")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase
        .from("learning_list_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("learning_list_id", typedList.id)
        .maybeSingle(),
    ])

    if (ownedLearningListsError) {
      throw new Error(ownedLearningListsError.message)
    }

    if (bookmarkError) {
      if (!isMissingBookmarksTableError(bookmarkError)) {
        throw new Error(bookmarkError.message)
      }

      bookmarksTableIsAvailable = false
    }

    ownedLists = (ownedLearningLists ?? []) as OwnedLearningListRow[]
    isBookmarkedByCurrentUser = Boolean(bookmark) && bookmarksTableIsAvailable
  }

  if (user && pieceIds.length > 0) {
    const [
      { data: userPieces, error: userPiecesError },
      { data: userKnownPieces, error: userKnownPiecesError },
      { data: ownMemberships, error: ownMembershipsError },
    ] = await Promise.all([
      supabase.from("user_pieces").select("id, piece_id, stage").eq("user_id", user.id).in("piece_id", pieceIds),
      supabase.from("user_known_pieces").select("piece_id").eq("user_id", user.id).in("piece_id", pieceIds),
      supabase.from("learning_list_items").select("piece_id, learning_list_id, learning_lists!inner(user_id)").eq("learning_lists.user_id", user.id).in("piece_id", pieceIds),
    ])

    if (userPiecesError) {
      throw new Error(userPiecesError.message)
    }

    activePieceStates = new Map(
      ((userPieces ?? []) as Array<PieceIdRow & { id: number; stage: number | null }>).map((row) => [row.piece_id, { id: row.id, stage: row.stage }])
    )

    if (userKnownPiecesError) {
      throw new Error(userKnownPiecesError.message)
    }

    knownPieceIds = new Set(
      ((userKnownPieces ?? []) as PieceIdRow[]).map((row) => row.piece_id)
    )
    if (ownMembershipsError) throw new Error(ownMembershipsError.message)
    existingListIdsByPiece = new Map()
    for (const row of (ownMemberships ?? []) as Array<{ piece_id: number; learning_list_id: number }>) {
      const ids = existingListIdsByPiece.get(row.piece_id) ?? []
      ids.push(row.learning_list_id)
      existingListIdsByPiece.set(row.piece_id, ids)
    }
  }

  return {
    user,
    typedList,
    owner,
    typedItems,
    mediaBundles,
    ownedLists,
    activePieceStates,
    knownPieceIds,
    existingListIdsByPiece,
    redirectTo,
    isViewingOwnPublicList,
    isBookmarkedByCurrentUser,
    canBookmark: Boolean(user) && !isViewingOwnPublicList,
  }
}
