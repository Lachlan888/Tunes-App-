"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  ALLOWED_REACTIONS,
  cleanRedirectTo,
  ensureCanInteractWithActivity,
  getActivityReactionCount,
  loadActivityEvent,
} from "./shared"

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