import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearningList, UserKnownPiece, UserPiece } from "@/lib/types"
import type {
  LearningListItemRow,
  PracticeProfileRow,
  UserPieceMetadata,
} from "./types"

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
      .select("id, name, description")
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
  const learningListItemsResult =
    ownedListIds.length > 0
      ? await supabase
          .from("learning_list_items")
          .select("learning_list_id, piece_id")
          .eq("piece_id", pieceId)
          .in("learning_list_id", ownedListIds)
      : { data: [], error: null }

  return {
    typedUserPieceMetadata:
      (userPieceMetadataResult.data as UserPieceMetadata | null) ?? null,
    typedUserPiece: (userPieceResult.data as UserPiece | null) ?? null,
    typedUserKnownPiece:
      (userKnownPieceResult.data as UserKnownPiece | null) ?? null,
    typedLearningLists,
    typedLearningListItems:
      (learningListItemsResult.data as LearningListItemRow[] | null) ?? [],
    practiceDiaryEnabled: Boolean(
      (practiceProfileResult.data as PracticeProfileRow | null)
        ?.practice_diary_enabled
    ),
  }
}
