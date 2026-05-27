import type { createClient } from "@/lib/supabase/server"
import type { UserPieceMediaLoop } from "@/lib/types"
import { getEffectiveReference } from "@/lib/effective-reference"
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

export async function loadReviewMediaLoopsByPieceId(
  supabase: SupabaseServerClient,
  userId: string,
  pieceIds: number[]
): Promise<Map<number, UserPieceMediaLoop[]>> {
  const loopsByPieceId = new Map<number, UserPieceMediaLoop[]>()

  if (pieceIds.length === 0) {
    return loopsByPieceId
  }

  const { data, error } = await supabase
    .from("user_piece_media_loops")
    .select(
      "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
    )
    .eq("user_id", userId)
    .in("piece_id", pieceIds)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  for (const loop of (data ?? []) as UserPieceMediaLoop[]) {
    const loops = loopsByPieceId.get(loop.piece_id) ?? []
    loops.push(loop)
    loopsByPieceId.set(loop.piece_id, loops)
  }

  return loopsByPieceId
}

export async function loadPreferredReferencesByPieceId(
  supabase: SupabaseServerClient,
  userId: string,
  pieceIds: number[]
): Promise<Map<number, ReviewPreferredReferenceMetadata>> {
  const referencesByPieceId = new Map<
    number,
    ReviewPreferredReferenceMetadata
  >()

  if (pieceIds.length === 0) {
    return referencesByPieceId
  }

  const { data, error } = await supabase
    .from("user_piece_metadata")
    .select("piece_id, preferred_reference_url, preferred_reference_label")
    .eq("user_id", userId)
    .in("piece_id", pieceIds)

  if (error) {
    throw new Error(error.message)
  }

  for (const metadata of (data ?? []) as ReviewPreferredReferenceMetadata[]) {
    referencesByPieceId.set(metadata.piece_id, metadata)
  }

  return referencesByPieceId
}

export async function loadReviewMediaLinksByPieceId(
  supabase: SupabaseServerClient,
  pieceIds: number[]
): Promise<Map<number, ReviewPieceMediaLink[]>> {
  const linksByPieceId = new Map<number, ReviewPieceMediaLink[]>()

  if (pieceIds.length === 0) {
    return linksByPieceId
  }

  const { data, error } = await supabase
    .from("piece_media_links")
    .select("id, piece_id, url, label")
    .in("piece_id", pieceIds)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  for (const link of (data ?? []) as ReviewPieceMediaLink[]) {
    const links = linksByPieceId.get(link.piece_id) ?? []
    links.push(link)
    linksByPieceId.set(link.piece_id, links)
  }

  return linksByPieceId
}

export function buildReviewQueueItems({
  rows,
  today,
  recentNotesByPieceId,
  activeFociByPieceId,
  activeFocusOptions,
  savedMediaLoopsByPieceId,
  mediaLinksByPieceId,
  preferredReferencesByPieceId,
}: {
  rows: ReviewPieceRow[]
  today: string
  recentNotesByPieceId: Map<number, RecentPracticeNoteForReview[]>
  activeFociByPieceId: Map<number, PracticeFocusForReview[]>
  activeFocusOptions: PracticeFocusForReview[]
  savedMediaLoopsByPieceId: Map<number, UserPieceMediaLoop[]>
  mediaLinksByPieceId: Map<number, ReviewPieceMediaLink[]>
  preferredReferencesByPieceId: Map<number, ReviewPreferredReferenceMetadata>
}): ReviewQueueItem[] {
  return rows
    .map((userPiece) => {
      const piece = getPiece(userPiece.pieces)
      const dueDateOnly = normaliseStoredDate(userPiece.next_review_due)
      const overdueDays = getOverdueDays(userPiece.next_review_due, today)
      const {
        effectiveReferenceUrl,
        effectiveReferenceLabel,
        isUsingPreferredReference,
      } = getEffectiveReference({
        defaultReferenceUrl: piece?.reference_url,
        metadata: preferredReferencesByPieceId.get(userPiece.piece_id) ?? null,
      })
      const preferredReferenceMetadata =
        preferredReferencesByPieceId.get(userPiece.piece_id) ?? null

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
        effective_reference_url: effectiveReferenceUrl,
        effective_reference_label: effectiveReferenceLabel,
        is_using_preferred_reference: isUsingPreferredReference,
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
