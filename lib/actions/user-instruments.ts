"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function getProfileDraftParams(formData: FormData) {
  const params = new URLSearchParams()

  const draftFields = [
    ["username", "profile_username"],
    ["display_name", "profile_display_name"],
    ["bio", "profile_bio"],
    ["show_identity", "profile_show_identity"],
    ["show_instruments", "profile_show_instruments"],
    ["show_public_lists_on_profile", "profile_show_public_lists_on_profile"],
    ["show_repertoire_summary", "profile_show_repertoire_summary"],
    [
      "show_compare_discoverability",
      "profile_show_compare_discoverability",
    ],
    ["compare_requires_friend", "profile_compare_requires_friend"],
  ]

  for (const [queryName, formName] of draftFields) {
    const value = formData.get(formName)

    if (value !== null) {
      params.set(queryName, String(value))
    }
  }

  return params
}

function redirectWithDraft(
  redirectTo: string,
  statusParams: Record<string, string>,
  formData: FormData
): never {
  const params = new URLSearchParams(statusParams)
  const draftParams = getProfileDraftParams(formData)

  draftParams.forEach((value, key) => {
    params.set(key, value)
  })

  const separator = redirectTo.includes("?") ? "&" : "?"
  redirect(`${redirectTo}${separator}${params.toString()}`)
}

export async function addUserInstrument(formData: FormData) {
  const instrumentName = String(formData.get("instrument_name") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard")

  if (!instrumentName) {
    redirectWithDraft(
      redirectTo,
      {
        instrument_error: "blank",
      },
      formData
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("user_instruments")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  if (existingError) {
    redirectWithDraft(
      redirectTo,
      {
        instrument_error: "save_failed",
      },
      formData
    )
  }

  const nextPosition =
    existingRows && existingRows.length > 0
      ? (existingRows[0].position ?? 0) + 1
      : 1

  const { error } = await supabase.from("user_instruments").insert({
    user_id: user.id,
    instrument_name: instrumentName,
    position: nextPosition,
  })

  if (error) {
    if (error.code === "23505") {
      redirectWithDraft(
        redirectTo,
        {
          instrument_error: "duplicate",
        },
        formData
      )
    }

    redirectWithDraft(
      redirectTo,
      {
        instrument_error: "save_failed",
      },
      formData
    )
  }

  revalidatePath("/dashboard")
  redirectWithDraft(
    redirectTo,
    {
      instrument_saved: "1",
    },
    formData
  )
}

export async function removeUserInstrument(formData: FormData) {
  const instrumentId = Number(formData.get("instrument_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard")

  if (!instrumentId || Number.isNaN(instrumentId)) {
    redirectWithDraft(
      redirectTo,
      {
        instrument_error: "missing",
      },
      formData
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("user_instruments")
    .delete()
    .eq("id", instrumentId)
    .eq("user_id", user.id)

  if (error) {
    redirectWithDraft(
      redirectTo,
      {
        instrument_error: "delete_failed",
      },
      formData
    )
  }

  revalidatePath("/dashboard")
  redirectWithDraft(
    redirectTo,
    {
      instrument_removed: "1",
    },
    formData
  )
}