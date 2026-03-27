"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markAsKnown(formData: FormData) {
  const pieceId = Number(formData.get("piece_id"))

  if (!pieceId) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: existingPractice } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingPractice) {
    return
  }

  const { data: existingKnown } = await supabase
    .from("user_known_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (!existingKnown) {
    await supabase.from("user_known_pieces").insert({
      user_id: user.id,
      piece_id: pieceId,
    })
  }

  revalidatePath("/library")
}