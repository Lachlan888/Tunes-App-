"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { recordCommentAddedEvent } from "@/lib/services/activity-events"

type ParentCommentRow = {
  id: number
  piece_id: number
  user_id: string
}

function previewBody(body: string) {
  const cleaned = body.replace(/\s+/g, " ").trim()
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}…` : cleaned
}

export async function addPieceComment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const parentCommentIdRaw = formData.get("parent_comment_id")
  const parentCommentId = parentCommentIdRaw ? Number(parentCommentIdRaw) : null
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const body = formData.get("body")?.toString().trim() || ""

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!body) {
    return
  }

  let parentComment: ParentCommentRow | null = null

  if (parentCommentId && !Number.isNaN(parentCommentId)) {
    const { data, error } = await supabase
      .from("piece_comments")
      .select("id, piece_id, user_id")
      .eq("id", parentCommentId)
      .eq("piece_id", pieceId)
      .maybeSingle()

    if (error) {
      console.error("Error loading parent piece comment:", error)
      return
    }

    parentComment = (data as ParentCommentRow | null) ?? null
  }

  const { data: insertedComment, error } = await supabase
    .from("piece_comments")
    .insert({
      piece_id: pieceId,
      user_id: user.id,
      body,
      parent_comment_id: parentComment?.id ?? null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error adding piece comment:", error)
    return
  }

  await recordCommentAddedEvent(user.id, pieceId, insertedComment.id)

  if (parentComment && parentComment.user_id !== user.id) {
    const { error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        recipient_user_id: parentComment.user_id,
        actor_user_id: user.id,
        notification_type: "comment_reply",
        piece_id: pieceId,
        comment_id: insertedComment.id,
        body_preview: previewBody(body),
      })

    if (notificationError) {
      console.error("Error creating comment reply notification:", notificationError)
    }
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath("/inbox")
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