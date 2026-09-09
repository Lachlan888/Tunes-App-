import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  paginateItems,
  parseInboxPage,
  parseInboxTab,
} from "../lib/inbox-view-state.ts"

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

test("Inbox URL state and history pagination are bounded", () => {
  assert.equal(parseInboxTab("messages"), "messages")
  assert.equal(parseInboxTab("unknown"), "activity")
  assert.equal(parseInboxPage("-1"), 1)
  assert.equal(parseInboxPage("999"), 50)
  assert.deepEqual(paginateItems([1, 2, 3, 4, 5], 2, 2), {
    items: [3, 4],
    page: 2,
    hasPrevious: true,
    hasNext: true,
  })
})

test("Home and Friends share one collapsed social interaction model", () => {
  const sharedFeed = source("../components/activity/SocialActivityFeed.tsx")
  const home = source("../components/home/HomeMobileSummarySwitcher.tsx")
  const friends = source("../components/friends/RecentFriendActivitySection.tsx")

  assert.match(home, /SocialActivityFeed/)
  assert.match(friends, /SocialActivityFeed/)
  assert.match(sharedFeed, /Open discussion/)
  assert.match(sharedFeed, /selectedItem \? \(/)
  assert.doesNotMatch(friends, /ActivityReplyForm/)
})

test("Friends preserves request actions and privacy-safe recovery copy", () => {
  const page = source("../app/friends/page.tsx")
  const actions = source("../lib/actions/friends.ts")
  const privacyMigration = source(
    "../supabase/migrations/20260908143000_restrict_activity_event_visibility.sql"
  )

  assert.match(page, /sendFriendRequest/)
  assert.match(page, /acceptFriendRequest/)
  assert.match(page, /declineFriendRequest/)
  assert.match(page, /unavailable or has expired/)
  assert.match(page, /Private profiles and existing connections are not shown/)
  assert.match(actions, /existingConnection/)
  assert.match(actions, /connection\.addressee_id !== user\.id/)
  assert.match(
    privacyMigration,
    /drop policy if exists "authenticated can read user_activity_events"/
  )
})

test("Inbox separates New, History and real Messages without oversized trees", () => {
  const page = source("../app/inbox/page.tsx")
  const loader = source("../lib/loaders/inbox.ts")
  const messages = source("../components/inbox/DirectMessageThreadList.tsx")

  assert.match(page, />New</)
  assert.match(page, />History</)
  assert.match(page, />Messages/)
  assert.match(page, /You’re caught up\. New activity will appear here/)
  assert.match(loader, /messages: thread\.messages\.slice\(-10\)/)
  assert.match(loader, /\.slice\(0, 20\)/)
  assert.match(messages, /Showing the latest/)
})
