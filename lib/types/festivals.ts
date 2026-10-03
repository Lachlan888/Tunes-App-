export type FestivalLifecycle = "draft" | "published" | "archived"
export type FestivalCollectionKind = "artist" | "tradition" | "general"
export type FestivalSessionStatus = "scheduled" | "changed" | "cancelled"

export type FestivalHub = {
  id: number
  slug: string
  name: string
  description: string | null
  timezone: string
  branding_image_url: string | null
  branding_alt: string | null
  programme_url: string | null
  programme_snapshot_date: string | null
  curator_credit: string | null
  curator_profile_id: string | null
  lifecycle: FestivalLifecycle
  editorial_order: number
}

export type FestivalCollection = {
  id: number
  festival_id: number
  learning_list_id: number
  collection_kind: FestivalCollectionKind
  display_title: string | null
  display_credit: string | null
  profile_id: string | null
  tradition_label: string | null
  editorial_order: number
}

export type FestivalSession = {
  id: number
  festival_id: number
  title: string
  leader_name: string | null
  leader_profile_id: string | null
  venue: string | null
  local_date: string | null
  local_start_time: string | null
  local_end_time: string | null
  status: FestivalSessionStatus
  source_note: string | null
  needs_review: boolean
  editorial_order: number
}

export type FestivalSessionCollection = {
  festival_id: number
  session_id: number
  festival_collection_id: number
  editorial_order: number
}

export type FestivalSettings = {
  mode_enabled: boolean
  selected_festival_id: number | null
}
