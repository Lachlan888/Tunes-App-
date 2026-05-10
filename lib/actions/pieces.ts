"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { canModerate, getCurrentUserRole } from "@/lib/auth/roles"
import { addPieceToLearningListForUser } from "@/lib/actions/lists"
import { markPieceKnownForUser } from "@/lib/actions/known-pieces"
import { startPracticeForUser } from "@/lib/actions/user-pieces"
import { normaliseKey } from "@/lib/music/keys"
import { normaliseTuneTitle } from "@/lib/normalise"
import {
  recordPieceCreatedEvent,
  recordPieceDetailsAddedEvent,
  recordPieceLoreAddedEvent,
  recordPieceMediaLinkAddedEvent,
  recordPieceSheetMusicLinkAddedEvent,
} from "@/lib/services/activity-events"
import { createClient } from "@/lib/supabase/server"

const VALID_LORE_CATEGORIES = [
  "region",
  "informant",
  "collector",
  "alternate_title",
  "tune_family",
  "story_folklore_note",
] as const

type LoreCategory = (typeof VALID_LORE_CATEGORIES)[number]

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

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function normaliseForDuplicateMatch(value: string | null) {
  return normaliseTuneTitle(value)
}

function isValidLoreCategory(category: string): category is LoreCategory {
  return VALID_LORE_CATEGORIES.includes(category as LoreCategory)
}

