import {
  normaliseSearchText,
  searchProfilesForSelection,
  type ProfileSearchRow,
  type RankedProfileMatch,
} from "@/lib/profile-search"
import type { CompareError } from "./types"

function pickExactUsernameMatch(
  searchMatches: RankedProfileMatch[],
  searchValue: string
) {
  const trimmedValue = searchValue.trim()
  if (!trimmedValue) return null

  return (
    searchMatches.find((profile) => profile.username === trimmedValue) ?? null
  )
}

function pickSingleStrongMatch(
  searchMatches: RankedProfileMatch[],
  searchValue: string
) {
  if (searchMatches.length === 0) return null

  const normalisedQuery = normaliseSearchText(searchValue)
  const exactMatches = searchMatches.filter((profile) => {
    return (
      normaliseSearchText(profile.username) === normalisedQuery ||
      normaliseSearchText(profile.display_name) === normalisedQuery
    )
  })

  if (exactMatches.length === 1) {
    return exactMatches[0]
  }

  return null
}

export async function resolveSelectedProfile(
  currentUserId: string,
  rawSearchValue: string
): Promise<{
  matchedProfile: ProfileSearchRow | null
  matchingProfiles: ProfileSearchRow[]
  searchMatches: RankedProfileMatch[]
  error: CompareError
  searchValue: string
}> {
  const searchValue = rawSearchValue.trim()

  if (!searchValue) {
    return {
      matchedProfile: null,
      matchingProfiles: [],
      searchMatches: [],
      error: "missing_search",
      searchValue: "",
    }
  }

  const searchMatches = await searchProfilesForSelection({
    query: searchValue,
    currentUserId,
    limit: 10,
    requireCompareDiscoverability: true,
  })

  if (searchMatches.length === 0) {
    return {
      matchedProfile: null,
      matchingProfiles: [],
      searchMatches,
      error: "user_not_found",
      searchValue,
    }
  }

  const exactUsernameMatch = pickExactUsernameMatch(searchMatches, searchValue)
  const singleStrongMatch = pickSingleStrongMatch(searchMatches, searchValue)
  const matchedProfile = exactUsernameMatch ?? singleStrongMatch ?? null

  if (!matchedProfile) {
    return {
      matchedProfile: null,
      matchingProfiles: searchMatches,
      searchMatches,
      error: "multiple_matches",
      searchValue,
    }
  }

  if (matchedProfile.id === currentUserId) {
    return {
      matchedProfile,
      matchingProfiles: [],
      searchMatches,
      error: "self_compare",
      searchValue,
    }
  }

  return {
    matchedProfile,
    matchingProfiles: [],
    searchMatches,
    error: null,
    searchValue,
  }
}