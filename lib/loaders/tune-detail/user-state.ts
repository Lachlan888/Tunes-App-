import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearningList, UserKnownPiece, UserPiece } from "@/lib/types"
import type {
  LearningListItemRow,
  PracticeProfileRow,
  UserPieceMetadata,
} from "./types"

export async function loadOwnedListIds(
  supabase: SupabaseClient,
  userId: string
): Promise<number[]> {
  const { data: ownedLists } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("user_id", userId)

  return (ownedLists ?? []).map((list) => list.id)
}

export async function loadTuneUserState(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number,
  ownedListIds: number[]
): Promise<{
  typedUserPieceMetadata: UserPieceMetadata | null
  typedUserPiece: UserPiece | null
  typedUserKnownPiece: UserKnownPiece | null
  typedLearningLists: LearningList[]
  typedLearningListItems: LearningListItemRow[]
  practiceDiaryEnabled: boolean
}> {
  const [
    userPieceMetadataResult,
    userPieceResult,
    userKnownPieceResult,
    learningListsResult,
    learningListItemsResult,
    practiceProfileResult,
  ] = await Promise.all([
    supabase
      .from("user_piece_metadata")
      .select("notes")
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
      .select("id, name, description")
      .eq("user_id", userId)
      .order("name", { ascending: true }),

    ownedListIds.length > 0
      ? supabase
          .from("learning_list_items")
          .select("learning_list_id, piece_id")
          .eq("piece_id", pieceId)
          .in("learning_list_id", ownedListIds)
      : Promise.resolve({ data: [], error: null }),

    supabase
      .from("profiles")
      .select("practice_diary_enabled")
      .eq("id", userId)
      .maybeSingle(),
  ])

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
    practiceDiaryEnabled: Boolean(
      (practiceProfileResult.data as PracticeProfileRow | null)
        ?.practice_diary_enabled
    ),
  }
}