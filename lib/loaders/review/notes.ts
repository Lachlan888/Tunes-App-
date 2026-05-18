import type { createClient } from "@/lib/supabase/server"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import {
  getPracticeDayDate,
  getPracticeNoteCategoryName,
} from "./helpers"
import type {
  RecentPracticeNoteForReview,
  RecentPracticeNoteRow,
} from "./types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadPracticeNoteCategoriesForUser(
  supabase: SupabaseServerClient,
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

export async function loadRecentPracticeNotesByPieceId(
  supabase: SupabaseServerClient,
  userId: string,
  pieceIds: number[]
): Promise<Map<number, RecentPracticeNoteForReview[]>> {
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