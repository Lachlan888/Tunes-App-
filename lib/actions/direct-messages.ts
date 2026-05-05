"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function cleanRedirectTo(value: FormDataEntryValue | null, fallback: string) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function appendStatus(redirectTo: string, status: string) {
  const separator = redirectTo.includes("?") ? "&" : "?"
  return `${redirectTo}${separator}direct_message=${status}`
}

function previewBody(body: string) {
  const cleaned = body.replace(/\s+/g, " ").trim()
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}…` : cleaned
}

export async function sendDirectMessage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const recipientUserId = formData.get("recipient_user_id")?.toString() || ""
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/inbox")
  const body = formData.get("body")?.toString().trim() || ""

  if (!recipientUserId) {
    redirect(appendStatus(redirectTo, "missing_user"))
  }

  if (recipientUserId === user.id) {
    redirect(appendStatus(redirectTo, "self"))
  }

  if (!body) {
    redirect(appendStatus(redirectTo, "missing_body"))
  }

  const { data: recipientProfile, error: recipientProfileError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("id", recipientUserId)
      .maybeSingle()

  if (recipientProfileError) {
    throw new Error(recipientProfileError.message)
  }

  if (!recipientProfile) {
    redirect(appendStatus(redirectTo, "not_found"))
  }

  const { data: insertedMessage, error: messageError } = await supabase
    .from("direct_messages")
    .insert({
      sender_user_id: user.id,
      recipient_user_id: recipientUserId,
      body,
    })
    .select("id")
    .single()

  if (messageError) {
    throw new Error(messageError.message)
  }

  const { error: notificationError } = await supabase
    .from("user_notifications")
    .insert({
      recipient_user_id: recipientUserId,
      actor_user_id: user.id,
      notification_type: "direct_message",
      direct_message_id: insertedMessage.id,
      body_preview: previewBody(body),
    })

  if (notificationError) {
    throw new Error(notificationError.message)
  }

  revalidatePath("/inbox")
  revalidatePath(redirectTo)

  redirect(appendStatus(redirectTo, "sent"))
}

export async function updateDirectMessage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const messageId = Number(formData.get("message_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/inbox")
  const body = formData.get("body")?.toString().trim() || ""

  if (!Number.isInteger(messageId) || messageId <= 0) {
    redirect(appendStatus(redirectTo, "missing_message"))
  }

  if (!body) {
    redirect(appendStatus(redirectTo, "missing_body"))
  }

  const { error: updateError } = await supabase
    .from("direct_messages")
    .update({ body })
    .eq("id", messageId)
    .eq("sender_user_id", user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const { error: notificationError } = await supabase
    .from("user_notifications")
    .update({ body_preview: previewBody(body) })
    .eq("direct_message_id", messageId)
    .eq("actor_user_id", user.id)

  if (notificationError) {
    throw new Error(notificationError.message)
  }

  revalidatePath("/inbox")
  revalidatePath(redirectTo)

  redirect(appendStatus(redirectTo, "edited"))
}

export async function deleteDirectMessage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const messageId = Number(formData.get("message_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/inbox")

  if (!Number.isInteger(messageId) || messageId <= 0) {
    redirect(appendStatus(redirectTo, "missing_message"))
  }

  const { error: deleteError } = await supabase
    .from("direct_messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_user_id", user.id)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  revalidatePath("/inbox")
  revalidatePath(redirectTo)

  redirect(appendStatus(redirectTo, "deleted"))
}

export async function archiveDirectMessageThread(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const otherUserId = formData.get("other_user_id")?.toString() || ""
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/inbox")
  const now = new Date().toISOString()

  if (!otherUserId) {
    redirect(appendStatus(redirectTo, "missing_user"))
  }

  const [senderArchiveResult, recipientArchiveResult] = await Promise.all([
    supabase
      .from("direct_messages")
      .update({ sender_archived_at: now })
      .eq("sender_user_id", user.id)
      .eq("recipient_user_id", otherUserId)
      .is("sender_archived_at", null),

    supabase
      .from("direct_messages")
      .update({ recipient_archived_at: now })
      .eq("recipient_user_id", user.id)
      .eq("sender_user_id", otherUserId)
      .is("recipient_archived_at", null),
  ])

  if (senderArchiveResult.error) {
    throw new Error(senderArchiveResult.error.message)
  }

  if (recipientArchiveResult.error) {
    throw new Error(recipientArchiveResult.error.message)
  }

  revalidatePath("/inbox")
  redirect(appendStatus(redirectTo, "archived"))
}