"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { recordCommentAddedEvent } from "@/lib/activity-events"

export async function addPieceComment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const body = formData.get("body")?.toString().trim() || ""

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!body) {
    return
  }

  const { data: insertedComment, error } = await supabase
    .from("piece_comments")
    .insert({
      piece_id: pieceId,
      user_id: user.id,
      body,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error adding piece comment:", error)
    return
  }

  await recordCommentAddedEvent(user.id, pieceId, insertedComment.id)

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

export async function deletePieceComment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const commentId = Number(formData.get("comment_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!commentId || Number.isNaN(commentId)) {
    return
  }

  const { error } = await supabase
    .from("piece_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting piece comment:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}