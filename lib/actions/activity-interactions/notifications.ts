"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markNotificationRead(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const notificationId = Number(formData.get("notification_id"))

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return
  }

  const { data: notification, error: notificationError } = await supabase
    .from("user_notifications")
    .select("id, direct_message_id")
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)
    .maybeSingle()

  if (notificationError) {
    throw new Error(notificationError.message)
  }

  if (!notification) {
    return
  }

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  if (notification.direct_message_id) {
    await supabase
      .from("direct_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification.direct_message_id)
      .eq("recipient_user_id", user.id)
      .is("read_at", null)
  }

  revalidatePath("/inbox")
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: now })
    .eq("recipient_user_id", user.id)
    .is("read_at", null)
    .is("archived_at", null)

  if (error) {
    throw new Error(error.message)
  }

  await supabase
    .from("direct_messages")
    .update({ read_at: now })
    .eq("recipient_user_id", user.id)
    .is("read_at", null)
    .is("recipient_archived_at", null)

  revalidatePath("/inbox")
}

export async function archiveAllInboxItems() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const now = new Date().toISOString()

  const [
    notificationArchiveResult,
    sentMessageArchiveResult,
    receivedMessageArchiveResult,
  ] = await Promise.all([
    supabase
      .from("user_notifications")
      .update({
        archived_at: now,
        read_at: now,
      })
      .eq("recipient_user_id", user.id)
      .is("archived_at", null),

    supabase
      .from("direct_messages")
      .update({ sender_archived_at: now })
      .eq("sender_user_id", user.id)
      .is("sender_archived_at", null),

    supabase
      .from("direct_messages")
      .update({
        recipient_archived_at: now,
        read_at: now,
      })
      .eq("recipient_user_id", user.id)
      .is("recipient_archived_at", null),
  ])

  if (notificationArchiveResult.error) {
    throw new Error(notificationArchiveResult.error.message)
  }

  if (sentMessageArchiveResult.error) {
    throw new Error(sentMessageArchiveResult.error.message)
  }

  if (receivedMessageArchiveResult.error) {
    throw new Error(receivedMessageArchiveResult.error.message)
  }

  revalidatePath("/inbox")
}

export async function archiveNotification(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const notificationId = Number(formData.get("notification_id"))

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("user_notifications")
    .update({
      archived_at: now,
      read_at: now,
    })
    .eq("id", notificationId)
    .eq("recipient_user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/inbox")
}