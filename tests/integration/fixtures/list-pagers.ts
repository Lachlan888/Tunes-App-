import type {
  BookmarkedSharedListSummary,
  DirectSharedListSummary,
} from "../../../lib/loaders/lists"

// In-memory loader fixtures only. Never seed these IDs into a connected database
// or navigate them against a live-data server. Browser acceptance needs a local
// harness that supplies both overview and detail data and rejects all writes.
const timestamp = "2026-09-16T00:00:00.000Z"
export const pagerFixtureQuery = "Pager session"

function summary(id: number, name: string) {
  return {
    id,
    name,
    description: "Disposable local pager acceptance fixture",
    ownerUserId: "00000000-0000-4000-8000-000000000001",
    ownerUsername: "pager-fixture-owner",
    ownerDisplayName: "Pager fixture owner",
    ownerLabel: "Pager fixture owner (@pager-fixture-owner)",
    tuneCount: 21,
  }
}

/** Fresh objects per scenario prevent one fixture consumer changing another. */
export function createListPagerFixtures(): {
  bookmarkedSharedLists: BookmarkedSharedListSummary[]
  directSharedLists: DirectSharedListSummary[]
} {
  return {
    bookmarkedSharedLists: Array.from({ length: 22 }, (_, index) => ({
      ...summary(
        910001 + index,
        index === 21 ? "Saved control collection" : `${pagerFixtureQuery} saved ${String(index + 1).padStart(2, "0")}`,
      ),
      bookmarkedAt: timestamp,
    })),
    directSharedLists: Array.from({ length: 22 }, (_, index) => ({
      ...summary(
        920001 + index,
        index === 21 ? "Shared control collection" : `${pagerFixtureQuery} shared ${String(index + 1).padStart(2, "0")}`,
      ),
      sharedAt: timestamp,
    })),
  }
}

export const ownedPagerFixtureId = 930001

/** Known fixture IDs only; unknown routes must never fall through to live data. */
export function createListDetailPagerFixture(rawId: string) {
  const id = Number(rawId)
  const overview = createListPagerFixtures()
  const saved = overview.bookmarkedSharedLists.find(list => list.id === id)
  const shared = overview.directSharedLists.find(list => list.id === id)
  const isOwner = id === ownedPagerFixtureId
  if (!saved && !shared && !isOwner) return null

  const ownerId = "00000000-0000-4000-8000-000000000001"
  const tunes: import("../../../lib/types").Piece[] = Array.from({ length: 21 }, (_, index) => ({
    id: 940001 + index,
    title: `Pager tune ${String(index + 1).padStart(2, "0")}`,
    key: "D",
    style: "Irish",
    time_signature: "4/4",
    reference_url: null,
  }))
  const typedList: import("../../../lib/types").LearningListDetail = {
    id,
    user_id: ownerId,
    name: saved?.name ?? shared?.name ?? "Pager session owned",
    description: "Disposable local detail pagination fixture",
    visibility: saved ? "public" : "private",
    is_imported: false,
  }
  const accessMode: import("../../../lib/loaders/list-detail").ListDetailAccessMode =
    isOwner ? "owner" : saved ? "public_viewer" : "shared_viewer"
  return {
    typedList,
    typedItems: tunes.map((piece, index) => ({ id: 950001 + index, position: index + 1, pieces: piece })),
    tunes,
    activePieceStates: new Map<number, import("../../../lib/loaders/list-detail").ActiveListPieceState>(),
    knownPieceIds: new Set<number>(),
    mediaBundles: new Map<number, import("../../../lib/tune-media").TuneMediaBundle>(),
    ownerProfile: { id: ownerId, username: "pager-fixture-owner", displayName: "Pager fixture owner", label: "Pager fixture owner (@pager-fixture-owner)" },
    shareRecipients: [],
    accessMode,
    redirectTo: `/learning-lists/${id}`,
  }
}

export function createPublicListDetailPagerFixture(rawId: string) {
  const detail = createListDetailPagerFixture(rawId)
  if (!detail || detail.typedList.visibility !== "public") return null
  return {
    typedList: detail.typedList,
    typedItems: detail.typedItems,
    owner: { id: detail.ownerProfile.id, username: detail.ownerProfile.username, display_name: detail.ownerProfile.displayName },
    user: { id: "00000000-0000-4000-8000-000000000002" },
    mediaBundles: detail.mediaBundles,
    ownedLists: [],
    activePieceIds: new Set<number>(),
    knownPieceIds: detail.knownPieceIds,
    redirectTo: `/public-lists/${detail.typedList.id}`,
    isViewingOwnPublicList: false,
    isBookmarkedByCurrentUser: true,
    canBookmark: true,
  }
}
