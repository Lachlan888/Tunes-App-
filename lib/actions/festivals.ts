"use server"

import { revalidatePath } from "next/cache"
import { requireAppAdmin } from "@/lib/auth/roles"
import {
  FestivalValidationError,
  validateFestivalCollectionInput,
  validateFestivalHubInput,
  validateFestivalSessionInput,
  validateFestivalSettingsInput,
} from "@/lib/festivals/validation"

async function requireFestivalOwner() {
  const context = await requireAppAdmin()
  if (context.adminRole !== "owner") throw new Error("festival_owner_required")
  return context
}

function formRecord(formData: FormData) {
  return Object.fromEntries(formData.entries())
}

function revalidateFestival(slug?: string) {
  revalidatePath("/")
  revalidatePath("/dev")
  revalidatePath("/dev/festivals")
  if (slug) revalidatePath(`/events/${slug}`)
}

export type FestivalActionState = {
  status: "idle" | "success" | "error"
  message: string | null
  field: string | null
}

function actionError(error: unknown): FestivalActionState {
  const code = error instanceof FestivalValidationError
    ? error.code
    : error instanceof Error
      ? error.message
      : "festival_write_failed"
  const field = code.startsWith("invalid_") ? code.slice("invalid_".length) : null
  const messages: Record<string, string> = {
    incomplete_branding: "Add both a branding image URL and descriptive alt text, or leave both blank.",
    mode_requires_selection: "Choose a published festival before turning festival mode on.",
    festival_collection_requires_public_list: "Only an existing public list can be attached.",
    festival_collection_not_found: "That festival list association no longer exists.",
    festival_session_collection_mismatch: "Choose repertoire collections attached to this festival.",
    "festival mode requires a selected published festival": "Festival mode can only be turned on for a selected published festival.",
  }
  return {
    status: "error",
    message: messages[code] ?? (field ? `Check the ${field.replaceAll("_", " ")} field.` : "The festival change could not be saved."),
    field,
  }
}

export async function createFestivalHub(formData: FormData) {
  const { supabase, user } = await requireFestivalOwner()
  const input = validateFestivalHubInput(formRecord(formData))
  const { data, error } = await supabase.from("festival_hubs").insert({ ...input, lifecycle: "draft", created_by: user.id }).select("id,slug").single()
  if (error || !data) throw new Error(error?.message ?? "festival_create_failed")
  revalidateFestival(data.slug)
  return data
}

export async function updateFestivalHub(festivalId: number, values: Record<string, unknown>) {
  const { supabase } = await requireFestivalOwner()
  if (!Number.isInteger(festivalId) || festivalId <= 0) throw new Error("invalid_festival_id")
  const input = validateFestivalHubInput(values)
  const { data, error } = await supabase.from("festival_hubs").update(input).eq("id", festivalId).select("id,slug").single()
  if (error || !data) throw new Error(error?.message ?? "festival_update_failed")
  revalidateFestival(data.slug)
  return data
}

export async function upsertFestivalCollection(values: Record<string, unknown>) {
  const { supabase } = await requireFestivalOwner()
  const input = validateFestivalCollectionInput(values)
  const { data: list } = await supabase.from("learning_lists").select("id").eq("id", input.learning_list_id).eq("visibility", "public").maybeSingle()
  if (!list) throw new Error("festival_collection_requires_public_list")
  const { data, error } = await supabase.from("festival_collections").upsert(input, { onConflict: "festival_id,learning_list_id" }).select("id").single()
  if (error || !data) throw new Error(error?.message ?? "festival_collection_write_failed")
  revalidateFestival()
  return data
}

export async function removeFestivalCollection(collectionId: number, festivalId: number) {
  const { supabase } = await requireFestivalOwner()
  if (!Number.isInteger(collectionId) || collectionId <= 0) throw new Error("invalid_collection_id")
  if (!Number.isInteger(festivalId) || festivalId <= 0) throw new Error("invalid_festival_id")
  const { data, error } = await supabase
    .from("festival_collections")
    .delete()
    .eq("id", collectionId)
    .eq("festival_id", festivalId)
    .select("id")
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("festival_collection_not_found")
  revalidateFestival()
  return data
}

