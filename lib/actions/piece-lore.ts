"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { canModerate, getCurrentUserRole } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"

const VALID_LORE_CATEGORIES = [
  "region",
  "informant",
  "collector",
  "alternate_title",
  "tune_family",
  "story_folklore_note",
] as const

const VALID_LORE_REPORT_REASONS = [
  "incorrect",
  "duplicate",
  "misleading",
  "inappropriate",
  "other",
] as const

type LoreCategory = (typeof VALID_LORE_CATEGORIES)[number]
type LoreReportReason = (typeof VALID_LORE_REPORT_REASONS)[number]

function isValidLoreCategory(category: string): category is LoreCategory {
  return VALID_LORE_CATEGORIES.includes(category as LoreCategory)
}

function isValidLoreReportReason(
  reason: string
): reason is LoreReportReason {
  return VALID_LORE_REPORT_REASONS.includes(reason as LoreReportReason)
}

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

export async function addPieceLoreEntry(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = cleanRedirectTo(
    formData.get("redirect_to"),
    `/library/${pieceId}`
  )
  const category = formData.get("category")?.toString() || ""
  const entryText = formData.get("entry_text")?.toString().trim() || ""

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!isValidLoreCategory(category)) {
    return
  }

  if (!entryText) {
    return
  }

  const { error } = await supabase.from("piece_lore_entries").insert({
    piece_id: pieceId,
    user_id: user.id,
    category,
    entry_text: entryText,
  })

  if (error) {
    console.error("Error adding piece lore entry:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

export async function updatePieceLoreEntry(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const role = await getCurrentUserRole(supabase, user.id)

  if (!canModerate(role)) {
    redirect("/")
  }

  const pieceId = Number(formData.get("piece_id"))
  const loreEntryId = Number(formData.get("lore_entry_id"))
  const redirectTo = cleanRedirectTo(
    formData.get("redirect_to"),
    `/library/${pieceId}`
  )
  const category = formData.get("category")?.toString() || ""
  const entryText = formData.get("entry_text")?.toString().trim() || ""
  const moderatorNote =
    formData.get("moderator_note")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "lore", "missing_piece"))
  }

  if (!loreEntryId || Number.isNaN(loreEntryId)) {
    redirect(appendQueryParam(redirectTo, "lore", "missing_entry"))
  }

  if (!isValidLoreCategory(category)) {
    redirect(appendQueryParam(redirectTo, "lore", "invalid_category"))
  }

  if (!entryText) {
    redirect(appendQueryParam(redirectTo, "lore", "missing_text"))
  }

  const { error } = await supabase
    .from("piece_lore_entries")
    .update({
      category,
      entry_text: entryText,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      moderator_note: moderatorNote,
    })
    .eq("id", loreEntryId)
    .eq("piece_id", pieceId)

  if (error) {
    console.error("Error updating piece lore entry:", error)
    redirect(appendQueryParam(redirectTo, "lore", "error"))
  }

  revalidatePath(`/library/${pieceId}`)
  redirect(appendQueryParam(redirectTo, "lore", "updated"))
}

export async function deletePieceLoreEntry(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const loreEntryId = Number(formData.get("lore_entry_id"))
  const redirectTo = cleanRedirectTo(
    formData.get("redirect_to"),
    `/library/${pieceId}`
  )

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!loreEntryId || Number.isNaN(loreEntryId)) {
    return
  }

  const role = await getCurrentUserRole(supabase, user.id)

  const deleteQuery = supabase
    .from("piece_lore_entries")
    .delete()
    .eq("id", loreEntryId)
    .eq("piece_id", pieceId)

  const { error } = canModerate(role)
    ? await deleteQuery
    : await deleteQuery.eq("user_id", user.id)

  if (error) {
    console.error("Error deleting piece lore entry:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

export async function reportPieceLoreEntry(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const loreEntryId = Number(formData.get("lore_entry_id"))
  const redirectTo = cleanRedirectTo(
    formData.get("redirect_to"),
    `/library/${pieceId}`
  )
  const reason = formData.get("reason")?.toString() || ""
  const details = formData.get("details")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "lore_report", "missing_piece"))
  }

  if (!loreEntryId || Number.isNaN(loreEntryId)) {
    redirect(appendQueryParam(redirectTo, "lore_report", "missing_entry"))
  }

  if (!isValidLoreReportReason(reason)) {
    redirect(appendQueryParam(redirectTo, "lore_report", "invalid_reason"))
  }

  const { data: loreEntry, error: loreEntryError } = await supabase
    .from("piece_lore_entries")
    .select("id, user_id, piece_id")
    .eq("id", loreEntryId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (loreEntryError || !loreEntry) {
    redirect(appendQueryParam(redirectTo, "lore_report", "entry_not_found"))
  }

  if (loreEntry.user_id === user.id) {
    redirect(appendQueryParam(redirectTo, "lore_report", "own_entry"))
  }

  const { error } = await supabase.from("piece_lore_reports").insert({
    lore_entry_id: loreEntryId,
    reported_by: user.id,
    reason,
    details,
  })

  if (error) {
    console.error("Error reporting piece lore entry:", error)
    redirect(appendQueryParam(redirectTo, "lore_report", "error"))
  }

  revalidatePath(`/library/${pieceId}`)
  redirect(appendQueryParam(redirectTo, "lore_report", "success"))
}