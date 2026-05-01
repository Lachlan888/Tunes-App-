import { createClient } from "@/lib/supabase/server"

export type ProfileSearchRow = {
  id: string
  username: string | null
  display_name: string | null
  compare_requires_friend: boolean
  show_compare_discoverability: boolean
}

export type RankedProfileMatch = ProfileSearchRow & {
  match_score: number
}

type SearchProfilesOptions = {
  query: string
  currentUserId: string
  limit?: number
  excludeIds?: string[]
  requireCompareDiscoverability?: boolean
}

export function normaliseSearchText(value: string | null | undefined) {
  if (!value) return ""
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export function scoreProfileMatch(profile: ProfileSearchRow, query: string) {
  const normalisedQuery = normaliseSearchText(query)
  if (!normalisedQuery) return 0

  const username = normaliseSearchText(profile.username)
  const displayName = normaliseSearchText(profile.display_name)

  if (username === normalisedQuery) return 400
  if (displayName === normalisedQuery) return 350
  if (username.startsWith(normalisedQuery)) return 250
  if (displayName.startsWith(normalisedQuery)) return 220
  if (username.includes(normalisedQuery)) return 150
  if (displayName.includes(normalisedQuery)) return 120

  return 0
}

export async function searchProfilesForSelection({
  query,
  currentUserId,
  limit = 10,
  excludeIds = [],
  requireCompareDiscoverability = false,
}: SearchProfilesOptions): Promise<RankedProfileMatch[]> {
  const supabase = await createClient()
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  let request = supabase
    .from("profiles")
    .select(
      "id, username, display_name, compare_requires_friend, show_compare_discoverability"
    )
    .neq("id", currentUserId)
    .limit(200)

  if (requireCompareDiscoverability) {
    request = request.eq("show_compare_discoverability", true)
  }

  const { data, error } = await request

  if (error) {
    throw new Error(error.message)
  }

  const excludedIds = new Set<string>([currentUserId, ...excludeIds])
  const typedProfiles = (data ?? []) as ProfileSearchRow[]

  return typedProfiles
    .filter((profile) => !excludedIds.has(profile.id))
    .map((profile) => ({
      ...profile,
      match_score: scoreProfileMatch(profile, trimmedQuery),
    }))
    .filter((profile) => profile.match_score > 0)
    .sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score
      }

      const aName = a.display_name ?? a.username ?? ""
      const bName = b.display_name ?? b.username ?? ""
      return aName.localeCompare(bName)
    })
    .slice(0, limit)
}