import type { createClient } from "@/lib/supabase/server"
import type {
  Piece,
  Setlist,
  SetlistMemberProfile,
} from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export function extractSetlist(
  setlist: Setlist | Setlist[] | null
): Setlist | null {
  if (!setlist) return null
  return Array.isArray(setlist) ? setlist[0] ?? null : setlist
}

export function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

export async function loadProfilesById(
  supabase: SupabaseServerClient,
  userIds: string[]
) {
  const uniqueIds = Array.from(new Set(userIds)).filter(Boolean)

  if (uniqueIds.length === 0) {
    return new Map<string, SetlistMemberProfile>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(
    ((data ?? []) as SetlistMemberProfile[]).map((profile) => [
      profile.id,
      profile,
    ])
  )
}