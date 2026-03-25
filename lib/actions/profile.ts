"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const displayNameRaw = String(formData.get("display_name") ?? "").trim()
  const display_name = displayNameRaw === "" ? null : displayNameRaw

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

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

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
  redirect("/dashboard?saved=1")
}