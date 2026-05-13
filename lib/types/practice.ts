import type { Piece } from "./pieces"

export type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

export type UserKnownPiece = {
  id: number
  piece_id: number
}

export type UserDailyStreak = {
  id: number
  user_id: string
  local_date: string
  revision_done: boolean
  practice_done: boolean
  due_count: number
  created_at?: string
  updated_at?: string
}

export type StreakSummary = {
  current_revision_streak: number
  longest_revision_streak: number
  current_practice_streak: number
  longest_practice_streak: number
  last_reconciled_date: string | null
}

export type UserStreakStats = StreakSummary & {
  user_id: string
  updated_at?: string
}

export type UserPieceWithPiece = {
  id: number
  piece_id: number
  stage: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

export type UserKnownPieceWithPiece = {
  id: number
  piece_id: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

export type MyTuneRow = {
  piece_id: number
  title: string
  inPractice: boolean
  known: boolean
}

export type PracticeOutcome = "rough" | "shaky" | "solid"

export type PracticeEventType =
  | "formal_review"
  | "free_practice"
  | "tune_target_work"
  | "setlist_prep"
  | "gig_prep"
  | "daily_reflection"
  | "focus_note"

export type PracticeEventSourceType =
  | "manual"
  | "review"
  | "tune_target"
  | "focus"
  | "setlist"
  | "setlist_item"

export type PracticeDay = {
  id: number
  user_id: string
  practice_date: string
  daily_reflection: string | null
  created_at: string
  updated_at: string | null
}

export type PracticeEvent = {
  id: number
  user_id: string
  practice_day_id: number
  piece_id: number | null
  review_event_id: number | null
  event_type: PracticeEventType
  source_type: PracticeEventSourceType | null
  source_id: number | null
  counted_as_review: boolean
  practice_outcome: PracticeOutcome | null
  created_at: string
}

export type PracticeDiaryEvent = PracticeEvent & {
  piece: Piece | null
  review_event: {
    id: number
    outcome: "solid" | "shaky" | "failed" | string
    resulting_stage: number | null
    created_at: string | null
  } | null
}

export type PracticeDiaryDayData = {
  userId: string
  selectedDate: string
  previousDate: string
  nextDate: string
  today: string
  practiceDay: PracticeDay | null
  events: PracticeDiaryEvent[]
}

export type BacklogTier = "due_now" | "overdue" | "overdue_longest"

export type BacklogGroupSummary = {
  tier: BacklogTier
  label: string
  count: number
}