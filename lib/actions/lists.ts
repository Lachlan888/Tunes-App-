"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  await supabase.from("learning_lists").insert({
    name,
    description,
    user_id: user.id,
  })

  redirect("/")
}

function buildRedirectUrl(basePath: string, status: "success" | "duplicate") {
  const separator = basePath.includes("?") ? "&" : "?"
  return `${basePath}${separator}list_add=${status}`
}

export async function addToLearningList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const piece_id = Number(formData.get("piece_id"))
  const learning_list_id = Number(formData.get("learning_list_id"))
  const redirectTo = (formData.get("redirect_to") as string) || "/"

  const { data: existingItem, error: existingItemError } = await supabase
    .from("learning_list_items")
    .select("id")
    .eq("learning_list_id", learning_list_id)
    .eq("piece_id", piece_id)
    .maybeSingle()

  if (existingItemError) {
    throw new Error(existingItemError.message)
  }

  if (existingItem) {
    redirect(buildRedirectUrl(redirectTo, "duplicate"))
  }

  const { data: existingItems, error: fetchError } = await supabase
    .from("learning_list_items")
    .select("position")
    .eq("learning_list_id", learning_list_id)
    .not("position", "is", null)
    .order("position", { ascending: false })
    .limit(1)

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const nextPosition =
    existingItems &&
    existingItems.length > 0 &&
    existingItems[0].position != null
      ? existingItems[0].position + 1
      : 1

  const { error: insertError } = await supabase
    .from("learning_list_items")
    .insert({
      piece_id,
      learning_list_id,
      position: nextPosition,
    })

  if (insertError) {
    throw new Error(insertError.message)
  }

  redirect(buildRedirectUrl(redirectTo, "success"))
}