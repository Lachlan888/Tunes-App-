"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function getRedirectTarget(formData: FormData, pieceId: number, status: string) {
  const rawRedirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`

  const separator = rawRedirectTo.includes("?") ? "&" : "?"

  return `${rawRedirectTo}${separator}loop=${status}`
}

function readPositiveNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

export async function createMediaLoop(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const youtubeVideoId =
    formData.get("youtube_video_id")?.toString().trim() || ""
  const label = formData.get("label")?.toString().trim() || ""
  const notes = formData.get("notes")?.toString().trim() || null
  const startSeconds = readPositiveNumber(formData.get("start_seconds"))
  const endSeconds = readPositiveNumber(formData.get("end_seconds"))
  const playbackRate = readPositiveNumber(formData.get("playback_rate")) ?? 1

  if (!Number.isInteger(pieceId) || pieceId <= 0) {
    redirect("/library?loop=missing_piece")
  }

  if (!youtubeVideoId || !label) {
    redirect(getRedirectTarget(formData, pieceId, "missing_fields"))
  }

  if (
    startSeconds === null ||
    endSeconds === null ||
    startSeconds < 0 ||
    endSeconds <= startSeconds ||
    playbackRate <= 0
  ) {
    redirect(getRedirectTarget(formData, pieceId, "invalid_range"))
  }

  const { error } = await supabase.from("user_piece_media_loops").insert({
    user_id: user.id,
    piece_id: pieceId,
    youtube_video_id: youtubeVideoId,
    label,
    start_seconds: startSeconds,
    end_seconds: endSeconds,
    playback_rate: playbackRate,
    notes,
  })

  if (error) {
    console.error("Error creating media loop:", error)
    redirect(getRedirectTarget(formData, pieceId, "error"))
  }

  revalidatePath(`/library/${pieceId}`)
  redirect(getRedirectTarget(formData, pieceId, "saved"))
}

export async function deleteMediaLoop(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const loopId = Number(formData.get("loop_id"))
  const pieceId = Number(formData.get("piece_id"))

  if (!Number.isInteger(pieceId) || pieceId <= 0) {
    redirect("/library?loop=missing_piece")
  }

  if (!Number.isInteger(loopId) || loopId <= 0) {
    redirect(getRedirectTarget(formData, pieceId, "missing_loop"))
  }

  const { error } = await supabase
    .from("user_piece_media_loops")
    .delete()
    .eq("id", loopId)
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)

  if (error) {
    console.error("Error deleting media loop:", error)
    redirect(getRedirectTarget(formData, pieceId, "error"))
  }

  revalidatePath(`/library/${pieceId}`)
  redirect(getRedirectTarget(formData, pieceId, "deleted"))
}