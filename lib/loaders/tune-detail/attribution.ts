import type { SupabaseClient } from "@supabase/supabase-js"
import type { PieceContributionField } from "@/lib/pieces/contribution-policy"
import type {
  AttributionPerson,
  PieceAttribution,
} from "./types"

type AttributionProfileRow = {
  id: string
  username: string | null
  display_name: string | null
  show_identity: boolean | null
}

type ContributionRow = {
  field_name: PieceContributionField
  contributed_by: string
  contributed_at: string
}

export function toAttributionPerson(
  profile: AttributionProfileRow | null | undefined
): AttributionPerson {
  if (!profile) return { displayName: "Unknown player", username: null }
  if (!profile.show_identity) {
    return { displayName: "Private player", username: null }
  }

  return {
    displayName: profile.display_name || profile.username || "Unknown player",
    username: profile.username,
  }
}

export async function loadPieceAttribution(
  supabase: SupabaseClient,
  pieceId: number,
  creatorUserId: string | null | undefined
): Promise<PieceAttribution> {
  const { data: contributionRows, error: contributionError } = await supabase
    .from("piece_field_contributions")
    .select("field_name, contributed_by, contributed_at")
    .eq("piece_id", pieceId)
    .order("contributed_at", { ascending: true })

  if (contributionError) throw new Error(contributionError.message)

  const contributions = (contributionRows as ContributionRow[] | null) ?? []
  const userIds = Array.from(
    new Set([
      ...(creatorUserId ? [creatorUserId] : []),
      ...contributions.map((entry) => entry.contributed_by),
    ])
  )

  if (userIds.length === 0) {
    return { creator: null, contributions: [] }
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, show_identity")
    .in("id", userIds)

  if (profileError) throw new Error(profileError.message)

  const profiles = new Map(
    ((profileRows as AttributionProfileRow[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ])
  )

  return {
    creator: creatorUserId
      ? toAttributionPerson(profiles.get(creatorUserId))
      : null,
    contributions: contributions.map((entry) => ({
      field: entry.field_name,
      contributedAt: entry.contributed_at,
      contributor: toAttributionPerson(profiles.get(entry.contributed_by)),
    })),
  }
}
