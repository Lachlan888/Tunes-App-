"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleLearningListVisibility(formData: FormData) {
  const listId = Number(formData.get("list_id"))
  const nextVisibility = String(formData.get("next_visibility"))

  if (!listId) return
  if (nextVisibility !== "private" && nextVisibility !== "public") return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from("learning_lists")
    .update({ visibility: nextVisibility })
    .eq("id", listId)
    .eq("user_id", user.id)

  revalidatePath("/learning-lists")
}