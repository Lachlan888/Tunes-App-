import { redirect } from "next/navigation"
import { requireUserContext } from "@/lib/auth/session"
import {
  addDaysToDateOnly,
  getToday,
  normaliseStoredDate,
} from "@/lib/review"
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

export type PracticeDueTune = {
  userPieceId: number
  pieceId: number
  dueDate: string
  stage: number
  piece: Piece | null
}

export type PracticeCategoryNoteSummary = {
  noteId: number
  body: string
  tuneTitle: string | null
  pieceId: number | null
}

export type PracticeDiaryEventWithNotes = PracticeDiaryEvent & {
  notes: PracticeNote[]
}

export type PracticeDiaryDayDataWithNotes = PracticeDiaryDayData & {
  categories: PracticeNoteCategory[]
  events: PracticeDiaryEventWithNotes[]
  dueTunes: PracticeDueTune[]
  unlinkedNotes: PracticeNote[]
}

export type PracticeDiaryWeekDaySummary = {
  date: string
  isToday: boolean
  formalReviewCount: number
  practiceCheckCount: number
  noteCount: number
  dueCount: number
  uniqueTuneCount: number
  hasPractice: boolean
}

export type PracticeDiaryWeekTuneSummary = {
  piece: Piece
  eventCount: number
  noteCount: number
  latestEventAt: string
  latestOutcome: string | null
  latestStage: number | null
  latestNoteSnippet: string | null
}

export type PracticeDiaryWeekCategorySummary = {
  categoryId: number
  categoryName: string
  noteCount: number
  notes: PracticeCategoryNoteSummary[]
}

export type PracticeDiaryWeekData = {
  userId: string
  selectedDate: string
  today: string
  weekStartDate: string
  weekEndDate: string
  previousWeekDate: string
  nextWeekDate: string
  currentWeekDate: string
  daySummaries: PracticeDiaryWeekDaySummary[]
  dueTunes: PracticeDueTune[]
  tuneSummaries: PracticeDiaryWeekTuneSummary[]
  categorySummaries: PracticeDiaryWeekCategorySummary[]
  summary: {
    activeDays: number
    formalReviews: number
    practiceChecks: number
    tuneNotes: number
    dueTunes: number
    uniqueTunesTouched: number
    categoriesUsed: number
  }
}

export type PracticeDiaryMonthDaySummary = {
  date: string
  isInSelectedMonth: boolean
  isToday: boolean
  formalReviewCount: number
  practiceCheckCount: number
  noteCount: number
  dueCount: number
  uniqueTuneCount: number
  hasPractice: boolean
  activityLevel: "none" | "light" | "medium" | "heavy"
}

export type PracticeDiaryMonthTuneSummary = {
  piece: Piece
  eventCount: number
  noteCount: number
  latestEventAt: string
  latestOutcome: string | null
  latestStage: number | null
  latestNoteSnippet: string | null
}

export type PracticeDiaryMonthCategorySummary = {
  categoryId: number
  categoryName: string
  noteCount: number
  notes: PracticeCategoryNoteSummary[]
}

