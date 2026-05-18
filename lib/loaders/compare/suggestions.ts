import type { createClient } from "@/lib/supabase/server"
import type { CompareSuggestion, ConnectionRow } from "./types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function loadCompareSuggestions(
  supabase: SupabaseServerClient,
  currentUserId: string
): Promise<CompareSuggestion[]> {
  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, requester_id, addressee_id")
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const typedConnections = (connectionRows ?? []) as ConnectionRow[]

  const acceptedFriendIds = typedConnections
    .filter((row) => row.status === "accepted")
    .map((row) =>
      row.requester_id === currentUserId ? row.addressee_id : row.requester_id
    )

  const uniqueAcceptedFriendIds = Array.from(new Set(acceptedFriendIds))

  if (uniqueAcceptedFriendIds.length === 0) {
    return []
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueAcceptedFriendIds)
    .eq("show_compare_discoverability", true)
    .not("username", "is", null)
    .order("display_name", { ascending: true })

  if (profileError) {
    throw new Error(profileError.message)
  }

  const typedProfiles = (profileRows ?? []) as Array<{
    id: string
    username: string | null
    display_name: string | null
  }>

  return typedProfiles
    .filter((profile): profile is typeof profile & { username: string } =>
      Boolean(profile.username)
    )
    .map((profile) => ({
      user_id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
    }))
    .sort((a, b) => {
      const aName = a.display_name ?? a.username
      const bName = b.display_name ?? b.username
      return aName.localeCompare(bName)
    })
}