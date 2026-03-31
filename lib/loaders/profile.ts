import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type OwnProfileData = {
  user: {
    id: string
    email: string | null
  }
  profile: {
    username: string
    display_name: string | null
    bio: string | null
    show_identity: boolean
    show_instruments: boolean
    show_public_lists_on_profile: boolean
    show_repertoire_summary: boolean
    show_comment_activity: boolean
    show_compare_discoverability: boolean
  } | null
  instruments: {
    id: number
    instrument_name: string
    position: number | null
  }[]
}

type ProfileRow = {
  username: string
  display_name: string | null
  bio: string | null
  show_identity: boolean
  show_instruments: boolean
  show_public_lists_on_profile: boolean
  show_repertoire_summary: boolean
  show_comment_activity: boolean
  show_compare_discoverability: boolean
}

type InstrumentRow = {
  id: number
  instrument_name: string
  position: number | null
}

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
        username,
        display_name,
        bio,
        show_identity,
        show_instruments,
        show_public_lists_on_profile,
        show_repertoire_summary,
        show_comment_activity,
        show_compare_discoverability
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
    profile: (profile ?? null) as ProfileRow | null,
    instruments: (instruments ?? []) as InstrumentRow[],
  }
}