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

type ExistingBadgeForUpdate = {
  id: number
  owner_user_id: string
  name: string
  slug: string
  category: BadgeCategory
  condition_logic: BadgeConditionLogic
}

type BadgeForActivityEvent = {
  id: number
  owner_user_id: string
  name: string
  slug: string
  category: BadgeCategory
  created_at: string | null
}

type BadgeAwardForActivityEvent = {
  id: number
  badge_id: number
  recipient_user_id: string
  awarded_by_user_id: string
  awarded_at: string | null
}

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

async function loadBadgeForActivityEvents({
  supabase,
  badgeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  badgeId: number
}) {
  const { data, error } = await supabase
    .from("badges")
    .select("id, owner_user_id, name, slug, category, created_at")
    .eq("id", badgeId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as BadgeForActivityEvent | null) ?? null
}

function buildBadgeCreatedMetadata(badge: BadgeForActivityEvent) {
  return {
    badge_id: badge.id,
    badge_slug: badge.slug,
    badge_name: badge.name,
    badge_category: badge.category,
  }
}

function buildBadgeAwardedMetadata({
  badge,
  award,
}: {
  badge: BadgeForActivityEvent
  award: BadgeAwardForActivityEvent
}) {
  return {
    badge_id: badge.id,
    badge_slug: badge.slug,
    badge_name: badge.name,
    badge_category: badge.category,
    badge_award_id: award.id,
    recipient_user_id: award.recipient_user_id,
    awarded_by_user_id: award.awarded_by_user_id,
  }
}

