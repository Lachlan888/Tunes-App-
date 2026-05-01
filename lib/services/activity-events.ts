import { createClient } from "@/lib/supabase/server"

type RecordActivityEventInput = {
  userId: string
  eventType:
    | "started_practice"
    | "tune_reviewed"
    | "marked_known"
    | "comment_added"
    | "public_list_created"
    | "public_list_updated"
  pieceId?: number | null
  learningListId?: number | null
  commentId?: number | null
  metadata?: Record<string, unknown> | null
}

async function recordActivityEvent({
  userId,
  eventType,
  pieceId = null,
  learningListId = null,
  commentId = null,
  metadata = null,
}: RecordActivityEventInput) {
  const supabase = await createClient()

  const { error } = await supabase.from("user_activity_events").insert({
    user_id: userId,
    event_type: eventType,
    piece_id: pieceId,
    learning_list_id: learningListId,
    comment_id: commentId,
    metadata,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function recordStartedPracticeEvent(
  userId: string,
  pieceId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "started_practice",
    pieceId,
  })
}

export async function recordTuneReviewedEvent(
  userId: string,
  pieceId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "tune_reviewed",
    pieceId,
  })
}

export async function recordMarkedKnownEvent(userId: string, pieceId: number) {
  await recordActivityEvent({
    userId,
    eventType: "marked_known",
    pieceId,
  })
}

export async function recordCommentAddedEvent(
  userId: string,
  pieceId: number,
  commentId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "comment_added",
    pieceId,
    commentId,
  })
}

export async function recordPublicListCreatedEvent(
  userId: string,
  learningListId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "public_list_created",
    learningListId,
  })
}

export async function recordPublicListUpdatedEvent(
  userId: string,
  learningListId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "public_list_updated",
    learningListId,
  })
}