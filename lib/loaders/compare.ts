import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  searchProfilesForSelection,
  type ProfileSearchRow,
  type RankedProfileMatch,
  normaliseSearchText,
} from "@/lib/profile-search"
import type { Piece } from "@/lib/types"

type PieceIdRow = {
  piece_id: number
}

type ConnectionRow = {
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

type CompareError =
  | "missing_search"
  | "self_compare"
  | "user_not_found"
  | "multiple_matches"
  | null

type CompareLoaderResult = {
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

async function loadCompareSuggestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentUserId: string
): Promise<CompareSuggestion[]> {
  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, requester_id, addressee_id")
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const typedConnections = (connectionRows ?? []) as ConnectionRow[]

  const acceptedFriendIds = typedConnections
    .filter((row) => row.status === "accepted")
    .map((row) =>
      row.requester_id === currentUserId ? row.addressee_id : row.requester_id
    )

  const uniqueAcceptedFriendIds = Array.from(new Set(acceptedFriendIds))

  if (uniqueAcceptedFriendIds.length === 0) {
    return []
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueAcceptedFriendIds)
    .eq("show_compare_discoverability", true)
    .not("username", "is", null)
    .order("display_name", { ascending: true })

  if (profileError) {
    throw new Error(profileError.message)
  }

  const typedProfiles = (profileRows ?? []) as Array<{
    id: string
    username: string | null
    display_name: string | null
  }>

  return typedProfiles
    .filter((profile): profile is typeof profile & { username: string } =>
      Boolean(profile.username)
    )
    .map((profile) => ({
      user_id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
    }))
    .sort((a, b) => {
      const aName = a.display_name ?? a.username
      const bName = b.display_name ?? b.username
      return aName.localeCompare(bName)
    })
}

async function getIsAcceptedFriend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentUserId: string,
  otherUserId: string
): Promise<boolean> {
  const { data: connectionRow, error: connectionError } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${currentUserId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${currentUserId})`
    )
    .maybeSingle()

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  return Boolean(connectionRow)
}

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

async function resolveSelectedProfile(
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
      searchMatches: [],
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

async function loadUserRepertoirePieceIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Set<number>> {
  const { data: practiceRows, error: practiceError } = await supabase
    .from("user_pieces")
    .select("piece_id")
    .eq("user_id", userId)

  if (practiceError) {
    throw new Error(practiceError.message)
  }

  const { data: knownRows, error: knownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", userId)

  if (knownError) {
    throw new Error(knownError.message)
  }

  return new Set<number>([
    ...((practiceRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
    ...((knownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
  ])
}

function intersectSets(base: Set<number>, other: Set<number>) {
  return new Set<number>(Array.from(base).filter((pieceId) => other.has(pieceId)))
}

export async function loadCompareData(
  rawSearchValues: string[]
): Promise<CompareLoaderResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const compareSuggestions = await loadCompareSuggestions(supabase, user.id)

  const cleanedSearchValues = Array.from(
    new Set(
      rawSearchValues
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )

  if (cleanedSearchValues.length === 0) {
    return {
      currentUserId: user.id,
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

  const resolvedProfiles: ProfileSearchRow[] = []

  for (const rawSearchValue of cleanedSearchValues) {
    const resolution = await resolveSelectedProfile(user.id, rawSearchValue)

    if (resolution.error) {
      return {
        currentUserId: user.id,
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
      }
    }

    if (
      resolution.matchedProfile &&
      !resolvedProfiles.some((profile) => profile.id === resolution.matchedProfile?.id)
    ) {
      resolvedProfiles.push(resolution.matchedProfile)
    }
  }

  if (resolvedProfiles.length === 0) {
    return {
      currentUserId: user.id,
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

  let blockedProfile: ProfileSearchRow | null = null
  let allAccepted = true

  for (const profile of resolvedProfiles) {
    const isAcceptedFriend = await getIsAcceptedFriend(supabase, user.id, profile.id)
    const profileCanCompare = !profile.compare_requires_friend || isAcceptedFriend

    if (!profileCanCompare) {
      blockedProfile = profile
      allAccepted = false
      break
    }

    if (!isAcceptedFriend) {
      allAccepted = false
    }
  }

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

  const currentUserPieceIds = await loadUserRepertoirePieceIds(supabase, user.id)

  let mutualPieceIds = new Set<number>(currentUserPieceIds)

  for (const profile of resolvedProfiles) {
    const otherUserPieceIds = await loadUserRepertoirePieceIds(supabase, profile.id)
    mutualPieceIds = intersectSets(mutualPieceIds, otherUserPieceIds)
  }

  if (mutualPieceIds.size === 0) {
    return {
      currentUserId: user.id,
      searchValue: cleanedSearchValues[0] ?? "",
      matchedProfile: resolvedProfiles[0] ?? null,
      matchingProfiles: [],
      searchMatches: [],
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: resolvedProfiles.length === 1 ? allAccepted : false,
      canCompare: true,
      error: null,
      selectedProfiles: resolvedProfiles,
    }
  }

  const { data: mutualPiecesRows, error: mutualPiecesError } = await supabase
    .from("pieces")
    .select(`
      id,
      title,
      key,
      style,
      time_signature,
      reference_url,
      piece_styles (
        style_id,
        styles (
          id,
          slug,
          label
        )
      )
    `)
    .in("id", Array.from(mutualPieceIds))
    .order("title", { ascending: true })

  if (mutualPiecesError) {
    throw new Error(mutualPiecesError.message)
  }

  return {
    currentUserId: user.id,
    searchValue: cleanedSearchValues[0] ?? "",
    matchedProfile: resolvedProfiles[0] ?? null,
    matchingProfiles: [],
    searchMatches: [],
    mutualPieces: (mutualPiecesRows ?? []) as Piece[],
    compareSuggestions,
    isAcceptedFriend: resolvedProfiles.length === 1 ? allAccepted : false,
    canCompare: true,
    error: null,
    selectedProfiles: resolvedProfiles,
  }
}