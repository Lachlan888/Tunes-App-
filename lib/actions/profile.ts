"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const displayNameRaw = String(formData.get("display_name") ?? "").trim()
  const display_name = displayNameRaw === "" ? null : displayNameRaw

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  await supabase
    .from("profiles")
    .update({
      username,
      display_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  revalidatePath("/dashboard")
}