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

  const encodedUsername = encodeURIComponent(username)
  const encodedDisplayName = encodeURIComponent(displayNameRaw)

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    redirect(
      `/dashboard?error=invalid_username&username=${encodedUsername}&display_name=${encodedDisplayName}`
    )
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
    redirect(
      `/dashboard?error=save_failed&username=${encodedUsername}&display_name=${encodedDisplayName}`
    )
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
      redirect(
        `/dashboard?error=username_taken&username=${encodedUsername}&display_name=${encodedDisplayName}`
      )
    }

    redirect(
      `/dashboard?error=save_failed&username=${encodedUsername}&display_name=${encodedDisplayName}`
    )
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