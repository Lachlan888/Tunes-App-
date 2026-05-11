import { redirect } from "next/navigation"
import { requireUserContext } from "@/lib/auth/session"
import { addDaysToDateOnly, getToday } from "@/lib/review"
import type {
  Piece,
  PracticeDay,
  PracticeDiaryDayData,
  PracticeDiaryEvent,
  PracticeEvent,
  PracticeOutcome,
} from "@/lib/types"

export type PracticeNoteCategory = {
  id: number
  user_id: string
  name: string
  prompt: string | null
  applies_to_tune_notes: boolean
  applies_to_daily_reflection: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export type PracticeNote = {
  id: number
  user_id: string
  practice_day_id: number
  practice_event_id: number | null
  piece_id: number | null
  review_event_id: number | null
  category_id: number | null
  body: string
  created_at: string
  updated_at: string | null
  category: PracticeNoteCategory | null
}

export type PracticeDiaryEventWithNotes = PracticeDiaryEvent & {
  notes: PracticeNote[]
}

export type PracticeDiaryDayDataWithNotes = PracticeDiaryDayData & {
  categories: PracticeNoteCategory[]
  events: PracticeDiaryEventWithNotes[]
  unlinkedNotes: PracticeNote[]
}

type PracticeEventRow = PracticeEvent & {
  pieces: Piece | Piece[] | null
  review_events:
    | {
        id: number
        outcome: string
        resulting_stage: number | null
      }
    | {
        id: number
        outcome: string
        resulting_stage: number | null
      }[]
    | null
}

type PracticeNoteRow = Omit<PracticeNote, "category"> & {
  practice_note_categories: PracticeNoteCategory | PracticeNoteCategory[] | null
}

function isValidDateOnly(value: string | undefined): value is string {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalisePracticeOutcome(value: string | null): PracticeOutcome | null {
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

function mapPracticeNote(row: PracticeNoteRow): PracticeNote {
  return {
    id: row.id,
    user_id: row.user_id,
    practice_day_id: row.practice_day_id,
    practice_event_id: row.practice_event_id,
    piece_id: row.piece_id,
    review_event_id: row.review_event_id,
    category_id: row.category_id,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: getSingleJoinedRow(row.practice_note_categories),
  }
}

async function loadPracticeNoteCategoriesForUser(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
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

export async function loadPracticePromptOptions() {
  const { supabase, user } = await requireUserContext()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("practice_diary_enabled")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  const practiceDiaryEnabled = Boolean(profile?.practice_diary_enabled)

  return {
    practiceDiaryEnabled,
    categories: practiceDiaryEnabled
      ? await loadPracticeNoteCategoriesForUser(supabase, user.id)
      : [],
  }
}

export async function loadPracticeDiaryDayData(
  requestedDate?: string
): Promise<PracticeDiaryDayDataWithNotes> {
  const { supabase, user } = await requireUserContext()

  const today = getToday()
  const selectedDate = isValidDateOnly(requestedDate) ? requestedDate : today

  const { data: practiceDay, error: practiceDayError } = await supabase
    .from("practice_days")
    .select("id, user_id, practice_date, daily_reflection, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("practice_date", selectedDate)
    .maybeSingle()

  if (practiceDayError) {
    throw new Error(practiceDayError.message)
  }

  const selectedPracticeDay = (practiceDay ?? null) as PracticeDay | null
  const practiceDayId = selectedPracticeDay?.id ?? null

  const categories = await loadPracticeNoteCategoriesForUser(supabase, user.id)

  const { data: events, error: eventsError } = practiceDayId
    ? await supabase
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
              reference_url
            ),
            review_events (
              id,
              outcome,
              resulting_stage
            )
          `
        )
        .eq("user_id", user.id)
        .eq("practice_day_id", practiceDayId)
        .order("created_at", { ascending: true })
    : { data: [], error: null }

  if (eventsError) {
    throw new Error(eventsError.message)
  }

  const { data: notes, error: notesError } = practiceDayId
    ? await supabase
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
        .eq("user_id", user.id)
        .eq("practice_day_id", practiceDayId)
        .order("created_at", { ascending: true })
    : { data: [], error: null }

  if (notesError) {
    throw new Error(notesError.message)
  }

  const typedNotes = ((notes ?? []) as PracticeNoteRow[]).map(mapPracticeNote)
  const eventNotesByEventId = new Map<number, PracticeNote[]>()

  for (const note of typedNotes) {
    if (!note.practice_event_id) continue

    const existing = eventNotesByEventId.get(note.practice_event_id) ?? []
    existing.push(note)
    eventNotesByEventId.set(note.practice_event_id, existing)
  }

  const mappedEvents = ((events ?? []) as PracticeEventRow[]).map((event) => {
    const mappedEvent = mapPracticeEvent(event)

    return {
      ...mappedEvent,
      notes: eventNotesByEventId.get(mappedEvent.id) ?? [],
    }
  })

  const unlinkedNotes = typedNotes.filter((note) => !note.practice_event_id)

  return {
    userId: user.id,
    selectedDate,
    previousDate: addDaysToDateOnly(selectedDate, -1),
    nextDate: addDaysToDateOnly(selectedDate, 1),
    today,
    practiceDay: selectedPracticeDay,
    events: mappedEvents,
    categories,
    unlinkedNotes,
  }
}

export async function requirePracticeDiaryEnabled() {
  const { supabase, user } = await requireUserContext()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("practice_diary_enabled")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile?.practice_diary_enabled) {
    redirect("/dashboard")
  }

  return {
    supabase,
    user,
  }
}