export type PracticeDiaryMonthData = {
  userId: string
  selectedDate: string
  today: string
  monthStartDate: string
  monthEndDate: string
  calendarStartDate: string
  calendarEndDate: string
  previousMonthDate: string
  nextMonthDate: string
  currentMonthDate: string
  daySummaries: PracticeDiaryMonthDaySummary[]
  dueTunes: PracticeDueTune[]
  tuneSummaries: PracticeDiaryMonthTuneSummary[]
  categorySummaries: PracticeDiaryMonthCategorySummary[]
  summary: {
    activeDays: number
    formalReviews: number
    practiceChecks: number
    tuneNotes: number
    dueTunes: number
    uniqueTunesTouched: number
    categoriesUsed: number
  }
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

type PracticeDayRow = PracticeDay

type DueTuneRow = {
  id: number
  piece_id: number
  next_review_due: string | null
  stage: number
  pieces: Piece | Piece[] | null
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

function parseDateOnlyAsUtcDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function getMondayWeekStart(dateOnly: string) {
  const date = parseDateOnlyAsUtcDate(dateOnly)
  const day = date.getUTCDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1

  return addDaysToDateOnly(dateOnly, -daysSinceMonday)
}

function getSundayWeekEnd(dateOnly: string) {
  const date = parseDateOnlyAsUtcDate(dateOnly)
  const day = date.getUTCDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day

  return addDaysToDateOnly(dateOnly, daysUntilSunday)
}

function getMonthStartDate(dateOnly: string) {
  const [year, month] = dateOnly.split("-")
  return `${year}-${month}-01`
}

function getMonthEndDate(dateOnly: string) {
  const monthStartDate = getMonthStartDate(dateOnly)
  const [year, month] = monthStartDate.split("-").map(Number)
  const nextMonthStart = new Date(Date.UTC(year, month, 1))

  return addDaysToDateOnly(nextMonthStart.toISOString().slice(0, 10), -1)
}

function getActivityLevel({
  formalReviewCount,
  practiceCheckCount,
  noteCount,
}: {
  formalReviewCount: number
  practiceCheckCount: number
  noteCount: number
}) {
  const activityScore = formalReviewCount + practiceCheckCount + noteCount

  if (activityScore >= 6) return "heavy"
  if (activityScore >= 3) return "medium"
  if (activityScore >= 1) return "light"

  return "none"
}

function formatOutcomeForSummary(
  event: PracticeDiaryEventWithNotes | PracticeDiaryEvent
) {
  const outcome = event.review_event?.outcome ?? event.practice_outcome

  if (outcome === "solid") return "Solid"
  if (outcome === "shaky") return "Shaky"
  if (outcome === "failed") return "Rough"
  if (outcome === "rough") return "Rough"

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

function attachNotesToEvents({
  events,
  notes,
}: {
  events: PracticeDiaryEvent[]
  notes: PracticeNote[]
}) {
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

function buildTuneSummaries(eventsWithNotes: PracticeDiaryEventWithNotes[]) {
  const tuneSummariesByPieceId = new Map<number, PracticeDiaryWeekTuneSummary>()

  for (const event of eventsWithNotes) {
    if (!event.piece || !event.piece_id) continue

    const existing = tuneSummariesByPieceId.get(event.piece_id)
    const latestNote =
      event.notes.length > 0
        ? event.notes[event.notes.length - 1]?.body ?? null
        : null

    if (!existing) {
      tuneSummariesByPieceId.set(event.piece_id, {
        piece: event.piece,
        eventCount: 1,
        noteCount: event.notes.length,
        latestEventAt: event.created_at,
        latestOutcome: formatOutcomeForSummary(event),
        latestStage: event.review_event?.resulting_stage ?? null,
        latestNoteSnippet: latestNote,
      })
      continue
    }

    existing.eventCount += 1
    existing.noteCount += event.notes.length

    if (event.created_at >= existing.latestEventAt) {
      existing.latestEventAt = event.created_at
      existing.latestOutcome = formatOutcomeForSummary(event)
      existing.latestStage = event.review_event?.resulting_stage ?? null

      if (latestNote) {
        existing.latestNoteSnippet = latestNote
      }
    }
  }

  return Array.from(tuneSummariesByPieceId.values()).sort((a, b) =>
    b.latestEventAt.localeCompare(a.latestEventAt)
  )
}

function buildCategorySummaries({
  notes,
  eventsWithNotes,
}: {
  notes: PracticeNote[]
  eventsWithNotes: PracticeDiaryEventWithNotes[]
}) {
  const categorySummariesById = new Map<
    number,
    PracticeDiaryWeekCategorySummary
  >()

  for (const note of notes) {
    if (!note.category) continue

    const relatedEvent = note.practice_event_id
      ? eventsWithNotes.find((event) => event.id === note.practice_event_id)
      : null
    const tuneTitle = relatedEvent?.piece?.title ?? null
    const pieceId = relatedEvent?.piece_id ?? note.piece_id
    const noteSummary: PracticeCategoryNoteSummary = {
      noteId: note.id,
      body: note.body,
      tuneTitle,
      pieceId,
    }

    const existing = categorySummariesById.get(note.category.id)

    if (!existing) {
      categorySummariesById.set(note.category.id, {
        categoryId: note.category.id,
        categoryName: note.category.name,
        noteCount: 1,
        notes: [noteSummary],
      })
      continue
    }

    existing.noteCount += 1
    existing.notes.push(noteSummary)
  }

  return Array.from(categorySummariesById.values())
    .map((summary) => ({
      ...summary,
      notes: summary.notes.slice(-5).reverse(),
    }))
    .sort(
      (a, b) =>
        b.noteCount - a.noteCount || a.categoryName.localeCompare(b.categoryName)
    )
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

async function loadPracticeDaysForRange({
  userId,
  startDate,
  endDate,
  supabase,
}: {
  userId: string
  startDate: string
  endDate: string
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
}) {
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

async function loadPracticeEventsForDayIds({
  userId,
  practiceDayIds,
  supabase,
}: {
  userId: string
  practiceDayIds: number[]
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
}) {
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

async function loadPracticeNotesForDayIds({
  userId,
  practiceDayIds,
  supabase,
}: {
  userId: string
  practiceDayIds: number[]
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
}) {
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

  return ((data ?? []) as PracticeNoteRow[]).map(mapPracticeNote)
}

async function loadDueTunesForRange({
  userId,
  startDate,
  endDate,
  supabase,
}: {
  userId: string
  startDate: string
  endDate: string
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
}) {
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

  const dueTunes = await loadDueTunesForRange({
    supabase,
    userId: user.id,
    startDate: selectedDate,
    endDate: selectedDate,
  })

  const events = practiceDayId
    ? await loadPracticeEventsForDayIds({
        supabase,
        userId: user.id,
        practiceDayIds: [practiceDayId],
      })
    : []

  const typedNotes = practiceDayId
    ? await loadPracticeNotesForDayIds({
        supabase,
        userId: user.id,
        practiceDayIds: [practiceDayId],
      })
    : []

  const mappedEvents = attachNotesToEvents({
    events,
    notes: typedNotes,
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
    dueTunes,
    categories,
    unlinkedNotes,
  }
}

export async function loadPracticeDiaryWeekData(
  requestedDate?: string
): Promise<PracticeDiaryWeekData> {
  const { supabase, user } = await requireUserContext()

  const today = getToday()
  const selectedDate = isValidDateOnly(requestedDate) ? requestedDate : today
  const weekStartDate = getMondayWeekStart(selectedDate)
  const weekEndDate = addDaysToDateOnly(weekStartDate, 6)

  const typedPracticeDays = await loadPracticeDaysForRange({
    supabase,
    userId: user.id,
    startDate: weekStartDate,
    endDate: weekEndDate,
  })

  const dueTunes = await loadDueTunesForRange({
    supabase,
    userId: user.id,
    startDate: weekStartDate,
    endDate: weekEndDate,
  })

  const practiceDayIds = typedPracticeDays.map((day) => day.id)
  const typedEvents = await loadPracticeEventsForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })
  const typedNotes = await loadPracticeNotesForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const eventsWithNotes = attachNotesToEvents({
    events: typedEvents,
    notes: typedNotes,
  })

  const daySummaries: PracticeDiaryWeekDaySummary[] = Array.from(
    { length: 7 },
    (_, index) => {
      const date = addDaysToDateOnly(weekStartDate, index)
      const day = typedPracticeDays.find(
        (practiceDay) => practiceDay.practice_date === date
      )
      const dayEvents = day
        ? eventsWithNotes.filter((event) => event.practice_day_id === day.id)
        : []
      const dayNotes = day
        ? typedNotes.filter((note) => note.practice_day_id === day.id)
        : []
      const dayDueTunes = dueTunes.filter((dueTune) => dueTune.dueDate === date)
      const formalReviewCount = dayEvents.filter(
        (event) => event.event_type === "formal_review"
      ).length
      const practiceCheckCount = dayEvents.filter(
        (event) => event.event_type === "free_practice"
      ).length

      return {
        date,
        isToday: date === today,
        formalReviewCount,
        practiceCheckCount,
        noteCount: dayNotes.length,
        dueCount: dayDueTunes.length,
        uniqueTuneCount: new Set(
          dayEvents
            .map((event) => event.piece_id)
            .filter((pieceId): pieceId is number => pieceId !== null)
        ).size,
        hasPractice:
          formalReviewCount > 0 ||
          practiceCheckCount > 0 ||
          dayNotes.length > 0,
      }
    }
  )

  const tuneSummaries = buildTuneSummaries(eventsWithNotes)
  const categorySummaries = buildCategorySummaries({
    notes: typedNotes,
    eventsWithNotes,
  })

  const formalReviews = eventsWithNotes.filter(
    (event) => event.event_type === "formal_review"
  ).length

  const practiceChecks = eventsWithNotes.filter(
    (event) => event.event_type === "free_practice"
  ).length

  return {
    userId: user.id,
    selectedDate,
    today,
    weekStartDate,
    weekEndDate,
    previousWeekDate: addDaysToDateOnly(weekStartDate, -7),
    nextWeekDate: addDaysToDateOnly(weekStartDate, 7),
    currentWeekDate: today,
    daySummaries,
    dueTunes,
    tuneSummaries,
    categorySummaries,
    summary: {
      activeDays: daySummaries.filter((day) => day.hasPractice).length,
      formalReviews,
      practiceChecks,
      tuneNotes: typedNotes.filter((note) => note.piece_id !== null).length,
      dueTunes: dueTunes.length,
      uniqueTunesTouched: tuneSummaries.length,
      categoriesUsed: categorySummaries.length,
    },
  }
}

export async function loadPracticeDiaryMonthData(
  requestedDate?: string
): Promise<PracticeDiaryMonthData> {
  const { supabase, user } = await requireUserContext()

  const today = getToday()
  const selectedDate = isValidDateOnly(requestedDate) ? requestedDate : today
  const monthStartDate = getMonthStartDate(selectedDate)
  const monthEndDate = getMonthEndDate(selectedDate)
  const calendarStartDate = getMondayWeekStart(monthStartDate)
  const calendarEndDate = getSundayWeekEnd(monthEndDate)

  const typedPracticeDays = await loadPracticeDaysForRange({
    supabase,
    userId: user.id,
    startDate: monthStartDate,
    endDate: monthEndDate,
  })

  const dueTunes = await loadDueTunesForRange({
    supabase,
    userId: user.id,
    startDate: monthStartDate,
    endDate: monthEndDate,
  })

  const practiceDayIds = typedPracticeDays.map((day) => day.id)
  const typedEvents = await loadPracticeEventsForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })
  const typedNotes = await loadPracticeNotesForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const eventsWithNotes = attachNotesToEvents({
    events: typedEvents,
    notes: typedNotes,
  })

  const calendarDayCount =
    Math.round(
      (parseDateOnlyAsUtcDate(calendarEndDate).getTime() -
        parseDateOnlyAsUtcDate(calendarStartDate).getTime()) /
        (24 * 60 * 60 * 1000)
    ) + 1

  const daySummaries: PracticeDiaryMonthDaySummary[] = Array.from(
    { length: calendarDayCount },
    (_, index) => {
      const date = addDaysToDateOnly(calendarStartDate, index)
      const isInSelectedMonth =
        date >= monthStartDate && date <= monthEndDate
      const day = typedPracticeDays.find(
        (practiceDay) => practiceDay.practice_date === date
      )
      const dayEvents = day
        ? eventsWithNotes.filter((event) => event.practice_day_id === day.id)
        : []
      const dayNotes = day
        ? typedNotes.filter((note) => note.practice_day_id === day.id)
        : []
      const dayDueTunes = dueTunes.filter((dueTune) => dueTune.dueDate === date)
      const formalReviewCount = dayEvents.filter(
        (event) => event.event_type === "formal_review"
      ).length
      const practiceCheckCount = dayEvents.filter(
        (event) => event.event_type === "free_practice"
      ).length

      return {
        date,
        isInSelectedMonth,
        isToday: date === today,
        formalReviewCount,
        practiceCheckCount,
        noteCount: dayNotes.length,
        dueCount: dayDueTunes.length,
        uniqueTuneCount: new Set(
          dayEvents
            .map((event) => event.piece_id)
            .filter((pieceId): pieceId is number => pieceId !== null)
        ).size,
        hasPractice:
          formalReviewCount > 0 ||
          practiceCheckCount > 0 ||
          dayNotes.length > 0,
        activityLevel: getActivityLevel({
          formalReviewCount,
          practiceCheckCount,
          noteCount: dayNotes.length,
        }),
      }
    }
  )

  const tuneSummaries = buildTuneSummaries(eventsWithNotes)
  const categorySummaries = buildCategorySummaries({
    notes: typedNotes,
    eventsWithNotes,
  })

  const formalReviews = eventsWithNotes.filter(
    (event) => event.event_type === "formal_review"
  ).length

  const practiceChecks = eventsWithNotes.filter(
    (event) => event.event_type === "free_practice"
  ).length

  return {
    userId: user.id,
    selectedDate,
    today,
    monthStartDate,
    monthEndDate,
    calendarStartDate,
    calendarEndDate,
    previousMonthDate: addDaysToDateOnly(monthStartDate, -1),
    nextMonthDate: addDaysToDateOnly(monthEndDate, 1),
    currentMonthDate: today,
    daySummaries,
    dueTunes,
    tuneSummaries,
    categorySummaries,
    summary: {
      activeDays: daySummaries.filter(
        (day) => day.isInSelectedMonth && day.hasPractice
      ).length,
      formalReviews,
      practiceChecks,
      tuneNotes: typedNotes.filter((note) => note.piece_id !== null).length,
      dueTunes: dueTunes.length,
      uniqueTunesTouched: tuneSummaries.length,
      categoriesUsed: categorySummaries.length,
    },
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