import type { UserRole } from "./auth"
import type {
  PublicProfileCreatedBadge,
  PublicProfileReceivedBadge,
} from "./badges"
import type { LearningList, LearningListVisibility } from "./lists"
import type { Piece } from "./pieces"

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