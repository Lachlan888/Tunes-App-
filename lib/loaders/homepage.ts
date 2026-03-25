import { isDueToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: LearningListItem[]
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

export async function loadHomepageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningLists } = await supabase
    .from("learning_lists")
    .select(`
      id,
      name,
      description,
      learning_list_items (
        id,
        position,
        pieces (
          id,
          title,
          key,
          style,
          time_signature
        )
      )
    `)
    .eq("user_id", user.id)

  const { data: pieces } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature")
    .order("title")

  const { data: userPieces } = await supabase
    .from("user_pieces")
    .select("id, piece_id, status, next_review_due, stage")
    .eq("user_id", user.id)

  const dueToday =
    userPieces?.filter((userPiece: UserPiece) =>
      isDueToday(userPiece.next_review_due)
    ) ?? []

  return {
    user,
    learningLists,
    pieces,
    userPieces,
    dueToday,
  }
}