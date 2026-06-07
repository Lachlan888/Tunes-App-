"use server"

import { redirect } from "next/navigation"
import { getToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"

function appendQueryParam(url: string, key: string, value: string) {
  const [baseUrl, hash] = url.split("#", 2)
  const separator = baseUrl.includes("?") ? "&" : "?"
  const nextUrl = `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`

  return hash ? `${nextUrl}#${hash}` : nextUrl
}

function getOptionalPositiveNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

async function recordReview(
  formData: FormData,
  outcome: "solid" | "shaky" | "failed"
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const userPieceId = Number(formData.get("userPieceId"))
  const redirectTo = String(formData.get("redirectTo") || "/review")
  const submissionKey = String(formData.get("reviewSubmissionKey") ?? "").trim()
  const noteBody = String(formData.get("practice_note") ?? "").trim()
  const categoryId = getOptionalPositiveNumber(formData.get("category_id"))
  const focusId = getOptionalPositiveNumber(formData.get("focus_id"))
  const shouldAddTuneToFocus =
    String(formData.get("add_tune_to_focus") ?? "") === "on"

  if (
    !Number.isInteger(userPieceId) ||
    userPieceId <= 0 ||
    submissionKey.length < 16
  ) {
    redirect(redirectTo)
  }

  const { data, error } = await supabase.rpc("complete_formal_review", {
    p_submission_key: submissionKey,
    p_user_piece_id: userPieceId,
    p_outcome: outcome,
    p_note_body: noteBody || null,
    p_category_id: categoryId,
    p_focus_id: focusId,
    p_add_tune_to_focus: shouldAddTuneToFocus,
    p_today: getToday(),
  })

  if (error) {
    throw new Error(error.message)
  }

  const result = Array.isArray(data) ? data[0] : null
  const movedToKnown = Boolean(result?.moved_to_known)

  if (movedToKnown) {
    redirect(appendQueryParam(redirectTo, "practice_update", "moved_to_known"))
  }

  redirect(redirectTo)
}

export async function markSolid(formData: FormData) {
  await recordReview(formData, "solid")
}

export async function markShaky(formData: FormData) {
  await recordReview(formData, "shaky")
}

export async function markFailed(formData: FormData) {
  await recordReview(formData, "failed")
}
