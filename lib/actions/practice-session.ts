"use server"

import { loadReviewPageData } from "@/lib/loaders/review"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type PracticeBatchContext = { lane: "list" | "focus"; scopeId: number; afterId: number }

/** Ready tunes disappear when rescheduled. Scoped sessions use a stable ID
 * cursor because they also include tunes scheduled in the future. */
export async function loadNextPracticeBatch(context?: PracticeBatchContext): Promise<
  { ok: true; items: ReviewQueueItem[]; total: number } | { ok: false; error: string }
> {
  try {
    if (context && (!(context.lane === "list" || context.lane === "focus") || !Number.isSafeInteger(context.scopeId) || context.scopeId <= 0 || !Number.isSafeInteger(context.afterId) || context.afterId < 0)) {
      return { ok: false, error: "This practice session is unavailable. Please reopen Practice." }
    }
    const data = await loadReviewPageData(context ? {
      lane: context.lane,
      listId: context.lane === "list" ? context.scopeId : undefined,
      focusId: context.lane === "focus" ? context.scopeId : undefined,
      afterId: context.afterId,
    } : { lane: "ready" })
    return { ok: true, items: data.practiceItems, total: data.queueTotal }
  } catch {
    return { ok: false, error: "Couldn’t load the next tune. Your ratings are saved." }
  }
}
