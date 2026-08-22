import { createHash, randomBytes } from "node:crypto"

export const COMPARE_INVITE_RANDOM_BYTES = 32
export const COMPARE_INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000

export type CompareInviteTimestampRow = {
  accepted_at: string | null
  revoked_at: string | null
  expires_at: string
}

export type CompareInviteLifecycleState =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired"

export function createCompareInviteToken() {
  return randomBytes(COMPARE_INVITE_RANDOM_BYTES).toString("base64url")
}

export function isValidCompareInviteToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token)
}

export function hashCompareInviteToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export function deriveCompareInviteState(
  invite: CompareInviteTimestampRow,
  now = new Date()
): CompareInviteLifecycleState {
  if (invite.accepted_at) return "accepted"
  if (invite.revoked_at) return "revoked"
  if (new Date(invite.expires_at).getTime() <= now.getTime()) return "expired"
  return "pending"
}
