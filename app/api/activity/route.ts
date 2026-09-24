import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { readBoundedRows } from "@/lib/loaders/bounded-read"
import { loadFriendActivityPage } from "@/lib/loaders/friends"
import { ACTIVITY_PAGE_SIZE, parseActivityCursor } from "@/lib/activity-pagination"

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" }
  const cursorValue = request.nextUrl.searchParams.get("cursor")
  const cursor = parseActivityCursor(cursorValue)
  if (cursorValue && !cursor) return NextResponse.json({ error: "Invalid activity position." }, { status: 400, headers })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to view activity." }, { status: 401, headers })
  try {
    const connections = await readBoundedRows((from, to) => supabase.from("connections").select("id, requester_id, addressee_id", { count: "exact" }).eq("status", "accepted").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).order("id").range(from, to))
    const friendIds = [...new Set(connections.map(row => row.requester_id === user.id ? row.addressee_id : row.requester_id))]
    const page = await loadFriendActivityPage(supabase, friendIds, user.id, ACTIVITY_PAGE_SIZE, cursor)
    return NextResponse.json(page, { headers })
  } catch {
    return NextResponse.json({ error: "Activity could not be loaded. Try again." }, { status: 503, headers })
  }
}
