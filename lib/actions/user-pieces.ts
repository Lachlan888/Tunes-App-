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

  const { data: existingUserPiece, error: fetchError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", piece_id)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (existingUserPiece) {
    redirect(redirectTo)
  }

  const { error } = await supabase.from("user_pieces").insert({
    user_id: user.id,
    piece_id,
    status: "learning",
    stage: 1,
    next_review_due: nextReviewDue,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect(redirectTo)
}