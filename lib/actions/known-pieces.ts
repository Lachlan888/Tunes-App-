"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function markPieceKnownForUser(
  supabase: SupabaseServerClient,
  pieceId: number
): Promise<"marked_known" | "already_known"> {
  const { data, error } = await supabase.rpc("mark_piece_known", {
    p_piece_id: pieceId,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data !== "marked_known" && data !== "already_known") {
    throw new Error("Unexpected known transition result")
  }

  return data
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

  await markPieceKnownForUser(supabase, pieceId)

  redirect(redirectTo)
}
