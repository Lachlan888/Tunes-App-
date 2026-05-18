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
  const friendshipChecks = await Promise.all(
    resolvedProfiles.map(async (profile) => {
      const isAcceptedFriend = await getIsAcceptedFriend(
        supabase,
        currentUserId,
        profile.id
      )

      const profileCanCompare =
        !profile.compare_requires_friend || isAcceptedFriend

      return {
        profile,
        isAcceptedFriend,
        profileCanCompare,
      }
    })
  )

  const blockedCheck =
    friendshipChecks.find((check) => !check.profileCanCompare) ?? null

  return {
    blockedProfile: blockedCheck?.profile ?? null,
    allAccepted: friendshipChecks.every((check) => check.isAcceptedFriend),
  }
}