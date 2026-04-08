"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { recordMarkedKnownEvent } from "@/lib/activity-events"

export async function markAsKnown(formData: FormData) {
  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  if (!pieceId) {
    redirect(redirectTo)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: existingPractice, error: existingPracticeError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingPracticeError) {
    throw new Error(existingPracticeError.message)
  }

  if (existingPractice) {
    const { error: deletePracticeError } = await supabase
      .from("user_pieces")
      .delete()
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)

    if (deletePracticeError) {
      throw new Error(deletePracticeError.message)
    }
  }

  const { data: existingKnown, error: existingKnownError } = await supabase
    .from("user_known_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingKnownError) {
    throw new Error(existingKnownError.message)
  }

  if (!existingKnown) {
    const { error: insertKnownError } = await supabase
      .from("user_known_pieces")
      .insert({
        user_id: user.id,
        piece_id: pieceId,
      })

    if (insertKnownError) {
      throw new Error(insertKnownError.message)
    }

    await recordMarkedKnownEvent(user.id, pieceId)
  }

  redirect(redirectTo)
}