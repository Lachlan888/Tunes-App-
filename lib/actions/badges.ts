"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  BadgeCategory,
  BadgeCondition,
  BadgeConditionLogic,
} from "@/lib/types"

const VALID_BADGE_CATEGORIES: BadgeCategory[] = [
  "repertoire",
  "media",
  "lore",
  "catalogue",
]

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function cleanRedirectTo(
  value: string | FormDataEntryValue | null,
  fallback: string
) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function asPositiveInteger(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

function optionalString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? ""
  return text || null
}

function optionalNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

function canonicaliseConditionLogic(value: unknown) {
  return JSON.stringify(value ?? {})
}

async function buildUniqueSlug({
  baseSlug,
  ownerUserId,
}: {
  baseSlug: string
  ownerUserId: string
}) {
  const supabase = await createClient()
  const safeBase = baseSlug || "badge"

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate =
      attempt === 0
        ? safeBase
        : `${safeBase}-${ownerUserId.slice(0, 6)}-${attempt}`

    const { data, error } = await supabase
      .from("badges")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }
  }

  return `${safeBase}-${Date.now()}`
}

function buildCondition(formData: FormData): BadgeCondition | null {
  const conditionType = formData.get("condition_type")?.toString() ?? ""

  if (conditionType === "know_all_tunes_in_list") {
    const listId = asPositiveInteger(formData.get("source_list_id"))
    if (!listId) return null

    return {
      type: "know_all_tunes_in_list",
      list_id: listId,
    }
  }

  if (conditionType === "know_selected_tunes") {
    const pieceIds = Array.from(
      new Set(
        formData
          .getAll("piece_ids")
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      )
    )

    if (pieceIds.length === 0) return null

    return {
      type: "know_selected_tunes",
      piece_ids: pieceIds,
    }
  }

  if (conditionType === "known_tune_count") {
    const count = asPositiveInteger(formData.get("known_tune_count"))
    if (!count) return null

    return {
      type: "known_tune_count",
      count,
      filters: {
        key: optionalString(formData.get("filter_key")),
        style: optionalString(formData.get("filter_style")),
        time_signature: optionalString(formData.get("filter_time_signature")),
      },
    }
  }

  if (conditionType === "added_media_links") {
    const count = asPositiveInteger(formData.get("media_link_count"))
    if (!count) return null

    const listId = optionalNumber(formData.get("media_list_id"))
    const onlyPreviouslyMissingMedia =
      formData.get("only_previously_missing_media")?.toString() === "true"

    return {
      type: "added_media_links",
      count,
      filters: {
        style: optionalString(formData.get("media_style")),
        list_id: listId ?? undefined,
        only_previously_missing_media: onlyPreviouslyMissingMedia,
      },
    }
  }

  if (conditionType === "added_lore_entries") {
    const count = asPositiveInteger(formData.get("lore_entry_count"))
    if (!count) return null

    return {
      type: "added_lore_entries",
      count,
      filters: {
        style: optionalString(formData.get("lore_style")),
        category: optionalString(formData.get("lore_category")),
      },
    }
  }

  if (conditionType === "added_missing_details") {
    const count = asPositiveInteger(formData.get("missing_detail_count"))
    if (!count) return null

    return {
      type: "added_missing_details",
      count,
      filters: {
        style: optionalString(formData.get("missing_detail_style")),
        field_name: optionalString(formData.get("missing_detail_field")),
      },
    }
  }

  return null
}

async function reconcileNewBadgeAwards({
  supabase,
  badgeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  badgeId: number
}) {
  const { error } = await supabase.rpc("reconcile_badge_awards_for_badge", {
    p_badge_id: badgeId,
  })

  if (error) {
    console.error("Error reconciling badge awards:", {
      badgeId,
      error,
    })
  }
}

export async function createBadge(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/badges/new")

  const name = formData.get("name")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""
  const category = formData.get("category")?.toString() as BadgeCategory

  if (!name) {
    redirect(appendQueryParam(redirectTo, "create_badge", "missing_name"))
  }

  if (!description) {
    redirect(appendQueryParam(redirectTo, "create_badge", "missing_description"))
  }

  if (!VALID_BADGE_CATEGORIES.includes(category)) {
    redirect(appendQueryParam(redirectTo, "create_badge", "invalid_category"))
  }

  const condition = buildCondition(formData)

  if (!condition) {
    redirect(appendQueryParam(redirectTo, "create_badge", "invalid_condition"))
  }

  const conditionLogic: BadgeConditionLogic = {
    mode: "all",
    conditions: [condition],
  }

  const slug = await buildUniqueSlug({
    baseSlug: slugify(name),
    ownerUserId: user.id,
  })

  const { data: insertedBadge, error } = await supabase
    .from("badges")
    .insert({
      owner_user_id: user.id,
      name,
      slug,
      description,
      commentary: description,
      category,
      visibility: "public",
      awarding_mode: "auto_when_eligible",
      condition_logic: conditionLogic,
    })
    .select("id, slug")
    .single()

  if (error) {
    console.error("Error creating badge:", error)
    redirect(appendQueryParam(redirectTo, "create_badge", "error"))
  }

  if (insertedBadge?.id) {
    await reconcileNewBadgeAwards({
      supabase,
      badgeId: insertedBadge.id,
    })
  }

  revalidatePath("/badges")
  revalidatePath("/inbox")

  redirect(
    `/badges/${encodeURIComponent(insertedBadge.slug)}?create_badge=success`
  )
}

