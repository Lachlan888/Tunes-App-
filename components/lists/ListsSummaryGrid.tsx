import EmptyState from "@/components/EmptyState"
import MyTunesModal from "@/components/lists/MyTunesModal"
import UnlistedKnownTunesModal from "@/components/lists/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/lists/UnlistedPracticeTunesModal"
import type {
  LearningList,
  MyTuneRow,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"

type ListsSummaryGridProps = {
  myTunes: MyTuneRow[]
  unlistedPracticeTunes: UserPieceWithPiece[]
  unlistedKnownTunes: UserKnownPieceWithPiece[]
  learningLists: LearningList[]
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
}

function getSummaryGridClass(visibleSummaryCount: number) {
  if (visibleSummaryCount <= 1) {
    return "mb-8 grid gap-4"
  }

  if (visibleSummaryCount === 2) {
    return "mb-8 grid gap-4 lg:grid-cols-2"
  }

  return "mb-8 grid gap-4 lg:grid-cols-3"
}

export default function ListsSummaryGrid({
  myTunes,
  unlistedPracticeTunes,
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  redirectTo,
}: ListsSummaryGridProps) {
  const visibleSummaryCount =
    1 +
    (unlistedPracticeTunes.length > 0 ? 1 : 0) +
    (unlistedKnownTunes.length > 0 ? 1 : 0)

  return (
    <div className={getSummaryGridClass(visibleSummaryCount)}>
      <section className="rounded border p-4">
        <div>
          <h2 className="text-xl font-semibold">My Tunes</h2>
          <p className="mt-2 text-gray-600">Known and active learning tunes</p>

          <div className="mt-3">
            <span className="text-sm text-gray-500">
              {myTunes.length} tune{myTunes.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {myTunes.length === 0 ? (
          <EmptyState
            title="No personal tunes yet"
            description="Tunes you mark as known or start practising will appear here."
            secondaryActionHref="/library"
            secondaryActionLabel="Browse Tunes"
            className="mt-4"
          />
        ) : (
          <div className="mt-4">
            <MyTunesModal myTunes={myTunes} />
          </div>
        )}
      </section>

      <UnlistedPracticeTunesModal
        unlistedPracticeTunes={unlistedPracticeTunes}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
        summaryClassName="rounded border p-4 h-full"
      />

      <UnlistedKnownTunesModal
        unlistedKnownTunes={unlistedKnownTunes}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
        summaryClassName="rounded border p-4 h-full"
      />
    </div>
  )
}