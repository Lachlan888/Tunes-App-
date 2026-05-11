"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  getPageOptionsConfig,
  normalisePageOptionsPreferences,
} from "@/lib/page-options/configs"
import type {
  PageColumnMode,
  PageDensity,
  PageKey,
  PageLayoutPresetId,
} from "@/lib/page-options/types"
import { createClient } from "@/lib/supabase/server"

function getRedirectTo(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()

  if (!redirectTo.startsWith("/")) {
    return "/"
  }

  return redirectTo
}

function appendStatus(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function isPageKey(value: string): value is PageKey {
  return (
    value === "home" ||
    value === "library" ||
    value === "tune_detail" ||
    value === "lists" ||
    value === "practice" ||
    value === "setlists" ||
    value === "badges" ||
    value === "compare" ||
    value === "shared" ||
    value === "profile" ||
    value === "moderator"
  )
}

function getPageKey(formData: FormData): PageKey | null {
  const pageKey = String(formData.get("page_key") ?? "")

  return isPageKey(pageKey) ? pageKey : null
}

function getLayoutPreset(formData: FormData): PageLayoutPresetId {
  return String(formData.get("layout_preset") ?? "balanced") as PageLayoutPresetId
}

function getColumnMode(formData: FormData): PageColumnMode {
  const value = String(formData.get("column_mode") ?? "auto")

  if (
    value === "auto" ||
    value === "compact" ||
    value === "comfortable" ||
    value === "wide"
  ) {
    return value
  }

  return "auto"
}

function getDensity(formData: FormData): PageDensity {
  const value = String(formData.get("density") ?? "standard")

  if (value === "spacious" || value === "standard" || value === "compact") {
    return value
  }

  return "standard"
}

export async function updatePagePreferences(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const redirectTo = getRedirectTo(formData)
  const pageKey = getPageKey(formData)

  if (!pageKey) {
    redirect(appendStatus(redirectTo, "page_options", "error"))
  }

  const config = getPageOptionsConfig(pageKey)

  if (!config) {
    redirect(appendStatus(redirectTo, "page_options", "error"))
  }

  const shouldReset = formData.get("reset_preferences") === "true"

  const rawPreferences = shouldReset
    ? config.defaultPreferences
    : {
        layoutPreset: getLayoutPreset(formData),
        columnMode: getColumnMode(formData),
        density: getDensity(formData),
        visibleSections: Object.fromEntries(
          config.sections.map((section) => [
            section.id,
            formData.get(`section_${section.id}`) === "true",
          ])
        ),
      }

  const preferencePayload = normalisePageOptionsPreferences(
    rawPreferences,
    config
  )

  const { error } = await supabase.from("user_page_preferences").upsert(
    {
      user_id: user.id,
      page_key: pageKey,
      preferences: preferencePayload,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,page_key",
    }
  )

  if (error) {
    redirect(appendStatus(redirectTo, "page_options", "error"))
  }

  revalidatePath(redirectTo.split("?")[0] || "/")

  redirect(
    appendStatus(
      redirectTo,
      "page_options",
      shouldReset ? "reset" : "saved"
    )
  )
}