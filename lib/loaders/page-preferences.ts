import { redirect } from "next/navigation"
import {
  getPageOptionsConfig,
  normalisePageOptionsPreferences,
} from "@/lib/page-options/configs"
import type { PageKey } from "@/lib/page-options/types"
import { createClient } from "@/lib/supabase/server"

type PagePreferenceRow = {
  preferences: unknown
}

export async function loadPagePreferences(pageKey: PageKey) {
  const config = getPageOptionsConfig(pageKey)

  if (!config) {
    throw new Error(`Unknown page options key: ${pageKey}`)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("user_page_preferences")
    .select("preferences")
    .eq("user_id", user.id)
    .eq("page_key", pageKey)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const row = data as PagePreferenceRow | null

  return normalisePageOptionsPreferences(row?.preferences ?? null, config)
}