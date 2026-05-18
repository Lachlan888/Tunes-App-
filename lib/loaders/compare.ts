import { redirect } from "next/navigation"
import { checkCompareFriendshipAccess } from "@/lib/loaders/compare/friendship"
import { resolveSelectedProfile } from "@/lib/loaders/compare/profile-resolution"
import {
  intersectSets,
  loadMutualPieces,
  loadUserRepertoirePieceIds,
} from "@/lib/loaders/compare/repertoire"
import { loadCompareSuggestions } from "@/lib/loaders/compare/suggestions"
import { createClient } from "@/lib/supabase/server"
import type { ProfileSearchRow } from "@/lib/profile-search"
import type {
  CompareLoaderOptions,
  CompareLoaderResult,
} from "@/lib/loaders/compare/types"

export type {
  CompareError,
  CompareLoaderOptions,
  CompareLoaderResult,
  CompareSuggestion,
  ConnectionRow,
  PieceIdRow,
} from "@/lib/loaders/compare/types"

function cleanSearchValues(rawSearchValues: string[]) {
  return Array.from(
    new Set(rawSearchValues.map((value) => value.trim()).filter(Boolean))
  )
}

function buildEmptyCompareResult({
  currentUserId,
  compareSuggestions,
}: {
  currentUserId: string
  compareSuggestions: CompareLoaderResult["compareSuggestions"]
}): CompareLoaderResult {
  return {
    currentUserId,
    searchValue: "",
    matchedProfile: null,
    matchingProfiles: [],
    searchMatches: [],
    mutualPieces: [],
    compareSuggestions,
    isAcceptedFriend: false,
    canCompare: false,
    error: "missing_search",
    selectedProfiles: [],
  }
}

async function resolveProfilesForCompare({
  currentUserId,
  cleanedSearchValues,
  compareSuggestions,
}: {
  currentUserId: string
  cleanedSearchValues: string[]
  compareSuggestions: CompareLoaderResult["compareSuggestions"]
}): Promise<
  | {
      status: "resolved"
      resolvedProfiles: ProfileSearchRow[]
    }
  | {
      status: "error"
      result: CompareLoaderResult
    }
> {
  const profileResolutions = await Promise.all(
    cleanedSearchValues.map((rawSearchValue) =>
      resolveSelectedProfile(currentUserId, rawSearchValue)
    )
  )

  const resolvedProfiles: ProfileSearchRow[] = []

  for (const resolution of profileResolutions) {
    if (resolution.error) {
      return {
        status: "error",
        result: {
          currentUserId,
          searchValue: resolution.searchValue,
          matchedProfile: resolution.matchedProfile,
          matchingProfiles: resolution.matchingProfiles,
          searchMatches: resolution.searchMatches,
          mutualPieces: [],
          compareSuggestions,
          isAcceptedFriend: false,
          canCompare: false,
          error: resolution.error,
          selectedProfiles: resolvedProfiles,
        },
      }
    }

    if (
      resolution.matchedProfile &&
      !resolvedProfiles.some(
        (profile) => profile.id === resolution.matchedProfile?.id
      )
    ) {
      resolvedProfiles.push(resolution.matchedProfile)
    }
  }

  return {
    status: "resolved",
    resolvedProfiles,
  }
}

async function getMutualPieceIds({
  supabase,
  currentUserId,
  resolvedProfiles,
  includePractice,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  currentUserId: string
  resolvedProfiles: ProfileSearchRow[]
  includePractice: boolean
}) {
  const repertoireSets = await Promise.all([
    loadUserRepertoirePieceIds(supabase, currentUserId, { includePractice }),
    ...resolvedProfiles.map((profile) =>
      loadUserRepertoirePieceIds(supabase, profile.id, { includePractice })
    ),
  ])

  const [currentUserPieceIds, ...otherUserPieceIdSets] = repertoireSets

  let mutualPieceIds = new Set<number>(currentUserPieceIds)

  for (const otherUserPieceIds of otherUserPieceIdSets) {
    mutualPieceIds = intersectSets(mutualPieceIds, otherUserPieceIds)
  }

  return mutualPieceIds
}

export async function loadCompareData(
  rawSearchValues: string[],
  options: CompareLoaderOptions = {}
): Promise<CompareLoaderResult> {
  const includePractice = options.includePractice ?? false
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const compareSuggestionsPromise = loadCompareSuggestions(supabase, user.id)
  const cleanedSearchValues = cleanSearchValues(rawSearchValues)

  if (cleanedSearchValues.length === 0) {
    const compareSuggestions = await compareSuggestionsPromise

    return buildEmptyCompareResult({
      currentUserId: user.id,
      compareSuggestions,
    })
  }

  const compareSuggestions = await compareSuggestionsPromise

  const profileResolution = await resolveProfilesForCompare({
    currentUserId: user.id,
    cleanedSearchValues,
    compareSuggestions,
  })

  if (profileResolution.status === "error") {
    return profileResolution.result
  }

  const { resolvedProfiles } = profileResolution

  if (resolvedProfiles.length === 0) {
    return buildEmptyCompareResult({
      currentUserId: user.id,
      compareSuggestions,
    })
  }

  const { blockedProfile, allAccepted } = await checkCompareFriendshipAccess(
    supabase,
    user.id,
    resolvedProfiles
  )

  if (blockedProfile) {
    return {
      currentUserId: user.id,
      searchValue: blockedProfile.username ?? blockedProfile.display_name ?? "",
      matchedProfile: blockedProfile,
      matchingProfiles: [],
      searchMatches: [],
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      canCompare: false,
      error: null,
      selectedProfiles: resolvedProfiles,
    }
  }

  const mutualPieceIds = await getMutualPieceIds({
    supabase,
    currentUserId: user.id,
    resolvedProfiles,
    includePractice,
  })

  const mutualPieces = await loadMutualPieces(supabase, mutualPieceIds)

  return {
    currentUserId: user.id,
    searchValue: cleanedSearchValues[0] ?? "",
    matchedProfile: resolvedProfiles[0] ?? null,
    matchingProfiles: [],
    searchMatches: [],
    mutualPieces,
    compareSuggestions,
    isAcceptedFriend: resolvedProfiles.length === 1 ? allAccepted : false,
    canCompare: true,
    error: null,
    selectedProfiles: resolvedProfiles,
  }
}