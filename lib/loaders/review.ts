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
  loadReviewPieceRows,
} from "@/lib/loaders/review/queue"
import { getToday } from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"
import { loadTuneMediaBundles } from "@/lib/tune-media"
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
    mediaBundlesByPieceId,
  ] = await Promise.all([
    loadRecentPracticeNotesByPieceId(supabase, user.id, pieceIds),
    loadActivePracticeFociByPieceId(supabase, user.id, pieceIds),
    loadActivePracticeFocusOptions(supabase, user.id),
    loadTuneMediaBundles({
      supabase,
      pieces: rows
        .map((row) => {
          const piece = Array.isArray(row.pieces)
            ? row.pieces[0] ?? null
            : row.pieces

          return piece
        })
        .filter((piece): piece is NonNullable<typeof piece> => Boolean(piece)),
      userId: user.id,
    }),
  ])

  const today = getToday()

  const practiceItems = buildReviewQueueItems({
    rows,
    today,
    recentNotesByPieceId,
    activeFociByPieceId,
    activeFocusOptions,
    savedMediaLoopsByPieceId: new Map(),
    mediaLinksByPieceId: new Map(
      Array.from(mediaBundlesByPieceId.entries()).map(([pieceId, bundle]) => [
        pieceId,
        bundle.additionalMedia.map((source) => ({
          id: Number(source.id.replace("media-", "")) || 0,
          piece_id: pieceId,
          url: source.url,
          label: source.label,
          media_type: source.mediaType,
          notes: source.notes ?? null,
          created_by: source.createdBy ?? null,
        })),
      ])
    ),
    mediaBundlesByPieceId,
    preferredReferencesByPieceId: new Map(),
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
