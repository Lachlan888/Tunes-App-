import { createClient } from "@/lib/supabase/server"
import type {
  LearningList,
  Piece,
  Profile,
  PublicProfileData,
  PublicProfileList,
  PublicProfileRepertoireTune,
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

type PieceIdRow = {
  piece_id: number
}

type ViewerListMembershipRow = {
  piece_id: number
  learning_list_id: number
  learning_lists:
    | {
        id: number
        name: string
      }
    | {
        id: number
        name: string
      }[]
    | null
}

function asSingleList(
  value:
    | {
        id: number
        name: string
      }
    | {
        id: number
        name: string
      }[]
    | null
) {
  return Array.isArray(value) ? value[0] ?? null : value
}

async function loadViewerLearningLists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  viewerId: string
): Promise<LearningList[]> {
  const { data: listRows, error: listRowsError } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility, is_imported")
    .eq("user_id", viewerId)
    .order("name", { ascending: true })

  if (listRowsError) {
    throw new Error(listRowsError.message)
  }

  return (listRows ?? []) as LearningList[]
}

async function loadProfileRepertoireTunes({
  supabase,
  profileUserId,
  viewerId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  profileUserId: string
  viewerId: string | null
}): Promise<PublicProfileRepertoireTune[]> {
  const [
    { data: knownRows, error: knownError },
    { data: practiceRows, error: practiceError },
  ] = await Promise.all([
    supabase
      .from("user_known_pieces")
      .select("piece_id")
      .eq("user_id", profileUserId),
    supabase
      .from("user_pieces")
      .select("piece_id")
      .eq("user_id", profileUserId)
      .eq("status", "learning"),
  ])

  if (knownError) {
    throw new Error(knownError.message)
  }

  if (practiceError) {
    throw new Error(practiceError.message)
  }

  const knownPieceIds = ((knownRows ?? []) as PieceIdRow[]).map(
    (row) => row.piece_id
  )

  const practicePieceIds = ((practiceRows ?? []) as PieceIdRow[]).map(
    (row) => row.piece_id
  )

  const profileStateByPieceId = new Map<number, "known" | "practice">()

  for (const pieceId of knownPieceIds) {
    profileStateByPieceId.set(pieceId, "known")
  }

  for (const pieceId of practicePieceIds) {
    if (!profileStateByPieceId.has(pieceId)) {
      profileStateByPieceId.set(pieceId, "practice")
    }
  }

  const repertoirePieceIds = Array.from(profileStateByPieceId.keys())

  if (repertoirePieceIds.length === 0) {
    return []
  }

  const [
    { data: pieceRows, error: pieceRowsError },
    viewerKnownResult,
    viewerPracticeResult,
    viewerListResult,
  ] = await Promise.all([
    supabase
      .from("pieces")
      .select(
        `
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
        `
      )
      .in("id", repertoirePieceIds)
      .order("title", { ascending: true }),
    viewerId
      ? supabase
          .from("user_known_pieces")
          .select("piece_id")
          .eq("user_id", viewerId)
          .in("piece_id", repertoirePieceIds)
      : Promise.resolve({ data: [], error: null }),
    viewerId
      ? supabase
          .from("user_pieces")
          .select("piece_id")
          .eq("user_id", viewerId)
          .eq("status", "learning")
          .in("piece_id", repertoirePieceIds)
      : Promise.resolve({ data: [], error: null }),
    viewerId
      ? supabase
          .from("learning_list_items")
          .select(
            `
              piece_id,
              learning_list_id,
              learning_lists!inner (
                id,
                name
              )
            `
          )
          .in("piece_id", repertoirePieceIds)
          .eq("learning_lists.user_id", viewerId)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (pieceRowsError) {
    throw new Error(pieceRowsError.message)
  }

  if (viewerKnownResult.error) {
    throw new Error(viewerKnownResult.error.message)
  }

  if (viewerPracticeResult.error) {
    throw new Error(viewerPracticeResult.error.message)
  }

  if (viewerListResult.error) {
    throw new Error(viewerListResult.error.message)
  }

  const viewerKnownPieceIds = new Set(
    ((viewerKnownResult.data ?? []) as PieceIdRow[]).map((row) => row.piece_id)
  )

  const viewerPracticePieceIds = new Set(
    ((viewerPracticeResult.data ?? []) as PieceIdRow[]).map(
      (row) => row.piece_id
    )
  )

  const viewerListRows =
    ((viewerListResult.data ?? []) as ViewerListMembershipRow[]) ?? []

  const viewerListIdsByPieceId = new Map<number, number[]>()
  const viewerListNamesByPieceId = new Map<number, string[]>()

  for (const row of viewerListRows) {
    const list = asSingleList(row.learning_lists)
    if (!list) continue

    const existingIds = viewerListIdsByPieceId.get(row.piece_id) ?? []
    const existingNames = viewerListNamesByPieceId.get(row.piece_id) ?? []

    viewerListIdsByPieceId.set(row.piece_id, [
      ...new Set([...existingIds, row.learning_list_id]),
    ])
    viewerListNamesByPieceId.set(row.piece_id, [
      ...new Set([...existingNames, list.name]),
    ])
  }

  return ((pieceRows ?? []) as Piece[]).map((piece) => {
    const viewerListIds = viewerListIdsByPieceId.get(piece.id) ?? []
    const viewerListNames = viewerListNamesByPieceId.get(piece.id) ?? []

    let viewer_state: PublicProfileRepertoireTune["viewer_state"] = "new_to_me"

    if (viewerPracticePieceIds.has(piece.id)) {
      viewer_state = "in_my_practice"
    } else if (viewerKnownPieceIds.has(piece.id)) {
      viewer_state = "known_by_me"
    } else if (viewerListIds.length > 0) {
      viewer_state = "in_my_lists"
    }

    return {
      ...piece,
      profile_state: profileStateByPieceId.get(piece.id) ?? "known",
      viewer_state,
      viewer_list_ids: viewerListIds,
      viewer_list_names: viewerListNames,
    }
  })
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
        show_repertoire_to_friends,
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
      canViewFullRepertoire: false,
      profile: null,
      instruments: [],
      publicLists: [],
      repertoireSummary: null,
      profileRepertoireTunes: [],
      viewerLearningLists: [],
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

  const canViewFullRepertoire =
    isOwnProfile ||
    (typedProfile.show_repertoire_to_friends && isAcceptedFriend)

  const [profileRepertoireTunes, viewerLearningLists] = await Promise.all([
    canViewFullRepertoire
      ? loadProfileRepertoireTunes({
          supabase,
          profileUserId: typedProfile.id,
          viewerId,
        })
      : Promise.resolve([]),
    viewerId && canViewFullRepertoire
      ? loadViewerLearningLists(supabase, viewerId)
      : Promise.resolve([]),
  ])

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
    canViewFullRepertoire,
    profile: typedProfile,
    instruments,
    publicLists,
    repertoireSummary,
    profileRepertoireTunes,
    viewerLearningLists,
  }
}