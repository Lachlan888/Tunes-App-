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

  const { data: userPieces } = await supabase
    .from("user_pieces")
    .select("id, piece_id, status, next_review_due, stage")
    .eq("user_id", user.id)

  const { data: learningLists } = await supabase
    .from("learning_lists")
    .select("id, name, description")
    .eq("user_id", user.id)
    .order("name")

  const { data: learningListItems } = await supabase
    .from("learning_list_items")
    .select("piece_id, learning_list_id, learning_lists!inner(id, name, user_id)")
    .eq("learning_lists.user_id", user.id)

  return {
    user,
    pieces,
    userPieces,
    learningLists,
    learningListItems,
  }
}