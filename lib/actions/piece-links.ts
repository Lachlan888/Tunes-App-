"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addPieceSheetMusicLink(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const url = formData.get("url")?.toString().trim() || ""
  const label = formData.get("label")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!url || !label) {
    return
  }

  try {
    new URL(url)
  } catch {
    return
  }

  const { error } = await supabase.from("piece_sheet_music_links").insert({
    piece_id: pieceId,
    url,
    label,
    created_by: user.id,
  })

  if (error) {
    console.error("Error adding piece sheet music link:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

export async function addPieceMediaLink(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const url = formData.get("url")?.toString().trim() || ""
  const label = formData.get("label")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!url || !label) {
    return
  }

  try {
    new URL(url)
  } catch {
    return
  }

  const { error } = await supabase.from("piece_media_links").insert({
    piece_id: pieceId,
    url,
    label,
    created_by: user.id,
  })

  if (error) {
    console.error("Error adding piece media link:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}