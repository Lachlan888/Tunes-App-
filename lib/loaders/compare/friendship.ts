import type { createClient } from "@/lib/supabase/server"
import type { ProfileSearchRow } from "@/lib/profile-search"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function getIsAcceptedFriend(
  supabase: SupabaseServerClient,
  currentUserId: string,
  otherUserId: string
): Promise<boolean> {
  const { data: connectionRow, error: connectionError } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${currentUserId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${currentUserId})`
    )
    .maybeSingle()

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  return Boolean(connectionRow)
}

export async function checkCompareFriendshipAccess(
  supabase: SupabaseServerClient,
  currentUserId: string,
  resolvedProfiles: ProfileSearchRow[]
): Promise<{
  blockedProfile: ProfileSearchRow | null
  allAccepted: boolean
}> {
  const profileIds = resolvedProfiles.map((profile) => profile.id)
  let acceptedFriendIds = new Set<string>()

  if (profileIds.length > 0) {
    const { data: connectionRows, error: connectionError } = await supabase
      .from("connections")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.in.(${profileIds.join(",")})),and(addressee_id.eq.${currentUserId},requester_id.in.(${profileIds.join(",")}))`
      )

    if (connectionError) {
      throw new Error(connectionError.message)
    }

    acceptedFriendIds = new Set(
      ((connectionRows ?? []) as Array<{
        requester_id: string
        addressee_id: string
      }>).map((row) =>
        row.requester_id === currentUserId ? row.addressee_id : row.requester_id
      )
    )
  }

  const friendshipChecks = resolvedProfiles.map((profile) => {
    const isAcceptedFriend = acceptedFriendIds.has(profile.id)
    const profileCanCompare =
      !profile.compare_requires_friend || isAcceptedFriend

    return {
      profile,
      isAcceptedFriend,
      profileCanCompare,
    }
  })

  const blockedCheck =
    friendshipChecks.find((check) => !check.profileCanCompare) ?? null

  return {
    blockedProfile: blockedCheck?.profile ?? null,
    allAccepted: friendshipChecks.every((check) => check.isAcceptedFriend),
  }
}
