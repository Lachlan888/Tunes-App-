import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  Piece,
  Setlist,
  SetlistInviteOption,
  SetlistItemWithCoverage,
  SetlistMember,
  SetlistMemberCoverage,
} from "@/lib/types"
import { extractPiece, loadProfilesById } from "./helpers"
import type {
  ConnectionRow,
  SetlistItemRow,
  SetlistMemberRow,
  UserKnownPieceRow,
  UserPieceRow,
} from "./types"

function buildCoverageForItem({
  item,
  acceptedMemberRows,
  userPiecesByKey,
  userKnownPiecesByKey,
}: {
  item: SetlistItemRow
  acceptedMemberRows: SetlistMemberRow[]
  userPiecesByKey: Map<string, UserPieceRow>
  userKnownPiecesByKey: Set<string>
}): SetlistMemberCoverage[] {
  return acceptedMemberRows.map((member) => {
    const key = `${member.user_id}:${item.piece_id}`
    const userPiece = userPiecesByKey.get(key)

    if (userKnownPiecesByKey.has(key)) {
      return {
        user_id: member.user_id,
        status: "known",
        stage: null,
        user_piece_id: null,
      }
    }

    if (userPiece) {
      return {
        user_id: member.user_id,
        status: "practice",
        stage: userPiece.stage,
        user_piece_id: userPiece.id,
      }
    }

    return {
      user_id: member.user_id,
      status: "gap",
      stage: null,
      user_piece_id: null,
    }
  })
}

function mapSetlistItemsWithCoverage({
  itemRows,
  acceptedMemberRows,
  userPiecesByKey,
  userKnownPiecesByKey,
}: {
  itemRows: SetlistItemRow[]
  acceptedMemberRows: SetlistMemberRow[]
  userPiecesByKey: Map<string, UserPieceRow>
  userKnownPiecesByKey: Set<string>
}): SetlistItemWithCoverage[] {
  return itemRows.map((item) => {
    const piece = extractPiece(item.pieces)

    return {
      id: item.id,
      setlist_id: item.setlist_id,
      piece_id: item.piece_id,
      position: item.position,
      performance_key: item.performance_key,
      notes: item.notes,
      chart_url: item.chart_url,
      chart_label: item.chart_label,
      chart_type: item.chart_type,
      added_by: item.added_by,
      created_at: item.created_at,
      updated_at: item.updated_at,
      piece,
      coverage: buildCoverageForItem({
        item,
        acceptedMemberRows,
        userPiecesByKey,
        userKnownPiecesByKey,
      }),
    }
  })
}

function buildInviteOptions({
  userId,
  members,
  connectionRows,
  friendProfilesById,
}: {
  userId: string
  members: SetlistMember[]
  connectionRows: ConnectionRow[]
  friendProfilesById: Awaited<ReturnType<typeof loadProfilesById>>
}): SetlistInviteOption[] {
  const friendIds = Array.from(
    new Set(
      connectionRows.map((connection) =>
        connection.requester_id === userId
          ? connection.addressee_id
          : connection.requester_id
      )
    )
  )

  const existingSetlistUserIds = new Set(members.map((member) => member.user_id))

  const availableFriendIds = friendIds.filter(
    (friendId) => !existingSetlistUserIds.has(friendId)
  )

  return availableFriendIds
    .map((friendId) => {
      const profile = friendProfilesById.get(friendId)

      return {
        user_id: friendId,
        username: profile?.username ?? null,
        display_name: profile?.display_name ?? null,
      }
    })
    .sort((a, b) => {
      const aName = a.display_name || a.username || ""
      const bName = b.display_name || b.username || ""
      return aName.localeCompare(bName)
    })
}

