"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
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

export type FormalReviewActionResult =
  | {
      ok: true
      applied: boolean
      pieceId: number
      reviewEventId: number | null
      movedToKnown: boolean
    }
  | { ok: false; error: string }

async function recordReviewInPlace(
  formData: FormData,
  outcome: "solid" | "shaky" | "failed"
): Promise<FormalReviewActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Your session has expired. Sign in and try again." }
  }

  const userPieceId = Number(formData.get("userPieceId"))
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
    return { ok: false, error: "This review could not be identified. Try again." }
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
    return { ok: false, error: "The rating could not be saved. Try again." }
  }

  const result = Array.isArray(data) ? data[0] : null
  const movedToKnown = Boolean(result?.moved_to_known)

  revalidatePath("/")
  revalidatePath("/review")
  revalidatePath(`/library/${Number(result?.piece_id)}`)

  return {
    ok: true,
    applied: Boolean(result?.applied),
    pieceId: Number(result?.piece_id),
    reviewEventId: result?.review_event_id
      ? Number(result.review_event_id)
      : null,
    movedToKnown,
  }
}

export async function completeFormalReviewInPlace(
  formData: FormData
): Promise<FormalReviewActionResult> {
  const outcome = String(formData.get("outcome") ?? "")

  if (outcome !== "solid" && outcome !== "shaky" && outcome !== "failed") {
    return { ok: false, error: "Choose Rough, Shaky or Solid." }
  }

  return recordReviewInPlace(formData, outcome)
}

async function recordReview(
  formData: FormData,
  outcome: "solid" | "shaky" | "failed"
) {
  const redirectTo = String(formData.get("redirectTo") || "/review")
  const result = await recordReviewInPlace(formData, outcome)

  if (!result.ok) {
    redirect(appendQueryParam(redirectTo, "practice_update", "error"))
  }

  if (result.movedToKnown) {
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
