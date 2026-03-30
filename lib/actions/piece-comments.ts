"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addPieceComment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    formData.get("redirect_to")?.toString() || `/library/${pieceId}`
  const body = formData.get("body")?.toString().trim() || ""

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  if (!body) {
    return
  }

  const { error } = await supabase.from("piece_comments").insert({
    piece_id: pieceId,
    user_id: user.id,
    body,
  })

  if (error) {
    console.error("Error adding piece comment:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}