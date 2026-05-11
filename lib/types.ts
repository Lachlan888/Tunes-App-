export type UserRole = "user" | "moderator" | "admin"

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

export type PieceEditRequestStatus = "pending" | "approved" | "rejected"

export type PieceEditRequest = {
  id: number
  piece_id: number
  requested_by: string
  status: PieceEditRequestStatus
  proposed_changes: Record<string, unknown>
  reason: string | null
  moderator_comment: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type CommentReportReason =
  | "spam"
  | "abuse_or_harassment"
  | "hateful_content"
  | "sexual_content"
  | "misleading_or_bad_faith"
  | "other"

export type CommentReportStatus = "pending" | "dismissed" | "actioned"

export type CommentReport = {
  id: number
  comment_id: number
  reported_by: string
  reason: CommentReportReason
  details: string | null
  status: CommentReportStatus
  reviewed_by: string | null
  moderator_note: string | null
  created_at: string
  reviewed_at: string | null
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
  role: UserRole
  show_identity: boolean
  show_instruments: boolean
  show_public_lists_on_profile: boolean
  show_repertoire_summary: boolean
  show_repertoire_to_friends: boolean
  show_comment_activity: boolean
  show_compare_discoverability: boolean
  compare_requires_friend: boolean
  practice_diary_enabled: boolean
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

export type PublicProfileRepertoireTune = Piece & {
  profile_state: "known" | "practice"
  viewer_state: "new_to_me" | "known_by_me" | "in_my_practice" | "in_my_lists"
  viewer_list_ids: number[]
  viewer_list_names: string[]
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
  canViewFullRepertoire: boolean
  profile: Profile | null
  instruments: UserInstrument[]
  publicLists: PublicProfileList[]
  repertoireSummary: RepertoireSummary | null
  profileRepertoireTunes: PublicProfileRepertoireTune[]
  viewerLearningLists: LearningList[]
  createdBadges: PublicProfileCreatedBadge[]
  receivedBadges: PublicProfileReceivedBadge[]
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

export type HomeTunePreview = {
  user_piece_id: number
  piece_id: number
  title: string
  stage: number
}

export type HomeListPreview = {
  id: number
  name: string
}

export type HomeSummaryData = {
  knownCount: number
  practiceCount: number
  dueTodayCount: number
  needsAttentionCount: number
  listCount: number
  badgeSummary: HomeBadgeSummary
  dueTodayPreview: HomeTunePreview[]
  inPracticePreview: HomeTunePreview[]
  listPreview: HomeListPreview[]
}

export type Setlist = {
  id: number
  name: string
  description: string | null
  event_date: string | null
  location: string | null
  created_by: string
  created_at: string
  updated_at: string | null
}

export type SetlistMemberProfile = {
  id: string
  username: string | null
  display_name: string | null
}

export type SetlistMember = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
  profile: SetlistMemberProfile | null
}

export type SetlistMemberCoverage = {
  user_id: string
  status: "known" | "practice" | "gap"
  stage: number | null
  user_piece_id: number | null
}

export type SetlistItemWithCoverage = {
  id: number
  setlist_id: number
  piece_id: number
  position: number
  performance_key: string | null
  notes: string | null
  chart_url: string | null
  chart_label: string | null
  chart_type: string | null
  added_by: string | null
  created_at: string
  updated_at: string | null
  piece: Piece | null
  coverage: SetlistMemberCoverage[]
}

export type SetlistOverview = {
  id: number
  name: string
  description: string | null
  event_date: string | null
  location: string | null
  created_by: string
  memberCount: number
  tuneCount: number
  knownByEveryoneCount: number
  gapTuneCount: number
  isCreator: boolean
}

export type SetlistPendingInvite = {
  membership_id: number
  setlist: Setlist
  invited_by_profile: SetlistMemberProfile | null
}

export type SetlistInviteOption = {
  user_id: string
  username: string | null
  display_name: string | null
}

export type BadgeCategory =
  | "repertoire"
  | "practice"
  | "lore"
  | "media"
  | "catalogue"
  | "social"
  | "recovery"
  | "collaboration"

export type BadgeVisibility = "private" | "public" | "unlisted"

export type BadgeAwardingMode =
  | "manual"
  | "requestable"
  | "auto_when_eligible"

export type BadgeConditionLogic = {
  mode?: "all" | "any"
  conditions?: BadgeCondition[]
}

export type BadgeCondition =
  | {
      type: "know_all_tunes_in_list"
      list_id: number
    }
  | {
      type: "know_selected_tunes"
      piece_ids: number[]
    }
  | {
      type: "known_tune_count"
      count: number
      filters?: {
        key?: string | null
        style?: string | null
        time_signature?: string | null
      }
    }
  | {
      type: "added_media_links"
      count: number
      filters?: {
        style?: string | null
        only_previously_missing_media?: boolean
        list_id?: number
      }
    }
  | {
      type: "added_lore_entries"
      count: number
      filters?: {
        style?: string | null
        category?: string | null
      }
    }
  | {
      type: "added_missing_details"
      count: number
      filters?: {
        style?: string | null
        field_name?: string | null
      }
    }

export type BadgeOwnerProfile = {
  id: string
  username: string | null
  display_name: string | null
}

export type Badge = {
  id: number
  owner_user_id: string
  name: string
  slug: string
  description: string | null
  commentary: string
  category: BadgeCategory
  visibility: BadgeVisibility
  awarding_mode: BadgeAwardingMode
  condition_logic: BadgeConditionLogic
  created_at: string
  updated_at: string | null
}

export type BadgeAward = {
  id: number
  badge_id: number
  recipient_user_id: string
  awarded_by_user_id: string
  award_note: string | null
  awarded_at: string
}

export type BadgeAwardWithProfiles = BadgeAward & {
  recipient_profile: BadgeOwnerProfile | null
  awarded_by_profile: BadgeOwnerProfile | null
}

export type BadgeAwardRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"

export type BadgeAwardRequest = {
  id: number
  badge_id: number
  requester_user_id: string
  requester_note: string | null
  status: BadgeAwardRequestStatus
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  created_at: string
}

export type BadgeProgressSummary = {
  isEligible: boolean
  isCalculable: boolean
  current: number
  required: number
  label: string
  missingPieceIds?: number[]
}

export type BadgeWithOwner = Badge & {
  owner_profile: BadgeOwnerProfile | null
  recipient_count: number
  viewer_award: BadgeAward | null
  viewer_progress: BadgeProgressSummary | null
  condition_summary: string
}

export type BadgeDetailData =
  | {
      status: "not_found"
      viewerId: string | null
    }
  | {
      status: "loaded"
      viewerId: string | null
      badge: BadgeWithOwner
      awards: BadgeAwardWithProfiles[]
    }

export type BadgeIndexData = {
  viewerId: string | null
  badges: BadgeWithOwner[]
}

export type HomeBadgePreview = {
  id: number
  name: string
  slug: string
  category: BadgeCategory
  created_at?: string | null
  awarded_at?: string | null
}

export type HomeBadgeSummary = {
  receivedCount: number
  createdCount: number
  recentReceivedBadges: HomeBadgePreview[]
  recentCreatedBadges: HomeBadgePreview[]
}

export type PublicProfileCreatedBadge = {
  id: number
  name: string
  slug: string
  category: BadgeCategory
  description: string | null
  created_at: string
  recipient_count: number
}

export type PublicProfileReceivedBadge = {
  award_id: number
  awarded_at: string
  badge: {
    id: number
    name: string
    slug: string
    category: BadgeCategory
    description: string | null
    owner_user_id: string
  }
  awarded_by_profile: BadgeOwnerProfile | null
}