export async function loadSetlistDetailData(rawSetlistId: string) {
  const setlistId = Number(rawSetlistId)

  if (!setlistId || Number.isNaN(setlistId)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: currentMembership, error: currentMembershipError } =
    await supabase
      .from("setlist_members")
      .select("id, status")
      .eq("setlist_id", setlistId)
      .eq("user_id", user.id)
      .in("status", ["accepted", "pending"])
      .maybeSingle()

  if (currentMembershipError) {
    throw new Error(currentMembershipError.message)
  }

  if (!currentMembership) {
    notFound()
  }

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select(
      "id, name, description, event_date, location, created_by, created_at, updated_at"
    )
    .eq("id", setlistId)
    .maybeSingle()

  if (setlistError) {
    throw new Error(setlistError.message)
  }

  if (!setlist) {
    notFound()
  }

  const [
    { data: memberRows, error: memberRowsError },
    { data: itemRows, error: itemRowsError },
    { data: allPieces, error: allPiecesError },
    { data: connectionRows, error: connectionRowsError },
  ] = await Promise.all([
    supabase
      .from("setlist_members")
      .select(
        "id, setlist_id, user_id, status, invited_by, created_at, responded_at"
      )
      .eq("setlist_id", setlistId)
      .in("status", ["accepted", "pending"])
      .order("created_at", { ascending: true }),

    supabase
      .from("setlist_items")
      .select(
        `
        id,
        setlist_id,
        piece_id,
        position,
        performance_key,
        notes,
        chart_url,
        chart_label,
        chart_type,
        added_by,
        created_at,
        updated_at,
        pieces (
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
        )
      `
      )
      .eq("setlist_id", setlistId)
      .order("position", { ascending: true }),

    supabase
      .from("pieces")
      .select("id, title, key, style, time_signature, reference_url")
      .order("title", { ascending: true })
      .limit(500),

    supabase
      .from("connections")
      .select("id, status, requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted"),
  ])

  if (memberRowsError) {
    throw new Error(memberRowsError.message)
  }

  if (itemRowsError) {
    throw new Error(itemRowsError.message)
  }

  if (allPiecesError) {
    throw new Error(allPiecesError.message)
  }

  if (connectionRowsError) {
    throw new Error(connectionRowsError.message)
  }

  const typedMemberRows = (memberRows ?? []) as SetlistMemberRow[]
  const acceptedMemberRows = typedMemberRows.filter(
    (member) => member.status === "accepted"
  )

  const acceptedMemberIds = acceptedMemberRows.map((member) => member.user_id)

  const profilesById = await loadProfilesById(
    supabase,
    typedMemberRows.flatMap((member) => [
      member.user_id,
      ...(member.invited_by ? [member.invited_by] : []),
    ])
  )

  const members: SetlistMember[] = typedMemberRows.map((member) => ({
    id: member.id,
    setlist_id: member.setlist_id,
    user_id: member.user_id,
    status: member.status,
    invited_by: member.invited_by,
    created_at: member.created_at,
    responded_at: member.responded_at,
    profile: profilesById.get(member.user_id) ?? null,
  }))

  const typedItemRows = (itemRows ?? []) as SetlistItemRow[]
  const pieceIds = typedItemRows.map((item) => item.piece_id)

  let userPieces: UserPieceRow[] = []
  let userKnownPieces: UserKnownPieceRow[] = []

  if (pieceIds.length > 0 && acceptedMemberIds.length > 0) {
    const [
      { data: userPieceRows, error: userPieceRowsError },
      { data: userKnownPieceRows, error: userKnownPieceRowsError },
    ] = await Promise.all([
      supabase
        .from("user_pieces")
        .select("id, user_id, piece_id, stage")
        .in("user_id", acceptedMemberIds)
        .in("piece_id", pieceIds),

      supabase
        .from("user_known_pieces")
        .select("user_id, piece_id")
        .in("user_id", acceptedMemberIds)
        .in("piece_id", pieceIds),
    ])

    if (userPieceRowsError) {
      throw new Error(userPieceRowsError.message)
    }

    if (userKnownPieceRowsError) {
      throw new Error(userKnownPieceRowsError.message)
    }

    userPieces = (userPieceRows ?? []) as UserPieceRow[]
    userKnownPieces = (userKnownPieceRows ?? []) as UserKnownPieceRow[]
  }

  const userPiecesByKey = new Map<string, UserPieceRow>()
  const userKnownPiecesByKey = new Set<string>()

  for (const userPiece of userPieces) {
    userPiecesByKey.set(`${userPiece.user_id}:${userPiece.piece_id}`, userPiece)
  }

  for (const userKnownPiece of userKnownPieces) {
    userKnownPiecesByKey.add(
      `${userKnownPiece.user_id}:${userKnownPiece.piece_id}`
    )
  }

  const items = mapSetlistItemsWithCoverage({
    itemRows: typedItemRows,
    acceptedMemberRows,
    userPiecesByKey,
    userKnownPiecesByKey,
  })

  const acceptedMembers = members.filter(
    (member) => member.status === "accepted"
  )

  const pendingMembers = members.filter((member) => member.status === "pending")

  const typedConnectionRows = (connectionRows ?? []) as ConnectionRow[]

  const friendIds = Array.from(
    new Set(
      typedConnectionRows.map((connection) =>
        connection.requester_id === user.id
          ? connection.addressee_id
          : connection.requester_id
      )
    )
  )

  const existingSetlistUserIds = new Set(members.map((member) => member.user_id))

  const availableFriendIds = friendIds.filter(
    (friendId) => !existingSetlistUserIds.has(friendId)
  )

  const friendProfilesById = await loadProfilesById(supabase, availableFriendIds)

  const inviteOptions = buildInviteOptions({
    userId: user.id,
    members,
    connectionRows: typedConnectionRows,
    friendProfilesById,
  })

  const knownByEveryoneCount = items.filter((item) =>
    item.coverage.every((coverage) => coverage.status === "known")
  ).length

  const gapTuneCount = items.filter((item) =>
    item.coverage.some((coverage) => coverage.status === "gap")
  ).length

  return {
    user,
    setlist: setlist as Setlist,
    currentMembershipStatus: currentMembership.status as "accepted" | "pending",
    members,
    acceptedMembers,
    pendingMembers,
    inviteOptions,
    items,
    allPieces: (allPieces ?? []) as Piece[],
    redirectTo: `/setlists/${setlistId}`,
    summary: {
      tuneCount: items.length,
      memberCount: acceptedMembers.length,
      knownByEveryoneCount,
      gapTuneCount,
    },
  }
}