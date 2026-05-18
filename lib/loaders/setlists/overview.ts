import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  Setlist,
  SetlistOverview,
  SetlistPendingInvite,
} from "@/lib/types"
import { extractSetlist, loadProfilesById } from "./helpers"
import type {
  MembershipRow,
  SetlistItemRow,
  SetlistMemberRow,
  UserKnownPieceRow,
} from "./types"

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