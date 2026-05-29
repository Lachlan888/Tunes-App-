"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  ActivityEventRow,
  ActivityReplyRow,
  PieceCommentRow,
  SupabaseServerClient,
  cleanRedirectTo,
  ensureCanInteractWithActivity,
  getMetadataNumber,
  getMetadataString,
  loadActivityEvent,
  normaliseJoinedActivityEvent,
  previewBody,
} from "./shared"

type BadgeRow = {
  id: number
  owner_user_id: string
  name: string
  slug: string
}

function isBadgeActivity(eventType: string) {
  return eventType === "badge_created" || eventType === "badge_awarded"
}

async function loadBadgeOwnerUserId({
  supabase,
  badgeId,
}: {
  supabase: SupabaseServerClient
  badgeId: number
}) {
  const { data, error } = await supabase
    .from("badges")
    .select("id, owner_user_id, name, slug")
    .eq("id", badgeId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const badge = (data as BadgeRow | null) ?? null
  return badge?.owner_user_id ?? null
}

async function createActivityReplyNotification({
  supabase,
  recipientUserId,
  actorUserId,
  activityEvent,
  activityReplyId,
  body,
  badgeId,
  commentId,
}: {
  supabase: SupabaseServerClient
  recipientUserId: string
  actorUserId: string
  activityEvent: ActivityEventRow
  activityReplyId: number
  body: string
  badgeId: number | null
  commentId: number | null
}) {
  if (recipientUserId === actorUserId) {
    return
  }

  const notificationType =
    activityEvent.event_type === "comment_added" && commentId
      ? "comment_reply"
      : "activity_reply"

  const { error } = await supabase
    .from("user_notifications")
    .insert({
      recipient_user_id: recipientUserId,
      actor_user_id: actorUserId,
      notification_type: notificationType,
      activity_event_id: activityEvent.id,
      activity_reply_id: activityReplyId,
      piece_id: activityEvent.piece_id,
      learning_list_id: activityEvent.learning_list_id,
      comment_id: commentId,
      badge_id: badgeId,
      body_preview: previewBody(body),
    })

  if (error) {
    console.error("Error creating activity reply notification:", error)
  }
}

async function notifyReplyTargets({
  supabase,
  activityEvent,
  actorUserId,
  activityReplyId,
  body,
  insertedPieceCommentId,
}: {
  supabase: SupabaseServerClient
  activityEvent: ActivityEventRow
  actorUserId: string
  activityReplyId: number
  body: string
  insertedPieceCommentId: number | null
}) {
  const badgeId = getMetadataNumber(activityEvent.metadata, "badge_id")
  const recipientUserIds = new Set<string>()

  if (activityEvent.user_id !== actorUserId) {
    recipientUserIds.add(activityEvent.user_id)
  }

  if (isBadgeActivity(activityEvent.event_type)) {
    if (badgeId !== null) {
      const badgeOwnerUserId = await loadBadgeOwnerUserId({
        supabase,
        badgeId,
      })

      if (badgeOwnerUserId && badgeOwnerUserId !== actorUserId) {
        recipientUserIds.add(badgeOwnerUserId)
      }
    }

    const badgeRecipientUserId = getMetadataString(
      activityEvent.metadata,
      "recipient_user_id"
    )

    if (badgeRecipientUserId && badgeRecipientUserId !== actorUserId) {
      recipientUserIds.add(badgeRecipientUserId)
    }
  }

  await Promise.all(
    Array.from(recipientUserIds).map((recipientUserId) =>
      createActivityReplyNotification({
        supabase,
        recipientUserId,
        actorUserId,
        activityEvent,
        activityReplyId,
        body,
        badgeId,
        commentId: insertedPieceCommentId ?? activityEvent.comment_id,
      })
    )
  )
}

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

  await notifyReplyTargets({
    supabase,
    activityEvent,
    actorUserId: user.id,
    activityReplyId: insertedReply.id,
    body,
    insertedPieceCommentId,
  })

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
