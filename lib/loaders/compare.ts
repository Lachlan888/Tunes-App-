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
  error: CompareError
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

  const searchValue = rawSearchValue.trim()

  if (!searchValue) {
    return {
      currentUserId: user.id,
      searchValue: "",
      matchedProfile: null,
      matchingProfiles: [],
      mutualPieces: [],
      error: "missing_search",
    }
  }

  const { data: usernameMatch, error: usernameMatchError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", searchValue)
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
      error: "self_compare",
    }
  }

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
    error: null,
  }
}