import type {
  Piece,
  PracticeDay,
  PracticeDiaryDayData,
  PracticeDiaryEvent,
  PracticeEvent,
  PracticeOutcome,
} from "@/lib/types"

export type SupabaseServerClient = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>

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

export type PracticeFocusForDiaryNote = {
  id: number
  title: string
  description: string | null
  status: string
}

export type PracticeNote = {
  id: number
  user_id: string
  practice_day_id: number
  practice_event_id: number | null
  piece_id: number | null
  review_event_id: number | null
  category_id: number | null
  focus_id: number | null
  body: string
  created_at: string
  updated_at: string | null
  category: PracticeNoteCategory | null
  focus: PracticeFocusForDiaryNote | null
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

export type PracticeFocusNoteSummary = {
  noteId: number
  body: string
  tuneTitle: string | null
  pieceId: number | null
  noteDate: string
}

export type PracticeDiaryFocusSummary = {
  focusId: number
  focusTitle: string
  focusStatus: string
  noteCount: number
  tuneCount: number
  latestDate: string
  notes: PracticeFocusNoteSummary[]
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
  focusSummaries: PracticeDiaryFocusSummary[]
  summary: {
    activeDays: number
    formalReviews: number
    practiceChecks: number
    tuneNotes: number
    dueTunes: number
    uniqueTunesTouched: number
    categoriesUsed: number
    fociTouched: number
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
  focusSummaries: PracticeDiaryFocusSummary[]
  summary: {
    activeDays: number
    formalReviews: number
    practiceChecks: number
    tuneNotes: number
    dueTunes: number
    uniqueTunesTouched: number
    categoriesUsed: number
    fociTouched: number
  }
}

export type PracticeEventRow = PracticeEvent & {
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

export type PracticeNoteRow = Omit<PracticeNote, "category" | "focus"> & {
  practice_note_categories: PracticeNoteCategory | PracticeNoteCategory[] | null
}

export type PracticeDayRow = PracticeDay

export type DueTuneRow = {
  id: number
  piece_id: number
  next_review_due: string | null
  stage: number
  pieces: Piece | Piece[] | null
}

export type PracticeOutcomeValue = PracticeOutcome | null