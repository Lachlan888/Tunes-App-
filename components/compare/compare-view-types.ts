import type { CompareError, CompareSuggestion } from "@/lib/loaders/compare"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import type { Piece } from "@/lib/types"

export type CompareViewProps = {
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
  mutualPieces: Piece[]
  filteredPieces: Piece[]
  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  hasActiveFilters: boolean
  canShowResults: boolean
}