export async function upsertFestivalSession(values: Record<string, unknown>) {
  const { supabase } = await requireFestivalOwner()
  const input = validateFestivalSessionInput(values)
  const collectionIds = Array.from(new Set(
    (Array.isArray(values.festival_collection_ids) ? values.festival_collection_ids : [])
      .map(Number)
  ))
  if (collectionIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error("invalid_festival_collection_ids")
  }
  if (collectionIds.length > 0) {
    const { data: matchingCollections, error: collectionError } = await supabase
      .from("festival_collections")
      .select("id")
      .eq("festival_id", input.festival_id)
      .in("id", collectionIds)
    if (collectionError || matchingCollections?.length !== collectionIds.length) {
      throw new Error("festival_session_collection_mismatch")
    }
  }
  const id = values.id == null ? null : Number(values.id)
  if (id != null && (!Number.isInteger(id) || id <= 0)) throw new Error("invalid_session_id")
  const query = id == null
    ? supabase.from("festival_sessions").insert(input)
    : supabase.from("festival_sessions").update(input).eq("id", id).eq("festival_id", input.festival_id)
  const { data, error } = await query.select("id").single()
  if (error || !data) throw new Error(error?.message ?? "festival_session_write_failed")
  const { error: detachError } = await supabase
    .from("festival_session_collections")
    .delete()
    .eq("festival_id", input.festival_id)
    .eq("session_id", data.id)
  if (detachError) throw new Error(detachError.message)
  if (collectionIds.length > 0) {
    const { error: attachError } = await supabase.from("festival_session_collections").insert(
      collectionIds.map((festivalCollectionId, index) => ({
        festival_id: input.festival_id,
        session_id: data.id,
        festival_collection_id: festivalCollectionId,
        editorial_order: index,
      }))
    )
    if (attachError) throw new Error(attachError.message)
  }
  revalidateFestival()
  return data
}

export async function updateFestivalSettings(values: Record<string, unknown>) {
  const { supabase } = await requireFestivalOwner()
  const input = validateFestivalSettingsInput(values)
  const { data, error } = await supabase.from("festival_settings").update(input).eq("singleton", true).select("mode_enabled,selected_festival_id").single()
  if (error || !data) throw new Error(error?.message ?? "festival_settings_write_failed")
  revalidateFestival()
  return data
}

export async function createFestivalHubFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    await createFestivalHub(formData)
    return { status: "success", message: "Draft festival created.", field: null }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateFestivalHubFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    const festivalId = Number(formData.get("festival_id"))
    await updateFestivalHub(festivalId, formRecord(formData))
    return { status: "success", message: "Festival details saved.", field: null }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateFestivalSettingsFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    await updateFestivalSettings(formRecord(formData))
    return { status: "success", message: "Festival settings saved.", field: null }
  } catch (error) {
    return actionError(error)
  }
}

export async function upsertFestivalCollectionFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    await upsertFestivalCollection(formRecord(formData))
    return { status: "success", message: "Festival list association saved.", field: null }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeFestivalCollectionFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    await removeFestivalCollection(
      Number(formData.get("collection_id")),
      Number(formData.get("festival_id"))
    )
    return { status: "success", message: "Festival list association removed. The source list was unchanged.", field: null }
  } catch (error) {
    return actionError(error)
  }
}

export async function upsertFestivalSessionFromForm(
  _previous: FestivalActionState,
  formData: FormData
): Promise<FestivalActionState> {
  try {
    await upsertFestivalSession({
      ...formRecord(formData),
      festival_collection_ids: formData.getAll("festival_collection_ids"),
    })
    return {
      status: "success",
      message: formData.get("id") ? "Session details saved." : "Session draft created.",
      field: null,
    }
  } catch (error) {
    return actionError(error)
  }
}
