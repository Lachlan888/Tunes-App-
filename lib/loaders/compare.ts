import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Piece } from "@/lib/types"

type ProfileRow = {
  id: string
  username: string
  display_name: string | null
}

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
  matchedProfile: ProfileRow | null
  matchingProfiles: ProfileRow[]
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
      mutualPieces: [],
      compareSuggestions,
      isAcceptedFriend: false,
      error: "missing_search",
    }
  }

  const { data: usernameMatch, error: usernameMatchError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", searchValue)
    .eq("show_compare_discoverability", true)
    .maybeSingle()

  if (usernameMatchError) {
    throw new Error(usernameMatchError.message)
  }

  let matchedProfile = (usernameMatch ?? null) as ProfileRow | null
  let matchingProfiles: ProfileRow[] = []

  if (!matchedProfile) {
    const { data: displayNameMatches, error: displayNameMatchesError } =
      await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("display_name", searchValue)
        .eq("show_compare_discoverability", true)

    if (displayNameMatchesError) {
      throw new Error(displayNameMatchesError.message)
    }

    matchingProfiles = (displayNameMatches ?? []) as ProfileRow[]

    if (matchingProfiles.length === 0) {
      return {
        currentUserId: user.id,
        searchValue,
        matchedProfile: null,
        matchingProfiles: [],
        mutualPieces: [],
        compareSuggestions,
        isAcceptedFriend: false,
        error: "user_not_found",
      }
    }

    if (matchingProfiles.length > 1) {
      return {
        currentUserId: user.id,
        searchValue,
        matchedProfile: null,
        matchingProfiles,
        mutualPieces: [],
        compareSuggestions,
        isAcceptedFriend: false,
        error: "multiple_matches",
      }
    }

    matchedProfile = matchingProfiles[0]
  }

  if (matchedProfile.id === user.id) {
    return {
      currentUserId: user.id,
      searchValue,
      matchedProfile,
      matchingProfiles: [],
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
    mutualPieces: (mutualPiecesRows ?? []) as Piece[],
    compareSuggestions,
    isAcceptedFriend,
    error: null,
  }
}