import { loadRecentFriendActivity } from "@/lib/loaders/friends"
import { isDueToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: LearningListItem[]
}

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

export async function loadHomepageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningLists, error: learningListsError } = await supabase
    .from("learning_lists")
    .select(`
      id,
      name,
      description,
      learning_list_items (
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
      )
    `)
    .eq("user_id", user.id)

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  const { data: pieces, error: piecesError } = await supabase
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

  if (piecesError) {
    throw new Error(piecesError.message)
  }

  const { data: userPieces, error: userPiecesError } = await supabase
    .from("user_pieces")
    .select("id, piece_id, status, next_review_due, stage")
    .eq("user_id", user.id)

  if (userPiecesError) {
    throw new Error(userPiecesError.message)
  }

  const { data: userKnownPieces, error: userKnownPiecesError } = await supabase
    .from("user_known_pieces")
    .select("id, piece_id")
    .eq("user_id", user.id)

  if (userKnownPiecesError) {
    throw new Error(userKnownPiecesError.message)
  }

  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const acceptedFriendIds = ((connectionRows ?? []) as ConnectionRow[])
    .filter((row) => row.status === "accepted")
    .map((row) =>
      row.requester_id === user.id ? row.addressee_id : row.requester_id
    )

  const recentFriendActivity = await loadRecentFriendActivity(
    supabase,
    acceptedFriendIds,
    5
  )

  const typedUserPieces = (userPieces ?? []) as UserPiece[]

  const dueToday = typedUserPieces.filter((userPiece) =>
    isDueToday(userPiece.next_review_due)
  )

  return {
    user,
    learningLists: (learningLists ?? []) as LearningList[],
    pieces: (pieces ?? []) as Piece[],
    userPieces: typedUserPieces,
    userKnownPieces: (userKnownPieces ?? []) as UserKnownPiece[],
    dueToday,
    recentFriendActivity,
  }
}