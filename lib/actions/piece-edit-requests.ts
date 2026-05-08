"use server"

import { redirect } from "next/navigation"
import { normaliseKey } from "@/lib/music/keys"
import { createClient } from "@/lib/supabase/server"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function cleanOptionalString(value: FormDataEntryValue | null) {
  const cleaned = value?.toString().trim() ?? ""
  return cleaned || null
}

export async function createPieceEditRequest(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "edit_request", "missing_piece"))
  }

  const title = cleanOptionalString(formData.get("title"))
  const rawKey = cleanOptionalString(formData.get("key"))
  const style = cleanOptionalString(formData.get("style"))
  const timeSignature = cleanOptionalString(formData.get("time_signature"))
  const referenceUrl = cleanOptionalString(formData.get("reference_url"))
  const reason = cleanOptionalString(formData.get("reason"))

  const proposedChanges: Record<string, string> = {}

  if (title) {
    proposedChanges.title = title
  }

  if (rawKey) {
    const key = normaliseKey(rawKey)

    if (!key) {
      redirect(appendQueryParam(redirectTo, "edit_request", "invalid_key"))
    }

    proposedChanges.key = key
  }

  if (style) {
    proposedChanges.style = style
  }

  if (timeSignature) {
    proposedChanges.time_signature = timeSignature
  }

  if (referenceUrl) {
    try {
      new URL(referenceUrl)
      proposedChanges.reference_url = referenceUrl
    } catch {
      redirect(appendQueryParam(redirectTo, "edit_request", "invalid_url"))
    }
  }

  if (Object.keys(proposedChanges).length === 0) {
    redirect(appendQueryParam(redirectTo, "edit_request", "empty"))
  }

  const { error } = await supabase.from("piece_edit_requests").insert({
    piece_id: pieceId,
    requested_by: user.id,
    proposed_changes: proposedChanges,
    reason,
  })

  if (error) {
    console.error("Error creating piece edit request:", error)
    redirect(appendQueryParam(redirectTo, "edit_request", "error"))
  }

  redirect(appendQueryParam(redirectTo, "edit_request", "success"))
}