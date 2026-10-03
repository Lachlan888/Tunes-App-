import type { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export const FRIEND_SUGGESTION_CANDIDATE_LIMIT = 60
export const FRIEND_SUGGESTION_RESULT_LIMIT = 6
export const FRIEND_SUGGESTION_GRAPH_LIMIT = 500
export const FRIEND_SUGGESTION_REPERTOIRE_LIMIT = 800

export type FriendSuggestionConnection = {
  requester_id: string
  addressee_id: string
  status: string
}

type CandidateProfileRow = {
  id: string
  username: string | null
  show_identity: boolean | null
  show_compare_discoverability: boolean | null
  compare_requires_friend: boolean | null
}

type IdentityRow = {
  id: string
  display_name: string | null
}

type RepertoireRow = {
  user_id: string
  piece_id: number
  pieces: { style: string | null } | { style: string | null }[] | null
}

export type FriendSuggestionCandidate = {
  id: string
  username: string | null
  display_name: string | null
  canUseRepertoire: boolean
}

export type FriendSuggestion = {
  id: string
  username: string | null
  display_name: string | null
  score: number
  reason: string
  mutualConnectionCount: number
  sharedStyleCount: number
  tuneOverlapCount: number
}

export type FriendSuggestionResult = {
  suggestions: FriendSuggestion[]
  state: "ready" | "insufficient_signals"
}

function checked<T>(result: { data: T | null; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

function repertoireStyle(row: RepertoireRow) {
  const piece = Array.isArray(row.pieces) ? row.pieces[0] : row.pieces
  return piece?.style?.trim() || null
}

function repertoireByUser(rows: RepertoireRow[]) {
  const pieceIds = new Map<string, Set<number>>()
  const styles = new Map<string, Set<string>>()

  for (const row of rows) {
    const userPieces = pieceIds.get(row.user_id) ?? new Set<number>()
    userPieces.add(row.piece_id)
    pieceIds.set(row.user_id, userPieces)

    const style = repertoireStyle(row)
    if (!style) continue
    const userStyles = styles.get(row.user_id) ?? new Set<string>()
    userStyles.add(style)
    styles.set(row.user_id, userStyles)
  }

  return { pieceIds, styles }
}

function intersectionSize<T>(left: Set<T>, right: Set<T>) {
  let count = 0
  for (const value of left) if (right.has(value)) count += 1
  return count
}

function firstSharedStyle(left: Set<string>, right: Set<string>) {
  return Array.from(left)
    .filter((style) => right.has(style))
    .sort((a, b) => a.localeCompare(b))[0] ?? null
}

export function rankFriendSuggestions({
  candidates,
  currentUserId,
  repertoireRows,
  mutualConnectionCounts,
  limit = FRIEND_SUGGESTION_RESULT_LIMIT,
}: {
  candidates: FriendSuggestionCandidate[]
  currentUserId: string
  repertoireRows: RepertoireRow[]
  mutualConnectionCounts: Map<string, number>
  limit?: number
}): FriendSuggestion[] {
  const repertoire = repertoireByUser(repertoireRows)
  const viewerPieces = repertoire.pieceIds.get(currentUserId) ?? new Set<number>()
  const viewerStyles = repertoire.styles.get(currentUserId) ?? new Set<string>()

  return candidates
    .map((candidate) => {
      const candidatePieces = repertoire.pieceIds.get(candidate.id) ?? new Set<number>()
      const candidateStyles = repertoire.styles.get(candidate.id) ?? new Set<string>()
      const mutualConnectionCount = mutualConnectionCounts.get(candidate.id) ?? 0
      const tuneOverlapCount = intersectionSize(viewerPieces, candidatePieces)
      const sharedStyleCount = intersectionSize(viewerStyles, candidateStyles)
      const sharedStyle = firstSharedStyle(viewerStyles, candidateStyles)
      const score =
        mutualConnectionCount * 100 +
        Math.min(sharedStyleCount, 3) * 20 +
        Math.min(tuneOverlapCount, 5) * 8
      const reason = mutualConnectionCount > 0
        ? `${mutualConnectionCount} mutual connection${mutualConnectionCount === 1 ? "" : "s"}`
        : sharedStyle
          ? `You both play ${sharedStyle}`
          : `${tuneOverlapCount} tune${tuneOverlapCount === 1 ? "" : "s"} in common`

      return {
        id: candidate.id,
        username: candidate.username,
        display_name: candidate.display_name,
        score,
        reason,
        mutualConnectionCount,
        sharedStyleCount,
        tuneOverlapCount,
      }
    })
    .filter((suggestion) => suggestion.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const aLabel = a.display_name ?? a.username ?? ""
      const bLabel = b.display_name ?? b.username ?? ""
      return aLabel.localeCompare(bLabel) || a.id.localeCompare(b.id)
    })
    .slice(0, limit)
}

async function loadRepertoireRows(
  supabase: SupabaseServerClient,
  currentUserId: string,
  candidateIds: string[]
) {
  const candidateReads = candidateIds.length === 0
    ? []
    : ["user_known_pieces", "user_pieces"].map((table) => supabase
        .from(table)
        .select("user_id, piece_id, pieces(style)")
        .in("user_id", candidateIds)
        .order("user_id")
        .order("piece_id")
        .limit(FRIEND_SUGGESTION_REPERTOIRE_LIMIT))
  const viewerReads = ["user_known_pieces", "user_pieces"].map((table) => supabase
    .from(table)
    .select("user_id, piece_id, pieces(style)")
    .eq("user_id", currentUserId)
    .order("piece_id")
    .limit(FRIEND_SUGGESTION_REPERTOIRE_LIMIT))
  const results = await Promise.all([...viewerReads, ...candidateReads])

  return results.flatMap((result) => checked(result) ?? []) as unknown as RepertoireRow[]
}

async function loadMutualConnectionCounts(
  supabase: SupabaseServerClient,
  acceptedFriendIds: string[],
  candidateIds: Set<string>
) {
  const counts = new Map<string, number>()
  if (acceptedFriendIds.length === 0 || candidateIds.size === 0) return counts

  const friendList = acceptedFriendIds.join(",")
  const rows = checked(await supabase
    .from("connections")
    .select("requester_id, addressee_id, status")
    .eq("status", "accepted")
    .or(`requester_id.in.(${friendList}),addressee_id.in.(${friendList})`)
    .order("id")
    .limit(FRIEND_SUGGESTION_GRAPH_LIMIT)) ?? []
  const acceptedFriendSet = new Set(acceptedFriendIds)

  for (const row of rows as FriendSuggestionConnection[]) {
    const candidateId = acceptedFriendSet.has(row.requester_id)
      ? row.addressee_id
      : acceptedFriendSet.has(row.addressee_id)
        ? row.requester_id
        : null
    if (!candidateId || !candidateIds.has(candidateId)) continue
    counts.set(candidateId, (counts.get(candidateId) ?? 0) + 1)
  }

  return counts
}

export async function loadFriendSuggestions(
  supabase: SupabaseServerClient,
  currentUserId: string,
  existingConnections: FriendSuggestionConnection[],
  limit = FRIEND_SUGGESTION_RESULT_LIMIT
): Promise<FriendSuggestionResult> {
  const excludedIds = new Set<string>([currentUserId])
  const acceptedFriendIds: string[] = []

  for (const connection of existingConnections) {
    const otherId = connection.requester_id === currentUserId
      ? connection.addressee_id
      : connection.requester_id
    excludedIds.add(otherId)
    if (connection.status === "accepted") acceptedFriendIds.push(otherId)
  }

  const profileRows = checked(await supabase
    .from("profiles")
    .select("id, username, show_identity, show_compare_discoverability, compare_requires_friend")
    .eq("show_compare_discoverability", true)
    .neq("id", currentUserId)
    .order("id")
    .limit(FRIEND_SUGGESTION_CANDIDATE_LIMIT)) ?? []
  const eligibleProfiles = (profileRows as CandidateProfileRow[])
    .filter((profile) => profile.show_compare_discoverability === true)
    .filter((profile) => !excludedIds.has(profile.id))
  const visibleIdentityIds = eligibleProfiles
    .filter((profile) => profile.show_identity === true)
    .map((profile) => profile.id)
  const identities = visibleIdentityIds.length === 0
    ? []
    : checked(await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("show_identity", true)
        .in("id", visibleIdentityIds)
        .order("id")
        .limit(FRIEND_SUGGESTION_CANDIDATE_LIMIT)) ?? []
  const identityById = new Map((identities as IdentityRow[]).map((row) => [row.id, row.display_name]))
  const candidates: FriendSuggestionCandidate[] = eligibleProfiles.map((profile) => ({
    id: profile.id,
    username: profile.username,
    display_name: identityById.get(profile.id) ?? null,
    canUseRepertoire: profile.compare_requires_friend === false,
  }))
  const repertoireCandidateIds = candidates
    .filter((candidate) => candidate.canUseRepertoire)
    .map((candidate) => candidate.id)
  const [repertoireRows, mutualConnectionCounts] = await Promise.all([
    loadRepertoireRows(supabase, currentUserId, repertoireCandidateIds),
    loadMutualConnectionCounts(supabase, acceptedFriendIds, new Set(candidates.map((candidate) => candidate.id))),
  ])
  const suggestions = rankFriendSuggestions({
    candidates,
    currentUserId,
    repertoireRows,
    mutualConnectionCounts,
    limit,
  })

  return {
    suggestions,
    state: suggestions.length > 0 ? "ready" : "insufficient_signals",
  }
}
