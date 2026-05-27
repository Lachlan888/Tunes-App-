import type { SupabaseClient } from "@supabase/supabase-js"
import type { Piece, StyleOption } from "@/lib/types"
import type { ProfileRow } from "./types"

export async function loadTuneCore(
  supabase: SupabaseClient,
  pieceId: number
): Promise<{
  piece: Piece | null
  loadError: boolean
}> {
  const { data: piece, error } = await supabase
    .from("pieces")
    .select(
      "id, title, key, style, time_signature, composer, composer_user_id, reference_url"
    )
    .eq("id", pieceId)
    .maybeSingle()

  if (error) {
    return {
      piece: null,
      loadError: true,
    }
  }

  return {
    piece: (piece as Piece | null) ?? null,
    loadError: false,
  }
}

export async function loadComposerProfile(
  supabase: SupabaseClient,
  composerUserId: string | null | undefined
): Promise<ProfileRow | null> {
  if (!composerUserId) {
    return null
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", composerUserId)
    .maybeSingle()

  return (data as ProfileRow | null) ?? null
}

export async function loadComposerProfileOptions(
  supabase: SupabaseClient
): Promise<ProfileRow[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .order("username", { ascending: true })

  return (data as ProfileRow[] | null) ?? []
}

export async function loadStyleOptions(
  supabase: SupabaseClient
): Promise<StyleOption[]> {
  const { data } = await supabase
    .from("styles")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  return (data as StyleOption[] | null) ?? []
}
