"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

function getPositivePieceId(value: FormDataEntryValue | null) {
  const pieceId = Number(value)

  return Number.isInteger(pieceId) && pieceId > 0 ? pieceId : null
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function upsertUserPieceNotes(formData: FormData) {
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
  const notes = formData.get("notes")?.toString().trim() || null

  if (!pieceId || Number.isNaN(pieceId)) {
    return
  }

  const { error } = await supabase.from("user_piece_metadata").upsert(
    {
      user_id: user.id,
      piece_id: pieceId,
      notes,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,piece_id",
    }
  )

  if (error) {
    console.error("Error saving user piece notes:", error)
    return
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
}

export async function upsertPreferredReferenceUrl(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = getPositivePieceId(formData.get("piece_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  if (!pieceId) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "missing_piece"))
  }

  const preferredReferenceUrl = String(
    formData.get("preferred_reference_url") ?? ""
  ).trim()
  const preferredReferenceLabel =
    String(formData.get("preferred_reference_label") ?? "").trim() || null

  if (!preferredReferenceUrl || !isValidUrl(preferredReferenceUrl)) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "invalid_url"))
  }

  if (!isYouTubeUrl(preferredReferenceUrl)) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "not_youtube"))
  }

  const { data: existingPiece, error: existingPieceError } = await supabase
    .from("pieces")
    .select("id")
    .eq("id", pieceId)
    .maybeSingle()

  if (existingPieceError || !existingPiece) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "missing_piece"))
  }

  const { error } = await supabase.from("user_piece_metadata").upsert(
    {
      user_id: user.id,
      piece_id: pieceId,
      preferred_reference_url: preferredReferenceUrl,
      preferred_reference_label: preferredReferenceLabel,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,piece_id",
    }
  )

  if (error) {
    console.error("Error saving preferred reference:", error)
    redirect(appendQueryParam(redirectTo, "preferred_reference", "error"))
  }

  revalidatePath("/library")
  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
  revalidatePath("/review")

  redirect(appendQueryParam(redirectTo, "preferred_reference", "saved"))
}

export async function removePreferredReferenceUrl(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const pieceId = getPositivePieceId(formData.get("piece_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/library")

  if (!pieceId) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "missing_piece"))
  }

  const { data: existingPiece, error: existingPieceError } = await supabase
    .from("pieces")
    .select("id")
    .eq("id", pieceId)
    .maybeSingle()

  if (existingPieceError || !existingPiece) {
    redirect(appendQueryParam(redirectTo, "preferred_reference", "missing_piece"))
  }

  const { error } = await supabase.from("user_piece_metadata").upsert(
    {
      user_id: user.id,
      piece_id: pieceId,
      preferred_reference_url: null,
      preferred_reference_label: null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,piece_id",
    }
  )

  if (error) {
    console.error("Error removing preferred reference:", error)
    redirect(appendQueryParam(redirectTo, "preferred_reference", "error"))
  }

  revalidatePath("/library")
  revalidatePath(`/library/${pieceId}`)
  revalidatePath(redirectTo)
  revalidatePath("/review")

  redirect(appendQueryParam(redirectTo, "preferred_reference", "removed"))
}
