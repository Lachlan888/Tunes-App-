import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { OwnProfileData, Profile, UserInstrument } from "@/lib/types"

export async function loadOwnProfileData(): Promise<OwnProfileData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        username,
        display_name,
        bio,
        show_identity,
        show_instruments,
        show_public_lists_on_profile,
        show_repertoire_summary,
        show_comment_activity,
        show_compare_discoverability,
        compare_requires_friend
      `
    )
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  const { data: instruments, error: instrumentsError } = await supabase
    .from("user_instruments")
    .select("id, instrument_name, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("id", { ascending: true })

  if (instrumentsError) {
    throw new Error(instrumentsError.message)
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: (profile ?? null) as Profile | null,
    instruments: (instruments ?? []) as UserInstrument[],
  }
}