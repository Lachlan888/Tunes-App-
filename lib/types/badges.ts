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

export type BadgeRequiredTuneViewerState =
  | "known"
  | "in_practice"
  | "not_in_repertoire"

export type BadgeRequiredTune = {
  piece: {
    id: number
    title: string
    key: string | null
    style: string | null
    time_signature: string | null
    reference_url: string | null
  }
  viewer_state: BadgeRequiredTuneViewerState | null
  stage: number | null
  existing_list_ids: number[]
}

export type BadgeViewerLearningList = {
  id: number
  name: string
  description: string | null
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
      requiredTunes: BadgeRequiredTune[]
      viewerLearningLists: BadgeViewerLearningList[]
    }

export type BadgeIndexData = {
  viewerId: string | null
  badges: BadgeWithOwner[]
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