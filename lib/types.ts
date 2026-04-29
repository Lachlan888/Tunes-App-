export type PieceStyleTag = {
  style_id: number
  styles:
    | {
        id: number
        slug: string
        label: string
      }
    | {
        id: number
        slug: string
        label: string
      }[]
    | null
}

export type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  reference_url?: string | null
  piece_styles?: PieceStyleTag[] | null
}

export type PieceFilterOption = {
  key: string | null
  style: string | null
  time_signature: string | null
  piece_styles?: PieceStyleTag[] | null
}

export type StyleOption = {
  id: number
  slug: string
  label: string
}

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

export type LearningListVisibility = "private" | "public"
export type LearningListSource = "mine" | "imported"

export type LearningList = {
  id: number
  name: string
  description: string | null
  visibility?: LearningListVisibility
  is_imported?: boolean
}

export type LearningListOwner = {
  id: number
  name: string
  user_id: string
}

export type LearningListItemMembership = {
  piece_id: number
  learning_list_id: number
  learning_lists: LearningListOwner
}

export type LearningListDetail = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: LearningListVisibility
  is_imported: boolean
}

export type LearningListItemWithPiece = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

export type LearningListItem = {
  id?: number
  piece_id?: number
  learning_list_id?: number
  position?: number | null
  pieces?: Piece | Piece[] | null
  learning_lists?: LearningListOwner
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

export type FilterableLearningList = {
  id: number
  name: string
  description: string | null
  visibility: LearningListVisibility
  is_imported: boolean
  tunes: Piece[]
  tuneCount: number
  stylesPresent: string[]
  source: LearningListSource
}

export type UserInstrument = {
  id: number
  instrument_name: string
  position: number | null
}

export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  show_identity: boolean
  show_instruments: boolean
  show_public_lists_on_profile: boolean
  show_repertoire_summary: boolean
  show_comment_activity: boolean
  show_compare_discoverability: boolean
  compare_requires_friend: boolean
}

export type PublicProfileList = {
  id: number
  name: string
  description: string | null
  visibility: LearningListVisibility | string
  tune_count: number
}

export type RepertoireSummary = {
  known_count: number
  practice_count: number
}

export type OwnProfileData = {
  user: {
    id: string
    email: string | null
  }
  profile: Profile | null
  instruments: UserInstrument[]
}

export type PublicProfileData = {
  viewerId: string | null
  isOwnProfile: boolean
  isAcceptedFriend: boolean
  hasPendingOutgoingRequest: boolean
  hasPendingIncomingRequest: boolean
  pendingIncomingConnectionId: number | null
  canCompare: boolean
  compareBlockedByFriendship: boolean
  profile: Profile | null
  instruments: UserInstrument[]
  publicLists: PublicProfileList[]
  repertoireSummary: RepertoireSummary | null
}

export type GettingStartedTaskId =
  | "complete_profile"
  | "add_tunes"
  | "mark_known"
  | "start_practice"
  | "create_list"
  | "complete_first_review"
  | "finish_today"

export type GettingStartedTaskGroup =
  | "Set up your account"
  | "Build repertoire state"
  | "Learn the practice loop"

export type GettingStartedTask = {
  id: GettingStartedTaskId
  group: GettingStartedTaskGroup
  label: string
  description: string
  href: string
  actionLabel: string
  pendingLabel: string
  isComplete: boolean
}

export type GettingStartedState = {
  shouldShow: boolean
  completedCount: number
  totalCount: number
  nextTask: GettingStartedTask | null
  tasks: GettingStartedTask[]
}

export type BacklogTier = "due_now" | "overdue" | "overdue_longest"

export type BacklogGroupSummary = {
  tier: BacklogTier
  label: string
  count: number
}