async function syncBadgeActivityEventsForBadge({
  supabase,
  badgeId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  badgeId: number
}) {
  const badge = await loadBadgeForActivityEvents({
    supabase,
    badgeId,
  })

  if (!badge) {
    return
  }

  const createdMetadata = buildBadgeCreatedMetadata(badge)

  const { data: existingCreatedEvent, error: existingCreatedEventError } =
    await supabase
      .from("user_activity_events")
      .select("id")
      .eq("event_type", "badge_created")
      .filter("metadata->>badge_id", "eq", String(badge.id))
      .maybeSingle()

  if (existingCreatedEventError) {
    throw new Error(existingCreatedEventError.message)
  }

  if (existingCreatedEvent) {
    const { error: updateCreatedEventError } = await supabase
      .from("user_activity_events")
      .update({
        user_id: badge.owner_user_id,
        metadata: createdMetadata,
      })
      .eq("id", existingCreatedEvent.id)

    if (updateCreatedEventError) {
      throw new Error(updateCreatedEventError.message)
    }
  } else {
    const { error: insertCreatedEventError } = await supabase
      .from("user_activity_events")
      .insert({
        user_id: badge.owner_user_id,
        event_type: "badge_created",
        piece_id: null,
        learning_list_id: null,
        comment_id: null,
        metadata: createdMetadata,
        created_at: badge.created_at ?? new Date().toISOString(),
      })

    if (insertCreatedEventError) {
      throw new Error(insertCreatedEventError.message)
    }
  }

  const { data: awardRows, error: awardsError } = await supabase
    .from("badge_awards")
    .select("id, badge_id, recipient_user_id, awarded_by_user_id, awarded_at")
    .eq("badge_id", badge.id)

  if (awardsError) {
    throw new Error(awardsError.message)
  }

  const awards = (awardRows ?? []) as BadgeAwardForActivityEvent[]

  for (const award of awards) {
    const awardedMetadata = buildBadgeAwardedMetadata({
      badge,
      award,
    })

    const { data: existingAwardEvent, error: existingAwardEventError } =
      await supabase
        .from("user_activity_events")
        .select("id")
        .eq("event_type", "badge_awarded")
        .filter("metadata->>badge_award_id", "eq", String(award.id))
        .maybeSingle()

    if (existingAwardEventError) {
      throw new Error(existingAwardEventError.message)
    }

    if (existingAwardEvent) {
      const { error: updateAwardEventError } = await supabase
        .from("user_activity_events")
        .update({
          user_id: award.recipient_user_id,
          metadata: awardedMetadata,
        })
        .eq("id", existingAwardEvent.id)

      if (updateAwardEventError) {
        throw new Error(updateAwardEventError.message)
      }
    } else {
      const { error: insertAwardEventError } = await supabase
        .from("user_activity_events")
        .insert({
          user_id: award.recipient_user_id,
          event_type: "badge_awarded",
          piece_id: null,
          learning_list_id: null,
          comment_id: null,
          metadata: awardedMetadata,
          created_at: award.awarded_at ?? new Date().toISOString(),
        })

      if (insertAwardEventError) {
        throw new Error(insertAwardEventError.message)
      }
    }
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

    await syncBadgeActivityEventsForBadge({
      supabase,
      badgeId: insertedBadge.id,
    })
  }

  revalidatePath("/")
  revalidatePath("/badges")
  revalidatePath("/friends")
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

  const { data: existingBadgeData, error: existingBadgeError } = await supabase
    .from("badges")
    .select("id, owner_user_id, name, slug, category, condition_logic")
    .eq("id", badgeId)
    .maybeSingle()

  if (existingBadgeError) {
    console.error("Error loading badge for update:", existingBadgeError)
    redirect(appendQueryParam(redirectTo, "update_badge", "error"))
  }

  const existingBadge =
    (existingBadgeData as ExistingBadgeForUpdate | null) ?? null

  if (!existingBadge) {
    redirect("/badges?update_badge=not_found")
  }

  if (existingBadge.owner_user_id !== user.id) {
    redirect(`/badges/${existingBadge.slug}?update_badge=not_owner`)
  }

  const name = formData.get("name")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""

  if (!name) {
    redirect(appendQueryParam(redirectTo, "update_badge", "missing_name"))
  }

  if (!description) {
    redirect(appendQueryParam(redirectTo, "update_badge", "missing_description"))
  }

  const { count, error: awardCountError } = await supabase
    .from("badge_awards")
    .select("id", { count: "exact", head: true })
    .eq("badge_id", badgeId)

  if (awardCountError) {
    console.error("Error counting badge awards:", awardCountError)
    redirect(appendQueryParam(redirectTo, "update_badge", "error"))
  }

  const hasExistingAwards = (count ?? 0) > 0

  let nextCategory = existingBadge.category
  let nextConditionLogic = existingBadge.condition_logic
  let conditionChanged = false

  if (!hasExistingAwards) {
    const submittedCategory = formData
      .get("category")
      ?.toString() as BadgeCategory

    if (!VALID_BADGE_CATEGORIES.includes(submittedCategory)) {
      redirect(appendQueryParam(redirectTo, "update_badge", "invalid_category"))
    }

    const condition = buildCondition(formData)

    if (!condition) {
      redirect(
        appendQueryParam(redirectTo, "update_badge", "invalid_condition")
      )
    }

    nextCategory = submittedCategory
    nextConditionLogic = {
      mode: "all",
      conditions: [condition],
    }

    conditionChanged =
      JSON.stringify(existingBadge.condition_logic ?? {}) !==
      JSON.stringify(nextConditionLogic ?? {})
  }

  const { error: updateError } = await supabase
    .from("badges")
    .update({
      name,
      description,
      commentary: description,
      category: nextCategory,
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

  await syncBadgeActivityEventsForBadge({
    supabase,
    badgeId,
  })

  revalidatePath("/")
  revalidatePath("/badges")
  revalidatePath(`/badges/${existingBadge.slug}`)
  revalidatePath(`/badges/${existingBadge.slug}/edit`)
  revalidatePath("/friends")
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

  const { error: notificationArchiveError } = await supabase
    .from("user_notifications")
    .update({
      archived_at: new Date().toISOString(),
      read_at: new Date().toISOString(),
    })
    .eq("badge_id", badgeId)

  if (notificationArchiveError) {
    console.error(
      "Error archiving badge notifications before delete:",
      notificationArchiveError
    )
    redirect(`/badges/${existingBadge.slug}?delete_badge=error`)
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

  revalidatePath("/")
  revalidatePath("/badges")
  revalidatePath("/friends")
  revalidatePath("/inbox")

  redirect("/badges?delete_badge=success")
}