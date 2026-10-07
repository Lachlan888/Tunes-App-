import { createClient } from "@/lib/supabase/server"
import { requireAppAdmin } from "@/lib/auth/roles"
import { validateFestivalSlug } from "@/lib/festivals/validation"
import type {
  FestivalCollection,
  FestivalHub,
  FestivalSession,
  FestivalSessionCollection,
  FestivalSettings,
} from "@/lib/types/festivals"

const HUB_FIELDS = "id,slug,name,description,timezone,branding_image_url,branding_alt,programme_url,programme_snapshot_date,curator_credit,curator_profile_id,lifecycle,editorial_order"
const PUBLIC_HUB_FIELDS = "id,slug,name,description,timezone,branding_image_url,branding_alt,programme_url,programme_snapshot_date,curator_credit,lifecycle,editorial_order"

export type PublicFestivalHub = Omit<FestivalHub, "curator_profile_id">

export type PublicFestivalCollection = Omit<FestivalCollection, "profile_id"> & {
  learning_list: {
    id: number
    name: string
    description: string | null
  }
}

export type PublicFestivalSessionCollection = FestivalSessionCollection & {
  collection: {
    id: number
    display_title: string | null
    learning_list: { id: number; name: string }
  }
}

export type PublicFestivalSession = Omit<
  FestivalSession,
  "leader_profile_id" | "source_note" | "needs_review"
> & { collections: PublicFestivalSessionCollection[] }

export async function loadFestivalOwnerLaunch() {
  const { supabase, adminRole } = await requireAppAdmin()
  if (adminRole !== "owner") return null
  const [settingsResult, festivalsResult] = await Promise.all([
    supabase.from("festival_settings").select("mode_enabled,selected_festival_id").eq("singleton", true).single(),
    supabase.from("festival_hubs").select("id,name,lifecycle").order("name").limit(100),
  ])
  if (settingsResult.error || festivalsResult.error || !settingsResult.data) {
    return { status: "unavailable" as const }
  }
  return {
    status: "ready" as const,
    settings: settingsResult.data as FestivalSettings,
    festivals: (festivalsResult.data ?? []) as Array<Pick<FestivalHub, "id" | "name" | "lifecycle">>,
  }
}

export async function loadFestivalPromotion(): Promise<{
  settings: FestivalSettings
  festival: PublicFestivalHub | null
}> {
  const safe = { settings: { mode_enabled: false, selected_festival_id: null }, festival: null }
  try {
    const supabase = await createClient()
    const { data: settings, error } = await supabase
      .from("festival_settings")
      .select("mode_enabled,selected_festival_id")
      .eq("singleton", true)
      .maybeSingle()
    if (error || !settings?.mode_enabled || !settings.selected_festival_id) return safe
    const { data: festival, error: festivalError } = await supabase
      .from("festival_hubs")
      .select(PUBLIC_HUB_FIELDS)
      .eq("id", settings.selected_festival_id)
      .eq("lifecycle", "published")
      .maybeSingle()
    if (festivalError || !festival) return safe
    return { settings: settings as FestivalSettings, festival: festival as PublicFestivalHub }
  } catch {
    return safe
  }
}

