import { createClient } from "@/lib/supabase/server"

export type ActivityEventType =
  | "started_practice"
  | "tune_reviewed"
  | "marked_known"
  | "comment_added"
  | "public_list_created"
  | "public_list_updated"
  | "piece_created"
  | "piece_details_added"
  | "piece_lore_added"
  | "piece_media_link_added"
  | "piece_sheet_music_link_added"

type RecordActivityEventInput = {
  userId: string
  eventType: ActivityEventType
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
    console.error("Error recording activity event:", {
      eventType,
      userId,
      pieceId,
      learningListId,
      commentId,
      metadata,
      error,
    })
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

export async function recordPieceCreatedEvent(userId: string, pieceId: number) {
  await recordActivityEvent({
    userId,
    eventType: "piece_created",
    pieceId,
  })
}

export async function recordPieceDetailsAddedEvent(
  userId: string,
  pieceId: number,
  fields: string[]
) {
  await recordActivityEvent({
    userId,
    eventType: "piece_details_added",
    pieceId,
    metadata: {
      fields,
    },
  })
}

export async function recordPieceLoreAddedEvent(
  userId: string,
  pieceId: number,
  loreEntryId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "piece_lore_added",
    pieceId,
    metadata: {
      lore_entry_id: loreEntryId,
    },
  })
}

export async function recordPieceMediaLinkAddedEvent(
  userId: string,
  pieceId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "piece_media_link_added",
    pieceId,
  })
}

export async function recordPieceSheetMusicLinkAddedEvent(
  userId: string,
  pieceId: number
) {
  await recordActivityEvent({
    userId,
    eventType: "piece_sheet_music_link_added",
    pieceId,
  })
}