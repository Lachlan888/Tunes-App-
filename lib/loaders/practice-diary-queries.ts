import { normaliseStoredDate } from "@/lib/review"
import type {
  DueTuneRow,
  PracticeDayRow,
  PracticeDueTune,
  PracticeDiaryEventWithNotes,
  PracticeEventRow,
  PracticeFocusForDiaryNote,
  PracticeNote,
  PracticeNoteCategory,
  PracticeNoteRow,
  PracticeOutcomeValue,
  SupabaseServerClient,
} from "@/lib/loaders/practice-diary-types"
import type { PracticeDiaryEvent } from "@/lib/types"

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalisePracticeOutcome(value: string | null): PracticeOutcomeValue {
  if (value === "rough" || value === "shaky" || value === "solid") {
    return value
  }

  return null
}

function mapPracticeEvent(row: PracticeEventRow): PracticeDiaryEvent {
  const reviewEvent = getSingleJoinedRow(row.review_events)

  return {
    id: row.id,
    user_id: row.user_id,
    practice_day_id: row.practice_day_id,
    piece_id: row.piece_id,
    review_event_id: row.review_event_id,
    event_type: row.event_type,
    source_type: row.source_type,
    source_id: row.source_id,
    counted_as_review: row.counted_as_review,
    practice_outcome: normalisePracticeOutcome(row.practice_outcome),
    created_at: row.created_at,
    piece: getSingleJoinedRow(row.pieces),
    review_event: reviewEvent
      ? {
          id: reviewEvent.id,
          outcome: reviewEvent.outcome,
          resulting_stage: reviewEvent.resulting_stage,
          created_at: null,
        }
      : null,
  }
}

function mapPracticeNote({
  row,
  focusById,
}: {
  row: PracticeNoteRow
  focusById: Map<number, PracticeFocusForDiaryNote>
}): PracticeNote {
  return {
    id: row.id,
    user_id: row.user_id,
    practice_day_id: row.practice_day_id,
    practice_event_id: row.practice_event_id,
    piece_id: row.piece_id,
    review_event_id: row.review_event_id,
    category_id: row.category_id,
    focus_id: row.focus_id,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: getSingleJoinedRow(row.practice_note_categories),
    focus: row.focus_id ? focusById.get(row.focus_id) ?? null : null,
  }
}

function mapDueTune(row: DueTuneRow): PracticeDueTune | null {
  const dueDate = normaliseStoredDate(row.next_review_due)

  if (!dueDate) {
    return null
  }

  return {
    userPieceId: row.id,
    pieceId: row.piece_id,
    dueDate,
    stage: row.stage,
    piece: getSingleJoinedRow(row.pieces),
  }
}

export function attachNotesToEvents({
  events,
  notes,
}: {
  events: PracticeDiaryEvent[]
  notes: PracticeNote[]
}): PracticeDiaryEventWithNotes[] {
  const eventNotesByEventId = new Map<number, PracticeNote[]>()

  for (const note of notes) {
    if (!note.practice_event_id) continue

    const existing = eventNotesByEventId.get(note.practice_event_id) ?? []
    existing.push(note)
    eventNotesByEventId.set(note.practice_event_id, existing)
  }

  return events.map((event) => ({
    ...event,
    notes: eventNotesByEventId.get(event.id) ?? [],
  }))
}

