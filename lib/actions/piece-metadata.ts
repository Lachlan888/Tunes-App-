"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { normaliseKey } from "@/lib/music/keys"

export async function upsertUserPieceNotes(formData: FormData) {
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
  const notes = formData.get("notes")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  const { error } = await supabase.from("user_piece_metadata").upsert(
    {
      user_id: user.id,
      piece_id: pieceId,
      notes,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,piece_id",
    }
  )

  if (error) {
    console.error("Error saving user piece notes:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

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

export async function updateMissingPieceDetails(formData: FormData) {
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

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  const { data: existingPiece, error: existingPieceError } = await supabase
    .from("pieces")
    .select("id, key, style, time_signature, reference_url")
    .eq("id", pieceId)
    .maybeSingle()

  if (existingPieceError || !existingPiece) {
    console.error("Error loading piece for canonical update:", existingPieceError)
    return
  }

  const rawKey = formData.get("key")?.toString().trim() || ""
  const rawStyle = formData.get("style")?.toString().trim() || ""
  const rawTimeSignature =
    formData.get("time_signature")?.toString().trim() || ""
  const rawReferenceUrl =
    formData.get("reference_url")?.toString().trim() || ""

  const updates: {
    key?: string | null
    style?: string | null
    time_signature?: string | null
    reference_url?: string | null
  } = {}

  if (!existingPiece.key && rawKey) {
    const normalised = normaliseKey(rawKey)

    if (!normalised) {
      return
    }

    updates.key = normalised
  }

  if (!existingPiece.style && rawStyle) {
    updates.style = rawStyle
  }

  if (!existingPiece.time_signature && rawTimeSignature) {
    updates.time_signature = rawTimeSignature
  }

  if (!existingPiece.reference_url && rawReferenceUrl) {
    try {
      new URL(rawReferenceUrl)
      updates.reference_url = rawReferenceUrl
    } catch {
      return
    }
  }

  if (Object.keys(updates).length === 0) {
    return
  }

  const { error: updateError } = await supabase
    .from("pieces")
    .update(updates)
    .eq("id", pieceId)

  if (updateError) {
    console.error("Error updating missing piece details:", updateError)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}