"use server"

import {
  COMPARE_INVITE_LIFETIME_MS,
  createCompareInviteToken,
  deriveCompareInviteState,
  hashCompareInviteToken,
  isValidCompareInviteToken,
} from "@/lib/compare-invites"
import {
  buildCompareJoinPath,
  buildSingleUserComparePath,
} from "@/lib/compare-invite-paths"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function createCompareAdminClient() {
  return createAdminClient() as unknown as SupabaseServerClient
}

type InviteRow = {
  id: number
  creator_user_id: string
  expires_at: string
  accepted_by_user_id: string | null
  accepted_at: string | null
  revoked_at: string | null
  connection_id: number | null
}

export type CreateCompareInviteResult =
  | {
      ok: true
      state: "pending"
      token: string
      joinPath: string
      expiresAt: string
      reused: boolean
    }
  | {
      ok: true
      state: "accepted"
      connectedName: string
      compareHref: string
    }
  | {
      ok: false
      reason: "signed_out" | "profile_required" | "unavailable"
    }

export type PollCompareInviteResult =
  | { state: "signed_out" | "invalid" | "pending" | "expired" | "revoked" }
  | {
      state: "accepted"
      connectedName: string
      compareHref: string
    }

export type AcceptCompareInviteResult =
  | {
      ok: true
      alreadyConnected: boolean
      compareHref: string
    }
  | {
      ok: false
      reason:
        | "signed_out"
        | "invalid"
        | "expired"
        | "revoked"
        | "self"
        | "consumed"
        | "profile_required"
        | "unavailable"
    }

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}

async function findReusableInvite(
  creatorUserId: string,
  rawToken: string
) {
  if (!isValidCompareInviteToken(rawToken)) return null

  const tokenHash = hashCompareInviteToken(rawToken)
  const supabaseAdmin = createCompareAdminClient()
  const { data, error } = await supabaseAdmin
    .from("compare_invites")
    .select(
      "id, creator_user_id, expires_at, accepted_by_user_id, accepted_at, revoked_at, connection_id"
    )
    .eq("creator_user_id", creatorUserId)
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return data as InviteRow
}

async function getAcceptedInviteDestination(invite: InviteRow) {
  if (!invite.accepted_by_user_id) return null

  const supabaseAdmin = createCompareAdminClient()
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("username, display_name, show_identity")
    .eq("id", invite.accepted_by_user_id)
    .maybeSingle()

  const canShowIdentity = profile?.show_identity !== false

  return {
    connectedName: canShowIdentity
      ? profile?.display_name || profile?.username || "a musician"
      : "a musician",
    compareHref: buildSingleUserComparePath(profile?.username ?? null),
  }
}

async function revokeActiveInvites(creatorUserId: string) {
  const supabaseAdmin = createCompareAdminClient()
  const { error } = await supabaseAdmin
    .from("compare_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("creator_user_id", creatorUserId)
    .is("accepted_at", null)
    .is("revoked_at", null)

  if (error) throw new Error(error.message)
}

export async function getOrCreateCompareInvite(input?: {
  existingToken?: string | null
  replace?: boolean
}): Promise<CreateCompareInviteResult> {
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) return { ok: false, reason: "signed_out" }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, show_compare_discoverability")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) return { ok: false, reason: "unavailable" }
  if (!profile?.username || !profile.show_compare_discoverability) {
    return { ok: false, reason: "profile_required" }
  }

  try {
    const existingToken = input?.existingToken?.trim() ?? ""

    if (!input?.replace && existingToken) {
      const reusableInvite = await findReusableInvite(user.id, existingToken)

      if (reusableInvite) {
        const existingState = deriveCompareInviteState(reusableInvite)

        if (existingState === "pending") {
          return {
            ok: true,
            state: "pending",
            token: existingToken,
            joinPath: buildCompareJoinPath(existingToken),
            expiresAt: reusableInvite.expires_at,
            reused: true,
          }
        }

        if (existingState === "accepted") {
          const destination = await getAcceptedInviteDestination(reusableInvite)

          if (destination) {
            return { ok: true, state: "accepted", ...destination }
          }
        }
      }
    }

    await revokeActiveInvites(user.id)

    const supabaseAdmin = createCompareAdminClient()

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = createCompareInviteToken()
      const tokenHash = hashCompareInviteToken(token)
      const expiresAt = new Date(
        Date.now() + COMPARE_INVITE_LIFETIME_MS
      ).toISOString()

      const { error } = await supabaseAdmin.from("compare_invites").insert({
        creator_user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })

      if (!error) {
        return {
          ok: true,
          state: "pending",
          token,
          joinPath: buildCompareJoinPath(token),
          expiresAt,
          reused: false,
        }
      }

      if (error.code !== "23505") {
        return { ok: false, reason: "unavailable" }
      }
    }
  } catch {
    return { ok: false, reason: "unavailable" }
  }

  return { ok: false, reason: "unavailable" }
}

export async function pollCompareInvite(
  rawToken: string
): Promise<PollCompareInviteResult> {
  const { user } = await getAuthenticatedUser()

  if (!user) return { state: "signed_out" }
  if (!isValidCompareInviteToken(rawToken)) return { state: "invalid" }

  const supabaseAdmin = createCompareAdminClient()
  const tokenHash = hashCompareInviteToken(rawToken)
  const { data, error } = await supabaseAdmin
    .from("compare_invites")
    .select(
      "id, creator_user_id, expires_at, accepted_by_user_id, accepted_at, revoked_at, connection_id"
    )
    .eq("creator_user_id", user.id)
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (error || !data) return { state: "invalid" }

  const invite = data as InviteRow
  const state = deriveCompareInviteState(invite)

  if (state !== "accepted") return { state }
  if (!invite.accepted_by_user_id) return { state: "invalid" }

  const destination = await getAcceptedInviteDestination(invite)
  if (!destination) return { state: "invalid" }

  return {
    state: "accepted",
    ...destination,
  }
}

type AcceptInviteRpcRow = {
  invite_result: string
  compare_username: string | null
  compare_display_name: string | null
  connection_record_id: number | null
}

export async function acceptCompareInvite(
  rawToken: string
): Promise<AcceptCompareInviteResult> {
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) return { ok: false, reason: "signed_out" }
  if (!isValidCompareInviteToken(rawToken)) {
    return { ok: false, reason: "invalid" }
  }

  const tokenHash = hashCompareInviteToken(rawToken)
  const { data, error } = await supabase.rpc("accept_compare_invite", {
    p_token_hash: tokenHash,
  })

  if (error) return { ok: false, reason: "unavailable" }

  const result = ((data ?? []) as AcceptInviteRpcRow[])[0]
  if (!result) return { ok: false, reason: "unavailable" }

  if (
    result.invite_result === "accepted" ||
    result.invite_result === "already_connected"
  ) {
    return {
      ok: true,
      alreadyConnected: result.invite_result === "already_connected",
      compareHref: buildSingleUserComparePath(result.compare_username),
    }
  }

  if (
    result.invite_result === "invalid" ||
    result.invite_result === "expired" ||
    result.invite_result === "revoked" ||
    result.invite_result === "self" ||
    result.invite_result === "consumed" ||
    result.invite_result === "profile_required"
  ) {
    return { ok: false, reason: result.invite_result }
  }

  return { ok: false, reason: "unavailable" }
}
