import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearningList, UserKnownPiece, UserPiece } from "@/lib/types"
import type {
  LearningListItemRow,
  PracticeProfileRow,
  PublicTuneListSummary,
  UserPieceMetadata,
} from "./types"

type PublicListRow = {
  id: number
  name: string
  description: string | null
  user_id: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

export async function loadTuneUserState(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number
): Promise<{
  typedUserPieceMetadata: UserPieceMetadata | null
  typedUserPiece: UserPiece | null
  typedUserKnownPiece: UserKnownPiece | null
  typedLearningLists: LearningList[]
  typedLearningListItems: LearningListItemRow[]
  typedPublicTuneLists: PublicTuneListSummary[]
  practiceDiaryEnabled: boolean
}> {
  const [
    userPieceMetadataResult,
    userPieceResult,
    userKnownPieceResult,
    learningListsResult,
    practiceProfileResult,
  ] = await Promise.all([
    supabase
      .from("user_piece_metadata")
      .select("notes, preferred_reference_url, preferred_reference_label")
      .eq("user_id", userId)
      .eq("piece_id", pieceId)
      .maybeSingle(),

    supabase
      .from("user_pieces")
      .select("id, piece_id, status, next_review_due, stage")
      .eq("user_id", userId)
      .eq("piece_id", pieceId)
      .maybeSingle(),

    supabase
      .from("user_known_pieces")
      .select("id, piece_id")
      .eq("user_id", userId)
      .eq("piece_id", pieceId)
      .maybeSingle(),

    supabase
      .from("learning_lists")
      .select("id, name, description, visibility, is_imported")
      .eq("user_id", userId)
      .order("name", { ascending: true }),

    supabase
      .from("profiles")
      .select("practice_diary_enabled")
      .eq("id", userId)
      .maybeSingle(),
  ])

  const typedLearningLists =
    (learningListsResult.data as LearningList[] | null) ?? []
  const ownedListIds = typedLearningLists.map((list) => list.id)

  const [learningListItemsResult, tuneMembershipsResult] = await Promise.all([
    ownedListIds.length > 0
      ? supabase
          .from("learning_list_items")
          .select("learning_list_id, piece_id")
          .eq("piece_id", pieceId)
          .in("learning_list_id", ownedListIds)
      : Promise.resolve({ data: [], error: null }),

    supabase
      .from("learning_list_items")
      .select("learning_list_id")
      .eq("piece_id", pieceId)
      .limit(250),
  ])

  const tuneMembershipListIds = [
    ...new Set(
      ((tuneMembershipsResult.data as Array<{ learning_list_id: number }> | null) ??
        []).map((row) => row.learning_list_id)
    ),
  ]

  let publicLists: PublicListRow[] = []

  if (tuneMembershipListIds.length > 0) {
    const { data: publicListRows } = await supabase
      .from("learning_lists")
      .select("id, name, description, user_id")
      .in("id", tuneMembershipListIds)
      .eq("visibility", "public")
      .neq("user_id", userId)
      .order("name", { ascending: true })
      .limit(50)

    publicLists = (publicListRows as PublicListRow[] | null) ?? []
  }

  const publicListOwnerIds = [
    ...new Set(publicLists.map((list) => list.user_id)),
  ]

  let profilesById: Record<
    string,
    { username: string | null; display_name: string | null }
  > = {}

  if (publicListOwnerIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", publicListOwnerIds)

    profilesById = ((profileRows as ProfileRow[] | null) ?? []).reduce(
      (acc, profile) => {
        acc[profile.id] = {
          username: profile.username,
          display_name: profile.display_name,
        }

        return acc
      },
      {} as Record<
        string,
        { username: string | null; display_name: string | null }
      >
    )
  }

  const typedPublicTuneLists: PublicTuneListSummary[] = publicLists.map(
    (list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      user_id: list.user_id,
      profiles: profilesById[list.user_id] ?? null,
    })
  )

  return {
    typedUserPieceMetadata:
      (userPieceMetadataResult.data as UserPieceMetadata | null) ?? null,
    typedUserPiece: (userPieceResult.data as UserPiece | null) ?? null,
    typedUserKnownPiece:
      (userKnownPieceResult.data as UserKnownPiece | null) ?? null,
    typedLearningLists,
    typedLearningListItems:
      (learningListItemsResult.data as LearningListItemRow[] | null) ?? [],
    typedPublicTuneLists,
    practiceDiaryEnabled: Boolean(
      (practiceProfileResult.data as PracticeProfileRow | null)
        ?.practice_diary_enabled
    ),
  }
}