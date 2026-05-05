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

type ActivityReplyRow = {
  id: number
  activity_event_id: number
  user_id: string
  piece_comment_id: number | null
  user_activity_events:
    | {
        piece_id: number | null
      }
    | {
        piece_id: number | null
      }[]
    | null
}

function cleanRedirectTo(
  value: string | FormDataEntryValue | null,
  fallback: string
) {
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

function appendActivityReplyStatus(redirectTo: string, status: string) {
  const separator = redirectTo.includes("?") ? "&" : "?"
  return `${redirectTo}${separator}activity_reply=${status}`
}

function normaliseJoinedActivityEvent(
  value:
    | {
        piece_id: number | null
      }
    | {
        piece_id: number | null
      }[]
    | null
) {
  return Array.isArray(value) ? value[0] ?? null : value
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

async function getActivityReactionCount(options: {
  supabase: Awaited<ReturnType<typeof createClient>>
  activityEventId: number
  reactionType: string
}) {
  const { count, error } = await options.supabase
    .from("activity_reactions")
    .select("id", { count: "exact", head: true })
    .eq("activity_event_id", options.activityEventId)
    .eq("reaction_type", options.reactionType)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function toggleActivityReactionByValues(options: {
  activityEventId: number
  reactionType: string
  redirectTo: string
  revalidateCurrentPath: boolean
  returnFreshCount: boolean
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      message: "You need to be signed in to react.",
      isActive: false,
      count: null,
    }
  }

  if (
    !Number.isInteger(options.activityEventId) ||
    options.activityEventId <= 0
  ) {
    return {
      ok: false,
      message: "That activity could not be found.",
      isActive: false,
      count: null,
    }
  }

  if (!ALLOWED_REACTIONS.has(options.reactionType)) {
    return {
      ok: false,
      message: "That reaction is not available.",
      isActive: false,
      count: null,
    }
  }

  const activityEvent = await loadActivityEvent(supabase, options.activityEventId)

  if (!activityEvent) {
    return {
      ok: false,
      message: "That activity could not be found.",
      isActive: false,
      count: null,
    }
  }

  const canInteract = await ensureCanInteractWithActivity({
    supabase,
    currentUserId: user.id,
    activityEvent,
  })

  if (!canInteract) {
    return {
      ok: false,
      message: "You cannot react to this activity.",
      isActive: false,
      count: null,
    }
  }

  const { data: existingReaction, error: existingReactionError } =
    await supabase
      .from("activity_reactions")
      .select("id")
      .eq("activity_event_id", options.activityEventId)
      .eq("user_id", user.id)
      .eq("reaction_type", options.reactionType)
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

    const count = options.returnFreshCount
      ? await getActivityReactionCount({
          supabase,
          activityEventId: options.activityEventId,
          reactionType: options.reactionType,
        })
      : null

    if (options.revalidateCurrentPath) {
      revalidatePath(options.redirectTo)
    }

    return {
      ok: true,
      message: null,
      isActive: false,
      count,
    }
  }

  const { data: insertedReaction, error: insertError } = await supabase
    .from("activity_reactions")
    .insert({
      activity_event_id: options.activityEventId,
      user_id: user.id,
      reaction_type: options.reactionType,
    })
    .select("id")
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  let createdNotification = false

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
        body_preview: options.reactionType,
      })

    if (notificationError) {
      throw new Error(notificationError.message)
    }

    createdNotification = true
  }

  const count = options.returnFreshCount
    ? await getActivityReactionCount({
        supabase,
        activityEventId: options.activityEventId,
        reactionType: options.reactionType,
      })
    : null

  if (options.revalidateCurrentPath) {
    revalidatePath(options.redirectTo)
  }

  if (createdNotification) {
    revalidatePath("/inbox")
  }

  return {
    ok: true,
    message: null,
    isActive: true,
    count,
  }
}

export async function toggleActivityReaction(formData: FormData) {
  const activityEventId = Number(formData.get("activity_event_id"))
  const reactionType = formData.get("reaction_type")?.toString() || ""
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/friends")

  await toggleActivityReactionByValues({
    activityEventId,
    reactionType,
    redirectTo,
    revalidateCurrentPath: true,
    returnFreshCount: true,
  })
}

export async function toggleActivityReactionFromClient(input: {
  activityEventId: number
  reactionType: string
  redirectTo?: string
}) {
  const redirectTo = cleanRedirectTo(input.redirectTo ?? null, "/friends")

  return toggleActivityReactionByValues({
    activityEventId: input.activityEventId,
    reactionType: input.reactionType,
    redirectTo,
    revalidateCurrentPath: false,
    returnFreshCount: false,
  })
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