import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type UserKnownPiece = {
  id: number
  piece_id: number
}

export async function loadLibraryData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
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

  const { data: learningLists, error: learningListsError } = await supabase
    .from("learning_lists")
    .select("id, name, description")
    .eq("user_id", user.id)
    .order("name")

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  const { data: learningListItems, error: learningListItemsError } =
    await supabase
      .from("learning_list_items")
      .select("piece_id, learning_list_id, learning_lists!inner(id, name, user_id)")
      .eq("learning_lists.user_id", user.id)

  if (learningListItemsError) {
    throw new Error(learningListItemsError.message)
  }

  return {
    user,
    pieces,
    userPieces,
    userKnownPieces: (userKnownPieces ?? []) as UserKnownPiece[],
    learningLists,
    learningListItems,
  }
}