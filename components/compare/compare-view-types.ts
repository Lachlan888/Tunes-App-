import type { CompareError, CompareSuggestion } from "@/lib/loaders/compare"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import type { Piece } from "@/lib/types"
import type { CompareOutcomeGroups } from "@/lib/compare-outcomes"

export type CompareViewProps = {
  currentUserId: string
  selectedProfiles: ProfileSearchRow[]
  filterPreservedUsers: string[]
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  includePractice: boolean
  friendRequestStatus: string
  error: CompareError
  primarySearchValue: string
  compareSuggestions: CompareSuggestion[]
  matchingProfiles: ProfileSearchRow[]
  searchMatches: RankedProfileMatch[]
  matchedProfile: ProfileSearchRow | null
  isAcceptedFriend: boolean
  canCompare: boolean
  redirectTo: string
  compareHeading: string
  filteredPieces: Piece[]
  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  hasActiveFilters: boolean
  canShowResults: boolean
  outcomeGroups: CompareOutcomeGroups
  outcomePieces: Piece[]
  overlapGroup: "all" | "strong" | "shaky"
  overlapPage: number
  overlapTotal: number
  previousOverlapHref: string | null
  nextOverlapHref: string | null
}
