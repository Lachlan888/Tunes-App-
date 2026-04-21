import { createClient } from "@/lib/supabase/server"
import type {
  Profile,
  PublicProfileData,
  PublicProfileList,
  RepertoireSummary,
  UserInstrument,
} from "@/lib/types"

type LearningListItemRow = {
  learning_list_id: number
}

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

export async function loadPublicProfileData(
  username: string
): Promise<PublicProfileData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const viewerId = user?.id ?? null
  const cleanUsername = username.trim().toLowerCase()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        username,
        display_name,
        bio,
        show_identity,
        show_instruments,
        show_public_lists_on_profile,
        show_repertoire_summary,
        show_comment_activity,
        show_compare_discoverability,
        compare_requires_friend
      `
    )
    .eq("username", cleanUsername)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile) {
    return {
      viewerId,
      isOwnProfile: false,
      isAcceptedFriend: false,
      hasPendingOutgoingRequest: false,
      hasPendingIncomingRequest: false,
      pendingIncomingConnectionId: null,
      canCompare: false,
      compareBlockedByFriendship: false,
      profile: null,
      instruments: [],
      publicLists: [],
      repertoireSummary: null,
    }
  }

  const typedProfile = profile as Profile
  const isOwnProfile = viewerId === typedProfile.id

  let instruments: UserInstrument[] = []
  if (typedProfile.show_instruments) {
    const { data: instrumentRows, error: instrumentsError } = await supabase
      .from("user_instruments")
      .select("id, instrument_name, position")
      .eq("user_id", typedProfile.id)
      .order("position", { ascending: true })
      .order("id", { ascending: true })

    if (instrumentsError) {
      throw new Error(instrumentsError.message)
    }

    instruments = (instrumentRows ?? []) as UserInstrument[]
  }

  let publicLists: PublicProfileList[] = []
  if (typedProfile.show_public_lists_on_profile) {
    const { data: publicListRows, error: publicListsError } = await supabase
      .from("learning_lists")
      .select("id, name, description, visibility")
      .eq("user_id", typedProfile.id)
      .eq("visibility", "public")
      .order("name", { ascending: true })

    if (publicListsError) {
      throw new Error(publicListsError.message)
    }

    const typedPublicLists =
      ((publicListRows ?? []) as Array<{
        id: number
        name: string
        description: string | null
        visibility: string
      }>) ?? []

    const publicListIds = typedPublicLists.map((list) => list.id)
    let tuneCountsByListId: Record<number, number> = {}

    if (publicListIds.length > 0) {
      const { data: listItems, error: listItemsError } = await supabase
        .from("learning_list_items")
        .select("learning_list_id")
        .in("learning_list_id", publicListIds)

      if (listItemsError) {
        throw new Error(listItemsError.message)
      }

      const typedListItems = (listItems ?? []) as LearningListItemRow[]

      tuneCountsByListId = typedListItems.reduce<Record<number, number>>(
        (acc, item) => {
          acc[item.learning_list_id] = (acc[item.learning_list_id] ?? 0) + 1
          return acc
        },
        {}
      )
    }

    publicLists = typedPublicLists.map((list) => ({
      ...list,
      tune_count: tuneCountsByListId[list.id] ?? 0,
    }))
  }

  let isAcceptedFriend = false
  let hasPendingOutgoingRequest = false
  let hasPendingIncomingRequest = false
  let pendingIncomingConnectionId: number | null = null

  if (viewerId && !isOwnProfile) {
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .select("id, status, requester_id, addressee_id")
      .or(
        `and(requester_id.eq.${viewerId},addressee_id.eq.${typedProfile.id}),and(requester_id.eq.${typedProfile.id},addressee_id.eq.${viewerId})`
      )
      .maybeSingle()

    if (connectionError) {
      throw new Error(connectionError.message)
    }

    const typedConnection = (connection as ConnectionRow | null) ?? null

    if (typedConnection) {
      if (typedConnection.status === "accepted") {
        isAcceptedFriend = true
      } else if (typedConnection.status === "pending") {
        if (typedConnection.requester_id === viewerId) {
          hasPendingOutgoingRequest = true
        } else {
          hasPendingIncomingRequest = true
          pendingIncomingConnectionId = typedConnection.id
        }
      }
    }
  }

  let repertoireSummary: RepertoireSummary | null = null

  if (typedProfile.show_repertoire_summary) {
    const [
      { count: practiceCount, error: practiceCountError },
      { count: knownCount, error: knownCountError },
    ] = await Promise.all([
      supabase
        .from("user_pieces")
        .select("*", { count: "exact", head: true })
        .eq("user_id", typedProfile.id),
      supabase
        .from("user_known_pieces")
        .select("*", { count: "exact", head: true })
        .eq("user_id", typedProfile.id),
    ])

    if (practiceCountError) {
      throw new Error(practiceCountError.message)
    }

    if (knownCountError) {
      throw new Error(knownCountError.message)
    }

    repertoireSummary = {
      known_count: knownCount ?? 0,
      practice_count: practiceCount ?? 0,
    }
  }

  const compareBlockedByFriendship =
    typedProfile.show_compare_discoverability &&
    typedProfile.compare_requires_friend &&
    !isOwnProfile &&
    !isAcceptedFriend

  const canCompare =
    typedProfile.show_compare_discoverability &&
    !isOwnProfile &&
    (!typedProfile.compare_requires_friend || isAcceptedFriend)

  return {
    viewerId,
    isOwnProfile,
    isAcceptedFriend,
    hasPendingOutgoingRequest,
    hasPendingIncomingRequest,
    pendingIncomingConnectionId,
    canCompare,
    compareBlockedByFriendship,
    profile: typedProfile,
    instruments,
    publicLists,
    repertoireSummary,
  }
}