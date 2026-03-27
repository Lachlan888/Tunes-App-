"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function createTune(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get("title") ?? "").trim()
  const key = String(formData.get("key") ?? "").trim()
  const style = String(formData.get("style") ?? "").trim()
  const timeSignature = String(formData.get("time_signature") ?? "").trim()
  const referenceUrl = String(formData.get("reference_url") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  if (!title) {
    redirect(appendQueryParam(redirectTo, "create_tune", "missing_title"))
  }

  const { error } = await supabase.from("pieces").insert({
    title,
    key: key || null,
    style: style || null,
    time_signature: timeSignature || null,
    reference_url: referenceUrl || null,
  })

  if (error) {
    redirect(appendQueryParam(redirectTo, "create_tune", "error"))
  }

  redirect(appendQueryParam(redirectTo, "create_tune", "success"))
}