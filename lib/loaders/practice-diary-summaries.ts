import { addDaysToDateOnly } from "@/lib/review"
import type {
  PracticeCategoryNoteSummary,
  PracticeDayRow,
  PracticeDiaryEventWithNotes,
  PracticeDiaryFocusSummary,
  PracticeDiaryMonthDaySummary,
  PracticeDiaryWeekCategorySummary,
  PracticeDiaryWeekDaySummary,
  PracticeDiaryWeekTuneSummary,
  PracticeFocusNoteSummary,
  PracticeNote,
} from "@/lib/loaders/practice-diary-types"
import type { PracticeDiaryEvent } from "@/lib/types"

export function isValidDateOnly(value: string | undefined): value is string {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function parseDateOnlyAsUtcDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function getMondayWeekStart(dateOnly: string) {
  const date = parseDateOnlyAsUtcDate(dateOnly)
  const day = date.getUTCDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1

  return addDaysToDateOnly(dateOnly, -daysSinceMonday)
}

export function getSundayWeekEnd(dateOnly: string) {
  const date = parseDateOnlyAsUtcDate(dateOnly)
  const day = date.getUTCDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day

  return addDaysToDateOnly(dateOnly, daysUntilSunday)
}

export function getMonthStartDate(dateOnly: string) {
  const [year, month] = dateOnly.split("-")
  return `${year}-${month}-01`
}

export function getMonthEndDate(dateOnly: string) {
  const monthStartDate = getMonthStartDate(dateOnly)
  const [year, month] = monthStartDate.split("-").map(Number)
  const nextMonthStart = new Date(Date.UTC(year, month, 1))

  return addDaysToDateOnly(nextMonthStart.toISOString().slice(0, 10), -1)
}

export function getActivityLevel({
  formalReviewCount,
  practiceCheckCount,
  noteCount,
}: {
  formalReviewCount: number
  practiceCheckCount: number
  noteCount: number
}): PracticeDiaryMonthDaySummary["activityLevel"] {
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

export function buildTuneSummaries(
  eventsWithNotes: PracticeDiaryEventWithNotes[]
): PracticeDiaryWeekTuneSummary[] {
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

export function buildCategorySummaries({
  notes,
  eventsWithNotes,
}: {
  notes: PracticeNote[]
  eventsWithNotes: PracticeDiaryEventWithNotes[]
}): PracticeDiaryWeekCategorySummary[] {
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

export function buildFocusSummaries({
  notes,
  eventsWithNotes,
  practiceDays,
}: {
  notes: PracticeNote[]
  eventsWithNotes: PracticeDiaryEventWithNotes[]
  practiceDays: PracticeDayRow[]
}): PracticeDiaryFocusSummary[] {
  const practiceDaysById = new Map(
    practiceDays.map((practiceDay) => [practiceDay.id, practiceDay] as const)
  )

  const focusSummariesById = new Map<
    number,
    PracticeDiaryFocusSummary & {
      tuneIds: Set<number>
    }
  >()

  for (const note of notes) {
    if (!note.focus) continue

    const practiceDay = practiceDaysById.get(note.practice_day_id)

    if (!practiceDay) continue

    const relatedEvent = note.practice_event_id
      ? eventsWithNotes.find((event) => event.id === note.practice_event_id)
      : null

    const pieceId = relatedEvent?.piece_id ?? note.piece_id
    const tuneTitle = relatedEvent?.piece?.title ?? null

    const noteSummary: PracticeFocusNoteSummary = {
      noteId: note.id,
      body: note.body,
      tuneTitle,
      pieceId,
      noteDate: practiceDay.practice_date,
    }

    const existing = focusSummariesById.get(note.focus.id)

    if (!existing) {
      focusSummariesById.set(note.focus.id, {
        focusId: note.focus.id,
        focusTitle: note.focus.title,
        focusStatus: note.focus.status,
        noteCount: 1,
        tuneCount: pieceId ? 1 : 0,
        latestDate: practiceDay.practice_date,
        notes: [noteSummary],
        tuneIds: pieceId ? new Set([pieceId]) : new Set(),
      })
      continue
    }

    existing.noteCount += 1
    existing.notes.push(noteSummary)

    if (pieceId) {
      existing.tuneIds.add(pieceId)
      existing.tuneCount = existing.tuneIds.size
    }

    if (practiceDay.practice_date > existing.latestDate) {
      existing.latestDate = practiceDay.practice_date
    }
  }

  return Array.from(focusSummariesById.values())
    .map(({ tuneIds, ...summary }) => ({
      ...summary,
      notes: [...summary.notes]
        .sort((a, b) => b.noteDate.localeCompare(a.noteDate))
        .slice(0, 5),
    }))
    .sort(
      (a, b) =>
        b.noteCount - a.noteCount ||
        b.latestDate.localeCompare(a.latestDate) ||
        a.focusTitle.localeCompare(b.focusTitle)
    )
}

export function buildWeekDaySummaries({
  weekStartDate,
  today,
  practiceDays,
  eventsWithNotes,
  notes,
  dueTunes,
}: {
  weekStartDate: string
  today: string
  practiceDays: PracticeDayRow[]
  eventsWithNotes: PracticeDiaryEventWithNotes[]
  notes: PracticeNote[]
  dueTunes: { dueDate: string }[]
}): PracticeDiaryWeekDaySummary[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateOnly(weekStartDate, index)
    const day = practiceDays.find(
      (practiceDay) => practiceDay.practice_date === date
    )
    const dayEvents = day
      ? eventsWithNotes.filter((event) => event.practice_day_id === day.id)
      : []
    const dayNotes = day
      ? notes.filter((note) => note.practice_day_id === day.id)
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
  })
}

export function buildMonthDaySummaries({
  calendarStartDate,
  calendarEndDate,
  monthStartDate,
  monthEndDate,
  today,
  practiceDays,
  eventsWithNotes,
  notes,
  dueTunes,
}: {
  calendarStartDate: string
  calendarEndDate: string
  monthStartDate: string
  monthEndDate: string
  today: string
  practiceDays: PracticeDayRow[]
  eventsWithNotes: PracticeDiaryEventWithNotes[]
  notes: PracticeNote[]
  dueTunes: { dueDate: string }[]
}): PracticeDiaryMonthDaySummary[] {
  const calendarDayCount =
    Math.round(
      (parseDateOnlyAsUtcDate(calendarEndDate).getTime() -
        parseDateOnlyAsUtcDate(calendarStartDate).getTime()) /
        (24 * 60 * 60 * 1000)
    ) + 1

  return Array.from({ length: calendarDayCount }, (_, index) => {
    const date = addDaysToDateOnly(calendarStartDate, index)
    const isInSelectedMonth = date >= monthStartDate && date <= monthEndDate
    const day = practiceDays.find(
      (practiceDay) => practiceDay.practice_date === date
    )
    const dayEvents = day
      ? eventsWithNotes.filter((event) => event.practice_day_id === day.id)
      : []
    const dayNotes = day
      ? notes.filter((note) => note.practice_day_id === day.id)
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
  })
}