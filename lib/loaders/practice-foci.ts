import { notFound, redirect } from "next/navigation"
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

export type PracticeFocusRecentNote = {
  id: number
  body: string
  created_at: string
  practice_date: string | null
  piece_id: number | null
  piece: Piece | null
  category_name: string | null
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

type PracticeDayRelation =
  | {
      practice_date: string | null
    }
  | {
      practice_date: string | null
    }[]
  | null

type PracticeNoteCategoryRelation =
  | {
      name: string | null
    }
  | {
      name: string | null
    }[]
  | null

type PracticeFocusRecentNoteRow = {
  id: number
  body: string | null
  created_at: string
  piece_id: number | null
  practice_days: PracticeDayRelation
  pieces: Piece | Piece[] | null
  practice_note_categories: PracticeNoteCategoryRelation
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

function mapPracticeFocusRecentNote(
  row: PracticeFocusRecentNoteRow
): PracticeFocusRecentNote | null {
  const body = row.body?.trim()

  if (!body) {
    return null
  }

  return {
    id: row.id,
    body,
    created_at: row.created_at,
    practice_date: getSingleJoinedRow(row.practice_days)?.practice_date ?? null,
    piece_id: row.piece_id,
    piece: getSingleJoinedRow(row.pieces),
    category_name:
      getSingleJoinedRow(row.practice_note_categories)?.name ?? null,
  }
}

async function requireUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return {
    supabase,
    user,
  }
}

async function loadActivePracticeTunes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
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
    .eq("user_id", userId)
    .eq("status", "learning")
    .order("stage", { ascending: true })

  if (activeTuneError) {
    throw new Error(activeTuneError.message)
  }

  return ((activeTuneRows ?? []) as unknown as ActivePracticeTuneRow[])
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
}

async function loadRecentNotesForFocus({
  supabase,
  userId,
  focusId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  focusId: number
}) {
  const { data, error } = await supabase
    .from("practice_notes")
    .select(
      `
        id,
        body,
        created_at,
        piece_id,
        practice_days (
          practice_date
        ),
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          reference_url
        ),
        practice_note_categories (
          name
        )
      `
    )
    .eq("user_id", userId)
    .eq("focus_id", focusId)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as PracticeFocusRecentNoteRow[])
    .map(mapPracticeFocusRecentNote)
    .filter((note): note is PracticeFocusRecentNote => note !== null)
}

function focusSelectQuery() {
  return `
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
}

export async function loadPracticeFociPageData() {
  const { supabase, user } = await requireUser()

  const { data: focusRows, error: focusError } = await supabase
    .from("practice_foci")
    .select(focusSelectQuery())
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })

  if (focusError) {
    throw new Error(focusError.message)
  }

  const foci = ((focusRows ?? []) as unknown as PracticeFocusRow[]).map(
    mapPracticeFocus
  )

  return {
    user,
    foci,
    activeFoci: foci.filter((focus) => focus.status === "active"),
    pausedFoci: foci.filter((focus) => focus.status === "paused"),
    completedFoci: foci.filter((focus) => focus.status === "completed"),
    archivedFoci: foci.filter((focus) => focus.status === "archived"),
  }
}

export async function loadPracticeFocusDetailPageData(focusId: number) {
  const { supabase, user } = await requireUser()

  if (!Number.isInteger(focusId) || focusId <= 0) {
    notFound()
  }

  const { data: focusRow, error: focusError } = await supabase
    .from("practice_foci")
    .select(focusSelectQuery())
    .eq("id", focusId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (focusError) {
    throw new Error(focusError.message)
  }

  if (!focusRow) {
    notFound()
  }

  const activePracticeTunes = await loadActivePracticeTunes(supabase, user.id)
  const recentNotes = await loadRecentNotesForFocus({
    supabase,
    userId: user.id,
    focusId,
  })

  return {
    user,
    focus: mapPracticeFocus(focusRow as unknown as PracticeFocusRow),
    activePracticeTunes,
    recentNotes,
  }
}