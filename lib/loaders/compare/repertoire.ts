import type { createClient } from "@/lib/supabase/server"
import { readBoundedRows } from "@/lib/loaders/bounded-read"
import type { Piece } from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadMutualPieces(
  supabase: SupabaseServerClient,
  mutualPieceIds: Set<number>
): Promise<Piece[]> {
  if (mutualPieceIds.size === 0) {
    return []
  }

  const ids = Array.from(mutualPieceIds)
  const pieces: Piece[] = []
  // Bound URL length and each response; no per-tune requests.
  for (let start = 0; start < ids.length; start += 200) {
    const batch = await readBoundedRows((from, to) => supabase.from("pieces")
      .select(`id,title,key,style,time_signature,composer,reference_url,
        piece_styles(style_id,styles(id,slug,label))`, { count: "exact" })
      .in("id", ids.slice(start, start + 200)).order("id").range(from, to))
    pieces.push(...batch as Piece[])
  }
  return pieces.sort((a, b) => a.title.localeCompare(b.title) || a.id - b.id)
}
