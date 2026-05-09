import AddToListAction from "@/components/AddToListAction"
import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import StartPracticeButton from "@/components/StartPracticeButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

type TuneDetailActionsProps = {
  piece: Piece
  userPiece: UserPiece | null
  userKnownPiece: UserKnownPiece | null
  learningLists: LearningList[] | null
  learningListItems: LearningListItemRow[] | null
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
}

export default function TuneDetailActions({
  piece,
  userPiece,
  userKnownPiece,
  learningLists,
  learningListItems,
  redirectTo,
  startLearning,
  addToLearningList,
}: TuneDetailActionsProps) {
  const isAlreadyInPractice = Boolean(userPiece)
  const isKnown = Boolean(userKnownPiece)
  const currentStage = userPiece?.stage ?? null
  const existingListCount = Array.from(
    new Set((learningListItems ?? []).map((item) => item.learning_list_id))
  ).length

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Tune state
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Practice
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {isAlreadyInPractice ? "Already in practice" : "Not in practice"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Known
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {isKnown ? "Known" : "Not known"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Lists
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {existingListCount}
          </p>
        </div>
      </div>

      {isAlreadyInPractice && currentStage ? (
        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
          <PracticeProgress stage={currentStage} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!isAlreadyInPractice ? (
          <StartPracticeButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            startLearning={startLearning}
            className={buttonStyles.primary}
          />
        ) : (
          <span className="rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm">
            Already in practice
          </span>
        )}

        {isAlreadyInPractice ? (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            label="Set as known"
            className={buttonStyles.secondary}
          />
        ) : isKnown ? (
          <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            Known
          </span>
        ) : (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            className={buttonStyles.secondary}
          />
        )}

        <AddToListAction
          piece={piece}
          learningLists={learningLists}
          learningListItems={learningListItems}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          buttonClassName={buttonStyles.secondary}
        />

        <RemoveTuneButton pieceId={piece.id} redirectTo={redirectTo} />
      </div>
    </section>
  )
}