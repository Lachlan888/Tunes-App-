import { createClient } from "@/lib/supabase/server"

export const ALLOWED_REACTIONS = new Set(["good_craic"])

export type ActivityEventRow = {
  id: number
  user_id: string
  event_type: string
  piece_id: number | null
  learning_list_id: number | null
  comment_id: number | null
  metadata: Record<string, unknown> | null
}

export type PieceCommentRow = {
  id: number
  piece_id: number
  user_id: string
}

export type ActivityReplyRow = {
  id: number
  activity_event_id: number
  user_id: string
  piece_comment_id: number | null
  user_activity_events:
    | {
        piece_id: number | null
      }
    | {
        piece_id: number | null
      }[]
    | null
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export function cleanRedirectTo(
  value: string | FormDataEntryValue | null,
  fallback: string
) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

export function previewBody(body: string) {
  const cleaned = body.replace(/\s+/g, " ").trim()
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}…` : cleaned
}

export function normaliseJoinedActivityEvent(
  value:
    | {
        piece_id: number | null
      }
    | {
        piece_id: number | null
      }[]
    | null
) {
  return Array.isArray(value) ? value[0] ?? null : value
}

export function getMetadataNumber(
  metadata: Record<string, unknown> | null,
  key: string
) {
  const value = metadata?.[key]

  if (typeof value === "number" && Number.isInteger(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  }

  return null
}

export function getMetadataString(
  metadata: Record<string, unknown> | null,
  key: string
) {
  const value = metadata?.[key]
  return typeof value === "string" ? value : null
}

export async function loadActivityEvent(
  supabase: SupabaseServerClient,
  activityEventId: number
) {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select(
      "id, user_id, event_type, piece_id, learning_list_id, comment_id, metadata"
    )
    .eq("id", activityEventId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as ActivityEventRow | null) ?? null
}

export async function usersAreAcceptedFriends(
  supabase: SupabaseServerClient,
  userIdA: string,
  userIdB: string
) {
  if (userIdA === userIdB) {
    return true
  }

  const { data, error } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${userIdA},addressee_id.eq.${userIdB}),and(requester_id.eq.${userIdB},addressee_id.eq.${userIdA})`
    )
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

export async function ensureCanInteractWithActivity(options: {
  supabase: SupabaseServerClient
  currentUserId: string
  activityEvent: ActivityEventRow
}) {
  if (options.activityEvent.user_id === options.currentUserId) {
    return true
  }

  return usersAreAcceptedFriends(
    options.supabase,
    options.currentUserId,
    options.activityEvent.user_id
  )
}

export async function getActivityReactionCount(options: {
  supabase: SupabaseServerClient
  activityEventId: number
  reactionType: string
}) {
  const { count, error } = await options.supabase
    .from("activity_reactions")
    .select("id", { count: "exact", head: true })
    .eq("activity_event_id", options.activityEventId)
    .eq("reaction_type", options.reactionType)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}