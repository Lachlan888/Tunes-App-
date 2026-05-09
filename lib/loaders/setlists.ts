import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  Piece,
  Setlist,
  SetlistInviteOption,
  SetlistItemWithCoverage,
  SetlistMember,
  SetlistMemberCoverage,
  SetlistMemberProfile,
  SetlistOverview,
  SetlistPendingInvite,
} from "@/lib/types"

type MembershipRow = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
  setlists: Setlist | Setlist[] | null
}

type SetlistMemberRow = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
}

type SetlistItemRow = {
  id: number
  setlist_id: number
  piece_id: number
  position: number
  performance_key: string | null
  notes: string | null
  chart_url: string | null
  chart_label: string | null
  chart_type: string | null
  added_by: string | null
  created_at: string
  updated_at: string | null
  pieces: Piece | Piece[] | null
}

type UserPieceRow = {
  id: number
  user_id: string
  piece_id: number
  stage: number
}

type UserKnownPieceRow = {
  user_id: string
  piece_id: number
}

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

function extractSetlist(setlist: Setlist | Setlist[] | null): Setlist | null {
  if (!setlist) return null
  return Array.isArray(setlist) ? setlist[0] ?? null : setlist
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

async function loadProfilesById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
) {
  const uniqueIds = Array.from(new Set(userIds)).filter(Boolean)

  if (uniqueIds.length === 0) {
    return new Map<string, SetlistMemberProfile>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(
    ((data ?? []) as SetlistMemberProfile[]).map((profile) => [
      profile.id,
      profile,
    ])
  )
}

export async function loadSetlistsPageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from("setlist_members")
    .select(
      `
      id,
      setlist_id,
      user_id,
      status,
      invited_by,
      created_at,
      responded_at,
      setlists (
        id,
        name,
        description,
        event_date,
        location,
        created_by,
        created_at,
        updated_at
      )
    `
    )
    .eq("user_id", user.id)
    .in("status", ["accepted", "pending"])
    .order("created_at", { ascending: false })

  if (membershipError) {
    throw new Error(membershipError.message)
  }

  const typedMembershipRows = (membershipRows ?? []) as MembershipRow[]

  const acceptedMemberships = typedMembershipRows.filter(
    (row) => row.status === "accepted"
  )

  const pendingMemberships = typedMembershipRows.filter(
    (row) => row.status === "pending"
  )

  const acceptedSetlists = acceptedMemberships
    .map((row) => extractSetlist(row.setlists))
    .filter((setlist): setlist is Setlist => Boolean(setlist))

  const acceptedSetlistIds = acceptedSetlists.map((setlist) => setlist.id)

  let memberCountBySetlistId = new Map<number, number>()
  let tuneCountBySetlistId = new Map<number, number>()
  let itemRowsBySetlistId = new Map<number, SetlistItemRow[]>()
  let acceptedMemberRowsBySetlistId = new Map<number, SetlistMemberRow[]>()
  let knownByEveryoneCountBySetlistId = new Map<number, number>()
  let gapTuneCountBySetlistId = new Map<number, number>()

  if (acceptedSetlistIds.length > 0) {
    const [
      { data: allMembers, error: allMembersError },
      { data: allItems, error: allItemsError },
    ] = await Promise.all([
      supabase
        .from("setlist_members")
        .select(
          "id, setlist_id, user_id, status, invited_by, created_at, responded_at"
        )
        .in("setlist_id", acceptedSetlistIds)
        .eq("status", "accepted"),
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
            reference_url
          )
        `
        )
        .in("setlist_id", acceptedSetlistIds)
        .order("position", { ascending: true }),
    ])

    if (allMembersError) {
      throw new Error(allMembersError.message)
    }

    if (allItemsError) {
      throw new Error(allItemsError.message)
    }

    const typedMembers = (allMembers ?? []) as SetlistMemberRow[]
    const typedItems = (allItems ?? []) as SetlistItemRow[]

    for (const member of typedMembers) {
      const existing = acceptedMemberRowsBySetlistId.get(member.setlist_id) ?? []
      existing.push(member)
      acceptedMemberRowsBySetlistId.set(member.setlist_id, existing)
    }

    for (const item of typedItems) {
      const existing = itemRowsBySetlistId.get(item.setlist_id) ?? []
      existing.push(item)
      itemRowsBySetlistId.set(item.setlist_id, existing)
    }

    memberCountBySetlistId = new Map(
      Array.from(acceptedMemberRowsBySetlistId.entries()).map(
        ([setlistId, members]) => [setlistId, members.length]
      )
    )

    tuneCountBySetlistId = new Map(
      Array.from(itemRowsBySetlistId.entries()).map(([setlistId, items]) => [
        setlistId,
        items.length,
      ])
    )

    const allPieceIds = Array.from(
      new Set(typedItems.map((item) => item.piece_id))
    )

    const allMemberUserIds = Array.from(
      new Set(typedMembers.map((member) => member.user_id))
    )

    let knownRows: UserKnownPieceRow[] = []

    if (allPieceIds.length > 0 && allMemberUserIds.length > 0) {
      const { data: userKnownPieces, error: knownError } = await supabase
        .from("user_known_pieces")
        .select("user_id, piece_id")
        .in("user_id", allMemberUserIds)
        .in("piece_id", allPieceIds)

      if (knownError) {
        throw new Error(knownError.message)
      }

      knownRows = (userKnownPieces ?? []) as UserKnownPieceRow[]
    }

    const knownKeySet = new Set(
      knownRows.map((row) => `${row.user_id}:${row.piece_id}`)
    )

    for (const setlist of acceptedSetlists) {
      const members = acceptedMemberRowsBySetlistId.get(setlist.id) ?? []
      const items = itemRowsBySetlistId.get(setlist.id) ?? []

      const knownByEveryoneCount = items.filter((item) =>
        members.every((member) =>
          knownKeySet.has(`${member.user_id}:${item.piece_id}`)
        )
      ).length

      const gapTuneCount = items.filter((item) =>
        members.some(
          (member) => !knownKeySet.has(`${member.user_id}:${item.piece_id}`)
        )
      ).length

      knownByEveryoneCountBySetlistId.set(setlist.id, knownByEveryoneCount)
      gapTuneCountBySetlistId.set(setlist.id, gapTuneCount)
    }
  }

  const overviews: SetlistOverview[] = acceptedSetlists.map((setlist) => ({
    id: setlist.id,
    name: setlist.name,
    description: setlist.description,
    event_date: setlist.event_date,
    location: setlist.location,
    created_by: setlist.created_by,
    memberCount: memberCountBySetlistId.get(setlist.id) ?? 1,
    tuneCount: tuneCountBySetlistId.get(setlist.id) ?? 0,
    knownByEveryoneCount: knownByEveryoneCountBySetlistId.get(setlist.id) ?? 0,
    gapTuneCount: gapTuneCountBySetlistId.get(setlist.id) ?? 0,
    isCreator: setlist.created_by === user.id,
  }))

  const invitedByIds = pendingMemberships
    .map((row) => row.invited_by)
    .filter((value): value is string => Boolean(value))

  const profilesById = await loadProfilesById(supabase, invitedByIds)

  const pendingInvites: SetlistPendingInvite[] = pendingMemberships
    .map((row) => {
      const setlist = extractSetlist(row.setlists)
      if (!setlist) return null

      return {
        membership_id: row.id,
        setlist,
        invited_by_profile: row.invited_by
          ? profilesById.get(row.invited_by) ?? null
          : null,
      }
    })
    .filter((invite): invite is SetlistPendingInvite => Boolean(invite))

  return {
    user,
    setlists: overviews,
    pendingInvites,
  }
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

  const items: SetlistItemWithCoverage[] = typedItemRows.map((item) => {
    const piece = extractPiece(item.pieces)

    const coverage: SetlistMemberCoverage[] = acceptedMemberRows.map(
      (member) => {
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
      }
    )

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
      coverage,
    }
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

  const inviteOptions: SetlistInviteOption[] = availableFriendIds
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