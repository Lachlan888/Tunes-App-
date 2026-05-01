"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function asNullableString(value: FormDataEntryValue | null) {
  const trimmed = String(value ?? "").trim()
  return trimmed === "" ? null : trimmed
}

function asBoolean(value: FormDataEntryValue | null) {
  return value === "on"
}

function getProfileDraftParams(formData: FormData) {
  const params = new URLSearchParams()

  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const displayName = String(formData.get("display_name") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()

  params.set("username", username)
  params.set("display_name", displayName)
  params.set("bio", bio)
  params.set("show_identity", String(asBoolean(formData.get("show_identity"))))
  params.set(
    "show_instruments",
    String(asBoolean(formData.get("show_instruments")))
  )
  params.set(
    "show_public_lists_on_profile",
    String(asBoolean(formData.get("show_public_lists_on_profile")))
  )
  params.set(
    "show_repertoire_summary",
    String(asBoolean(formData.get("show_repertoire_summary")))
  )
  params.set(
    "show_compare_discoverability",
    String(asBoolean(formData.get("show_compare_discoverability")))
  )
  params.set(
    "compare_requires_friend",
    String(asBoolean(formData.get("compare_requires_friend")))
  )

  return params
}

function redirectWithProfileError(error: string, formData: FormData): never {
  const params = getProfileDraftParams(formData)
  params.set("error", error)

  redirect(`/dashboard?${params.toString()}`)
}

export async function updateProfile(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const displayNameRaw = String(formData.get("display_name") ?? "").trim()
  const display_name = displayNameRaw === "" ? null : displayNameRaw
  const bio = asNullableString(formData.get("bio"))

  const show_identity = asBoolean(formData.get("show_identity"))
  const show_instruments = asBoolean(formData.get("show_instruments"))
  const show_public_lists_on_profile = asBoolean(
    formData.get("show_public_lists_on_profile")
  )
  const show_repertoire_summary = asBoolean(
    formData.get("show_repertoire_summary")
  )
  const show_compare_discoverability = asBoolean(
    formData.get("show_compare_discoverability")
  )
  const compare_requires_friend = asBoolean(
    formData.get("compare_requires_friend")
  )

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    redirectWithProfileError("invalid_username", formData)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  if (existingProfileError) {
    redirectWithProfileError("save_failed", formData)
  }

  const previousUsername =
    existingProfile && typeof existingProfile.username === "string"
      ? existingProfile.username
      : null

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
      display_name,
      bio,
      show_identity,
      show_instruments,
      show_public_lists_on_profile,
      show_repertoire_summary,
      show_compare_discoverability,
      compare_requires_friend,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  )

  if (error) {
    if (error.code === "23505") {
      redirectWithProfileError("username_taken", formData)
    }

    redirectWithProfileError("save_failed", formData)
  }

  revalidatePath("/dashboard")
  revalidatePath("/compare")
  revalidatePath("/friends")

  if (previousUsername) {
    revalidatePath(`/users/${previousUsername}`)
  }

  revalidatePath(`/users/${username}`)

  redirect("/dashboard?saved=1")
}