import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types"
import type { PieceCommentRow, PieceLoreEntryRow } from "./types"

export async function loadTuneCommunity(
  supabase: SupabaseClient,
  pieceId: number,
  currentUserRole: UserRole
): Promise<{
  typedPieceComments: PieceCommentRow[]
  typedPieceLoreEntries: PieceLoreEntryRow[]
}> {
  const canSeeHiddenComments =
    currentUserRole === "moderator" || currentUserRole === "admin"

  let commentsQuery = supabase
    .from("piece_comments")
    .select(
      "id, body, created_at, user_id, parent_comment_id, moderation_status"
    )
    .eq("piece_id", pieceId)
    .order("created_at", { ascending: true })

  if (!canSeeHiddenComments) {
    commentsQuery = commentsQuery.eq("moderation_status", "visible")
  }

  const [pieceCommentsResult, pieceLoreEntriesResult] = await Promise.all([
    commentsQuery,

    supabase
      .from("piece_lore_entries")
      .select("id, category, entry_text, created_at, user_id")
      .eq("piece_id", pieceId)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true }),
  ])

  return {
    typedPieceComments:
      (pieceCommentsResult.data as PieceCommentRow[] | null) ?? [],
    typedPieceLoreEntries:
      (pieceLoreEntriesResult.data as PieceLoreEntryRow[] | null) ?? [],
  }
}