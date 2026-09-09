import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  deriveCompareOutcomeGroups,
  parseComparePage,
} from "../lib/compare-outcomes.ts"
import {
  COMPARE_INVITE_LIFETIME_MS,
  createCompareInviteToken,
  formatCompareInviteCode,
  normaliseCompareInviteCode,
} from "../lib/compare-invites.ts"

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

test("comparison groups describe playable, strong, shaky and teachable outcomes", () => {
  const groups = deriveCompareOutcomeGroups(["a", "b"], [
    { pieceId: 1, byUserId: { a: { known: true, practiceStage: null }, b: { known: true, practiceStage: null } } },
    { pieceId: 2, byUserId: { a: { known: true, practiceStage: null }, b: { known: false, practiceStage: 2 } } },
    { pieceId: 3, byUserId: { a: { known: true, practiceStage: null }, b: { known: false, practiceStage: null } } },
    { pieceId: 4, byUserId: { a: { known: false, practiceStage: null }, b: { known: true, practiceStage: null } } },
  ])

  assert.deepEqual(groups.playableTogetherIds, [1, 2])
  assert.deepEqual(groups.sharedStrongIds, [1])
  assert.deepEqual(groups.sharedShakyIds, [2])
  assert.deepEqual(groups.teachableByUserId, { a: [3], b: [4] })
  assert.deepEqual(groups.suggestedSetIds, [1, 2])
})

test("no-overlap and large-overlap paging remain bounded", () => {
  assert.deepEqual(deriveCompareOutcomeGroups(["a", "b"], []).playableTogetherIds, [])
  assert.equal(parseComparePage(undefined), 1)
  assert.equal(parseComparePage("-2"), 1)
  assert.equal(parseComparePage("999"), 50)
})

test("in-person codes are strong, readable, short-lived and reconnectable", () => {
  const token = createCompareInviteToken()
  assert.equal(COMPARE_INVITE_LIFETIME_MS, 10 * 60 * 1000)
  assert.equal(normaliseCompareInviteCode(formatCompareInviteCode(token)), token)

  const sheet = source("../components/compare/CompareInPersonSheet.tsx")
  const actions = source("../lib/actions/compare-invites.ts")
  assert.match(sheet, /sessionStorage\.getItem\(STORED_TOKEN_KEY\)/)
  assert.match(sheet, /Cancel comparison/)
  assert.match(actions, /recentInviteCount[\s\S]*>= 8/)
  assert.match(actions, /cancelCompareInvite/)
})

test("suggested set conversion preserves order and revalidates overlap", () => {
  const editor = source("../components/compare/SuggestedSessionSet.tsx")
  const action = source("../lib/actions/compare.ts")
  assert.match(editor, /Move .* earlier/)
  assert.match(editor, /confirm_private/)
  assert.match(action, /allowedIds\.has\(pieceId\)/)
  assert.match(action, /position: index \+ 1/)
  assert.match(action, /Other musicians are not added automatically|Private session set/)
})

test("full overlap is URL-filtered and rendered through TuneRow", () => {
  const page = source("../app/compare/page.tsx")
  const experience = source("../components/compare/CompareOutcomeExperience.tsx")
  assert.match(page, /pageSize = 20/)
  assert.match(page, /overlapGroup/)
  assert.match(experience, /PieceSearchFilters/)
  assert.match(experience, /PaginatedTuneCollection/)
  assert.match(experience, /TuneRow/)
})

test("repertoire reads require explicit profile consent", () => {
  const migration = source("../supabase/migrations/20260909001000_scope_repertoire_visibility.sql")
  assert.match(migration, /drop policy if exists "authenticated can read user_known_pieces"/)
  assert.match(migration, /show_compare_discoverability = true/)
  assert.match(migration, /compare_requires_friend = false/)
  assert.match(migration, /show_repertoire_to_friends = true/)
  assert.match(migration, /c\.status = 'accepted'/)
})
