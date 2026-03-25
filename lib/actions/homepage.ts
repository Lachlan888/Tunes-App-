"use server"

import { getTomorrow } from "@/lib/review"
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

export async function createTune(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const key = formData.get("key") as string
  const style = formData.get("style") as string
  const time_signature = formData.get("time_signature") as string

  const { error } = await supabase.from("pieces").insert({
    title,
    key: key || null,
    style: style || null,
    time_signature: time_signature || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect("/")
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
    existingItems && existingItems.length > 0 && existingItems[0].position != null
      ? existingItems[0].position + 1
      : 1

  const { error: insertError } = await supabase.from("learning_list_items").insert({
    piece_id,
    learning_list_id,
    position: nextPosition,
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  redirect("/")
}

export async function startLearning(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const piece_id = Number(formData.get("piece_id"))
  const nextReviewDue = getTomorrow()

  const { data: existingUserPiece, error: fetchError } = await supabase
    .from("user_pieces")
    .select("id")
    .eq("user_id", user.id)
    .eq("piece_id", piece_id)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (existingUserPiece) {
    redirect("/")
  }

  const { error } = await supabase.from("user_pieces").insert({
    user_id: user.id,
    piece_id,
    status: "learning",
    stage: 1,
    next_review_due: nextReviewDue,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect("/")
}