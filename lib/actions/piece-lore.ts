"use server"

import { revalidatePath } from "next/cache"
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

function isValidLoreCategory(category: string): category is LoreCategory {
  return VALID_LORE_CATEGORIES.includes(category as LoreCategory)
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
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
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
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!loreEntryId || Number.isNaN(loreEntryId)) {
    return
  }

  const { error } = await supabase
    .from("piece_lore_entries")
    .delete()
    .eq("id", loreEntryId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting piece lore entry:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}