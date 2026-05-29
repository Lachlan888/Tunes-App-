import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { PageOptionsPreferences } from "@/lib/page-options/types"
import type {
  LearningList,
  Piece,
  StyleOption,
  UserPieceMediaLoop,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"

export type UserPieceMetadata = {
  notes: string | null
  preferred_reference_url: string | null
  preferred_reference_label: string | null
}

export type PieceSheetMusicLink = {
  id: number
  url: string
  label: string | null
}

export type { UserPieceMediaLoop }

export type PieceCommentRow = {
  id: number
  body: string
  created_at: string
  user_id: string
  parent_comment_id: number | null
  moderation_status: "visible" | "hidden"
}

export type PieceLoreCategory =
  | "region"
  | "informant"
  | "collector"
  | "alternate_title"
  | "tune_family"
  | "story_folklore_note"

export type PieceLoreEntryRow = {
  id: number
  category: PieceLoreCategory
  entry_text: string
  created_at: string
  user_id: string
}

export type TunePracticeNote = {
  id: number
  body: string
  created_at: string
  practice_date: string
  category_name: string | null
  outcome: string | null
}

export type CommentAuthor = {
  displayName: string
  username: string | null
}

export type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

export type PublicTuneListSummary = {
  id: number
  name: string
  description: string | null
  user_id: string
  profiles:
    | {
        username: string | null
        display_name: string | null
      }
    | {
        username: string | null
        display_name: string | null
      }[]
    | null
}

export type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

export type PracticeProfileRow = {
  practice_diary_enabled: boolean | null
}

export type PracticeNoteRow = {
  id: number
  body: string
  created_at: string
  practice_days:
    | {
        practice_date: string
      }
    | {
        practice_date: string
      }[]
    | null
  practice_note_categories:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
  review_events:
    | {
        outcome: string
      }
    | {
        outcome: string
      }[]
    | null
  practice_events:
    | {
        practice_outcome: string | null
      }
    | {
        practice_outcome: string | null
      }[]
    | null
}

export type TuneDetailLoadedData = {
  user: {
    id: string
    email?: string | null
  }
  currentUserRole: UserRole
  pieceId: number
  redirectTo: string
  typedPiece: Piece
  typedUserPieceMetadata: UserPieceMetadata | null
  typedSheetMusicLinks: PieceSheetMusicLink[]
  typedMediaLoops: UserPieceMediaLoop[]
  typedPieceComments: PieceCommentRow[]
  typedPieceLoreEntries: PieceLoreEntryRow[]
  typedUserPiece: UserPiece | null
  typedUserKnownPiece: UserKnownPiece | null
  typedLearningLists: LearningList[]
  typedLearningListItems: LearningListItemRow[]
  typedPublicTuneLists: PublicTuneListSummary[]
  typedPracticeNotes: TunePracticeNote[]
  typedTunePagePreferences: PageOptionsPreferences
  practiceDiaryEnabled: boolean
  practiceNoteCategories: PracticeNoteCategory[]
  styleOptions: StyleOption[]
  composerProfile: ProfileRow | null
  composerProfileOptions: ProfileRow[]
  profileMap: Record<string, CommentAuthor>
}

export type TuneDetailLoadResult =
  | ({
      status: "loaded"
    } & TuneDetailLoadedData)
  | {
      status: "load_error"
      pieceId: number
    }
  | {
      status: "not_found"
      pieceId: number
    }