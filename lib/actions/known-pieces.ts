"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { recordMarkedKnownEvent } from "@/lib/activity-events"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function markPieceKnownForUser(
  supabase: SupabaseServerClient,
  userId: string,
  pieceId: number
): Promise<"marked_known" | "already_known"> {
  const { data: existingPractice, error: existingPracticeError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", userId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingPracticeError) {
    throw new Error(existingPracticeError.message)
  }

  if (existingPractice) {
    const { error: deletePracticeError } = await supabase
      .from("user_pieces")
      .delete()
      .eq("user_id", userId)
      .eq("piece_id", pieceId)

    if (deletePracticeError) {
      throw new Error(deletePracticeError.message)
    }
  }

  const { data: existingKnown, error: existingKnownError } = await supabase
    .from("user_known_pieces")
    .select("id")
    .eq("user_id", userId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingKnownError) {
    throw new Error(existingKnownError.message)
  }

  if (existingKnown) {
    return "already_known"
  }

  const { error: insertKnownError } = await supabase
    .from("user_known_pieces")
    .insert({
      user_id: userId,
      piece_id: pieceId,
    })

  if (insertKnownError) {
    throw new Error(insertKnownError.message)
  }

  await recordMarkedKnownEvent(userId, pieceId)

  return "marked_known"
}

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

  await markPieceKnownForUser(supabase, user.id, pieceId)

  redirect(redirectTo)
}