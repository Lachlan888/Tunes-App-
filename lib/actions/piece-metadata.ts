"use server"

import { revalidatePath } from "next/cache"
import { recordPieceDetailsAddedEvent } from "@/lib/services/activity-events"
import { contributeMissingPieceDetails } from "@/lib/services/piece-contributions"
import { createClient } from "@/lib/supabase/server"

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

  const rawKey = formData.get("key")?.toString().trim() || ""
  const rawTimeSignature =
    formData.get("time_signature")?.toString().trim() || ""
  const rawComposer = formData.get("composer")?.toString().trim() || ""
  const rawReferenceUrl =
    formData.get("reference_url")?.toString().trim() || ""
  const rawStyleId = Number(formData.get("style_id"))

  let style: string | undefined

  if (Number.isInteger(rawStyleId) && rawStyleId > 0) {
    const { data: styleRow, error: styleError } = await supabase
      .from("styles")
      .select("id, label")
      .eq("id", rawStyleId)
      .eq("is_active", true)
      .maybeSingle()

    if (styleError || !styleRow) {
      console.error("Error loading style for canonical update:", styleError)
      return
    }

    style = styleRow.label
  }

  const result = await contributeMissingPieceDetails(supabase, pieceId, {
    key: rawKey,
    style,
    time_signature: rawTimeSignature,
    composer: rawComposer,
    reference_url: rawReferenceUrl,
  })

  if (result.status !== "saved") {
    return
  }

  await recordPieceDetailsAddedEvent(user.id, pieceId, result.fields)

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}
