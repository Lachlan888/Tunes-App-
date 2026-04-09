"use server"

import { createClient } from "@/lib/supabase/server"
import {
  recordPublicListCreatedEvent,
  recordPublicListUpdatedEvent,
} from "@/lib/activity-events"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

type ListVisibility = "private" | "public"

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
  const visibility = String(formData.get("visibility") ?? "private").trim()

  if (!name) {
    redirect(appendQueryParam(redirectTo, "create_list", "missing_name"))
  }

  if (visibility !== "private" && visibility !== "public") {
    redirect(appendQueryParam(redirectTo, "create_list", "invalid_visibility"))
  }

  const { data: createdList, error } = await supabase
    .from("learning_lists")
    .insert({
      name,
      description: description || null,
      visibility,
      user_id: user.id,
    })
    .select("id, visibility")
    .single()

  if (error) {
    redirect(appendQueryParam(redirectTo, "create_list", "error"))
  }

  if (createdList.visibility === "public") {
    await recordPublicListCreatedEvent(user.id, createdList.id)
  }

  redirect(appendQueryParam(redirectTo, "create_list", "success"))
}

export async function createListInline(
  _prevState: {
    status: "idle" | "success" | "error"
    error: string | null
    createdList: {
      id: number
      name: string
      description: string | null
      visibility: ListVisibility
    } | null
  },
  formData: FormData
): Promise<{
  status: "idle" | "success" | "error"
  error: string | null
  createdList: {
    id: number
    name: string
    description: string | null
    visibility: ListVisibility
  } | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: "error",
      error: "Please log in again.",
      createdList: null,
    }
  }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const visibility = String(formData.get("visibility") ?? "private").trim()

  if (!name) {
    return {
      status: "error",
      error: "Enter a list name.",
      createdList: null,
    }
  }

  if (visibility !== "private" && visibility !== "public") {
    return {
      status: "error",
      error: "Invalid list visibility.",
      createdList: null,
    }
  }

  const { data: createdList, error } = await supabase
    .from("learning_lists")
    .insert({
      name,
      description: description || null,
      visibility,
      user_id: user.id,
    })
    .select("id, name, description, visibility")
    .single()

  if (error || !createdList) {
    return {
      status: "error",
      error: "Could not create list.",
      createdList: null,
    }
  }

  if (createdList.visibility === "public") {
    await recordPublicListCreatedEvent(user.id, createdList.id)
  }

  return {
    status: "success",
    error: null,
    createdList: {
      id: createdList.id,
      name: createdList.name,
      description: createdList.description,
      visibility: createdList.visibility as ListVisibility,
    },
  }
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

export async function updateList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const listId = Number(formData.get("learning_list_id"))
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const visibility = String(formData.get("visibility") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/learning-lists")

  if (!listId) {
    redirect(appendQueryParam(redirectTo, "edit_list", "missing_list"))
  }

  if (!name) {
    redirect(appendQueryParam(redirectTo, "edit_list", "missing_name"))
  }

  if (visibility !== "private" && visibility !== "public") {
    redirect(appendQueryParam(redirectTo, "edit_list", "invalid_visibility"))
  }

  const { data: ownedList, error: ownedListError } = await supabase
    .from("learning_lists")
    .select("id, visibility, name, description")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ownedListError || !ownedList) {
    redirect(appendQueryParam(redirectTo, "edit_list", "not_found"))
  }

  const wasPublic = ownedList.visibility === "public"
  const isMeaningfulChange =
    ownedList.name !== name ||
    (ownedList.description ?? "") !== (description || "") ||
    ownedList.visibility !== visibility

  const { error: updateError } = await supabase
    .from("learning_lists")
    .update({
      name,
      description: description || null,
      visibility,
    })
    .eq("id", listId)
    .eq("user_id", user.id)

  if (updateError) {
    redirect(appendQueryParam(redirectTo, "edit_list", "error"))
  }

  if (visibility === "public") {
    if (!wasPublic) {
      await recordPublicListCreatedEvent(user.id, listId)
    } else if (isMeaningfulChange) {
      await recordPublicListUpdatedEvent(user.id, listId)
    }
  }

  redirect(appendQueryParam(redirectTo, "edit_list", "success"))
}

export async function removeTuneFromList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const listId = Number(formData.get("learning_list_id"))
  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/learning-lists")

  if (!listId || !pieceId) {
    redirect(appendQueryParam(redirectTo, "edit_list", "missing_item"))
  }

  const { data: ownedList, error: ownedListError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ownedListError || !ownedList) {
    redirect(appendQueryParam(redirectTo, "edit_list", "not_found"))
  }

  const { error: deleteError } = await supabase
    .from("learning_list_items")
    .delete()
    .eq("learning_list_id", listId)
    .eq("piece_id", pieceId)

  if (deleteError) {
    redirect(appendQueryParam(redirectTo, "edit_list", "error"))
  }

  redirect(appendQueryParam(redirectTo, "edit_list", "removed_tune"))
}

export async function deleteList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const listId = Number(formData.get("learning_list_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/learning-lists")

  if (!listId) {
    redirect(appendQueryParam(redirectTo, "edit_list", "missing_list"))
  }

  const { data: ownedList, error: ownedListError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ownedListError || !ownedList) {
    redirect(appendQueryParam(redirectTo, "edit_list", "not_found"))
  }

  const { error: itemsDeleteError } = await supabase
    .from("learning_list_items")
    .delete()
    .eq("learning_list_id", listId)

  if (itemsDeleteError) {
    redirect(appendQueryParam(redirectTo, "edit_list", "error"))
  }

  const { error: listDeleteError } = await supabase
    .from("learning_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id)

  if (listDeleteError) {
    redirect(appendQueryParam(redirectTo, "edit_list", "error"))
  }

  redirect(appendQueryParam(redirectTo, "edit_list", "deleted"))
}