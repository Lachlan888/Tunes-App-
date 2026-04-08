"use server"

import { normaliseTuneTitle } from "@/lib/normalise"
import { normaliseKey } from "@/lib/music/keys"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function normaliseForDuplicateMatch(value: string | null) {
  return normaliseTuneTitle(value)
}

export async function createTune(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get("title") ?? "").trim()
  const rawKey = String(formData.get("key") ?? "").trim()
  const key = rawKey ? normaliseKey(rawKey) : null
  const timeSignature = String(formData.get("time_signature") ?? "").trim()
  const referenceUrl = String(formData.get("reference_url") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  const rawStyleIds = formData.getAll("style_ids")
  const styleIds = rawStyleIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)

  if (!title) {
    redirect(appendQueryParam(redirectTo, "create_tune", "missing_title"))
  }

  if (rawKey && !key) {
    redirect(appendQueryParam(redirectTo, "create_tune", "invalid_key"))
  }

  const normalisedTitle = normaliseForDuplicateMatch(title)

  const { data: existingPieces, error: existingPiecesError } = await supabase
    .from("pieces")
    .select("id, title")
    .order("id")

  if (existingPiecesError) {
    redirect(appendQueryParam(redirectTo, "create_tune", "error"))
  }

  const duplicatePiece = (existingPieces ?? []).find(
    (piece) => normaliseForDuplicateMatch(piece.title) === normalisedTitle
  )

  if (duplicatePiece) {
    redirect(appendQueryParam(redirectTo, "create_tune", "duplicate"))
  }

  let styleLabelString: string | null = null

  if (styleIds.length > 0) {
    const { data: validStyles, error: stylesError } = await supabase
      .from("styles")
      .select("id, label")
      .in("id", styleIds)
      .eq("is_active", true)

    if (stylesError) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }

    const validStyleIds = new Set((validStyles ?? []).map((style) => style.id))
    const hasInvalidStyleId = styleIds.some((id) => !validStyleIds.has(id))

    if (hasInvalidStyleId) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }

    const styleLabelsInSelectedOrder = styleIds
      .map((id) => validStyles?.find((style) => style.id === id)?.label ?? null)
      .filter((label): label is string => Boolean(label))

    styleLabelString =
      styleLabelsInSelectedOrder.length > 0
        ? styleLabelsInSelectedOrder.join(", ")
        : null
  }

  const { data: insertedPiece, error: insertPieceError } = await supabase
    .from("pieces")
    .insert({
      title,
      key,
      style: styleLabelString,
      time_signature: timeSignature || null,
      reference_url: referenceUrl || null,
    })
    .select("id")
    .single()

  if (insertPieceError || !insertedPiece) {
    redirect(appendQueryParam(redirectTo, "create_tune", "error"))
  }

  if (styleIds.length > 0) {
    const pieceStyleRows = styleIds.map((styleId) => ({
      piece_id: insertedPiece.id,
      style_id: styleId,
    }))

    const { error: pieceStylesError } = await supabase
      .from("piece_styles")
      .insert(pieceStyleRows)

    if (pieceStylesError) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }
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