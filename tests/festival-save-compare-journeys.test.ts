import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { deriveCompareOutcomeGroups } from "../lib/compare-outcomes.ts"

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function exportedFunction(sourceText: string, name: string, nextName: string) {
  const start = sourceText.indexOf(`export async function ${name}`)
  const end = sourceText.indexOf(`export async function ${nextName}`, start)
  assert.notEqual(start, -1)
  assert.notEqual(end, -1)
  return sourceText.slice(start, end)
}

test("festival collections enter the existing public-list and Compare journeys", () => {
  const hub = source("../app/events/[slug]/page.tsx")
  assert.match(hub, /href={`\/public-lists\/\$\{collection\.learning_list\.id\}`}/)
  assert.match(hub, /href="\/compare"/)
  assert.match(hub, /find tunes you both know/i)
  assert.doesNotMatch(hub, /festival_(?:bookmark|compare|practice)|FestivalCompare/)
})

test("signed-out Save offers a safe continuation back to the same public list", () => {
  const page = source("../app/public-lists/[id]/page.tsx")
  const actions = source("../lib/actions/lists.ts")
  const bookmark = exportedFunction(actions, "bookmarkPublicList", "unbookmarkPublicList")

  assert.match(page, /href={`\/login\?next=\$\{encodeURIComponent\(pageHref\)\}`}/)
  assert.match(page, /Sign in to save this list/)
  assert.match(page, /name="redirect_to" value=\{pageHref\}/)
  assert.match(bookmark, /getAuthReturnPath\(/)
  assert.match(bookmark, /redirect\(`\/login\?next=\$\{encodeURIComponent\(redirectTo\)\}`\)/)
})

test("bookmark retry and reload stay on the normal list identity without practice effects", () => {
  const actions = source("../lib/actions/lists.ts")
  const page = source("../app/public-lists/[id]/page.tsx")
  const bookmark = exportedFunction(actions, "bookmarkPublicList", "unbookmarkPublicList")

  assert.match(bookmark, /from\("learning_list_bookmarks"\)/)
  assert.match(bookmark, /bookmark_public", "already"/)
  assert.match(bookmark, /bookmark_public", "error"/)
  assert.match(bookmark, /bookmark_public", "bookmarked"/)
  assert.match(bookmark, /revalidatePath\(`\/public-lists\/\$\{listId\}`\)/)
  assert.doesNotMatch(bookmark, /startPracticeForUser|user_pieces|user_known_pieces/)
  assert.match(page, /This shared list is already bookmarked/)
})

test("normal Compare retains auth, consent and common-tune outcomes", () => {
  const loader = source("../lib/loaders/compare.ts")
  const migration = source("../supabase/migrations/20260909001000_scope_repertoire_visibility.sql")
  assert.match(loader, /if \(!user\) \{[\s\S]*return redirectToLogin\(\)/)
  assert.match(loader, /checkCompareFriendshipAccess/)
  assert.match(migration, /show_compare_discoverability = true/)
  assert.match(migration, /compare_requires_friend = false/)
  assert.match(migration, /show_repertoire_to_friends = true/)

  const groups = deriveCompareOutcomeGroups(["new", "existing"], [
    { pieceId: 11, byUserId: { new: { known: true, practiceStage: null }, existing: { known: true, practiceStage: null } } },
    { pieceId: 12, byUserId: { new: { known: true, practiceStage: null }, existing: { known: false, practiceStage: 2 } } },
  ])
  assert.deepEqual(groups.playableTogetherIds, [11, 12])
  assert.deepEqual(groups.sharedStrongIds, [11])
  assert.deepEqual(groups.sharedShakyIds, [12])
})
