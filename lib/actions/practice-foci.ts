"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function getRedirectTo(formData: FormData, fallback = "/review/foci") {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()

  if (!redirectTo.startsWith("/")) {
    return fallback
  }

  return redirectTo
}

function appendStatus(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function asPositiveInteger(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

function normaliseOptionalDateOnly(value: FormDataEntryValue | null) {
  const date = String(value ?? "").trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  return null
}

async function requireUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return {
    supabase,
    user,
  }
}

export async function createPracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const targetDate = normaliseOptionalDateOnly(formData.get("target_date"))

  if (title === "") {
    redirect(appendStatus(redirectTo, "foci", "missing_title"))
  }

  const { error } = await supabase.from("practice_foci").insert({
    user_id: user.id,
    title,
    description: description === "" ? null : description,
    status: "active",
    started_at: new Date().toISOString().slice(0, 10),
    target_date: targetDate,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "created"))
}

export async function updatePracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const focusId = asPositiveInteger(formData.get("focus_id"))
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const targetDate = normaliseOptionalDateOnly(formData.get("target_date"))

  if (!focusId) {
    redirect(appendStatus(redirectTo, "foci", "missing_focus"))
  }

  if (title === "") {
    redirect(appendStatus(redirectTo, "foci", "missing_title"))
  }

  const { error } = await supabase
    .from("practice_foci")
    .update({
      title,
      description: description === "" ? null : description,
      target_date: targetDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", focusId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "updated"))
}

export async function archivePracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const focusId = asPositiveInteger(formData.get("focus_id"))

  if (!focusId) {
    redirect(appendStatus(redirectTo, "foci", "missing_focus"))
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from("practice_foci")
    .update({
      status: "archived",
      archived_at: now,
      updated_at: now,
    })
    .eq("id", focusId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "archived"))
}

export async function deletePracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const focusId = asPositiveInteger(formData.get("focus_id"))

  if (!focusId) {
    redirect(appendStatus(redirectTo, "foci", "missing_focus"))
  }

  const { error } = await supabase
    .from("practice_foci")
    .delete()
    .eq("id", focusId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "deleted"))
}

export async function addTuneToPracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const focusId = asPositiveInteger(formData.get("focus_id"))
  const pieceId = asPositiveInteger(formData.get("piece_id"))

  if (!focusId) {
    redirect(appendStatus(redirectTo, "foci", "missing_focus"))
  }

  if (!pieceId) {
    redirect(appendStatus(redirectTo, "foci", "missing_piece"))
  }

  const { data: focus, error: focusError } = await supabase
    .from("practice_foci")
    .select("id, status")
    .eq("id", focusId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (focusError) {
    throw new Error(focusError.message)
  }

  if (!focus) {
    redirect(appendStatus(redirectTo, "foci", "focus_not_found"))
  }

  if (focus.status !== "active") {
    redirect(appendStatus(redirectTo, "foci", "focus_not_active"))
  }

  const [
    { data: userPiece, error: userPieceError },
    { data: knownPiece, error: knownPieceError },
  ] = await Promise.all([
    supabase
      .from("user_pieces")
      .select("id")
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .eq("status", "learning")
      .maybeSingle(),

    supabase
      .from("user_known_pieces")
      .select("id")
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .maybeSingle(),
  ])

  if (userPieceError) {
    throw new Error(userPieceError.message)
  }

  if (knownPieceError) {
    throw new Error(knownPieceError.message)
  }

  if (!userPiece && !knownPiece) {
    redirect(appendStatus(redirectTo, "foci", "not_in_repertoire"))
  }

  const { error } = await supabase.from("practice_focus_tunes").upsert(
    {
      user_id: user.id,
      focus_id: focusId,
      piece_id: pieceId,
    },
    {
      onConflict: "focus_id,piece_id",
      ignoreDuplicates: true,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "tune_added"))
}

export async function removeTuneFromPracticeFocus(formData: FormData) {
  const { supabase, user } = await requireUser()

  const redirectTo = getRedirectTo(formData)
  const focusTuneId = asPositiveInteger(formData.get("focus_tune_id"))

  if (!focusTuneId) {
    redirect(appendStatus(redirectTo, "foci", "missing_focus_tune"))
  }

  const { error } = await supabase
    .from("practice_focus_tunes")
    .delete()
    .eq("id", focusTuneId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/foci")
  redirect(appendStatus(redirectTo, "foci", "tune_removed"))
}