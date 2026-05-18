import type {
  ProfileSearchRow,
  RankedProfileMatch,
} from "@/lib/profile-search"
import type { Piece } from "@/lib/types"

export type PieceIdRow = {
  piece_id: number
}

export type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

export type CompareSuggestion = {
  user_id: string
  username: string
  display_name: string | null
}

export type CompareError =
  | "missing_search"
  | "self_compare"
  | "user_not_found"
  | "multiple_matches"
  | null

export type CompareLoaderResult = {
  currentUserId: string
  searchValue: string
  matchedProfile: ProfileSearchRow | null
  matchingProfiles: ProfileSearchRow[]
  searchMatches: RankedProfileMatch[]
  mutualPieces: Piece[]
  compareSuggestions: CompareSuggestion[]
  isAcceptedFriend: boolean
  canCompare: boolean
  error: CompareError
  selectedProfiles: ProfileSearchRow[]
}

export type CompareLoaderOptions = {
  includePractice?: boolean
}