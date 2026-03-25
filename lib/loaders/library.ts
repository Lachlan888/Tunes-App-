import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loadLibraryData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: pieces } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature")
    .order("title")

  return {
    user,
    pieces,
  }
}