function isValidOptionalUrl(value: string) {
  if (!value) return true

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

type OptionalLinkInput = {
  label: string
  url: string
}

function getOptionalLinkInput(
  formData: FormData,
  labelKey: string,
  urlKey: string
): OptionalLinkInput | null {
  const label = String(formData.get(labelKey) ?? "").trim()
  const url = String(formData.get(urlKey) ?? "").trim()

  if (!label && !url) {
    return null
  }

  return {
    label,
    url,
  }
}

type OptionalLoreInput = {
  category: LoreCategory
  entryText: string
}

function getOptionalLoreInput(formData: FormData): OptionalLoreInput | null {
  const category = String(formData.get("advanced_lore_category") ?? "").trim()
  const entryText = String(formData.get("advanced_lore_text") ?? "").trim()

  if (!category && !entryText) {
    return null
  }

  if (!isValidLoreCategory(category)) {
    return null
  }

  if (!entryText) {
    return null
  }

  return {
    category,
    entryText,
  }
}

type PostCreateAction = "none" | "known" | "practice"

export async function createTune(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = String(formData.get("title") ?? "").trim()
  const rawKey = String(formData.get("key") ?? "").trim()
  const key = rawKey ? normaliseKey(rawKey) : null
  const timeSignature = String(formData.get("time_signature") ?? "").trim()
  const referenceUrl = String(formData.get("reference_url") ?? "").trim()
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  const advancedMediaLink = getOptionalLinkInput(
    formData,
    "advanced_media_label",
    "advanced_media_url"
  )
  const advancedSheetMusicLink = getOptionalLinkInput(
    formData,
    "advanced_sheet_music_label",
    "advanced_sheet_music_url"
  )
  const advancedLoreCategory = String(
    formData.get("advanced_lore_category") ?? ""
  ).trim()
  const advancedLoreText = String(formData.get("advanced_lore_text") ?? "").trim()
  const advancedLoreInput = getOptionalLoreInput(formData)

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

  if (!isValidOptionalUrl(referenceUrl)) {
    redirect(appendQueryParam(redirectTo, "create_tune", "invalid_url"))
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

  if (advancedMediaLink) {
    if (!advancedMediaLink.label || !advancedMediaLink.url) {
      redirect(appendQueryParam(redirectTo, "create_tune", "incomplete_media"))
    }

    if (!isValidOptionalUrl(advancedMediaLink.url)) {
      redirect(appendQueryParam(redirectTo, "create_tune", "invalid_media_url"))
    }
  }

  if (advancedSheetMusicLink) {
    if (!advancedSheetMusicLink.label || !advancedSheetMusicLink.url) {
      redirect(
        appendQueryParam(redirectTo, "create_tune", "incomplete_sheet_music")
      )
    }

    if (!isValidOptionalUrl(advancedSheetMusicLink.url)) {
      redirect(
        appendQueryParam(redirectTo, "create_tune", "invalid_sheet_music_url")
      )
    }
  }

  if (advancedLoreCategory || advancedLoreText) {
    if (!isValidLoreCategory(advancedLoreCategory)) {
      redirect(
        appendQueryParam(redirectTo, "create_tune", "invalid_lore_category")
      )
    }

    if (!advancedLoreText) {
      redirect(appendQueryParam(redirectTo, "create_tune", "missing_lore_text"))
    }
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

  await recordPieceCreatedEvent(user.id, insertedPiece.id)

  const addedDetailFields: string[] = []

  if (referenceUrl) {
    addedDetailFields.push("reference_url")
  }

  if (advancedMediaLink) {
    const { error: mediaLinkError } = await supabase
      .from("piece_media_links")
      .insert({
        piece_id: insertedPiece.id,
        url: advancedMediaLink.url,
        label: advancedMediaLink.label,
        created_by: user.id,
      })

    if (mediaLinkError) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }

    addedDetailFields.push("media_link")
    await recordPieceMediaLinkAddedEvent(user.id, insertedPiece.id)
  }

  if (advancedSheetMusicLink) {
    const { error: sheetMusicLinkError } = await supabase
      .from("piece_sheet_music_links")
      .insert({
        piece_id: insertedPiece.id,
        url: advancedSheetMusicLink.url,
        label: advancedSheetMusicLink.label,
        created_by: user.id,
      })

    if (sheetMusicLinkError) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }

    addedDetailFields.push("sheet_music_link")
    await recordPieceSheetMusicLinkAddedEvent(user.id, insertedPiece.id)
  }

  if (advancedLoreInput) {
    const { data: insertedLoreEntry, error: loreEntryError } = await supabase
      .from("piece_lore_entries")
      .insert({
        piece_id: insertedPiece.id,
        user_id: user.id,
        category: advancedLoreInput.category,
        entry_text: advancedLoreInput.entryText,
      })
      .select("id")
      .single()

    if (loreEntryError || !insertedLoreEntry) {
      redirect(appendQueryParam(redirectTo, "create_tune", "error"))
    }

    addedDetailFields.push("lore_entry")
    await recordPieceLoreAddedEvent(user.id, insertedPiece.id, insertedLoreEntry.id)
  }

  if (addedDetailFields.length > 0) {
    await recordPieceDetailsAddedEvent(user.id, insertedPiece.id, addedDetailFields)
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
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

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

export async function deleteCanonicalTuneAsModerator(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  if (!user) {
    redirect("/login")
  }

  const role = await getCurrentUserRole(supabase, user.id)

  if (!canModerate(role)) {
    redirect(appendQueryParam(redirectTo, "delete_tune", "not_allowed"))
  }

  const pieceId = Number(formData.get("piece_id"))
  const confirmation = formData.get("confirmation")?.toString() ?? ""

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "delete_tune", "missing_piece"))
  }

  const { data: piece, error: pieceError } = await supabase
    .from("pieces")
    .select("id, title")
    .eq("id", pieceId)
    .maybeSingle()

  if (pieceError) {
    console.error("Error loading piece before canonical delete:", pieceError)
    redirect(appendQueryParam(redirectTo, "delete_tune", "error"))
  }

  if (!piece) {
    redirect(appendQueryParam(redirectTo, "delete_tune", "not_found"))
  }

  const expectedConfirmation = `DELETE ${piece.title}`

  if (confirmation !== expectedConfirmation) {
    redirect(
      appendQueryParam(redirectTo, "delete_tune", "confirmation_mismatch")
    )
  }

  const { error: deleteError } = await supabase
    .from("pieces")
    .delete()
    .eq("id", piece.id)

  if (deleteError) {
    console.error("Error deleting canonical tune:", deleteError)
    redirect(appendQueryParam(redirectTo, "delete_tune", "error"))
  }

  revalidatePath("/library")
  redirect(appendQueryParam(redirectTo, "delete_tune", "success"))
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

  const updatedFields = Object.keys(updates)

  if (updatedFields.length === 0) {
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

  await recordPieceDetailsAddedEvent(user.id, pieceId, updatedFields)

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}