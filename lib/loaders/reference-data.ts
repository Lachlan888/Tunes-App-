import { unstable_cache } from "next/cache"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { PieceFilterOption, StyleOption } from "@/lib/types"

function createReferenceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

async function loadActiveStyleOptionsUncached(): Promise<StyleOption[]> {
  const supabase = createReferenceClient()

  const { data, error } = await supabase
    .from("styles")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as StyleOption[]
}

async function loadCanonicalPieceFilterOptionsUncached(
  searchQuery = ""
): Promise<PieceFilterOption[]> {
  const supabase = createReferenceClient()
  const trimmedSearchQuery = searchQuery.trim()

  let query = supabase.from("pieces").select(`
    key,
    style,
    time_signature,
    piece_styles (
      style_id,
      styles (
        id,
        slug,
        label
      )
    )
  `)

  if (trimmedSearchQuery) {
    query = query.ilike("title", `%${trimmedSearchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PieceFilterOption[]
}

export const loadActiveStyleOptions = unstable_cache(
  loadActiveStyleOptionsUncached,
  ["active-style-options"],
  {
    revalidate: 3600,
    tags: ["active-style-options"],
  }
)

export const loadCanonicalPieceFilterOptions = unstable_cache(
  loadCanonicalPieceFilterOptionsUncached,
  ["canonical-piece-filter-options"],
  {
    revalidate: 900,
    tags: ["canonical-piece-filter-options"],
  }
)