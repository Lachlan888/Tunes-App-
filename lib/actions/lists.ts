"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function createList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/learning-lists")

  if (!name) {
    redirect(appendQueryParam(redirectTo, "create_list", "missing_name"))
  }

  const { error } = await supabase.from("learning_lists").insert({
    name,
    description: description || null,
    user_id: user.id,
  })

  if (error) {
    redirect(appendQueryParam(redirectTo, "create_list", "error"))
  }

  redirect(appendQueryParam(redirectTo, "create_list", "success"))
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