"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { recordPieceMediaLinkAddedEvent } from "@/lib/services/activity-events"
import { createClient } from "@/lib/supabase/server"

const MEDIA_LINK_TYPES = new Set([
  "Recording",
  "Video",
  "Lesson",
  "Sheet music",
  "Source",
  "Performance",
  "Other",
])

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function cleanRedirectTo(
  value: string | FormDataEntryValue | null,
  fallback: string
) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) return fallback

  return raw
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function cleanMediaType(value: string) {
  return MEDIA_LINK_TYPES.has(value) ? value : "Other"
}

export async function addPieceMediaLink(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")
  const title = String(formData.get("title") ?? "").trim()
  const url = String(formData.get("url") ?? "").trim()
  const mediaType = cleanMediaType(String(formData.get("media_type") ?? "Other"))
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "media_link", "missing_piece"))
  }

  if (!title || !url) {
    redirect(appendQueryParam(redirectTo, "media_link", "missing_fields"))
  }

  if (!isValidUrl(url)) {
    redirect(appendQueryParam(redirectTo, "media_link", "invalid_url"))
  }

  const { error } = await supabase.from("piece_media_links").insert({
    piece_id: pieceId,
    url,
    label: title,
    media_type: mediaType,
    notes,
    created_by: user.id,
  })

  if (error) {
    console.error("Error adding piece media link:", error)
    redirect(appendQueryParam(redirectTo, "media_link", "error"))
  }

  await recordPieceMediaLinkAddedEvent(user.id, pieceId)

  revalidatePath("/library")
  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)

  redirect(appendQueryParam(redirectTo, "media_link", "added"))
}

export async function removePieceMediaLink(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const mediaLinkId = Number(formData.get("media_link_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  if (!pieceId || Number.isNaN(pieceId) || !mediaLinkId || Number.isNaN(mediaLinkId)) {
    redirect(appendQueryParam(redirectTo, "media_link", "missing_link"))
  }

  const { error } = await supabase
    .from("piece_media_links")
    .delete()
    .eq("id", mediaLinkId)
    .eq("piece_id", pieceId)
    .eq("created_by", user.id)

  if (error) {
    console.error("Error removing piece media link:", error)
    redirect(appendQueryParam(redirectTo, "media_link", "error"))
  }

  revalidatePath("/library")
  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)

  redirect(appendQueryParam(redirectTo, "media_link", "removed"))
}
