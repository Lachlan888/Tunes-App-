import { createClient } from "@/lib/supabase/server"
import {
  DUPLICATE_CANDIDATE_LIMIT,
  getTuneDuplicateSuggestions,
  type TuneDuplicateCandidate,
} from "@/lib/tunes/duplicate-suggestions"

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ suggestions: [] }, { status: 401 })
  }

  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? ""

  if (query.length < 3) {
    return Response.json({ suggestions: [] })
  }

  const { data, error } = await supabase
    .from("pieces")
    .select(
      "id, title, alternate_titles, type, key, style, time_signature, composer"
    )
    .order("title")
    .limit(DUPLICATE_CANDIDATE_LIMIT)

  if (error) {
    return Response.json(
      { suggestions: [], error: "Could not check the catalogue." },
      { status: 500 }
    )
  }

  return Response.json({
    suggestions: getTuneDuplicateSuggestions(
      query,
      (data ?? []) as TuneDuplicateCandidate[]
    ),
  })
}
