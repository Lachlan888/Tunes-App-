import EmptyState from "@/components/EmptyState"
import LearningQueueModal from "@/components/lists/LearningQueueModal"
import MyTunesModal from "@/components/lists/MyTunesModal"
import UnlistedKnownTunesModal from "@/components/lists/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/lists/UnlistedPracticeTunesModal"
import type { LearningQueueTune } from "@/lib/loaders/lists"
import type {
  LearningList,
  MyTuneRow,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"

type ListsSummaryGridProps = {
  myTunes: MyTuneRow[]
  learningQueueTunes: LearningQueueTune[]
  unlistedPracticeTunes: UserPieceWithPiece[]
  unlistedKnownTunes: UserKnownPieceWithPiece[]
  learningLists: LearningList[]
  addToLearningList: (formData: FormData) => Promise<void>
  startLearning: (formData: FormData) => Promise<void>
  redirectTo: string
}

function getSummaryGridClass(visibleSummaryCount: number) {
  if (visibleSummaryCount <= 1) {
    return "mb-8 divide-y divide-border/70 md:grid md:gap-4 md:divide-y-0"
  }

  if (visibleSummaryCount === 2) {
    return "mb-8 divide-y divide-border/70 md:grid md:gap-4 md:divide-y-0 lg:grid-cols-2"
  }

  return "mb-8 divide-y divide-border/70 md:grid md:gap-4 md:divide-y-0 lg:grid-cols-3"
}

const summaryCardClass =
  "py-4 md:h-full md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm"

export default function ListsSummaryGrid({
  myTunes,
  learningQueueTunes,
  unlistedPracticeTunes,
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  startLearning,
  redirectTo,
}: ListsSummaryGridProps) {
  const visibleSummaryCount =
    1 +
    (learningQueueTunes.length > 0 ? 1 : 0) +
    (unlistedPracticeTunes.length > 0 ? 1 : 0) +
    (unlistedKnownTunes.length > 0 ? 1 : 0)

  return (
    <div className={getSummaryGridClass(visibleSummaryCount)}>
      <section className={summaryCardClass}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Repertoire
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
            My Tunes
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Known and active practice tunes.
          </p>

          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {myTunes.length} tune{myTunes.length === 1 ? "" : "s"}
          </p>
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
          <div className="mt-5">
            <MyTunesModal myTunes={myTunes} />
          </div>
        )}
      </section>

      <LearningQueueModal
        learningQueueTunes={learningQueueTunes}
        startLearning={startLearning}
        redirectTo={redirectTo}
        summaryClassName={summaryCardClass}
      />

      <UnlistedPracticeTunesModal
        unlistedPracticeTunes={unlistedPracticeTunes}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
        summaryClassName={summaryCardClass}
      />

      <UnlistedKnownTunesModal
        unlistedKnownTunes={unlistedKnownTunes}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
        summaryClassName={summaryCardClass}
      />
    </div>
  )
}
