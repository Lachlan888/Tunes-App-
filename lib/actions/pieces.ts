"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function createTune(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get("title") ?? "").trim()
  const key = String(formData.get("key") ?? "").trim()
  const style = String(formData.get("style") ?? "").trim()
  const timeSignature = String(formData.get("time_signature") ?? "").trim()
  const referenceUrl = String(formData.get("reference_url") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  if (!title) {
    redirect(appendQueryParam(redirectTo, "create_tune", "missing_title"))
  }

  const { error } = await supabase.from("pieces").insert({
    title,
    key: key || null,
    style: style || null,
    time_signature: timeSignature || null,
    reference_url: referenceUrl || null,
  })

  if (error) {
    redirect(appendQueryParam(redirectTo, "create_tune", "error"))
  }

  redirect(appendQueryParam(redirectTo, "create_tune", "success"))
}

export async function removeTuneFromMyApp(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  if (!pieceId) {
    redirect(appendQueryParam(redirectTo, "remove_tune", "missing_piece"))
  }

  const { data: ownedLists, error: ownedListsError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("user_id", user.id)

  if (ownedListsError) {
    redirect(appendQueryParam(redirectTo, "remove_tune", "error"))
  }

  const ownedListIds = (ownedLists ?? []).map((list) => list.id)

  if (ownedListIds.length > 0) {
    const { error: listItemsDeleteError } = await supabase
      .from("learning_list_items")
      .delete()
      .eq("piece_id", pieceId)
      .in("learning_list_id", ownedListIds)

    if (listItemsDeleteError) {
      redirect(appendQueryParam(redirectTo, "remove_tune", "error"))
    }
  }

  const { error: userPiecesDeleteError } = await supabase
    .from("user_pieces")
    .delete()
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)

  if (userPiecesDeleteError) {
    redirect(appendQueryParam(redirectTo, "remove_tune", "error"))
  }

  const { error: knownPiecesDeleteError } = await supabase
    .from("user_known_pieces")
    .delete()
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)

  if (knownPiecesDeleteError) {
    redirect(appendQueryParam(redirectTo, "remove_tune", "error"))
  }

  redirect(appendQueryParam(redirectTo, "remove_tune", "success"))
}