"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function addUserInstrument(formData: FormData) {
  const instrumentName = String(formData.get("instrument_name") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard")

  if (!instrumentName) {
    redirect(`${redirectTo}?instrument_error=blank`)
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
    redirect(`${redirectTo}?instrument_error=save_failed`)
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
      redirect(`${redirectTo}?instrument_error=duplicate`)
    }

    redirect(`${redirectTo}?instrument_error=save_failed`)
  }

  revalidatePath("/dashboard")
  redirect(`${redirectTo}?instrument_saved=1`)
}

export async function removeUserInstrument(formData: FormData) {
  const instrumentId = Number(formData.get("instrument_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard")

  if (!instrumentId || Number.isNaN(instrumentId)) {
    redirect(`${redirectTo}?instrument_error=missing`)
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
    redirect(`${redirectTo}?instrument_error=delete_failed`)
  }

  revalidatePath("/dashboard")
  redirect(`${redirectTo}?instrument_removed=1`)
}