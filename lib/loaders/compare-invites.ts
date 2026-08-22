import {
  deriveCompareInviteState,
  hashCompareInviteToken,
  isValidCompareInviteToken,
} from "@/lib/compare-invites"
import { buildSingleUserComparePath } from "@/lib/compare-invite-paths"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function createCompareAdminClient() {
  return createAdminClient() as unknown as SupabaseServerClient
}

type SafeInviter = {
  name: string
}

export type CompareInvitePreview =
  | { state: "invalid" | "expired" | "revoked" | "consumed" }
  | { state: "self"; inviter: SafeInviter }
  | { state: "valid"; inviter: SafeInviter; isSignedIn: boolean }
  | {
      state: "already_connected" | "accepted"
      inviter: SafeInviter
      compareHref: string
    }

type InvitePreviewRow = {
  creator_user_id: string
  expires_at: string
  accepted_by_user_id: string | null
  accepted_at: string | null
  revoked_at: string | null
}

function safeInviterName(profile: {
  username: string | null
  display_name: string | null
  show_identity: boolean
  show_compare_discoverability: boolean
} | null) {
  if (!profile || !profile.show_identity) return "A musician"
  return profile.display_name || profile.username || "A musician"
}

export async function loadCompareInvitePreview(
  rawToken: string
): Promise<CompareInvitePreview> {
  if (!isValidCompareInviteToken(rawToken)) return { state: "invalid" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const supabaseAdmin = createCompareAdminClient()
  const { data, error } = await supabaseAdmin
    .from("compare_invites")
    .select(
      "creator_user_id, expires_at, accepted_by_user_id, accepted_at, revoked_at"
    )
    .eq("token_hash", hashCompareInviteToken(rawToken))
    .maybeSingle()

  if (error || !data) return { state: "invalid" }

  const invite = data as InvitePreviewRow

  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select(
      "username, display_name, show_identity, show_compare_discoverability"
    )
    .eq("id", invite.creator_user_id)
    .maybeSingle()

  const profile = profileData as {
    username: string | null
    display_name: string | null
    show_identity: boolean
    show_compare_discoverability: boolean
  } | null
  const inviter = { name: safeInviterName(profile) }
  const compareHref = buildSingleUserComparePath(profile?.username ?? null)

  if (!profile?.username || !profile.show_compare_discoverability) {
    return { state: "revoked" }
  }

  if (user?.id === invite.creator_user_id) {
    return { state: "self", inviter }
  }

  const lifecycleState = deriveCompareInviteState(invite)

  if (lifecycleState === "expired" || lifecycleState === "revoked") {
    return { state: lifecycleState }
  }

  if (lifecycleState === "accepted") {
    if (user?.id && invite.accepted_by_user_id === user.id) {
      return { state: "accepted", inviter, compareHref }
    }

    return { state: "consumed" }
  }

  if (user) {
    const { data: existingConnection } = await supabaseAdmin
      .from("connections")
      .select("id, status")
      .eq("status", "accepted")
      .or(
        `and(requester_id.eq.${invite.creator_user_id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${invite.creator_user_id})`
      )
      .limit(1)
      .maybeSingle()

    if (existingConnection) {
      return { state: "already_connected", inviter, compareHref }
    }
  }

  return { state: "valid", inviter, isSignedIn: Boolean(user) }
}
