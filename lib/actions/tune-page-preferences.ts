"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const PREFERENCE_FIELDS = [
  "show_tune_state",
  "show_canonical_details",
  "show_my_notes",
  "show_practice_history",
  "show_media_links",
  "show_sheet_music",
  "show_lore",
  "show_comments",
] as const

type PreferenceField = (typeof PREFERENCE_FIELDS)[number]

function getRedirectTo(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()

  if (!redirectTo.startsWith("/")) {
    return "/library"
  }

  return redirectTo
}

function appendStatus(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function getBooleanFromForm(formData: FormData, field: PreferenceField) {
  return formData.get(field) === "true"
}

export async function updateTunePagePreferences(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const redirectTo = getRedirectTo(formData)

  const preferencePayload = Object.fromEntries(
    PREFERENCE_FIELDS.map((field) => [field, getBooleanFromForm(formData, field)])
  ) as Record<PreferenceField, boolean>

  const { error } = await supabase
    .from("user_tune_page_preferences")
    .upsert(
      {
        user_id: user.id,
        ...preferencePayload,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )

  if (error) {
    redirect(appendStatus(redirectTo, "view_preferences", "error"))
  }

  redirect(appendStatus(redirectTo, "view_preferences", "saved"))
}