export async function updateBadge(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const badgeId = asPositiveInteger(formData.get("badge_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/badges")

  if (!badgeId) {
    redirect(appendQueryParam(redirectTo, "update_badge", "missing_badge"))
  }

  const { data: existingBadge, error: existingBadgeError } = await supabase
    .from("badges")
    .select("id, owner_user_id, slug, condition_logic")
    .eq("id", badgeId)
    .maybeSingle()

  if (existingBadgeError) {
    console.error("Error loading badge for update:", existingBadgeError)
    redirect(appendQueryParam(redirectTo, "update_badge", "error"))
  }

  if (!existingBadge) {
    redirect("/badges?update_badge=not_found")
  }

  if (existingBadge.owner_user_id !== user.id) {
    redirect(`/badges/${existingBadge.slug}?update_badge=not_owner`)
  }

  const name = formData.get("name")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""
  const category = formData.get("category")?.toString() as BadgeCategory

  if (!name) {
    redirect(appendQueryParam(redirectTo, "update_badge", "missing_name"))
  }

  if (!description) {
    redirect(appendQueryParam(redirectTo, "update_badge", "missing_description"))
  }

  if (!VALID_BADGE_CATEGORIES.includes(category)) {
    redirect(appendQueryParam(redirectTo, "update_badge", "invalid_category"))
  }

  const condition = buildCondition(formData)

  if (!condition) {
    redirect(appendQueryParam(redirectTo, "update_badge", "invalid_condition"))
  }

  const nextConditionLogic: BadgeConditionLogic = {
    mode: "all",
    conditions: [condition],
  }

  const conditionChanged =
    canonicaliseConditionLogic(existingBadge.condition_logic) !==
    canonicaliseConditionLogic(nextConditionLogic)

  if (conditionChanged) {
    const { count, error: awardCountError } = await supabase
      .from("badge_awards")
      .select("id", { count: "exact", head: true })
      .eq("badge_id", badgeId)

    if (awardCountError) {
      console.error("Error counting badge awards:", awardCountError)
      redirect(appendQueryParam(redirectTo, "update_badge", "error"))
    }

    if ((count ?? 0) > 0) {
      redirect(appendQueryParam(redirectTo, "update_badge", "condition_locked"))
    }
  }

  const { error: updateError } = await supabase
    .from("badges")
    .update({
      name,
      description,
      commentary: description,
      category,
      condition_logic: nextConditionLogic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", badgeId)
    .eq("owner_user_id", user.id)

  if (updateError) {
    console.error("Error updating badge:", updateError)
    redirect(appendQueryParam(redirectTo, "update_badge", "error"))
  }

  if (conditionChanged) {
    await reconcileNewBadgeAwards({
      supabase,
      badgeId,
    })
  }

  revalidatePath("/badges")
  revalidatePath(`/badges/${existingBadge.slug}`)
  revalidatePath(`/badges/${existingBadge.slug}/edit`)
  revalidatePath("/inbox")

  redirect(`/badges/${existingBadge.slug}?update_badge=success`)
}

export async function deleteBadge(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const badgeId = asPositiveInteger(formData.get("badge_id"))

  if (!badgeId) {
    redirect("/badges?delete_badge=missing_badge")
  }

  const { data: existingBadge, error: existingBadgeError } = await supabase
    .from("badges")
    .select("id, owner_user_id, slug")
    .eq("id", badgeId)
    .maybeSingle()

  if (existingBadgeError) {
    console.error("Error loading badge for delete:", existingBadgeError)
    redirect("/badges?delete_badge=error")
  }

  if (!existingBadge) {
    redirect("/badges?delete_badge=not_found")
  }

  if (existingBadge.owner_user_id !== user.id) {
    redirect(`/badges/${existingBadge.slug}?delete_badge=not_owner`)
  }

  const { error: deleteError } = await supabase
    .from("badges")
    .delete()
    .eq("id", badgeId)
    .eq("owner_user_id", user.id)

  if (deleteError) {
    console.error("Error deleting badge:", deleteError)
    redirect(`/badges/${existingBadge.slug}?delete_badge=error`)
  }

  revalidatePath("/badges")
  revalidatePath("/inbox")

  redirect("/badges?delete_badge=success")
}