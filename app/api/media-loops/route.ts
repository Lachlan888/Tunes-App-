import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { UserPieceMediaLoop } from "@/lib/types"

function parsePieceId(value: string | null) {
  const pieceId = Number(value)

  return Number.isInteger(pieceId) && pieceId > 0 ? pieceId : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pieceId = parsePieceId(searchParams.get("piece_id"))
  const youtubeVideoId = searchParams.get("youtube_video_id")?.trim() || ""

  if (!pieceId) {
    return NextResponse.json(
      { error: "piece_id must be a positive integer" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  let query = supabase
    .from("user_piece_media_loops")
    .select(
      "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)

  if (youtubeVideoId) {
    query = query.eq("youtube_video_id", youtubeVideoId)
  }

  const { data, error } = await query.order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: "Couldn’t load media loops" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    loops: (data ?? []) as UserPieceMediaLoop[],
  })
}