export async function loadPublicFestivalFoundation(rawSlug: string) {
  let slug: string
  try {
    slug = validateFestivalSlug(rawSlug)
  } catch {
    return { status: "not_found" as const }
  }
  const supabase = await createClient()
  const { data: festival, error } = await supabase
    .from("festival_hubs")
    .select(PUBLIC_HUB_FIELDS)
    .eq("slug", slug)
    .in("lifecycle", ["published", "archived"])
    .maybeSingle()
  if (error || !festival) return { status: "not_found" as const }
  const [
    { data: collections, error: collectionError },
    { data: sessions, error: sessionError },
    { data: sessionCollections, error: sessionCollectionError },
  ] = await Promise.all([
    supabase.from("festival_collections").select("id,festival_id,learning_list_id,collection_kind,display_title,display_credit,tradition_label,editorial_order,learning_lists!inner(id,name,description,visibility)").eq("festival_id", festival.id).eq("learning_lists.visibility", "public").order("editorial_order").order("id").limit(100),
    supabase.from("festival_sessions").select("id,festival_id,title,leader_name,venue,local_date,local_start_time,local_end_time,status,editorial_order").eq("festival_id", festival.id).eq("needs_review", false).order("local_date", { ascending: true, nullsFirst: false }).order("local_start_time", { ascending: true, nullsFirst: false }).order("editorial_order").order("id").limit(200),
    supabase.from("festival_session_collections").select("festival_id,session_id,festival_collection_id,editorial_order,festival_collections!inner(id,display_title,learning_list_id,learning_lists!inner(id,name,visibility))").eq("festival_id", festival.id).eq("festival_collections.learning_lists.visibility", "public").order("session_id").order("editorial_order").order("festival_collection_id").limit(500),
  ])
  if (collectionError || sessionError || sessionCollectionError) throw new Error("festival_foundation_load_failed")
  const publicCollections = ((collections ?? []) as unknown as Array<
    Omit<FestivalCollection, "profile_id"> & {
      learning_lists:
        | { id: number; name: string; description: string | null; visibility: "public" }
        | Array<{ id: number; name: string; description: string | null; visibility: "public" }>
    }
  >).flatMap((collection) => {
    const list = Array.isArray(collection.learning_lists)
      ? collection.learning_lists[0]
      : collection.learning_lists
    if (!list) return []
    return [{
      id: collection.id,
      festival_id: collection.festival_id,
      learning_list_id: collection.learning_list_id,
      collection_kind: collection.collection_kind,
      display_title: collection.display_title,
      display_credit: collection.display_credit,
      tradition_label: collection.tradition_label,
      editorial_order: collection.editorial_order,
      learning_list: { id: list.id, name: list.name, description: list.description },
    }]
  })
  const publicSessionCollections = ((sessionCollections ?? []) as unknown as Array<
    FestivalSessionCollection & {
      festival_collections: {
        id: number
        display_title: string | null
        learning_list_id: number
        learning_lists:
          | { id: number; name: string; visibility: "public" }
          | Array<{ id: number; name: string; visibility: "public" }>
      }
    }
  >).flatMap((association) => {
    const list = Array.isArray(association.festival_collections.learning_lists)
      ? association.festival_collections.learning_lists[0]
      : association.festival_collections.learning_lists
    if (!list) return []
    return [{
      festival_id: association.festival_id,
      session_id: association.session_id,
      festival_collection_id: association.festival_collection_id,
      editorial_order: association.editorial_order,
      collection: {
        id: association.festival_collections.id,
        display_title: association.festival_collections.display_title,
        learning_list: { id: list.id, name: list.name },
      },
    }]
  })
  const publicSessions = ((sessions ?? []) as Omit<PublicFestivalSession, "collections">[]).map((session) => ({
    ...session,
    collections: publicSessionCollections.filter((association) => association.session_id === session.id),
  }))
  return {
    status: "loaded" as const,
    festival: festival as PublicFestivalHub,
    collections: publicCollections as PublicFestivalCollection[],
    sessions: publicSessions,
  }
}

export async function loadFestivalOwnerFoundation() {
  const { supabase, adminRole } = await requireAppAdmin()
  if (adminRole !== "owner") throw new Error("festival_owner_required")
  const [
    { data: settings, error: settingsError },
    { data: festivals, error: festivalsError },
    { data: collections, error: collectionsError },
    { data: sessions, error: sessionsError },
    { data: sessionCollections, error: sessionCollectionsError },
    { data: publicLists, error: publicListsError },
  ] = await Promise.all([
    supabase.from("festival_settings").select("mode_enabled,selected_festival_id").eq("singleton", true).single(),
    supabase.from("festival_hubs").select(HUB_FIELDS).order("editorial_order").order("id").limit(100),
    supabase
      .from("festival_collections")
      .select("id,festival_id,learning_list_id,collection_kind,display_title,display_credit,profile_id,tradition_label,editorial_order,learning_lists!inner(id,name,visibility)")
      .eq("learning_lists.visibility", "public")
      .order("festival_id")
      .order("editorial_order")
      .order("id")
      .limit(500),
    supabase
      .from("festival_sessions")
      .select("id,festival_id,title,leader_name,leader_profile_id,venue,local_date,local_start_time,local_end_time,status,source_note,needs_review,editorial_order")
      .order("festival_id")
      .order("local_date", { ascending: true, nullsFirst: false })
      .order("local_start_time", { ascending: true, nullsFirst: false })
      .order("editorial_order")
      .order("id")
      .limit(500),
    supabase
      .from("festival_session_collections")
      .select("festival_id,session_id,festival_collection_id,editorial_order")
      .order("festival_id")
      .order("session_id")
      .order("editorial_order")
      .limit(1000),
    supabase
      .from("learning_lists")
      .select("id,name")
      .eq("visibility", "public")
      .order("name")
      .order("id")
      .limit(500),
  ])
  if (settingsError || festivalsError || collectionsError || sessionsError || sessionCollectionsError || publicListsError) {
    throw new Error("festival_owner_load_failed")
  }
  const ownerCollections = ((collections ?? []) as unknown as Array<
    FestivalCollection & {
      learning_lists:
        | { id: number; name: string; visibility: "public" }
        | Array<{ id: number; name: string; visibility: "public" }>
    }
  >).flatMap((collection) => {
    const list = Array.isArray(collection.learning_lists)
      ? collection.learning_lists[0]
      : collection.learning_lists
    return list ? [{ ...collection, learning_lists: list }] : []
  })
  return {
    settings: settings as FestivalSettings,
    festivals: (festivals ?? []) as FestivalHub[],
    collections: ownerCollections,
    sessions: (sessions ?? []) as FestivalSession[],
    sessionCollections: (sessionCollections ?? []) as FestivalSessionCollection[],
    publicLists: (publicLists ?? []) as Array<{ id: number; name: string }>,
  }
}
