import type { createClient } from "@/lib/supabase/server"
import type { Piece } from "@/lib/types"
import type { PieceIdRow } from "./types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadUserRepertoirePieceIds(
  supabase: SupabaseServerClient,
  userId: string,
  options: { includePractice: boolean }
): Promise<Set<number>> {
  const { data: knownRows, error: knownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", userId)

  if (knownError) {
    throw new Error(knownError.message)
  }

  const knownPieceIds = ((knownRows ?? []) as PieceIdRow[]).map(
    (row) => row.piece_id
  )

  if (!options.includePractice) {
    return new Set<number>(knownPieceIds)
  }

  const { data: practiceRows, error: practiceError } = await supabase
    .from("user_pieces")
    .select("piece_id")
    .eq("user_id", userId)
    .eq("status", "learning")

  if (practiceError) {
    throw new Error(practiceError.message)
  }

  return new Set<number>([
    ...knownPieceIds,
    ...((practiceRows ?? []) as PieceIdRow[]).map((row) => row.piece_id),
  ])
}

export function intersectSets(base: Set<number>, other: Set<number>) {
  return new Set<number>(Array.from(base).filter((pieceId) => other.has(pieceId)))
}

export async function loadMutualPieces(
  supabase: SupabaseServerClient,
  mutualPieceIds: Set<number>
): Promise<Piece[]> {
  if (mutualPieceIds.size === 0) {
    return []
  }

  const { data: mutualPiecesRows, error: mutualPiecesError } = await supabase
    .from("pieces")
    .select(`
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
    `)
    .in("id", Array.from(mutualPieceIds))
    .order("title", { ascending: true })

  if (mutualPiecesError) {
    throw new Error(mutualPiecesError.message)
  }

  return (mutualPiecesRows ?? []) as Piece[]
}