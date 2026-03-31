"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function sendFriendRequest(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const addresseeId = String(formData.get("addressee_id") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/friends")

  if (!addresseeId) {
    redirect(appendQueryParam(redirectTo, "friend_request", "missing_user"))
  }

  if (addresseeId === user.id) {
    redirect(appendQueryParam(redirectTo, "friend_request", "self"))
  }

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", addresseeId)
    .maybeSingle()

  if (targetProfileError) {
    throw new Error(targetProfileError.message)
  }

  if (!targetProfile) {
    redirect(appendQueryParam(redirectTo, "friend_request", "not_found"))
  }

  const { data: existingConnection, error: existingConnectionError } =
    await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .maybeSingle()

  if (existingConnectionError) {
    throw new Error(existingConnectionError.message)
  }

  if (existingConnection) {
    redirect(appendQueryParam(redirectTo, "friend_request", "duplicate"))
  }

  const { error: insertError } = await supabase.from("connections").insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    status: "pending",
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  redirect(appendQueryParam(redirectTo, "friend_request", "sent"))
}

export async function acceptFriendRequest(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const connectionId = Number(formData.get("connection_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/friends")

  if (!connectionId || Number.isNaN(connectionId)) {
    redirect(appendQueryParam(redirectTo, "friend_accept", "missing_connection"))
  }

  const { data: connection, error: connectionError } = await supabase
    .from("connections")
    .select("id, addressee_id, status")
    .eq("id", connectionId)
    .maybeSingle()

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  if (!connection) {
    redirect(appendQueryParam(redirectTo, "friend_accept", "not_found"))
  }

  if (connection.addressee_id !== user.id) {
    redirect(appendQueryParam(redirectTo, "friend_accept", "forbidden"))
  }

  if (connection.status !== "pending") {
    redirect(appendQueryParam(redirectTo, "friend_accept", "invalid_status"))
  }

  const { error: updateError } = await supabase
    .from("connections")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", connectionId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  redirect(appendQueryParam(redirectTo, "friend_accept", "accepted"))
}