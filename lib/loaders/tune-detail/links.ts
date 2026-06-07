import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  PieceMediaLink,
  PieceSheetMusicLink,
  UserPieceMediaLoop,
} from "./types"

export async function loadTuneLinks(
  supabase: SupabaseClient,
  userId: string,
  pieceId: number
): Promise<{
  typedMediaLinks: PieceMediaLink[]
  typedSheetMusicLinks: PieceSheetMusicLink[]
  typedMediaLoops: UserPieceMediaLoop[]
}> {
  const [mediaLinksResult, sheetMusicLinksResult, mediaLoopsResult] =
    await Promise.all([
      supabase
        .from("piece_media_links")
        .select(
          "id, piece_id, url, label, media_type, notes, created_by, created_at"
        )
        .eq("piece_id", pieceId)
        .order("created_at", { ascending: true }),

      supabase
        .from("piece_sheet_music_links")
        .select("id, url, label")
        .eq("piece_id", pieceId)
        .order("created_at", { ascending: true }),

      supabase
        .from("user_piece_media_loops")
        .select(
          "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
        )
        .eq("user_id", userId)
        .eq("piece_id", pieceId)
        .order("created_at", { ascending: true }),
    ])

  return {
    typedMediaLinks:
      (mediaLinksResult.data as PieceMediaLink[] | null) ?? [],
    typedSheetMusicLinks:
      (sheetMusicLinksResult.data as PieceSheetMusicLink[] | null) ?? [],
    typedMediaLoops:
      (mediaLoopsResult.data as UserPieceMediaLoop[] | null) ?? [],
  }
}
