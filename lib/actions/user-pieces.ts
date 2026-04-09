"use server"

import { getTomorrow } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { recordStartedPracticeEvent } from "@/lib/activity-events"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function startLearning(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const piece_id = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") || "/")
  const nextReviewDue = getTomorrow()

  if (!piece_id || Number.isNaN(piece_id)) {
    redirect(redirectTo)
  }

  const { data: existingUserPiece, error: fetchUserPieceError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", piece_id)
    .maybeSingle()

  if (fetchUserPieceError) {
    throw new Error(fetchUserPieceError.message)
  }

  if (existingUserPiece) {
    redirect(redirectTo)
  }

  const { error: deleteKnownError } = await supabase
    .from("user_known_pieces")
    .delete()
    .eq("user_id", user.id)
    .eq("piece_id", piece_id)

  if (deleteKnownError) {
    throw new Error(deleteKnownError.message)
  }

  const { error: insertUserPieceError } = await supabase
    .from("user_pieces")
    .insert({
      user_id: user.id,
      piece_id,
      status: "learning",
      stage: 1,
      next_review_due: nextReviewDue,
    })

  if (insertUserPieceError) {
    throw new Error(insertUserPieceError.message)
  }

  await recordStartedPracticeEvent(user.id, piece_id)

  redirect(redirectTo)
}

export async function removeFromPractice(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const userPieceId = Number(formData.get("user_piece_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/review")

  if (!userPieceId || Number.isNaN(userPieceId)) {
    redirect(
      appendQueryParam(redirectTo, "remove_from_practice", "missing_user_piece")
    )
  }

  const { data: existingUserPiece, error: fetchUserPieceError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchUserPieceError) {
    redirect(appendQueryParam(redirectTo, "remove_from_practice", "error"))
  }

  if (!existingUserPiece) {
    redirect(appendQueryParam(redirectTo, "remove_from_practice", "not_found"))
  }

  const { error: deleteUserPieceError } = await supabase
    .from("user_pieces")
    .delete()
    .eq("id", userPieceId)
    .eq("user_id", user.id)

  if (deleteUserPieceError) {
    redirect(appendQueryParam(redirectTo, "remove_from_practice", "error"))
  }

  redirect(appendQueryParam(redirectTo, "remove_from_practice", "success"))
}