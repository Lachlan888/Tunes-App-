import { redirect } from "next/navigation"
import { loadActivePracticeFociByPieceId, loadActivePracticeFocusOptions } from "@/lib/loaders/review/foci"
import {
  loadPracticeNoteCategoriesForUser,
  loadRecentPracticeNotesByPieceId,
} from "@/lib/loaders/review/notes"
import {
  buildCatchUpQueue,
  buildDueTodayPieces,
  buildReviewQueueItems,
  getReviewPieceIds,
  loadPreferredReferencesByPieceId,
  loadReviewMediaLoopsByPieceId,
  loadReviewPieceRows,
} from "@/lib/loaders/review/queue"
import { getToday } from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"
import type { StreakSummary } from "@/lib/types"

export type {
  PracticeDayRelation,
  PracticeFocusForReview,
  PracticeFocusRelation,
  PracticeFocusRow,
  PracticeFocusTuneRow,
  PracticeNoteCategoryRelation,
  RecentPracticeNoteForReview,
  RecentPracticeNoteRow,
  ReviewPageData,
  ReviewPieceRow,
  ReviewPreferredReferenceMetadata,
  ReviewQueueItem,
} from "@/lib/loaders/review/types"

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

  const [noteCategories, streakSummary, rows] = await Promise.all([
    practiceDiaryEnabled
      ? loadPracticeNoteCategoriesForUser(supabase, user.id)
      : [],
    reconcileStreaksForUser(supabase, user.id) as Promise<StreakSummary>,
    loadReviewPieceRows(supabase, user.id),
  ])

  const pieceIds = getReviewPieceIds(rows)

  const [
    recentNotesByPieceId,
    activeFociByPieceId,
    activeFocusOptions,
    savedMediaLoopsByPieceId,
    preferredReferencesByPieceId,
  ] = await Promise.all([
    loadRecentPracticeNotesByPieceId(supabase, user.id, pieceIds),
    loadActivePracticeFociByPieceId(supabase, user.id, pieceIds),
    loadActivePracticeFocusOptions(supabase, user.id),
    loadReviewMediaLoopsByPieceId(supabase, user.id, pieceIds),
    loadPreferredReferencesByPieceId(supabase, user.id, pieceIds),
  ])

  const today = getToday()

  const practiceItems = buildReviewQueueItems({
    rows,
    today,
    recentNotesByPieceId,
    activeFociByPieceId,
    activeFocusOptions,
    savedMediaLoopsByPieceId,
    mediaLinksByPieceId: new Map(),
    preferredReferencesByPieceId,
  })

  const dueTodayPieces = buildDueTodayPieces(practiceItems)
  const catchUpQueue = buildCatchUpQueue(practiceItems)

  return {
    user,
    practiceDiaryEnabled,
    noteCategories,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
  }
}
