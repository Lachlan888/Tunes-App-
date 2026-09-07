import type { SupabaseClient } from "@supabase/supabase-js"
import type { TuneDetailView } from "@/lib/tune-detail-view"
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

type PublicListMembershipRow = {
  learning_lists: PublicListRow | PublicListRow[] | null
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

function getJoinedPublicList(
  value: PublicListRow | PublicListRow[] | null
): PublicListRow | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function loadTuneUserState(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number,
  scope: TuneDetailView
): Promise<{
  typedUserPieceMetadata: UserPieceMetadata | null
  typedUserPiece: UserPiece | null
  typedUserKnownPiece: UserKnownPiece | null
  typedLearningLists: LearningList[]
  typedLearningListItems: LearningListItemRow[]
  typedPublicTuneLists: PublicTuneListSummary[]
  practiceDiaryEnabled: boolean
}> {
  const needsPublicLists = scope === "about"
  const needsPracticeDiary = scope === "practice"

  const [
    userPieceMetadataResult,
    userPieceResult,
    userKnownPieceResult,
    learningListsResult,
    learningListItemsResult,
    publicListMembershipsResult,
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
      .from("learning_list_items")
      .select("learning_list_id, piece_id, learning_lists!inner(user_id)")
      .eq("piece_id", pieceId)
      .eq("learning_lists.user_id", userId),
    needsPublicLists
      ? supabase
          .from("learning_list_items")
          .select(
            `
              learning_lists!inner (
                id,
                name,
                description,
                user_id,
                visibility
              )
            `
          )
          .eq("piece_id", pieceId)
          .eq("learning_lists.visibility", "public")
          .neq("learning_lists.user_id", userId)
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    needsPracticeDiary
      ? supabase
          .from("profiles")
          .select("practice_diary_enabled")
          .eq("id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const publicLists = Array.from(
    new Map(
      ((publicListMembershipsResult.data ?? []) as PublicListMembershipRow[])
        .map((row) => getJoinedPublicList(row.learning_lists))
        .filter((list): list is PublicListRow => Boolean(list))
        .map((list) => [list.id, list])
    ).values()
  )
  const publicListOwnerIds = [
    ...new Set(publicLists.map((list) => list.user_id)),
  ]

  const { data: profileRows } = publicListOwnerIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", publicListOwnerIds)
    : { data: [] }

  const profilesById = ((profileRows as ProfileRow[] | null) ?? []).reduce(
    (profiles, profile) => {
      profiles[profile.id] = {
        username: profile.username,
        display_name: profile.display_name,
      }
      return profiles
    },
    {} as Record<
      string,
      { username: string | null; display_name: string | null }
    >
  )

  return {
    typedUserPieceMetadata:
      (userPieceMetadataResult.data as UserPieceMetadata | null) ?? null,
    typedUserPiece: (userPieceResult.data as UserPiece | null) ?? null,
    typedUserKnownPiece:
      (userKnownPieceResult.data as UserKnownPiece | null) ?? null,
    typedLearningLists:
      (learningListsResult.data as LearningList[] | null) ?? [],
    typedLearningListItems:
      (learningListItemsResult.data as LearningListItemRow[] | null) ?? [],
    typedPublicTuneLists: publicLists.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      user_id: list.user_id,
      profiles: profilesById[list.user_id] ?? null,
    })),
    practiceDiaryEnabled: Boolean(
      (practiceProfileResult.data as PracticeProfileRow | null)
        ?.practice_diary_enabled
    ),
  }
}
