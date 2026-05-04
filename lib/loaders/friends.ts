import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  searchProfilesForSelection,
  type ProfileSearchRow,
} from "@/lib/profile-search"

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  created_at: string
  accepted_at: string | null
  requester_id: string
  addressee_id: string
}

type ActivityEventRow = {
  id: number
  user_id: string
  event_type:
    | "started_practice"
    | "tune_reviewed"
    | "marked_known"
    | "comment_added"
    | "public_list_created"
    | "public_list_updated"
  piece_id: number | null
  learning_list_id: number | null
  comment_id: number | null
  created_at: string
}

type PieceRow = {
  id: number
  title: string
}

type LearningListRow = {
  id: number
  name: string
  visibility: string | null
}

type PieceCommentRow = {
  id: number
  body: string
}

export type FriendSearchMatch = {
  id: string
  username: string | null
  display_name: string | null
  match_score: number
}

export type PendingFriendRequest = {
  connection_id: number
  requester_id: string
  username: string | null
  display_name: string | null
  created_at: string
}

export type AcceptedFriend = {
  connection_id: number
  user_id: string
  username: string | null
  display_name: string | null
  accepted_at: string | null
}

export type FriendActivityItem = {
  id: number
  created_at: string
  event_type:
    | "started_practice"
    | "tune_reviewed"
    | "marked_known"
    | "comment_added"
    | "public_list_created"
    | "public_list_updated"
  actor: {
    id: string
    username: string | null
    display_name: string | null
  } | null
  piece: {
    id: number
    title: string
  } | null
  learning_list: {
    id: number
    name: string
  } | null
  comment: {
    id: number
    body: string
  } | null
}

