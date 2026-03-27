"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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