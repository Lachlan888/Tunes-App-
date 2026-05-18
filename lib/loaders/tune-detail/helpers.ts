import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  CommentAuthor,
  PieceCommentRow,
  PieceLoreEntryRow,
  PracticeNoteRow,
  ProfileRow,
  TunePracticeNote,
} from "./types"

export function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapPracticeOutcomeLabel(outcome: string | null) {
  if (outcome === "rough") return "rough"
  if (outcome === "shaky") return "shaky"
  if (outcome === "solid") return "solid"
  if (outcome === "failed") return "failed"

  return outcome
}

export function mapPracticeNote(row: PracticeNoteRow): TunePracticeNote {
  const practiceDay = getSingleJoinedRow(row.practice_days)
  const category = getSingleJoinedRow(row.practice_note_categories)
  const reviewEvent = getSingleJoinedRow(row.review_events)
  const practiceEvent = getSingleJoinedRow(row.practice_events)

  return {
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    practice_date: practiceDay?.practice_date ?? row.created_at.slice(0, 10),
    category_name: category?.name ?? null,
    outcome: mapPracticeOutcomeLabel(
      reviewEvent?.outcome ?? practiceEvent?.practice_outcome ?? null
    ),
  }
}

export async function loadProfileMapForCommunityRows(
  supabase: SupabaseClient,
  comments: PieceCommentRow[],
  loreEntries: PieceLoreEntryRow[]
): Promise<Record<string, CommentAuthor>> {
  const profileUserIds = Array.from(
    new Set([
      ...comments.map((comment) => comment.user_id),
      ...loreEntries.map((entry) => entry.user_id),
    ])
  )

  if (profileUserIds.length === 0) {
    return {}
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", profileUserIds)

  const typedProfiles = (profiles as ProfileRow[] | null) ?? []

  return Object.fromEntries(
    typedProfiles.map((profile) => [
      profile.id,
      {
        displayName: profile.display_name || profile.username || "Unknown user",
        username: profile.username,
      },
    ])
  )
}