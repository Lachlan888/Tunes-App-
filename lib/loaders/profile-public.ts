import { createClient } from "@/lib/supabase/server"

export type PublicProfileData = {
  profile: {
    id: string
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
  publicLists: {
    id: number
    name: string
    description: string | null
    visibility: string
    tune_count: number
  }[]
}

type ProfileRow = {
  id: string
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

type PublicListRow = {
  id: number
  name: string
  description: string | null
  visibility: string
}

type LearningListItemRow = {
  learning_list_id: number
}

export async function loadPublicProfileData(
  username: string
): Promise<PublicProfileData> {
  const supabase = await createClient()

  const cleanUsername = username.trim().toLowerCase()

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
        show_compare_discoverability
      `
    )
    .eq("username", cleanUsername)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile) {
    return {
      profile: null,
      instruments: [],
      publicLists: [],
    }
  }

  const typedProfile = profile as ProfileRow

  const { data: instruments, error: instrumentsError } = await supabase
    .from("user_instruments")
    .select("id, instrument_name, position")
    .eq("user_id", typedProfile.id)
    .order("position", { ascending: true })
    .order("id", { ascending: true })

  if (instrumentsError) {
    throw new Error(instrumentsError.message)
  }

  const { data: publicLists, error: publicListsError } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility")
    .eq("user_id", typedProfile.id)
    .eq("visibility", "public")
    .order("name", { ascending: true })

  if (publicListsError) {
    throw new Error(publicListsError.message)
  }

  const typedPublicLists = (publicLists as PublicListRow[] | null) ?? []
  const publicListIds = typedPublicLists.map((list) => list.id)

  let tuneCountsByListId: Record<number, number> = {}

  if (publicListIds.length > 0) {
    const { data: listItems, error: listItemsError } = await supabase
      .from("learning_list_items")
      .select("learning_list_id")
      .in("learning_list_id", publicListIds)

    if (listItemsError) {
      throw new Error(listItemsError.message)
    }

    const typedListItems = (listItems as LearningListItemRow[] | null) ?? []

    tuneCountsByListId = typedListItems.reduce<Record<number, number>>(
      (acc, item) => {
        acc[item.learning_list_id] = (acc[item.learning_list_id] ?? 0) + 1
        return acc
      },
      {}
    )
  }

  return {
    profile: typedProfile,
    instruments: (instruments ?? []) as InstrumentRow[],
    publicLists: typedPublicLists.map((list) => ({
      ...list,
      tune_count: tuneCountsByListId[list.id] ?? 0,
    })),
  }
}