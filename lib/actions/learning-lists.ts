"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function toggleLearningListVisibility(formData: FormData) {
  const listId = Number(formData.get("list_id"))
  const nextVisibility = String(formData.get("next_visibility"))

  if (
    Number.isNaN(listId) ||
    (nextVisibility !== "private" && nextVisibility !== "public")
  ) {
    throw new Error("Invalid visibility request")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: existingList, error: existingListError } = await supabase
    .from("learning_lists")
    .select("id, user_id, visibility, is_imported")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single()

  if (existingListError || !existingList) {
    throw new Error("Learning list not found")
  }

  if (nextVisibility === "public" && existingList.is_imported) {
    throw new Error("Imported lists cannot be made public")
  }

  const { error: updateError } = await supabase
    .from("learning_lists")
    .update({ visibility: nextVisibility })
    .eq("id", listId)
    .eq("user_id", user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/learning-lists")
}