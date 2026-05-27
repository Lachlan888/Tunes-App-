import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { UserPieceMediaLoop } from "@/lib/types"
import type {
  BacklogGroupSummary,
  BacklogTier,
  Piece,
  StreakSummary,
  UserPiece,
} from "@/lib/types"

export type ReviewPieceRow = UserPiece & {
  pieces: Piece[] | Piece | null
}

export type ReviewPreferredReferenceMetadata = {
  piece_id: number
  preferred_reference_url: string | null
  preferred_reference_label: string | null
}

export type PracticeNoteCategoryRelation =
  | {
      name: string | null
    }
  | {
      name: string | null
    }[]
  | null

export type PracticeDayRelation =
  | {
      practice_date: string | null
    }
  | {
      practice_date: string | null
    }[]
  | null

export type RecentPracticeNoteRow = {
  id: number
  piece_id: number | null
  body: string | null
  created_at: string
  practice_note_categories: PracticeNoteCategoryRelation
  practice_days: PracticeDayRelation
}

export type PracticeFocusRelation =
  | {
      id: number
      title: string
      description: string | null
      status: string
    }
  | {
      id: number
      title: string
      description: string | null
      status: string
    }[]
  | null

export type PracticeFocusTuneRow = {
  id: number
  piece_id: number
  practice_foci: PracticeFocusRelation
}

export type PracticeFocusRow = {
  id: number
  title: string
  description: string | null
  status: string
}

export type RecentPracticeNoteForReview = {
  id: number
  body: string
  created_at: string
  practice_date: string | null
  category_name: string | null
}

export type PracticeFocusForReview = {
  id: number
  title: string
  description: string | null
}

export type ReviewQueueItem = UserPiece & {
  piece: Piece | null
  due_date_only: string | null
  overdue_days: number
  backlog_tier: BacklogTier | null
  backlog_label: string | null
  recent_practice_notes: RecentPracticeNoteForReview[]
  active_practice_foci: PracticeFocusForReview[]
  practice_focus_options: PracticeFocusForReview[]
  saved_media_loops: UserPieceMediaLoop[]
  effective_reference_url: string | null
  effective_reference_label: string | null
  is_using_preferred_reference: boolean
}

export type ReviewPageData = {
  user: {
    id: string
    email?: string | null
  }
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  streakSummary: StreakSummary
  practiceItems: ReviewQueueItem[]
  dueTodayPieces: ReviewQueueItem[]
  catchUpQueue: ReviewQueueItem[]
  backlogSummary: BacklogGroupSummary[]
  needsAttentionCount: number
}
