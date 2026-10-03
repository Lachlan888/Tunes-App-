import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  COMPARE_INVITE_RANDOM_BYTES,
  COMPARE_INVITE_ALIAS_SPACE,
  COMPARE_INVITE_ALIAS_WORDS,
  createCompareInviteAlias,
  createCompareInviteToken,
  deriveCompareInviteState,
  formatCompareInviteAlias,
  getCompareInviteLookup,
  hashCompareInviteToken,
  isValidCompareInviteToken,
  normaliseCompareInviteAlias,
  normaliseCompareInviteCode,
} from "../lib/compare-invites.ts"
import {
  getSafeInternalPath,
  isSafeInternalPath,
} from "../lib/auth/redirects.ts"

test("compare invitation tokens contain at least 32 random bytes and are URL safe", () => {
  const first = createCompareInviteToken()
  const second = createCompareInviteToken()

  assert.equal(isValidCompareInviteToken(first), true)
  assert.notEqual(first, second)
  assert.equal(Buffer.from(first, "base64url").byteLength, COMPARE_INVITE_RANDOM_BYTES)
  assert.doesNotMatch(first, /[+/=]/)
})

test("compare invitation tokens are hashed deterministically without retaining raw data", () => {
  const token = createCompareInviteToken()
  const hash = hashCompareInviteToken(token)

  assert.match(hash, /^[0-9a-f]{64}$/)
  assert.equal(hash, hashCompareInviteToken(token))
  assert.notEqual(hash, token)
  assert.equal(hash.includes(token), false)
})

test("readable aliases use three curated musical words with documented code space", () => {
  const picks = [89, 88, 90]
  const alias = createCompareInviteAlias(() => picks.shift() ?? 0)

  assert.deepEqual(alias, {
    code: "Monroe Mastertone Parlor",
    key: "monroe-mastertone-parlor",
  })
  assert.equal(COMPARE_INVITE_ALIAS_WORDS.length, 96)
  assert.equal(COMPARE_INVITE_ALIAS_SPACE, 96 ** 3)
})

test("readable aliases normalise case, spaces and hyphens without accepting unknown words", () => {
  assert.equal(normaliseCompareInviteAlias("  MONROE mastertone D28  "), null)
  assert.equal(
    normaliseCompareInviteAlias("  MONROE -- mastertone   parlor "),
    "monroe-mastertone-parlor"
  )
  assert.equal(formatCompareInviteAlias("monroe-mastertone-parlor"), "Monroe Mastertone Parlor")
  assert.equal(normaliseCompareInviteAlias("monroe-mastertone"), null)
  assert.equal(normaliseCompareInviteAlias("monroe-mastertone-secret"), null)
})

test("invite lookup preserves legacy tokens and resolves aliases to canonical keys", () => {
  const token = createCompareInviteToken()
  assert.deepEqual(getCompareInviteLookup(token), {
    kind: "token",
    key: hashCompareInviteToken(token),
  })
  assert.deepEqual(getCompareInviteLookup("Monroe MASTERTONE parlor"), {
    kind: "alias",
    key: "monroe-mastertone-parlor",
  })
  assert.equal(
    normaliseCompareInviteCode(" Monroe -- MASTERTONE parlor "),
    "monroe-mastertone-parlor"
  )
  assert.equal(getCompareInviteLookup("not a real code"), null)
  assert.equal(normaliseCompareInviteCode("not a real code"), null)
})

test("invitation state derives acceptance, revocation, and expiry from timestamps", () => {
  const now = new Date("2026-08-22T12:00:00.000Z")

  assert.equal(
    deriveCompareInviteState(
      {
        accepted_at: null,
        revoked_at: null,
        expires_at: "2026-08-22T13:00:00.000Z",
      },
      now
    ),
    "pending"
  )
  assert.equal(
    deriveCompareInviteState(
      {
        accepted_at: null,
        revoked_at: null,
        expires_at: "2026-08-22T12:00:00.000Z",
      },
      now
    ),
    "expired"
  )
  assert.equal(
    deriveCompareInviteState(
      {
        accepted_at: null,
        revoked_at: "2026-08-22T11:00:00.000Z",
        expires_at: "2026-08-22T13:00:00.000Z",
      },
      now
    ),
    "revoked"
  )
  assert.equal(
    deriveCompareInviteState(
      {
        accepted_at: "2026-08-22T11:00:00.000Z",
        revoked_at: null,
        expires_at: "2026-08-22T10:00:00.000Z",
      },
      now
    ),
    "accepted"
  )
})

test("authentication continuation accepts only internal application paths", () => {
  for (const path of [
    "/compare/join/abc_123",
    "/compare?user=alice",
    "/dashboard?next=%2Fcompare",
  ]) {
    assert.equal(isSafeInternalPath(path), true)
    assert.equal(getSafeInternalPath(path), path)
  }

  for (const path of [
    "https://example.com",
    "//example.com/path",
    "/\\example.com/path",
    "/%2F%2Fexample.com/path",
    "javascript:alert(1)",
  ]) {
    assert.equal(isSafeInternalPath(path), false)
    assert.equal(getSafeInternalPath(path, "/compare"), "/compare")
  }
})

test("database acceptance locks the invite and handles required connection states", () => {
  const migration = readFileSync(
    new URL(
      "../supabase/migrations/20260822020000_create_compare_invites.sql",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(migration, /for update;/i)
  assert.match(migration, /creator_user_id = v_accepting_user_id/i)
  assert.match(migration, /v_invite\.expires_at <= now\(\)/i)
  assert.match(migration, /v_invite\.revoked_at is not null/i)
  assert.match(migration, /v_invite\.accepted_by_user_id = v_accepting_user_id/i)
  assert.match(migration, /status = 'accepted'/i)
  assert.match(migration, /when unique_violation/i)
  assert.match(migration, /'already_connected'/i)
  assert.match(migration, /'consumed'/i)
  assert.match(migration, /accepted_by_user_id = v_accepting_user_id/i)
})

test("alias storage is unique and optional for legacy invite compatibility", () => {
  const migration = readFileSync(
    new URL(
      "../supabase/migrations/20260924060600_readable_compare_invite_aliases.sql",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(migration, /add column if not exists alias_code text/i)
  assert.match(migration, /add column if not exists alias_key text/i)
  assert.match(migration, /unique index[\s\S]*\(alias_key\)[\s\S]*alias_key is not null/i)
  assert.match(migration, /alias_key is null and alias_code is null/i)
})

test("alias creation retries collisions while regeneration revokes the prior invite", () => {
  const actions = readFileSync(
    new URL("../lib/actions/compare-invites.ts", import.meta.url),
    "utf8"
  )

  assert.match(actions, /await revokeActiveInvites\(user\.id\)/)
  assert.match(actions, /attempt < 6/)
  assert.match(actions, /error\.code !== "23505"/)
  assert.match(actions, /alias_code: alias\.code/)
  assert.match(actions, /alias_key: alias\.key/)
  assert.match(actions, /\.eq\("alias_key", lookup\.key\)/)
})