export async function loadPracticeNoteCategoriesForUser({
  supabase,
  userId,
}: {
  supabase: SupabaseServerClient
  userId: string
}): Promise<PracticeNoteCategory[]> {
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

export async function loadPracticeDaysForRange({
  userId,
  startDate,
  endDate,
  supabase,
}: {
  userId: string
  startDate: string
  endDate: string
  supabase: SupabaseServerClient
}): Promise<PracticeDayRow[]> {
  const { data, error } = await supabase
    .from("practice_days")
    .select("id, user_id, practice_date, daily_reflection, created_at, updated_at")
    .eq("user_id", userId)
    .gte("practice_date", startDate)
    .lte("practice_date", endDate)
    .order("practice_date", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PracticeDayRow[]
}

export async function loadPracticeDayForDate({
  userId,
  selectedDate,
  supabase,
}: {
  userId: string
  selectedDate: string
  supabase: SupabaseServerClient
}): Promise<PracticeDayRow | null> {
  const { data, error } = await supabase
    .from("practice_days")
    .select("id, user_id, practice_date, daily_reflection, created_at, updated_at")
    .eq("user_id", userId)
    .eq("practice_date", selectedDate)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? null) as PracticeDayRow | null
}

export async function loadPracticeEventsForDayIds({
  userId,
  practiceDayIds,
  supabase,
}: {
  userId: string
  practiceDayIds: number[]
  supabase: SupabaseServerClient
}): Promise<PracticeDiaryEvent[]> {
  if (practiceDayIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from("practice_events")
    .select(
      `
        id,
        user_id,
        practice_day_id,
        piece_id,
        review_event_id,
        event_type,
        source_type,
        source_id,
        counted_as_review,
        practice_outcome,
        created_at,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
          reference_url
        ),
        review_events (
          id,
          outcome,
          resulting_stage
        )
      `
    )
    .eq("user_id", userId)
    .in("practice_day_id", practiceDayIds)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as PracticeEventRow[]).map(mapPracticeEvent)
}

async function loadPracticeFociById({
  userId,
  focusIds,
  supabase,
}: {
  userId: string
  focusIds: number[]
  supabase: SupabaseServerClient
}) {
  if (focusIds.length === 0) {
    return new Map<number, PracticeFocusForDiaryNote>()
  }

  const { data, error } = await supabase
    .from("practice_foci")
    .select("id, title, description, status")
    .eq("user_id", userId)
    .in("id", focusIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(
    ((data ?? []) as PracticeFocusForDiaryNote[]).map(
      (focus) => [focus.id, focus] as const
    )
  )
}

export async function loadPracticeNotesForDayIds({
  userId,
  practiceDayIds,
  supabase,
}: {
  userId: string
  practiceDayIds: number[]
  supabase: SupabaseServerClient
}): Promise<PracticeNote[]> {
  if (practiceDayIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from("practice_notes")
    .select(
      `
        id,
        user_id,
        practice_day_id,
        practice_event_id,
        piece_id,
        review_event_id,
        category_id,
        focus_id,
        body,
        created_at,
        updated_at,
        practice_note_categories (
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
        )
      `
    )
    .eq("user_id", userId)
    .in("practice_day_id", practiceDayIds)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const noteRows = (data ?? []) as unknown as PracticeNoteRow[]

  const focusIds = Array.from(
    new Set(
      noteRows
        .map((note) => note.focus_id)
        .filter((focusId): focusId is number => typeof focusId === "number")
    )
  )

  const focusById = await loadPracticeFociById({
    userId,
    focusIds,
    supabase,
  })

  return noteRows.map((row) => mapPracticeNote({ row, focusById }))
}

export async function loadDueTunesForRange({
  userId,
  startDate,
  endDate,
  supabase,
}: {
  userId: string
  startDate: string
  endDate: string
  supabase: SupabaseServerClient
}): Promise<PracticeDueTune[]> {
  const { data, error } = await supabase
    .from("user_pieces")
    .select(
      `
        id,
        piece_id,
        next_review_due,
        stage,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
          reference_url
        )
      `
    )
    .eq("user_id", userId)
    .eq("status", "learning")
    .not("next_review_due", "is", null)
    .gte("next_review_due", startDate)
    .lte("next_review_due", endDate)
    .order("next_review_due", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as DueTuneRow[])
    .map(mapDueTune)
    .filter((dueTune): dueTune is PracticeDueTune => dueTune !== null)
}
