import { createListDetailPagerFixture, createListPagerFixtures, ownedPagerFixtureId } from "./list-pagers.ts"
import type { LearningQueueTune } from "../../../lib/loaders/lists"
import type { FilterableLearningList, UserKnownPieceWithPiece, UserPieceWithPiece } from "../../../lib/types"

/** Disposable five-view data; never seed these records into a database. */
export function createListSideEffectFixtures() {
  const detail = createListDetailPagerFixture(String(ownedPagerFixtureId))!
  const list = detail.typedList
  const listOverviews: FilterableLearningList[] = [{
    ...list,
    tunes: detail.tunes,
    tuneCount: detail.tunes.length,
    stylesPresent: ["Irish"],
    source: "mine",
  }]
  const learningQueueTunes: LearningQueueTune[] = detail.tunes.map(piece => ({
    piece,
    firstAddedAt: "2026-09-16T00:00:00.000Z",
    firstAddedSortValue: "2026-09-16T00:00:00.000Z",
    firstListId: list.id,
    firstListName: list.name,
    listIds: [list.id],
    listNames: [list.name],
  }))
  const unlistedPracticeTunes: UserPieceWithPiece[] = [{
    id: 960001, piece_id: 970001, stage: 2,
    pieces: { id: 970001, title: "Unsorted Practice fixture" },
  }]
  const unlistedKnownTunes: UserKnownPieceWithPiece[] = [{
    id: 960002, piece_id: 970002,
    pieces: { id: 970002, title: "Unsorted Known fixture" },
  }]
  return {
    ...createListPagerFixtures(),
    learningLists: [list], listOverviews, learningQueueTunes,
    unlistedPracticeTunes, unlistedKnownTunes,
  }
}

/** Same factory as the rendered loader, including queue and unsorted state. */
export function createListSideEffectSnapshot() {
  const overview = createListSideEffectFixtures()
  const ids = [
    ...overview.learningLists.map(list => list.id),
    ...overview.bookmarkedSharedLists.map(list => list.id),
    ...overview.directSharedLists.map(list => list.id),
  ]
  return {
    bookmarks: overview.bookmarkedSharedLists.map(list => list.id),
    lists: ids.map(id => {
      const detail = createListDetailPagerFixture(String(id))!
      return { id, visibility: detail.typedList.visibility, members: detail.tunes.map(tune => tune.id) }
    }),
    queue: overview.learningQueueTunes.map(tune => ({ pieceId: tune.piece.id, listIds: tune.listIds })),
    practice: overview.unlistedPracticeTunes.map(tune => ({ pieceId: tune.piece_id, stage: tune.stage })),
    known: overview.unlistedKnownTunes.map(tune => tune.piece_id),
  }
}
