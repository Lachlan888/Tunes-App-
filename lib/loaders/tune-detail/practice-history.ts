import type { SupabaseClient } from "@supabase/supabase-js"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import { mapPracticeNote } from "./helpers"
import type {
  PracticeNoteRow,
  TunePracticeNote,
  TuneReviewSummary,
} from "./types"

type ReviewEventRow = {
  id: number
  outcome: string
  resulting_stage: number | null
  created_at: string | null
}

type PracticeReviewRow = {
  id: number
  created_at: string
  review_events: ReviewEventRow | ReviewEventRow[] | null
}

function getJoinedReview(
  value: PracticeReviewRow["review_events"]
): ReviewEventRow | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function loadTunePracticeHistory(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number
): Promise<{
  typedPracticeNotes: TunePracticeNote[]
  typedReviewHistory: TuneReviewSummary[]
  practiceNoteCategories: PracticeNoteCategory[]
}> {
  const [practiceNotesResult, practiceCategoriesResult, reviewHistoryResult] =
    await Promise.all([
    supabase
      .from("practice_notes")
      .select(
        `
          id,
          body,
          created_at,
          practice_days (
            practice_date
          ),
          practice_note_categories (
            name
          ),
          review_events (
            outcome
          ),
          practice_events (
            practice_outcome
          )
        `
      )
      .eq("user_id", userId)
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
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
      .order("name", { ascending: true }),

    supabase
      .from("practice_events")
      .select(
        `
          id,
          created_at,
          review_events (
            id,
            outcome,
            resulting_stage,
            created_at
          )
        `
      )
      .eq("user_id", userId)
      .eq("piece_id", pieceId)
      .not("review_event_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const typedReviewHistory = (
    (reviewHistoryResult.data ?? []) as PracticeReviewRow[]
  ).flatMap((event): TuneReviewSummary[] => {
    const review = getJoinedReview(event.review_events)
    if (!review) return []

    return [
      {
        id: review.id,
        outcome: review.outcome,
        resulting_stage: review.resulting_stage,
        created_at: review.created_at ?? event.created_at,
      },
    ]
  })

  return {
    typedPracticeNotes: ((practiceNotesResult.data ?? []) as PracticeNoteRow[])
      .map(mapPracticeNote),
    typedReviewHistory,
    practiceNoteCategories:
      (practiceCategoriesResult.data as PracticeNoteCategory[] | null) ?? [],
  }
}
