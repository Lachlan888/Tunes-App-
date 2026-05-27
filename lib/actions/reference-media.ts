"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { recordPieceDetailsAddedEvent } from "@/lib/services/activity-events"
import { createClient } from "@/lib/supabase/server"
import { isYouTubeUrl } from "@/lib/youtube"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function cleanRedirectTo(
  value: string | FormDataEntryValue | null,
  fallback: string
) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function addReferenceUrlToPiece(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = Number(formData.get("piece_id"))
  const referenceUrl = String(formData.get("reference_url") ?? "").trim()
  const referenceLabel =
    String(formData.get("reference_label") ?? "").trim() || null
  const makePreferred = formData.get("make_preferred")?.toString() === "true"
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "reference_url", "missing_piece"))
  }

  if (!referenceUrl || !isValidUrl(referenceUrl)) {
    redirect(appendQueryParam(redirectTo, "reference_url", "invalid_url"))
  }

  if (!isYouTubeUrl(referenceUrl)) {
    redirect(appendQueryParam(redirectTo, "reference_url", "not_youtube"))
  }

  const { data: existingPiece, error: existingPieceError } = await supabase
    .from("pieces")
    .select("id, reference_url")
    .eq("id", pieceId)
    .maybeSingle()

  if (existingPieceError || !existingPiece) {
    redirect(appendQueryParam(redirectTo, "reference_url", "error"))
  }

  if (existingPiece.reference_url) {
    redirect(appendQueryParam(redirectTo, "reference_url", "already_present"))
  }

  const { error: updateError } = await supabase
    .from("pieces")
    .update({
      reference_url: referenceUrl,
    })
    .eq("id", pieceId)
    .is("reference_url", null)

  if (updateError) {
    redirect(appendQueryParam(redirectTo, "reference_url", "error"))
  }

  await recordPieceDetailsAddedEvent(user.id, pieceId, ["reference_url"])

  if (makePreferred) {
    const { error: preferredReferenceError } = await supabase
      .from("user_piece_metadata")
      .upsert(
        {
          user_id: user.id,
          piece_id: pieceId,
          preferred_reference_url: referenceUrl,
          preferred_reference_label: referenceLabel,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,piece_id",
        }
      )

    if (preferredReferenceError) {
      console.error(
        "Error setting reference URL as preferred:",
        preferredReferenceError
      )
    }
  }

  revalidatePath("/library")
  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
  revalidatePath("/review")

  redirect(appendQueryParam(redirectTo, "reference_url", "added"))
}
