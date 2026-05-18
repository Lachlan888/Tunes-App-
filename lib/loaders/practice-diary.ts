import { redirect } from "next/navigation"
import { requireUserContext } from "@/lib/auth/session"
import { addDaysToDateOnly, getToday } from "@/lib/review"
import {
  attachNotesToEvents,
  loadDueTunesForRange,
  loadPracticeDayForDate,
  loadPracticeDaysForRange,
  loadPracticeEventsForDayIds,
  loadPracticeNoteCategoriesForUser,
  loadPracticeNotesForDayIds,
} from "@/lib/loaders/practice-diary-queries"
import {
  buildCategorySummaries,
  buildFocusSummaries,
  buildMonthDaySummaries,
  buildTuneSummaries,
  buildWeekDaySummaries,
  getMondayWeekStart,
  getMonthEndDate,
  getMonthStartDate,
  getSundayWeekEnd,
  isValidDateOnly,
} from "@/lib/loaders/practice-diary-summaries"
import type {
  PracticeDiaryDayDataWithNotes,
  PracticeDiaryMonthData,
  PracticeDiaryWeekData,
} from "@/lib/loaders/practice-diary-types"

export type * from "@/lib/loaders/practice-diary-types"

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
      ? await loadPracticeNoteCategoriesForUser({
          supabase,
          userId: user.id,
        })
      : [],
  }
}

export async function loadPracticeDiaryDayData(
  requestedDate?: string
): Promise<PracticeDiaryDayDataWithNotes> {
  const { supabase, user } = await requireUserContext()

  const today = getToday()
  const selectedDate = isValidDateOnly(requestedDate) ? requestedDate : today

  const practiceDay = await loadPracticeDayForDate({
    supabase,
    userId: user.id,
    selectedDate,
  })

  const practiceDayId = practiceDay?.id ?? null

  const categories = await loadPracticeNoteCategoriesForUser({
    supabase,
    userId: user.id,
  })

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

  const notes = practiceDayId
    ? await loadPracticeNotesForDayIds({
        supabase,
        userId: user.id,
        practiceDayIds: [practiceDayId],
      })
    : []

  const eventsWithNotes = attachNotesToEvents({
    events,
    notes,
  })

  const unlinkedNotes = notes.filter((note) => !note.practice_event_id)

  return {
    userId: user.id,
    selectedDate,
    previousDate: addDaysToDateOnly(selectedDate, -1),
    nextDate: addDaysToDateOnly(selectedDate, 1),
    today,
    practiceDay,
    events: eventsWithNotes,
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

  const practiceDays = await loadPracticeDaysForRange({
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

  const practiceDayIds = practiceDays.map((day) => day.id)

  const events = await loadPracticeEventsForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const notes = await loadPracticeNotesForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const eventsWithNotes = attachNotesToEvents({
    events,
    notes,
  })

  const daySummaries = buildWeekDaySummaries({
    weekStartDate,
    today,
    practiceDays,
    eventsWithNotes,
    notes,
    dueTunes,
  })

  const tuneSummaries = buildTuneSummaries(eventsWithNotes)

  const categorySummaries = buildCategorySummaries({
    notes,
    eventsWithNotes,
  })

  const focusSummaries = buildFocusSummaries({
    notes,
    eventsWithNotes,
    practiceDays,
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
    focusSummaries,
    summary: {
      activeDays: daySummaries.filter((day) => day.hasPractice).length,
      formalReviews,
      practiceChecks,
      tuneNotes: notes.filter((note) => note.piece_id !== null).length,
      dueTunes: dueTunes.length,
      uniqueTunesTouched: tuneSummaries.length,
      categoriesUsed: categorySummaries.length,
      fociTouched: focusSummaries.length,
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

  const practiceDays = await loadPracticeDaysForRange({
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

  const practiceDayIds = practiceDays.map((day) => day.id)

  const events = await loadPracticeEventsForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const notes = await loadPracticeNotesForDayIds({
    supabase,
    userId: user.id,
    practiceDayIds,
  })

  const eventsWithNotes = attachNotesToEvents({
    events,
    notes,
  })

  const daySummaries = buildMonthDaySummaries({
    calendarStartDate,
    calendarEndDate,
    monthStartDate,
    monthEndDate,
    today,
    practiceDays,
    eventsWithNotes,
    notes,
    dueTunes,
  })

  const tuneSummaries = buildTuneSummaries(eventsWithNotes)

  const categorySummaries = buildCategorySummaries({
    notes,
    eventsWithNotes,
  })

  const focusSummaries = buildFocusSummaries({
    notes,
    eventsWithNotes,
    practiceDays,
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
    focusSummaries,
    summary: {
      activeDays: daySummaries.filter(
        (day) => day.isInSelectedMonth && day.hasPractice
      ).length,
      formalReviews,
      practiceChecks,
      tuneNotes: notes.filter((note) => note.piece_id !== null).length,
      dueTunes: dueTunes.length,
      uniqueTunesTouched: tuneSummaries.length,
      categoriesUsed: categorySummaries.length,
      fociTouched: focusSummaries.length,
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