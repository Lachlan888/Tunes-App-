import type { createClient } from "@/lib/supabase/server"
import { getSingleJoinedRow } from "./helpers"
import type {
  PracticeFocusForReview,
  PracticeFocusRow,
  PracticeFocusTuneRow,
} from "./types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadActivePracticeFociByPieceId(
  supabase: SupabaseServerClient,
  userId: string,
  pieceIds: number[]
): Promise<Map<number, PracticeFocusForReview[]>> {
  const fociByPieceId = new Map<number, PracticeFocusForReview[]>()

  if (pieceIds.length === 0) {
    return fociByPieceId
  }

  const { data, error } = await supabase
    .from("practice_focus_tunes")
    .select(
      `
        id,
        piece_id,
        practice_foci!inner (
          id,
          title,
          description,
          status
        )
      `
    )
    .eq("user_id", userId)
    .in("piece_id", pieceIds)
    .eq("practice_foci.status", "active")
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  for (const row of (data ?? []) as PracticeFocusTuneRow[]) {
    const focus = getSingleJoinedRow(row.practice_foci)

    if (!focus || focus.status !== "active") {
      continue
    }

    const existing = fociByPieceId.get(row.piece_id) ?? []

    existing.push({
      id: focus.id,
      title: focus.title,
      description: focus.description,
    })

    fociByPieceId.set(row.piece_id, existing)
  }

  return fociByPieceId
}

export async function loadActivePracticeFocusOptions(
  supabase: SupabaseServerClient,
  userId: string
): Promise<PracticeFocusForReview[]> {
  const { data, error } = await supabase
    .from("practice_foci")
    .select(
      `
        id,
        title,
        description,
        status
      `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as PracticeFocusRow[]).map((focus) => ({
    id: focus.id,
    title: focus.title,
    description: focus.description,
  }))
}