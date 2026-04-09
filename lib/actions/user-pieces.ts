"use server"

import { getTomorrow } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { recordStartedPracticeEvent } from "@/lib/activity-events"
import { redirect } from "next/navigation"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function startPracticeForUser(
  supabase: SupabaseServerClient,
  userId: string,
  pieceId: number
): Promise<"started" | "already_in_practice"> {
  const nextReviewDue = getTomorrow()

  const { data: existingUserPiece, error: fetchUserPieceError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", userId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (fetchUserPieceError) {
    throw new Error(fetchUserPieceError.message)
  }

  if (existingUserPiece) {
    return "already_in_practice"
  }

  const { error: deleteKnownError } = await supabase
    .from("user_known_pieces")
    .delete()
    .eq("user_id", userId)
    .eq("piece_id", pieceId)

  if (deleteKnownError) {
    throw new Error(deleteKnownError.message)
  }

  const { error: insertUserPieceError } = await supabase
    .from("user_pieces")
    .insert({
      user_id: userId,
      piece_id: pieceId,
      status: "learning",
      stage: 1,
      next_review_due: nextReviewDue,
    })

  if (insertUserPieceError) {
    throw new Error(insertUserPieceError.message)
  }

  await recordStartedPracticeEvent(userId, pieceId)

  return "started"
}

export async function startLearning(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") || "/")

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(redirectTo)
  }

  await startPracticeForUser(supabase, user.id, pieceId)

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