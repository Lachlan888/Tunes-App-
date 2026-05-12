import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Piece } from "@/lib/types"

export type PracticeFocusStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived"

export type PracticeFocusTune = {
  id: number
  focus_id: number
  piece_id: number
  created_at: string
  piece: Piece | null
}

export type PracticeFocus = {
  id: number
  user_id: string
  title: string
  description: string | null
  status: PracticeFocusStatus
  started_at: string | null
  target_date: string | null
  created_at: string
  updated_at: string | null
  completed_at: string | null
  archived_at: string | null
  tunes: PracticeFocusTune[]
}

export type ActivePracticeTuneOption = {
  user_piece_id: number
  piece_id: number
  stage: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type PracticeFocusTuneRow = {
  id: number
  focus_id: number
  piece_id: number
  created_at: string
  pieces: Piece | Piece[] | null
}

type PracticeFocusRow = {
  id: number
  user_id: string
  title: string
  description: string | null
  status: PracticeFocusStatus
  started_at: string | null
  target_date: string | null
  created_at: string
  updated_at: string | null
  completed_at: string | null
  archived_at: string | null
  practice_focus_tunes: PracticeFocusTuneRow[] | null
}

type ActivePracticeTuneRow = {
  id: number
  piece_id: number
  stage: number
  pieces: Piece | Piece[] | null
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapPracticeFocus(row: PracticeFocusRow): PracticeFocus {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    started_at: row.started_at,
    target_date: row.target_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
    archived_at: row.archived_at,
    tunes: (row.practice_focus_tunes ?? []).map((tuneRow) => ({
      id: tuneRow.id,
      focus_id: tuneRow.focus_id,
      piece_id: tuneRow.piece_id,
      created_at: tuneRow.created_at,
      piece: getSingleJoinedRow(tuneRow.pieces),
    })),
  }
}

export async function loadPracticeFociPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: focusRows, error: focusError } = await supabase
    .from("practice_foci")
    .select(
      `
        id,
        user_id,
        title,
        description,
        status,
        started_at,
        target_date,
        created_at,
        updated_at,
        completed_at,
        archived_at,
        practice_focus_tunes (
          id,
          focus_id,
          piece_id,
          created_at,
          pieces (
            id,
            title,
            key,
            style,
            time_signature,
            reference_url
          )
        )
      `
    )
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })

  if (focusError) {
    throw new Error(focusError.message)
  }

  const { data: activeTuneRows, error: activeTuneError } = await supabase
    .from("user_pieces")
    .select(
      `
        id,
        piece_id,
        stage,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          reference_url
        )
      `
    )
    .eq("user_id", user.id)
    .eq("status", "learning")
    .order("stage", { ascending: true })

  if (activeTuneError) {
    throw new Error(activeTuneError.message)
  }

  const activePracticeTunes: ActivePracticeTuneOption[] = (
    (activeTuneRows ?? []) as ActivePracticeTuneRow[]
  )
    .map((row) => {
      const piece = getSingleJoinedRow(row.pieces)

      if (!piece) {
        return null
      }

      return {
        user_piece_id: row.id,
        piece_id: row.piece_id,
        stage: row.stage,
        title: piece.title,
        key: piece.key,
        style: piece.style,
        time_signature: piece.time_signature,
      }
    })
    .filter((row): row is ActivePracticeTuneOption => row !== null)
    .sort((a, b) => a.title.localeCompare(b.title))

  const foci = ((focusRows ?? []) as PracticeFocusRow[]).map(mapPracticeFocus)

  return {
    user,
    foci,
    activeFoci: foci.filter((focus) => focus.status === "active"),
    pausedFoci: foci.filter((focus) => focus.status === "paused"),
    completedFoci: foci.filter((focus) => focus.status === "completed"),
    archivedFoci: foci.filter((focus) => focus.status === "archived"),
    activePracticeTunes,
  }
}