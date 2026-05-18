import type { SupabaseServerClient } from "@/lib/auth/session"

export type AppEventType =
  | "created_tune"
  | "removed_tune_from_my_app"
  | "deleted_canonical_tune"
  | "updated_missing_tune_details"
  | "created_list"
  | "created_list_inline"
  | "added_tune_to_list"
  | "imported_public_list"
  | "imported_selected_public_list_items"
  | "updated_list"
  | "removed_tune_from_list"
  | "deleted_list"
  | "toggled_list_visibility"
  | "created_setlist"
  | "updated_setlist"
  | "invited_setlist_collaborator"
  | "accepted_setlist_invite"
  | "declined_setlist_invite"
  | "added_tune_to_setlist"
  | "updated_setlist_item"
  | "removed_tune_from_setlist"
  | "moved_setlist_item"
  | "deleted_setlist"
  | "sent_friend_request"
  | "accepted_friend_request"
  | "created_practice_focus"
  | "updated_practice_focus"
  | "archived_practice_focus"
  | "deleted_practice_focus"
  | "added_tune_to_focus"
  | "removed_tune_from_focus"
  | "created_badge"
  | "updated_badge"
  | "deleted_badge"
  | "submitted_feedback"

export type AppEventInput = {
  supabase: SupabaseServerClient
  userId: string | null
  eventType: AppEventType
  pagePath?: string | null
  entityType?: string | null
  entityId?: string | number | null
  metadata?: Record<string, unknown> | null
}

export async function recordAppEvent({
  supabase,
  userId,
  eventType,
  pagePath = null,
  entityType = null,
  entityId = null,
  metadata = null,
}: AppEventInput) {
  const { error } = await supabase.from("app_events").insert({
    user_id: userId,
    event_type: eventType,
    page_path: pagePath,
    entity_type: entityType,
    entity_id:
      entityId === null || entityId === undefined ? null : String(entityId),
    metadata: metadata ?? {},
  })

  if (error) {
    console.error("Error recording app event:", {
      eventType,
      userId,
      pagePath,
      entityType,
      entityId,
      metadata,
      error,
    })
  }
}