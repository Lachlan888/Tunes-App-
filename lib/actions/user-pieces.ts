"use server"

import { redirect } from "next/navigation"
import { getTomorrow } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function appendQueryParam(url: string, key: string, value: string) {
  const [baseUrl, hash] = url.split("#", 2)
  const separator = baseUrl.includes("?") ? "&" : "?"
  const nextUrl = `${baseUrl}${separator}${key}=${encodeURIComponent(value)}`

  return hash ? `${nextUrl}#${hash}` : nextUrl
}

export async function startPracticeForUser(
  supabase: SupabaseServerClient,
  pieceId: number
): Promise<"started" | "already_in_practice"> {
  const nextReviewDue = getTomorrow()
  const { data, error } = await supabase.rpc("enrol_piece_in_practice", {
    p_piece_id: pieceId,
    p_next_review_due: nextReviewDue,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data !== "started" && data !== "already_in_practice") {
    throw new Error("Unexpected practice transition result")
  }

  return data
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

  await startPracticeForUser(supabase, pieceId)

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
