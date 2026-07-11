import type { createClient } from "@/lib/supabase/server"
import type { TuneMediaBundle } from "@/lib/tune-media"
import type { UserPieceMediaLoop } from "@/lib/types"
import { buildTuneMediaBundle } from "@/lib/tune-media"
import {
  getOverdueDays,
  isDueExactlyToday,
  normaliseStoredDate,
} from "@/lib/review"
import { getPiece, sortByDueDateAscending, sortByMostOverdueFirst } from "./helpers"
import type {
  PracticeFocusForReview,
  RecentPracticeNoteForReview,
  ReviewPieceMediaLink,
  ReviewPreferredReferenceMetadata,
  ReviewPieceRow,
  ReviewQueueItem,
} from "./types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadReviewPieceRows(
  supabase: SupabaseServerClient,
  userId: string
): Promise<ReviewPieceRow[]> {
  const { data, error } = await supabase
    .from("user_pieces")
    .select(`
      id,
      piece_id,
      status,
      next_review_due,
      stage,
      pieces (
        id,
        title,
        key,
        style,
        time_signature,
        composer,
        reference_url
      )
    `)
    .eq("user_id", userId)
    .eq("status", "learning")
    .not("next_review_due", "is", null)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ReviewPieceRow[]
}

export function getReviewPieceIds(rows: ReviewPieceRow[]): number[] {
  return Array.from(
    new Set(
      rows
        .map((userPiece) => userPiece.piece_id)
        .filter((pieceId): pieceId is number => Number.isFinite(pieceId))
    )
  )
}

export function buildReviewQueueItems({
  rows,
  today,
  recentNotesByPieceId,
  activeFociByPieceId,
  activeFocusOptions,
  savedMediaLoopsByPieceId,
  mediaLinksByPieceId,
  mediaBundlesByPieceId,
  preferredReferencesByPieceId,
}: {
  rows: ReviewPieceRow[]
  today: string
  recentNotesByPieceId: Map<number, RecentPracticeNoteForReview[]>
  activeFociByPieceId: Map<number, PracticeFocusForReview[]>
  activeFocusOptions: PracticeFocusForReview[]
  savedMediaLoopsByPieceId: Map<number, UserPieceMediaLoop[]>
  mediaLinksByPieceId: Map<number, ReviewPieceMediaLink[]>
  mediaBundlesByPieceId?: Map<number, TuneMediaBundle>
  preferredReferencesByPieceId: Map<number, ReviewPreferredReferenceMetadata>
}): ReviewQueueItem[] {
  return rows
    .map((userPiece) => {
      const piece = getPiece(userPiece.pieces)
      const dueDateOnly = normaliseStoredDate(userPiece.next_review_due)
      const overdueDays = getOverdueDays(userPiece.next_review_due, today)
      const preferredReferenceMetadata =
        preferredReferencesByPieceId.get(userPiece.piece_id) ?? null
      const mediaBundle =
        mediaBundlesByPieceId?.get(userPiece.piece_id) ??
        buildTuneMediaBundle({
          piece: piece ?? {
            id: userPiece.piece_id,
            title: "Untitled piece",
            reference_url: null,
          },
          mediaLinks: mediaLinksByPieceId.get(userPiece.piece_id) ?? [],
          metadata: preferredReferenceMetadata,
          mediaLoops: savedMediaLoopsByPieceId.get(userPiece.piece_id) ?? [],
        })
      const effectiveReference = mediaBundle.effectiveReference

      return {
        ...userPiece,
        piece,
        due_date_only: dueDateOnly,
        overdue_days: overdueDays,
        recent_practice_notes:
          recentNotesByPieceId.get(userPiece.piece_id) ?? [],
        active_practice_foci:
          activeFociByPieceId.get(userPiece.piece_id) ?? [],
        practice_focus_options: activeFocusOptions,
        saved_media_loops:
          savedMediaLoopsByPieceId.get(userPiece.piece_id) ?? [],
        media_links: mediaLinksByPieceId.get(userPiece.piece_id) ?? [],
        preferred_reference_metadata: preferredReferenceMetadata,
        effective_reference_url: effectiveReference?.url ?? null,
        effective_reference_label:
          mediaBundle.personalPreferredReference &&
          effectiveReference?.url === mediaBundle.personalPreferredReference.url
            ? effectiveReference.label
            : null,
        is_using_preferred_reference:
          effectiveReference?.sourceType === "personal-preferred-reference",
        media_bundle: mediaBundle,
      }
    })
    .sort(sortByDueDateAscending)
}

export function buildDueTodayPieces(
  practiceItems: ReviewQueueItem[]
): ReviewQueueItem[] {
  return practiceItems
    .filter((item) => isDueExactlyToday(item.next_review_due))
    .sort(sortByDueDateAscending)
}

export function buildCatchUpQueue(
  practiceItems: ReviewQueueItem[]
): ReviewQueueItem[] {
  return practiceItems
    .filter((item) => item.overdue_days > 0)
    .sort(sortByMostOverdueFirst)
}
