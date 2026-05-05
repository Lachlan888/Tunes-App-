"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_REACTIONS = new Set(["good_craic"])

type ActivityEventRow = {
  id: number
  user_id: string
  event_type:
    | "started_practice"
    | "tune_reviewed"
    | "marked_known"
    | "comment_added"
    | "public_list_created"
    | "public_list_updated"
  piece_id: number | null
  learning_list_id: number | null
  comment_id: number | null
}

type PieceCommentRow = {
  id: number
  piece_id: number
  user_id: string
}

function cleanRedirectTo(value: FormDataEntryValue | null, fallback: string) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function previewBody(body: string) {
  const cleaned = body.replace(/\s+/g, " ").trim()
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}…` : cleaned
}

async function loadActivityEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  activityEventId: number
) {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select("id, user_id, event_type, piece_id, learning_list_id, comment_id")
    .eq("id", activityEventId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as ActivityEventRow | null) ?? null
}

async function usersAreAcceptedFriends(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIdA: string,
  userIdB: string
) {
  if (userIdA === userIdB) {
    return true
  }

  const { data, error } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${userIdA},addressee_id.eq.${userIdB}),and(requester_id.eq.${userIdB},addressee_id.eq.${userIdA})`
    )
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

async function ensureCanInteractWithActivity(options: {
  supabase: Awaited<ReturnType<typeof createClient>>
  currentUserId: string
  activityEvent: ActivityEventRow
}) {
  if (options.activityEvent.user_id === options.currentUserId) {
    return true
  }

  return usersAreAcceptedFriends(
    options.supabase,
    options.currentUserId,
    options.activityEvent.user_id
  )
}

export async function toggleActivityReaction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const activityEventId = Number(formData.get("activity_event_id"))
  const reactionType = formData.get("reaction_type")?.toString() || ""
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/friends")

  if (!Number.isInteger(activityEventId) || activityEventId <= 0) {
    return
  }

  if (!ALLOWED_REACTIONS.has(reactionType)) {
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

  const { data: existingReaction, error: existingReactionError } = await supabase
    .from("activity_reactions")
    .select("id")
    .eq("activity_event_id", activityEventId)
    .eq("user_id", user.id)
    .eq("reaction_type", reactionType)
    .maybeSingle()

  if (existingReactionError) {
    throw new Error(existingReactionError.message)
  }

  if (existingReaction) {
    const { error: deleteError } = await supabase
      .from("activity_reactions")
      .delete()
      .eq("id", existingReaction.id)
      .eq("user_id", user.id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    revalidatePath("/")
    revalidatePath("/friends")
    revalidatePath("/inbox")
    revalidatePath(redirectTo)
    return
  }

  const { data: insertedReaction, error: insertError } = await supabase
    .from("activity_reactions")
    .insert({
      activity_event_id: activityEventId,
      user_id: user.id,
      reaction_type: reactionType,
    })
    .select("id")
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  if (activityEvent.user_id !== user.id) {
    const { error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        recipient_user_id: activityEvent.user_id,
        actor_user_id: user.id,
        notification_type: "activity_reaction",
        activity_event_id: activityEvent.id,
        activity_reaction_id: insertedReaction.id,
        piece_id: activityEvent.piece_id,
        learning_list_id: activityEvent.learning_list_id,
        comment_id: activityEvent.comment_id,
        body_preview: reactionType,
      })

    if (notificationError) {
      throw new Error(notificationError.message)
    }
  }

  revalidatePath("/")
  revalidatePath("/friends")
  revalidatePath("/inbox")
  revalidatePath(redirectTo)
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

export async function markNotificationRead(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const notificationId = Number(formData.get("notification_id"))

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return
  }

  const { data: notification, error: notificationError } = await supabase
    .from("user_notifications")
    .select("id, direct_message_id")
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)
    .maybeSingle()

  if (notificationError) {
    throw new Error(notificationError.message)
  }

  if (!notification) {
    return
  }

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  if (notification.direct_message_id) {
    await supabase
      .from("direct_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification.direct_message_id)
      .eq("recipient_user_id", user.id)
      .is("read_at", null)
  }

  revalidatePath("/inbox")
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: now })
    .eq("recipient_user_id", user.id)
    .is("read_at", null)
    .is("archived_at", null)

  if (error) {
    throw new Error(error.message)
  }

  await supabase
    .from("direct_messages")
    .update({ read_at: now })
    .eq("recipient_user_id", user.id)
    .is("read_at", null)
    .is("recipient_archived_at", null)

  revalidatePath("/inbox")
}

export async function archiveNotification(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const notificationId = Number(formData.get("notification_id"))

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("user_notifications")
    .update({
      archived_at: now,
      read_at: now,
    })
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/inbox")
}