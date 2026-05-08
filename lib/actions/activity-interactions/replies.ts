"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  ActivityReplyRow,
  PieceCommentRow,
  cleanRedirectTo,
  ensureCanInteractWithActivity,
  loadActivityEvent,
  normaliseJoinedActivityEvent,
  previewBody,
} from "./shared"

export async function addActivityReply(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const activityEventId = Number(formData.get("activity_event_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/friends")
  const body = formData.get("body")?.toString().trim() || ""

  if (!Number.isInteger(activityEventId) || activityEventId <= 0) {
    return
  }

  if (!body) {
    return
  }

  const activityEvent = await loadActivityEvent(supabase, activityEventId)

  if (!activityEvent) {
    return
  }

  const canInteract = await ensureCanInteractWithActivity({
    supabase,
    currentUserId: user.id,
    activityEvent,
  })

  if (!canInteract) {
    return
  }

  let insertedPieceCommentId: number | null = null
  let notificationType: "activity_reply" | "comment_reply" = "activity_reply"

  if (
    activityEvent.event_type === "comment_added" &&
    activityEvent.piece_id &&
    activityEvent.comment_id
  ) {
    const { data: parentComment, error: parentCommentError } = await supabase
      .from("piece_comments")
      .select("id, piece_id, user_id")
      .eq("id", activityEvent.comment_id)
      .eq("piece_id", activityEvent.piece_id)
      .maybeSingle()

    if (parentCommentError) {
      throw new Error(parentCommentError.message)
    }

    const typedParentComment = (parentComment as PieceCommentRow | null) ?? null

    if (typedParentComment) {
      const { data: insertedPieceComment, error: pieceCommentError } =
        await supabase
          .from("piece_comments")
          .insert({
            piece_id: typedParentComment.piece_id,
            user_id: user.id,
            body,
            parent_comment_id: typedParentComment.id,
          })
          .select("id")
          .single()

      if (pieceCommentError) {
        throw new Error(pieceCommentError.message)
      }

      insertedPieceCommentId = insertedPieceComment.id
      notificationType = "comment_reply"
    }
  }

  const { data: insertedReply, error: replyError } = await supabase
    .from("activity_replies")
    .insert({
      activity_event_id: activityEventId,
      user_id: user.id,
      body,
      piece_comment_id: insertedPieceCommentId,
    })
    .select("id")
    .single()

  if (replyError) {
    throw new Error(replyError.message)
  }

  if (activityEvent.user_id !== user.id) {
    const { error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        recipient_user_id: activityEvent.user_id,
        actor_user_id: user.id,
        notification_type: notificationType,
        activity_event_id: activityEvent.id,
        activity_reply_id: insertedReply.id,
        piece_id: activityEvent.piece_id,
        learning_list_id: activityEvent.learning_list_id,
        comment_id: insertedPieceCommentId ?? activityEvent.comment_id,
        body_preview: previewBody(body),
      })

    if (notificationError) {
      throw new Error(notificationError.message)
    }
  }

  if (activityEvent.piece_id) {
    revalidatePath(`/library/${activityEvent.piece_id}`)
  }

  revalidatePath("/")
  revalidatePath("/friends")
  revalidatePath("/inbox")
  revalidatePath(redirectTo)
}

export async function updateActivityReply(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const replyId = Number(formData.get("activity_reply_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/friends")
  const body = formData.get("body")?.toString().trim() || ""

  if (!Number.isInteger(replyId) || replyId <= 0) {
    return
  }

  if (!body) {
    return
  }

  const { data: reply, error: replyError } = await supabase
    .from("activity_replies")
    .select(
      `
        id,
        activity_event_id,
        user_id,
        piece_comment_id,
        user_activity_events (
          piece_id
        )
      `
    )
    .eq("id", replyId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (replyError) {
    throw new Error(replyError.message)
  }

  const typedReply = (reply as ActivityReplyRow | null) ?? null

  if (!typedReply) {
    return
  }

  const { error: updateReplyError } = await supabase
    .from("activity_replies")
    .update({ body })
    .eq("id", typedReply.id)
    .eq("user_id", user.id)

  if (updateReplyError) {
    throw new Error(updateReplyError.message)
  }

  if (typedReply.piece_comment_id) {
    const { error: updatePieceCommentError } = await supabase
      .from("piece_comments")
      .update({ body })
      .eq("id", typedReply.piece_comment_id)
      .eq("user_id", user.id)

    if (updatePieceCommentError) {
      throw new Error(updatePieceCommentError.message)
    }
  }

  const { error: notificationUpdateError } = await supabase
    .from("user_notifications")
    .update({ body_preview: previewBody(body) })
    .eq("activity_reply_id", typedReply.id)
    .eq("actor_user_id", user.id)

  if (notificationUpdateError) {
    throw new Error(notificationUpdateError.message)
  }

  const activityEvent = normaliseJoinedActivityEvent(
    typedReply.user_activity_events
  )

  if (activityEvent?.piece_id) {
    revalidatePath(`/library/${activityEvent.piece_id}`)
  }

  revalidatePath("/")
  revalidatePath("/friends")
  revalidatePath("/inbox")
  revalidatePath(redirectTo)
}

export async function deleteActivityReply(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const replyId = Number(formData.get("activity_reply_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/friends")

  if (!Number.isInteger(replyId) || replyId <= 0) {
    return
  }

  const { data: reply, error: replyError } = await supabase
    .from("activity_replies")
    .select(
      `
        id,
        activity_event_id,
        user_id,
        piece_comment_id,
        user_activity_events (
          piece_id
        )
      `
    )
    .eq("id", replyId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (replyError) {
    throw new Error(replyError.message)
  }

  const typedReply = (reply as ActivityReplyRow | null) ?? null

  if (!typedReply) {
    return
  }

  const { error: notificationArchiveError } = await supabase
    .from("user_notifications")
    .update({
      archived_at: new Date().toISOString(),
      read_at: new Date().toISOString(),
    })
    .eq("activity_reply_id", typedReply.id)
    .eq("actor_user_id", user.id)

  if (notificationArchiveError) {
    throw new Error(notificationArchiveError.message)
  }

  const { error: deleteReplyError } = await supabase
    .from("activity_replies")
    .delete()
    .eq("id", typedReply.id)
    .eq("user_id", user.id)

  if (deleteReplyError) {
    throw new Error(deleteReplyError.message)
  }

  if (typedReply.piece_comment_id) {
    const { error: deletePieceCommentError } = await supabase
      .from("piece_comments")
      .delete()
      .eq("id", typedReply.piece_comment_id)
      .eq("user_id", user.id)

    if (deletePieceCommentError) {
      throw new Error(deletePieceCommentError.message)
    }
  }

  const activityEvent = normaliseJoinedActivityEvent(
    typedReply.user_activity_events
  )

  if (activityEvent?.piece_id) {
    revalidatePath(`/library/${activityEvent.piece_id}`)
  }

  revalidatePath("/")
  revalidatePath("/friends")
  revalidatePath("/inbox")
  revalidatePath(redirectTo)
}