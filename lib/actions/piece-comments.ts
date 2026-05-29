"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { recordCommentAddedEvent } from "@/lib/services/activity-events"
import { sendNotificationEmailForNotificationId } from "@/lib/services/notification-emails"

type ParentCommentRow = {
  id: number
  piece_id: number
  user_id: string
}

const VALID_REPORT_REASONS = [
  "spam",
  "abuse_or_harassment",
  "hateful_content",
  "sexual_content",
  "misleading_or_bad_faith",
  "other",
] as const

type CommentReportReason = (typeof VALID_REPORT_REASONS)[number]

function isValidReportReason(value: string): value is CommentReportReason {
  return VALID_REPORT_REASONS.includes(value as CommentReportReason)
}

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
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
      .eq("moderation_status", "visible")
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
      moderation_status: "visible",
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error adding piece comment:", error)
    return
  }

  await recordCommentAddedEvent(user.id, pieceId, insertedComment.id)

  if (parentComment && parentComment.user_id !== user.id) {
    const { data: notification, error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        recipient_user_id: parentComment.user_id,
        actor_user_id: user.id,
        notification_type: "comment_reply",
        piece_id: pieceId,
        comment_id: insertedComment.id,
        body_preview: previewBody(body),
      })
      .select("id")
      .single()

    if (notificationError || !notification) {
      console.error("Error creating comment reply notification:", notificationError)
    } else {
      try {
        const emailResult = await sendNotificationEmailForNotificationId(
          notification.id
        )

        if (!emailResult.ok) {
          console.error("Comment reply notification email did not send:", {
            notificationId: notification.id,
            status: emailResult.status,
            reason: emailResult.reason,
          })
        }
      } catch (emailError) {
        console.error("Comment reply notification email failed unexpectedly:", {
          notificationId: notification.id,
          error: emailError,
        })
      }
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

export async function reportPieceComment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const commentId = Number(formData.get("comment_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const reason = formData.get("reason")?.toString() || ""
  const details = formData.get("details")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "comment_report", "missing_piece"))
  }

  if (!commentId || Number.isNaN(commentId)) {
    redirect(appendQueryParam(redirectTo, "comment_report", "missing_comment"))
  }

  if (!isValidReportReason(reason)) {
    redirect(appendQueryParam(redirectTo, "comment_report", "invalid_reason"))
  }

  const { data: comment, error: commentError } = await supabase
    .from("piece_comments")
    .select("id, user_id, piece_id, moderation_status")
    .eq("id", commentId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (commentError || !comment) {
    redirect(appendQueryParam(redirectTo, "comment_report", "comment_not_found"))
  }

  if (comment.user_id === user.id) {
    redirect(appendQueryParam(redirectTo, "comment_report", "own_comment"))
  }

  if (comment.moderation_status === "hidden") {
    redirect(appendQueryParam(redirectTo, "comment_report", "already_hidden"))
  }

  const { error } = await supabase.from("comment_reports").insert({
    comment_id: commentId,
    reported_by: user.id,
    reason,
    details,
  })

  if (error) {
    console.error("Error reporting comment:", error)
    redirect(appendQueryParam(redirectTo, "comment_report", "error"))
  }

  revalidatePath(`/library/${pieceId}`)
  redirect(appendQueryParam(redirectTo, "comment_report", "success"))
}
