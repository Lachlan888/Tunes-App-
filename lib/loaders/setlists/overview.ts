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
  UserPieceRow,
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
  const itemRowsBySetlistId = new Map<number, SetlistItemRow[]>()
  const acceptedMemberRowsBySetlistId = new Map<number, SetlistMemberRow[]>()
  const readyCountBySetlistId = new Map<number, number>()
  const practiceCountBySetlistId = new Map<number, number>()
  const newToMeCountBySetlistId = new Map<number, number>()
  const collaboratorLabelsBySetlistId = new Map<number, string[]>()

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
            composer,
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

    let knownRows: UserKnownPieceRow[] = []
    let practiceRows: UserPieceRow[] = []

    if (allPieceIds.length > 0) {
      const [
        { data: userKnownPieces, error: knownError },
        { data: userPracticePieces, error: practiceError },
      ] = await Promise.all([
        supabase
          .from("user_known_pieces")
          .select("user_id, piece_id")
          .eq("user_id", user.id)
          .in("piece_id", allPieceIds),
        supabase
          .from("user_pieces")
          .select("id, user_id, piece_id, stage")
          .eq("user_id", user.id)
          .in("piece_id", allPieceIds),
      ])

      if (knownError) {
        throw new Error(knownError.message)
      }

      if (practiceError) {
        throw new Error(practiceError.message)
      }

      knownRows = (userKnownPieces ?? []) as UserKnownPieceRow[]
      practiceRows = (userPracticePieces ?? []) as UserPieceRow[]
    }

    const knownPieceIds = new Set(knownRows.map((row) => row.piece_id))
    const practicePieceIds = new Set(practiceRows.map((row) => row.piece_id))
    const profilesById = await loadProfilesById(
      supabase,
      Array.from(new Set(typedMembers.map((member) => member.user_id)))
    )

    for (const setlist of acceptedSetlists) {
      const members = acceptedMemberRowsBySetlistId.get(setlist.id) ?? []
      const items = itemRowsBySetlistId.get(setlist.id) ?? []
      const readyCount = items.filter((item) =>
        knownPieceIds.has(item.piece_id)
      ).length
      const practiceCount = items.filter((item) =>
        practicePieceIds.has(item.piece_id)
      ).length

      readyCountBySetlistId.set(setlist.id, readyCount)
      practiceCountBySetlistId.set(setlist.id, practiceCount)
      newToMeCountBySetlistId.set(
        setlist.id,
        Math.max(0, items.length - readyCount - practiceCount)
      )
      collaboratorLabelsBySetlistId.set(
        setlist.id,
        members.slice(0, 4).map((member) => {
          const profile = profilesById.get(member.user_id)
          return profile?.display_name || profile?.username || "Musician"
        })
      )
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
    readyCount: readyCountBySetlistId.get(setlist.id) ?? 0,
    practiceCount: practiceCountBySetlistId.get(setlist.id) ?? 0,
    newToMeCount: newToMeCountBySetlistId.get(setlist.id) ?? 0,
    collaboratorLabels: collaboratorLabelsBySetlistId.get(setlist.id) ?? [],
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
