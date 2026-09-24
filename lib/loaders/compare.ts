import { redirectToLogin } from "@/lib/auth/login-redirect"
import { checkCompareFriendshipAccess } from "@/lib/loaders/compare/friendship"
import { resolveSelectedProfile } from "@/lib/loaders/compare/profile-resolution"
import {
  loadMutualPieces,
} from "@/lib/loaders/compare/repertoire"
import { loadCompareSuggestions } from "@/lib/loaders/compare/suggestions"
import { createClient } from "@/lib/supabase/server"
import type { ProfileSearchRow } from "@/lib/profile-search"
import type {
  CompareLoaderOptions,
  CompareLoaderResult,
  CompareSearchResolution,
} from "@/lib/loaders/compare/types"
import { readBoundedRows } from "@/lib/loaders/bounded-read"
import { deriveCompareOutcomeGroups } from "@/lib/compare-outcomes"

export type {
  CompareError,
  CompareLoaderOptions,
  CompareLoaderResult,
  CompareSearchResolution,
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
    outcomeGroups: deriveCompareOutcomeGroups([], []),
    outcomePieces: [],
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
          outcomeGroups: deriveCompareOutcomeGroups([], []),
          outcomePieces: [],
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

async function loadComparisonOutcomes({
  supabase,
  currentUserId,
  resolvedProfiles,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  currentUserId: string
  resolvedProfiles: ProfileSearchRow[]
}) {
  const participantIds = [
    currentUserId,
    ...resolvedProfiles.map((profile) => profile.id),
  ]
  const [knownRows, practiceRows] = await Promise.all([
    readBoundedRows((from, to) => supabase.from("user_known_pieces")
      .select("user_id, piece_id", { count: "exact" })
      .in("user_id", participantIds).order("user_id").order("piece_id").range(from, to)),
    readBoundedRows((from, to) => supabase.from("user_pieces")
      .select("user_id, piece_id, stage", { count: "exact" })
      .in("user_id", participantIds).eq("status", "learning")
      .order("user_id").order("piece_id").range(from, to)),
  ])

  const byPieceId = new Map<number, Record<string, { known: boolean; practiceStage: number | null }>>()
  function ensure(pieceId: number) {
    const existing = byPieceId.get(pieceId)
    if (existing) return existing
    const created = Object.fromEntries(
      participantIds.map((userId) => [userId, { known: false, practiceStage: null }])
    )
    byPieceId.set(pieceId, created)
    return created
  }

  for (const row of knownRows) {
    ensure(row.piece_id)[row.user_id].known = true
  }
  for (const row of practiceRows) {
    ensure(row.piece_id)[row.user_id].practiceStage = row.stage ?? 1
  }

  const tuneStates = Array.from(byPieceId, ([pieceId, byUserId]) => ({
    pieceId,
    byUserId,
  }))
  const outcomeGroups = deriveCompareOutcomeGroups(participantIds, tuneStates)
  // Teaching is a count only; do not load non-visible tune metadata.
  const visibleIds = new Set(outcomeGroups.playableTogetherIds)
  const outcomePieces = await loadMutualPieces(supabase, visibleIds)
  const titleById = new Map(outcomePieces.map((piece) => [piece.id, piece.title]))
  const byTitle = (a: number, b: number) =>
    (titleById.get(a) ?? "").localeCompare(titleById.get(b) ?? "")

  outcomeGroups.playableTogetherIds.sort(byTitle)
  outcomeGroups.sharedStrongIds.sort(byTitle)
  outcomeGroups.sharedShakyIds.sort(byTitle)
  Object.values(outcomeGroups.teachableByUserId).forEach((ids) => ids.sort(byTitle))
  outcomeGroups.suggestedSetIds = [
    ...outcomeGroups.sharedStrongIds,
    ...outcomeGroups.sharedShakyIds,
  ].slice(0, 6)

  const knownTogetherIds = new Set(tuneStates.filter((tune) =>
    participantIds.every((id) => tune.byUserId[id].known)
  ).map((tune) => tune.pieceId))
  return { outcomeGroups, outcomePieces, knownTogetherIds }
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
    return redirectToLogin()
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

  if (cleanedSearchValues.length > 7) {
    return { ...buildEmptyCompareResult({ currentUserId: user.id, compareSuggestions }), error: "group_too_large" }
  }

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
      outcomeGroups: deriveCompareOutcomeGroups([], []),
      outcomePieces: [],
    }
  }

  const { outcomeGroups, outcomePieces, knownTogetherIds } =
    await loadComparisonOutcomes({ supabase, currentUserId: user.id, resolvedProfiles })
  const mutualPieces = includePractice
    ? outcomePieces
    : outcomePieces.filter((piece) => knownTogetherIds.has(piece.id))

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
    outcomeGroups,
    outcomePieces,
  }
}

export async function loadCompareUserSearch(
  currentUserId: string,
  rawSearchValue: string
): Promise<CompareSearchResolution> {
  const resolution = await resolveSelectedProfile(currentUserId, rawSearchValue)

  return {
    searchValue: resolution.searchValue,
    matchedProfile: resolution.matchedProfile,
    matchingProfiles: resolution.matchingProfiles,
    searchMatches: resolution.searchMatches,
    error: resolution.error,
  }
}
