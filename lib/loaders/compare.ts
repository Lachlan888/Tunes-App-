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
  error: CompareError
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

export async function loadCompareData(
  rawSearchValue: string
): Promise<CompareLoaderResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const compareSuggestions = await loadCompareSuggestions(supabase, user.id)
  const searchValue = rawSearchValue.trim()

  if (!searchValue) {
    return {
      currentUserId: user.id,
      searchValue: "",
      matchedProfile: null,
      matchingProfiles: [],
      searchMatches: [],
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      error: "missing_search",
    }
  }

  const searchMatches = await searchProfilesForSelection({
    query: searchValue,
    currentUserId: user.id,
    limit: 10,
    requireCompareDiscoverability: true,
  })

  if (searchMatches.length === 0) {
    return {
      currentUserId: user.id,
      searchValue,
      matchedProfile: null,
      matchingProfiles: [],
      searchMatches: [],
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      error: "user_not_found",
    }
  }

  const exactUsernameMatch = pickExactUsernameMatch(searchMatches, searchValue)
  const singleStrongMatch = pickSingleStrongMatch(searchMatches, searchValue)
  const matchedProfile = exactUsernameMatch ?? singleStrongMatch ?? null

  if (!matchedProfile) {
    return {
      currentUserId: user.id,
      searchValue,
      matchedProfile: null,
      matchingProfiles: searchMatches,
      searchMatches,
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      error: "multiple_matches",
    }
  }

  if (matchedProfile.id === user.id) {
    return {
      currentUserId: user.id,
      searchValue,
      matchedProfile,
      matchingProfiles: [],
      searchMatches,
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      error: "self_compare",
    }
  }

  const isAcceptedFriend = await getIsAcceptedFriend(
    supabase,
    user.id,
    matchedProfile.id
  )

  const { data: currentPracticeRows, error: currentPracticeError } =
    await supabase
      .from("user_pieces")
      .select("piece_id")
      .eq("user_id", user.id)

  if (currentPracticeError) {
    throw new Error(currentPracticeError.message)
  }

  const { data: currentKnownRows, error: currentKnownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", user.id)

  if (currentKnownError) {
    throw new Error(currentKnownError.message)
  }

  const { data: otherPracticeRows, error: otherPracticeError } = await supabase
    .from("user_pieces")
    .select("piece_id")
    .eq("user_id", matchedProfile.id)

  if (otherPracticeError) {
    throw new Error(otherPracticeError.message)
  }

  const { data: otherKnownRows, error: otherKnownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", matchedProfile.id)

  if (otherKnownError) {
    throw new Error(otherKnownError.message)
  }

  const currentUserPieceIds = new Set<number>([
    ...((currentPracticeRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
    ...((currentKnownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
  ])

  const otherUserPieceIds = new Set<number>([
    ...((otherPracticeRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
    ...((otherKnownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
  ])

  const mutualPieceIds = Array.from(currentUserPieceIds).filter((pieceId) =>
    otherUserPieceIds.has(pieceId)
  )

  if (mutualPieceIds.length === 0) {
    return {
      currentUserId: user.id,
      searchValue,
      matchedProfile,
      matchingProfiles: [],
      searchMatches,
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend,
      error: null,
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
    .in("id", mutualPieceIds)
    .order("title", { ascending: true })

  if (mutualPiecesError) {
    throw new Error(mutualPiecesError.message)
  }

  return {
    currentUserId: user.id,
    searchValue,
    matchedProfile,
    matchingProfiles: [],
    searchMatches,
    mutualPieces: (mutualPiecesRows ?? []) as Piece[],
    compareSuggestions,
    isAcceptedFriend,
    error: null,
  }
}