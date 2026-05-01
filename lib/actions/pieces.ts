"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { normaliseTuneTitle } from "@/lib/normalise"
import { normaliseKey } from "@/lib/music/keys"
import { createClient } from "@/lib/supabase/server"
import { startPracticeForUser } from "@/lib/actions/user-pieces"
import { markPieceKnownForUser } from "@/lib/actions/known-pieces"
import { addPieceToLearningListForUser } from "@/lib/actions/lists"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function normaliseForDuplicateMatch(value: string | null) {
  return normaliseTuneTitle(value)
}

type PostCreateAction = "none" | "known" | "practice"

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

  const postCreateAction = String(
    formData.get("post_create_action") ?? "none"
  ).trim() as PostCreateAction

  const addToList = String(formData.get("add_to_list") ?? "") === "true"
  const learningListId = Number(formData.get("learning_list_id"))

  if (!title) {
    redirect(appendQueryParam(redirectTo, "create_tune", "missing_title"))
  }

  if (rawKey && !key) {
    redirect(appendQueryParam(redirectTo, "create_tune", "invalid_key"))
  }

  if (
    postCreateAction !== "none" &&
    postCreateAction !== "known" &&
    postCreateAction !== "practice"
  ) {
    redirect(
      appendQueryParam(redirectTo, "create_tune", "invalid_post_create_action")
    )
  }

  if (addToList && (!learningListId || Number.isNaN(learningListId))) {
    redirect(appendQueryParam(redirectTo, "create_tune", "missing_list"))
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

  const needsUserAction = postCreateAction !== "none" || addToList

  if (needsUserAction) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    if (postCreateAction === "known") {
      await markPieceKnownForUser(supabase, user.id, insertedPiece.id)
    }

    if (postCreateAction === "practice") {
      await startPracticeForUser(supabase, user.id, insertedPiece.id)
    }

    if (addToList) {
      await addPieceToLearningListForUser(
        supabase,
        user.id,
        insertedPiece.id,
        learningListId
      )
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
  const rawTimeSignature =
    formData.get("time_signature")?.toString().trim() || ""
  const rawReferenceUrl = formData.get("reference_url")?.toString().trim() || ""
  const rawStyleId = Number(formData.get("style_id"))

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

  if (!existingPiece.style && Number.isInteger(rawStyleId) && rawStyleId > 0) {
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

    updates.style = styleRow.label
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