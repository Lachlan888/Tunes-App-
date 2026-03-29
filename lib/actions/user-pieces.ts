"use server"

import { getTomorrow } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

  const { error: insertUserPieceError } = await supabase.from("user_pieces").insert({
    user_id: user.id,
    piece_id,
    status: "learning",
    stage: 1,
    next_review_due: nextReviewDue,
  })

  if (insertUserPieceError) {
    throw new Error(insertUserPieceError.message)
  }

  redirect(redirectTo)
}