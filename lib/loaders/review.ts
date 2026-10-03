import { redirectToLogin } from "@/lib/auth/login-redirect"
import {
  buildCatchUpQueue,
  buildDueTodayPieces,
  buildReviewQueueItems,
  loadReviewPieceRows,
} from "@/lib/loaders/review/queue"
import { getToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { loadTuneMediaBundles } from "@/lib/tune-media"

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

export async function loadReviewPageData(options: { lane?: string | null; listId?: number; focusId?: number; afterId?: number } = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectToLogin()
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

  const today = getToday()
  let scope: { kind: "list" | "focus"; id: number } | null | undefined
  let sessionLabel: string | undefined
  let sessionKey: string | undefined
  if (options.lane === "list" || options.lane === "focus") {
    const isList = options.lane === "list"
    const id = isList ? options.listId : options.focusId
    scope = null
    sessionLabel = isList ? "List unavailable" : "Focus unavailable"
    sessionKey = `${options.lane}-unavailable`
    if (id && Number.isSafeInteger(id) && id > 0) {
      const scopeResult = isList
        ? await supabase.from("learning_lists").select("id, name").eq("id", id).maybeSingle()
        : await supabase.from("practice_foci").select("id, title").eq("id", id).eq("user_id", user.id).eq("status", "active").maybeSingle()
      if (scopeResult.error) throw new Error("Practice context could not be loaded")
      if (scopeResult.data) {
        scope = { kind: isList ? "list" : "focus", id }
        sessionLabel = "name" in scopeResult.data ? scopeResult.data.name : scopeResult.data.title
        sessionKey = `${options.lane}-${id}`
      }
    }
  }
  const countQuery = () => supabase.from("user_pieces").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "learning").not("next_review_due", "is", null)
  const [page, dueCount, catchUpCount, activeCount] = await Promise.all([
    options.lane ? loadReviewPieceRows(supabase, user.id, { today, lane: options.lane, scope, afterId: options.afterId, limit: 50 }) : Promise.resolve({ rows: [], total: 0 }),
    countQuery().eq("next_review_due", today),
    countQuery().lt("next_review_due", today),
    countQuery(),
  ])

  for (const result of [dueCount, catchUpCount, activeCount]) if (result.error) throw new Error("Practice counts could not be loaded")
  const rows = page.rows
  const mediaBundlesByPieceId = await loadTuneMediaBundles({
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
    })

  const practiceItems = buildReviewQueueItems({
    rows,
    today,
    recentNotesByPieceId: new Map(),
    activeFociByPieceId: new Map(),
    activeFocusOptions: [],
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

  if (scope) practiceItems.sort((left, right) => left.id - right.id)

  const dueTodayPieces = buildDueTodayPieces(practiceItems)
  const catchUpQueue = buildCatchUpQueue(practiceItems)

  return {
    user,
    dueTodayCount: dueCount.count ?? 0,
    catchUpCount: catchUpCount.count ?? 0,
    activeCount: activeCount.count ?? 0,
    queueTotal: page.total,
    sessionLabel,
    sessionKey,
    scopeId: scope?.id,
    practiceDiaryEnabled,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    today,
  }
}
