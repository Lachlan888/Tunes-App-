import type { createClient } from "@/lib/supabase/server"
import {
  getBacklogTier,
  getBacklogTierLabel,
  getOverdueDays,
  isDueExactlyToday,
  normaliseStoredDate,
} from "@/lib/review"
import type { BacklogGroupSummary } from "@/lib/types"
import { getPiece, sortByDueDateAscending, sortByMostOverdueFirst } from "./helpers"
import type {
  PracticeFocusForReview,
  RecentPracticeNoteForReview,
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
}: {
  rows: ReviewPieceRow[]
  today: string
  recentNotesByPieceId: Map<number, RecentPracticeNoteForReview[]>
  activeFociByPieceId: Map<number, PracticeFocusForReview[]>
  activeFocusOptions: PracticeFocusForReview[]
}): ReviewQueueItem[] {
  return rows
    .map((userPiece) => {
      const dueDateOnly = normaliseStoredDate(userPiece.next_review_due)
      const backlogTier = getBacklogTier(userPiece.next_review_due, today)

      return {
        ...userPiece,
        piece: getPiece(userPiece.pieces),
        due_date_only: dueDateOnly,
        overdue_days: getOverdueDays(userPiece.next_review_due, today),
        backlog_tier: backlogTier,
        backlog_label: backlogTier ? getBacklogTierLabel(backlogTier) : null,
        recent_practice_notes:
          recentNotesByPieceId.get(userPiece.piece_id) ?? [],
        active_practice_foci:
          activeFociByPieceId.get(userPiece.piece_id) ?? [],
        practice_focus_options: activeFocusOptions,
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
    .filter((item) => item.backlog_tier !== null)
    .sort(sortByMostOverdueFirst)
}

export function buildBacklogSummary(
  catchUpQueue: ReviewQueueItem[]
): BacklogGroupSummary[] {
  return [
    {
      tier: "due_now",
      label: getBacklogTierLabel("due_now"),
      count: catchUpQueue.filter((item) => item.backlog_tier === "due_now")
        .length,
    },
    {
      tier: "overdue",
      label: getBacklogTierLabel("overdue"),
      count: catchUpQueue.filter((item) => item.backlog_tier === "overdue")
        .length,
    },
    {
      tier: "overdue_longest",
      label: getBacklogTierLabel("overdue_longest"),
      count: catchUpQueue.filter(
        (item) => item.backlog_tier === "overdue_longest"
      ).length,
    },
  ]
}

export function getNeedsAttentionCount(backlogSummary: BacklogGroupSummary[]) {
  return backlogSummary.reduce((sum, group) => sum + group.count, 0)
}