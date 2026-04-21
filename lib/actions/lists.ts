"use server"

import { createClient } from "@/lib/supabase/server"
import {
  recordPublicListCreatedEvent,
  recordPublicListUpdatedEvent,
} from "@/lib/activity-events"
import { redirect } from "next/navigation"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type ListVisibility = "private" | "public"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function appendQueryParams(
  url: string,
  params: Record<string, string | number | null | undefined>
) {
  let nextUrl = url

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    nextUrl = appendQueryParam(nextUrl, key, String(value))
  }

  return nextUrl
}

export async function addPieceToLearningListForUser(
  supabase: SupabaseServerClient,
  userId: string,
  pieceId: number,
  learningListId: number
): Promise<"added" | "duplicate"> {
  const { data: ownedList, error: ownedListError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("id", learningListId)
    .eq("user_id", userId)
    .maybeSingle()

  if (ownedListError) {
    throw new Error(ownedListError.message)
  }

  if (!ownedList) {
    throw new Error("List not found or not owned by user.")
  }

  const { data: existingItem, error: existingItemError } = await supabase
    .from("learning_list_items")
    .select("id")
    .eq("learning_list_id", learningListId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingItemError) {
    throw new Error(existingItemError.message)
  }

  if (existingItem) {
    return "duplicate"
  }

  const { data: existingItems, error: fetchError } = await supabase
    .from("learning_list_items")
    .select("position")
    .eq("learning_list_id", learningListId)
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
      piece_id: pieceId,
      learning_list_id: learningListId,
      position: nextPosition,
    })

  if (insertError) {
    throw new Error(insertError.message)
  }

  return "added"
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

  const pieceId = Number(formData.get("piece_id"))
  const learningListId = Number(formData.get("learning_list_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/")

  await addPieceToLearningListForUser(
    supabase,
    user.id,
    pieceId,
    learningListId
  ).then((status) => {
    redirect(
      buildRedirectUrl(redirectTo, status === "added" ? "success" : "duplicate")
    )
  })
}

export async function importPublicList(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const sourceListId = Number(formData.get("source_list_id"))
  const redirectTo = String(
    formData.get("redirect_to") ?? `/public-lists/${sourceListId}`
  )

  if (!sourceListId) {
    redirect(appendQueryParam(redirectTo, "import_public", "source_not_found"))
  }

  const { data: sourceList, error: sourceListError } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility")
    .eq("id", sourceListId)
    .eq("visibility", "public")
    .single()

  if (sourceListError || !sourceList) {
    redirect(appendQueryParam(redirectTo, "import_public", "source_not_found"))
  }

  const { data: sourceItems, error: sourceItemsError } = await supabase
    .from("learning_list_items")
    .select("piece_id, position")
    .eq("learning_list_id", sourceListId)
    .order("position", { ascending: true })

  if (sourceItemsError) {
    redirect(appendQueryParam(redirectTo, "import_public", "error"))
  }

  const { data: newList, error: newListError } = await supabase
    .from("learning_lists")
    .insert({
      user_id: user.id,
      name: `${sourceList.name} (Imported)`,
      description: sourceList.description,
      visibility: "private",
      is_imported: true,
    })
    .select("id")
    .single()

  if (newListError || !newList) {
    redirect(appendQueryParam(redirectTo, "import_public", "error"))
  }

  if (sourceItems && sourceItems.length > 0) {
    const copiedItems = sourceItems.map((item) => ({
      learning_list_id: newList.id,
      piece_id: item.piece_id,
      position: item.position,
    }))

    const { error: copyItemsError } = await supabase
      .from("learning_list_items")
      .insert(copiedItems)

    if (copyItemsError) {
      redirect(appendQueryParam(redirectTo, "import_public", "error"))
    }
  }

  redirect(
    appendQueryParams(redirectTo, {
      import_public: "imported_all",
      imported_list_id: newList.id,
    })
  )
}

export async function importSelectedPublicListItems(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const sourceListId = Number(formData.get("source_list_id"))
  const targetLearningListId = Number(formData.get("target_learning_list_id"))
  const redirectTo = String(
    formData.get("redirect_to") ?? `/public-lists/${sourceListId}`
  )

  if (!sourceListId) {
    redirect(appendQueryParam(redirectTo, "import_public", "source_not_found"))
  }

  if (!targetLearningListId) {
    redirect(
      appendQueryParam(redirectTo, "import_public", "missing_target_list")
    )
  }

  const selectedPieceIds = Array.from(
    new Set(
      formData
        .getAll("piece_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  )

  if (selectedPieceIds.length === 0) {
    redirect(appendQueryParam(redirectTo, "import_public", "no_selection"))
  }

  const { data: sourceList, error: sourceListError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("id", sourceListId)
    .eq("visibility", "public")
    .maybeSingle()

  if (sourceListError || !sourceList) {
    redirect(appendQueryParam(redirectTo, "import_public", "source_not_found"))
  }

  const { data: targetList, error: targetListError } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("id", targetLearningListId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (targetListError || !targetList) {
    redirect(
      appendQueryParam(redirectTo, "import_public", "missing_target_list")
    )
  }

  const { data: sourceItems, error: sourceItemsError } = await supabase
    .from("learning_list_items")
    .select("piece_id, position")
    .eq("learning_list_id", sourceListId)
    .in("piece_id", selectedPieceIds)
    .order("position", { ascending: true })

  if (sourceItemsError) {
    redirect(appendQueryParam(redirectTo, "import_public", "error"))
  }

  if (!sourceItems || sourceItems.length === 0) {
    redirect(appendQueryParam(redirectTo, "import_public", "no_selection"))
  }

  let addedCount = 0
  let duplicateCount = 0

  for (const item of sourceItems) {
    const status = await addPieceToLearningListForUser(
      supabase,
      user.id,
      item.piece_id,
      targetLearningListId
    )

    if (status === "added") {
      addedCount += 1
    } else {
      duplicateCount += 1
    }
  }

  redirect(
    appendQueryParams(redirectTo, {
      import_public: "imported_selected",
      added_count: addedCount,
      duplicate_count: duplicateCount,
      imported_list_id: targetLearningListId,
    })
  )
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