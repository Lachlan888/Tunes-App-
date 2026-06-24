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

export type ListDetailUserPieceMetadata = {
  piece_id: number
  preferred_reference_url: string | null
  preferred_reference_label: string | null
}

export type ListDetailAccessMode = "owner" | "shared_viewer" | "public_viewer"

export type LearningListShareRecipient = {
  id: number
  sharedWithUserId: string
  username: string | null
  displayName: string | null
  label: string
}

export type LearningListOwnerProfile = {
  id: string
  username: string | null
  displayName: string | null
  label: string
}

type LearningListShareRow = {
  id: number
  shared_with_user_id: string
  profiles:
    | {
        username: string | null
        display_name: string | null
      }
    | {
        username: string | null
        display_name: string | null
      }[]
    | null
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

function extractJoinedRow<T>(row: T | T[] | null): T | null {
  if (!row) return null
  return Array.isArray(row) ? row[0] ?? null : row
}

function formatProfileLabel(profile: {
  username: string | null
  displayName: string | null
}) {
  if (profile.displayName && profile.username) {
    return `${profile.displayName} (@${profile.username})`
  }

  if (profile.displayName) {
    return profile.displayName
  }

  if (profile.username) {
    return `@${profile.username}`
  }

  return "Unknown player"
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
    .maybeSingle()

  if (listError || !list) {
    notFound()
  }

  const typedList = list as LearningListDetail
  const redirectTo = `/learning-lists/${typedList.id}`
  const accessMode: ListDetailAccessMode =
    typedList.user_id === user.id
      ? "owner"
      : typedList.visibility === "public"
        ? "public_viewer"
        : "shared_viewer"

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

  const typedItems = (items ?? []) as LearningListItemWithPiece[]

  const tunes = typedItems
    .map((item) => extractPiece(item.pieces))
    .filter((piece): piece is Piece => Boolean(piece))

  const pieceIds = tunes.map((piece) => piece.id)

  let activePieceIds = new Set<number>()
  let knownPieceIds = new Set<number>()
  let userPieceMetadata: ListDetailUserPieceMetadata[] = []

  if (pieceIds.length > 0) {
    const [
      { data: userPieces, error: userPiecesError },
      { data: userKnownPieces, error: userKnownPiecesError },
      { data: userPieceMetadataRows, error: userPieceMetadataError },
    ] = await Promise.all([
      supabase
        .from("user_pieces")
        .select("piece_id")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds),

      supabase
        .from("user_known_pieces")
        .select("piece_id")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds),

      supabase
        .from("user_piece_metadata")
        .select("piece_id, preferred_reference_url, preferred_reference_label")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds),
    ])

    if (userPiecesError) {
      throw new Error(userPiecesError.message)
    }

    activePieceIds = new Set(
      ((userPieces ?? []) as PieceIdRow[]).map((row) => row.piece_id)
    )

    if (userKnownPiecesError) {
      throw new Error(userKnownPiecesError.message)
    }

    if (userPieceMetadataError) {
      throw new Error(userPieceMetadataError.message)
    }

    knownPieceIds = new Set(
      ((userKnownPieces ?? []) as PieceIdRow[]).map((row) => row.piece_id)
    )
    userPieceMetadata =
      (userPieceMetadataRows ?? []) as ListDetailUserPieceMetadata[]
  }

  const [{ data: ownerProfileRows, error: ownerProfileError }, shareResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("id", typedList.user_id)
        .limit(1),

      accessMode === "owner"
        ? supabase
            .from("learning_list_shares")
            .select(
              `
                id,
                shared_with_user_id,
                profiles!learning_list_shares_shared_with_user_id_fkey (
                  username,
                  display_name
                )
              `
            )
            .eq("learning_list_id", typedList.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ])

  if (ownerProfileError) {
    throw new Error(ownerProfileError.message)
  }

  if (shareResult.error) {
    throw new Error(shareResult.error.message)
  }

  const ownerProfileRow =
    ((ownerProfileRows ?? []) as ProfileRow[])[0] ?? null
  const ownerProfile: LearningListOwnerProfile = {
    id: typedList.user_id,
    username: ownerProfileRow?.username ?? null,
    displayName: ownerProfileRow?.display_name ?? null,
    label: formatProfileLabel({
      username: ownerProfileRow?.username ?? null,
      displayName: ownerProfileRow?.display_name ?? null,
    }),
  }

  const shareRecipients: LearningListShareRecipient[] = (
    (shareResult.data ?? []) as LearningListShareRow[]
  ).map((share) => {
    const profile = extractJoinedRow(share.profiles)
    const displayName = profile?.display_name ?? null
    const username = profile?.username ?? null

    return {
      id: share.id,
      sharedWithUserId: share.shared_with_user_id,
      username,
      displayName,
      label: formatProfileLabel({ username, displayName }),
    }
  })

  return {
    user,
    typedList,
    typedItems,
    tunes,
    activePieceIds,
    knownPieceIds,
    userPieceMetadata,
    ownerProfile,
    shareRecipients,
    accessMode,
    redirectTo,
  }
}
