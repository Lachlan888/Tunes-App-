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
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
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

type PracticeNoteCategoryRelation =
  | {
      name: string | null
    }
  | {
      name: string | null
    }[]
  | null

type PracticeDayRelation =
  | {
      practice_date: string | null
    }
  | {
      practice_date: string | null
    }[]
  | null

type RecentPracticeNoteRow = {
  id: number
  piece_id: number | null
  body: string | null
  created_at: string
  practice_note_categories: PracticeNoteCategoryRelation
  practice_days: PracticeDayRelation
}

export type RecentPracticeNoteForReview = {
  id: number
  body: string
  created_at: string
  practice_date: string | null
  category_name: string | null
}

export type ReviewQueueItem = UserPiece & {
  piece: Piece | null
  due_date_only: string | null
  overdue_days: number
  backlog_tier: BacklogTier | null
  backlog_label: string | null
  recent_practice_notes: RecentPracticeNoteForReview[]
}

function getPiece(pieces: Piece[] | Piece | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function getPracticeNoteCategoryName(
  relation: PracticeNoteCategoryRelation
): string | null {
  return getSingleJoinedRow(relation)?.name ?? null
}

function getPracticeDayDate(relation: PracticeDayRelation): string | null {
  return getSingleJoinedRow(relation)?.practice_date ?? null
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

async function loadPracticeNoteCategoriesForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<PracticeNoteCategory[]> {
  const { data, error } = await supabase
    .from("practice_note_categories")
    .select(
      `
        id,
        user_id,
        name,
        prompt,
        applies_to_tune_notes,
        applies_to_daily_reflection,
        sort_order,
        is_active,
        created_at,
        updated_at
      `
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PracticeNoteCategory[]
}

async function loadRecentPracticeNotesByPieceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  pieceIds: number[]
) {
  const notesByPieceId = new Map<number, RecentPracticeNoteForReview[]>()

  if (pieceIds.length === 0) {
    return notesByPieceId
  }

  const { data, error } = await supabase
    .from("practice_notes")
    .select(
      `
        id,
        piece_id,
        body,
        created_at,
        practice_note_categories (
          name
        ),
        practice_days (
          practice_date
        )
      `
    )
    .eq("user_id", userId)
    .in("piece_id", pieceIds)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(300)

  if (error) {
    throw new Error(error.message)
  }

  for (const row of (data ?? []) as RecentPracticeNoteRow[]) {
    if (!row.piece_id) continue

    const body = row.body?.trim()
    if (!body) continue

    const currentNotes = notesByPieceId.get(row.piece_id) ?? []

    if (currentNotes.length >= 3) {
      continue
    }

    currentNotes.push({
      id: row.id,
      body,
      created_at: row.created_at,
      practice_date: getPracticeDayDate(row.practice_days),
      category_name: getPracticeNoteCategoryName(
        row.practice_note_categories
      ),
    })

    notesByPieceId.set(row.piece_id, currentNotes)
  }

  return notesByPieceId
}

export async function loadReviewPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("practice_diary_enabled")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  const practiceDiaryEnabled = Boolean(profile?.practice_diary_enabled)

  const noteCategories = practiceDiaryEnabled
    ? await loadPracticeNoteCategoriesForUser(supabase, user.id)
    : []

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

  const rows = (data ?? []) as ReviewPieceRow[]

  const pieceIds = Array.from(
    new Set(
      rows
        .map((userPiece) => userPiece.piece_id)
        .filter((pieceId): pieceId is number => Number.isFinite(pieceId))
    )
  )

  const recentNotesByPieceId = await loadRecentPracticeNotesByPieceId(
    supabase,
    user.id,
    pieceIds
  )

  const today = getToday()

  const practiceItems: ReviewQueueItem[] = rows
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
    practiceDiaryEnabled,
    noteCategories,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    backlogSummary,
    needsAttentionCount,
  }
}