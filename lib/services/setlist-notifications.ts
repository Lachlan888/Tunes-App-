import type { SupabaseServerClient } from "@/lib/auth/session"
import { sendNotificationEmailForNotificationId } from "@/lib/services/notification-emails"

export type SetlistNotificationType =
  | "setlist_invite"
  | "setlist_invite_accepted"
  | "setlist_tune_added"
  | "setlist_tune_removed"
  | "setlist_item_updated"
  | "setlist_details_updated"

type NotifySetlistMembersInput = {
  supabase: SupabaseServerClient
  setlistId: number
  actorUserId: string
  notificationType: SetlistNotificationType
  pieceId?: number | null
  setlistItemId?: number | null
  bodyPreview?: string | null
}

export async function notifySingleUser({
  supabase,
  recipientUserId,
  actorUserId,
  notificationType,
  setlistId,
  pieceId = null,
  setlistItemId = null,
  bodyPreview = null,
}: NotifySetlistMembersInput & {
  recipientUserId: string
}) {
  if (recipientUserId === actorUserId) return null

  const { data: notification, error } = await supabase
    .from("user_notifications")
    .insert({
      recipient_user_id: recipientUserId,
      actor_user_id: actorUserId,
      notification_type: notificationType,
      setlist_id: setlistId,
      setlist_item_id: setlistItemId,
      piece_id: pieceId,
      body_preview: bodyPreview,
    })
    .select("id")
    .single()

  if (error || !notification) {
    console.error("Error creating setlist notification:", error)
    return null
  }

  if (notificationType !== "setlist_invite") {
    return notification
  }

  try {
    const emailResult = await sendNotificationEmailForNotificationId(
      notification.id
    )

    if (!emailResult.ok) {
      console.error("Setlist invite notification email did not send:", {
        notificationId: notification.id,
        status: emailResult.status,
        reason: emailResult.reason,
      })
    }
  } catch (emailError) {
    console.error("Setlist invite notification email failed unexpectedly:", {
      notificationId: notification.id,
      error: emailError,
    })
  }

  return notification
}

export async function notifySetlistMembers({
  supabase,
  setlistId,
  actorUserId,
  notificationType,
  pieceId = null,
  setlistItemId = null,
  bodyPreview = null,
}: NotifySetlistMembersInput) {
  const { data: members, error } = await supabase
    .from("setlist_members")
    .select("user_id")
    .eq("setlist_id", setlistId)
    .eq("status", "accepted")

  if (error) {
    console.error("Error loading setlist members for notification:", error)
    return
  }

  const rows = (members ?? [])
    .map((member) => member.user_id)
    .filter((recipientUserId) => recipientUserId !== actorUserId)
    .map((recipientUserId) => ({
      recipient_user_id: recipientUserId,
      actor_user_id: actorUserId,
      notification_type: notificationType,
      setlist_id: setlistId,
      setlist_item_id: setlistItemId,
      piece_id: pieceId,
      body_preview: bodyPreview,
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from("user_notifications")
    .insert(rows)

  if (insertError) {
    console.error("Error creating setlist notifications:", insertError)
  }
}
