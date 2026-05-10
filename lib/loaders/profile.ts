import { requireUserContext } from "@/lib/auth/session"
import type { OwnProfileData, Profile, UserInstrument } from "@/lib/types"

export async function loadOwnProfileData(): Promise<OwnProfileData> {
  const { supabase, user } = await requireUserContext()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        username,
        display_name,
        bio,
        role,
        show_identity,
        show_instruments,
        show_public_lists_on_profile,
        show_repertoire_summary,
        show_repertoire_to_friends,
        show_comment_activity,
        show_compare_discoverability,
        compare_requires_friend,
        practice_diary_enabled
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