import { redirect } from "next/navigation"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"
import {
  getBacklogTier,
  getBacklogTierLabel,
  getOverdueDays,
  getToday,
  isDueExactlyToday,
  normaliseStoredDate,
} from "@/lib/review"
import type {
  BacklogGroupSummary,
  BacklogTier,
  Piece,
  StreakSummary,
  UserPiece,
} from "@/lib/types"

type ReviewPieceRow = UserPiece & {
  pieces: Piece[] | Piece | null
}

export type ReviewQueueItem = UserPiece & {
  piece: Piece | null
  due_date_only: string | null
  overdue_days: number
  backlog_tier: BacklogTier | null
  backlog_label: string | null
}

function getPiece(pieces: Piece[] | Piece | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

function sortByDueDateAscending(a: ReviewQueueItem, b: ReviewQueueItem) {
  const aDue = a.due_date_only ?? "9999-12-31"
  const bDue = b.due_date_only ?? "9999-12-31"

  if (aDue !== bDue) {
    return aDue.localeCompare(bDue)
  }

  return a.stage - b.stage
}

function sortByMostOverdueFirst(a: ReviewQueueItem, b: ReviewQueueItem) {
  if (a.overdue_days !== b.overdue_days) {
    return b.overdue_days - a.overdue_days
  }

  const aDue = a.due_date_only ?? "9999-12-31"
  const bDue = b.due_date_only ?? "9999-12-31"

  if (aDue !== bDue) {
    return aDue.localeCompare(bDue)
  }

  return a.stage - b.stage
}

export async function loadReviewPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const streakSummary: StreakSummary = await reconcileStreaksForUser(
    supabase,
    user.id
  )

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
    .eq("user_id", user.id)
    .eq("status", "learning")
    .not("next_review_due", "is", null)

  if (error) {
    throw new Error(error.message)
  }

  const today = getToday()

  const practiceItems: ReviewQueueItem[] = ((data ?? []) as ReviewPieceRow[])
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
      }
    })
    .sort(sortByDueDateAscending)

  const dueTodayPieces = practiceItems
    .filter((item) => isDueExactlyToday(item.next_review_due))
    .sort(sortByDueDateAscending)

  const catchUpQueue = practiceItems
    .filter((item) => item.backlog_tier !== null)
    .sort(sortByMostOverdueFirst)

  const backlogSummary: BacklogGroupSummary[] = [
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

  const needsAttentionCount = backlogSummary.reduce(
    (sum, group) => sum + group.count,
    0
  )

  return {
    user,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    backlogSummary,
    needsAttentionCount,
  }
}