import type { SupabaseClient } from "@supabase/supabase-js"
import type { Piece, StyleOption } from "@/lib/types"

export async function loadTuneCore(
  supabase: SupabaseClient,
  pieceId: number
): Promise<{
  piece: Piece | null
  loadError: boolean
}> {
  const { data: piece, error } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature, reference_url")
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