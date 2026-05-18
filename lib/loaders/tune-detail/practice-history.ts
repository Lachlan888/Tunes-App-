import type { SupabaseClient } from "@supabase/supabase-js"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import { mapPracticeNote } from "./helpers"
import type { PracticeNoteRow, TunePracticeNote } from "./types"

export async function loadTunePracticeHistory(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number
): Promise<{
  typedPracticeNotes: TunePracticeNote[]
  practiceNoteCategories: PracticeNoteCategory[]
}> {
  const [practiceNotesResult, practiceCategoriesResult] = await Promise.all([
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
  ])

  return {
    typedPracticeNotes: ((practiceNotesResult.data ?? []) as PracticeNoteRow[])
      .map(mapPracticeNote),
    practiceNoteCategories:
      (practiceCategoriesResult.data as PracticeNoteCategory[] | null) ?? [],
  }
}