export async function loadRecentFriendActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  acceptedFriendIds: string[],
  limit = 25
): Promise<FriendActivityItem[]> {
  if (acceptedFriendIds.length === 0) {
    return []
  }

  const { data: activityRows, error: activityError } = await supabase
    .from("user_activity_events")
    .select(
      "id, user_id, event_type, piece_id, learning_list_id, comment_id, created_at"
    )
    .in("user_id", acceptedFriendIds)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (activityError) {
    throw new Error(activityError.message)
  }

  const typedActivityRows = (activityRows ?? []) as ActivityEventRow[]

  const activityUserIds = Array.from(
    new Set(typedActivityRows.map((row) => row.user_id))
  )

  const pieceIds = Array.from(
    new Set(
      typedActivityRows
        .map((row) => row.piece_id)
        .filter((value): value is number => value !== null)
    )
  )

  const learningListIds = Array.from(
    new Set(
      typedActivityRows
        .map((row) => row.learning_list_id)
        .filter((value): value is number => value !== null)
    )
  )

  const commentIds = Array.from(
    new Set(
      typedActivityRows
        .map((row) => row.comment_id)
        .filter((value): value is number => value !== null)
    )
  )

  let activityProfilesById = new Map<string, ProfileSearchRow>()
  let piecesById = new Map<number, PieceRow>()
  let learningListsById = new Map<number, LearningListRow>()
  let commentsById = new Map<number, PieceCommentRow>()

  if (activityUserIds.length > 0) {
    const { data: activityProfiles, error: activityProfilesError } =
      await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", activityUserIds)

    if (activityProfilesError) {
      throw new Error(activityProfilesError.message)
    }

    activityProfilesById = new Map(
      ((activityProfiles ?? []) as ProfileSearchRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    )
  }

  if (pieceIds.length > 0) {
    const { data: pieces, error: piecesError } = await supabase
      .from("pieces")
      .select("id, title")
      .in("id", pieceIds)

    if (piecesError) {
      throw new Error(piecesError.message)
    }

    piecesById = new Map(
      ((pieces ?? []) as PieceRow[]).map((piece) => [piece.id, piece])
    )
  }

  if (learningListIds.length > 0) {
    const { data: learningLists, error: learningListsError } = await supabase
      .from("learning_lists")
      .select("id, name, visibility")
      .in("id", learningListIds)
      .eq("visibility", "public")

    if (learningListsError) {
      throw new Error(learningListsError.message)
    }

    learningListsById = new Map(
      ((learningLists ?? []) as LearningListRow[]).map((list) => [
        list.id,
        list,
      ])
    )
  }

  if (commentIds.length > 0) {
    const { data: comments, error: commentsError } = await supabase
      .from("piece_comments")
      .select("id, body")
      .in("id", commentIds)

    if (commentsError) {
      throw new Error(commentsError.message)
    }

    commentsById = new Map(
      ((comments ?? []) as PieceCommentRow[]).map((comment) => [
        comment.id,
        comment,
      ])
    )
  }

  return typedActivityRows
    .map((row) => {
      const actor = activityProfilesById.get(row.user_id) ?? null
      const piece =
        row.piece_id != null ? piecesById.get(row.piece_id) ?? null : null
      const learningList =
        row.learning_list_id != null
          ? learningListsById.get(row.learning_list_id) ?? null
          : null
      const comment =
        row.comment_id != null ? commentsById.get(row.comment_id) ?? null : null

      if (
        (row.event_type === "public_list_created" ||
          row.event_type === "public_list_updated") &&
        !learningList
      ) {
        return null
      }

      return {
        id: row.id,
        created_at: row.created_at,
        event_type: row.event_type,
        actor: actor
          ? {
              id: actor.id,
              username: actor.username,
              display_name: actor.display_name,
            }
          : null,
        piece: piece
          ? {
              id: piece.id,
              title: piece.title,
            }
          : null,
        learning_list: learningList
          ? {
              id: learningList.id,
              name: learningList.name,
            }
          : null,
        comment: comment
          ? {
              id: comment.id,
              body: comment.body,
            }
          : null,
      }
    })
    .filter((row): row is FriendActivityItem => row !== null)
}

export async function loadFriendsPageData(searchQuery?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const trimmedQuery = (searchQuery ?? "").trim()

  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, created_at, accepted_at, requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const typedConnections = (connectionRows ?? []) as ConnectionRow[]

  const connectedUserIds = Array.from(
    new Set(
      typedConnections.flatMap((row) => [row.requester_id, row.addressee_id])
    )
  ).filter((id) => id !== user.id)

  let connectionProfilesById = new Map<string, ProfileSearchRow>()

  if (connectedUserIds.length > 0) {
    const { data: connectionProfiles, error: connectionProfilesError } =
      await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", connectedUserIds)

    if (connectionProfilesError) {
      throw new Error(connectionProfilesError.message)
    }

    connectionProfilesById = new Map(
      ((connectionProfiles ?? []) as ProfileSearchRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    )
  }

  const pendingIncomingRequests: PendingFriendRequest[] = typedConnections
    .filter((row) => row.status === "pending" && row.addressee_id === user.id)
    .map((row) => {
      const requester = connectionProfilesById.get(row.requester_id)

      return {
        connection_id: row.id,
        requester_id: row.requester_id,
        username: requester?.username ?? null,
        display_name: requester?.display_name ?? null,
        created_at: row.created_at,
      }
    })

  const acceptedFriends: AcceptedFriend[] = typedConnections
    .filter((row) => row.status === "accepted")
    .map((row) => {
      const otherUserId =
        row.requester_id === user.id ? row.addressee_id : row.requester_id
      const otherProfile = connectionProfilesById.get(otherUserId)

      return {
        connection_id: row.id,
        user_id: otherUserId,
        username: otherProfile?.username ?? null,
        display_name: otherProfile?.display_name ?? null,
        accepted_at: row.accepted_at,
      }
    })

  let searchMatches: FriendSearchMatch[] = []

  if (trimmedQuery) {
    searchMatches = await searchProfilesForSelection({
      query: trimmedQuery,
      currentUserId: user.id,
      excludeIds: connectedUserIds,
      limit: 10,
      requireCompareDiscoverability: false,
    })
  }

  const acceptedFriendIds = acceptedFriends.map((friend) => friend.user_id)

  const recentFriendActivity = await loadRecentFriendActivity(
    supabase,
    acceptedFriendIds,
    25
  )

  return {
    user,
    pendingIncomingRequests,
    acceptedFriends,
    searchMatches,
    searchQuery: trimmedQuery,
    recentFriendActivity,
  }
}