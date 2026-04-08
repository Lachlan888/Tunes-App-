import AddToListAction from "@/components/AddToListAction"
import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import StartPracticeButton from "@/components/StartPracticeButton"
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

  const buttonClassName = "w-full border px-3 py-2 text-sm"

  return (
    <section className="rounded border p-4">
      <h2 className="mb-4 text-xl font-semibold">Tune state</h2>

      <div className="space-y-2 text-sm text-gray-700">
        <p>In practice: {isAlreadyInPractice ? "Yes" : "No"}</p>
        <p>Known: {isKnown ? "Yes" : "No"}</p>
        <p>Stage: {currentStage ?? "—"}</p>
        <p>Lists containing this tune: {existingListCount}</p>
      </div>

      <div className="mt-5 space-y-2">
        {!isAlreadyInPractice ? (
          <StartPracticeButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            startLearning={startLearning}
            className={buttonClassName}
          />
        ) : (
          <p className="border px-3 py-2 text-sm text-gray-600">
            Already in practice
          </p>
        )}

        {isAlreadyInPractice ? (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            label="Set as known"
            className={buttonClassName}
          />
        ) : isKnown ? (
          <p className="border px-3 py-2 text-sm text-gray-600">Known</p>
        ) : (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            className={buttonClassName}
          />
        )}

        <AddToListAction
          piece={piece}
          learningLists={learningLists}
          learningListItems={learningListItems}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          buttonClassName={buttonClassName}
        />

        <RemoveTuneButton
          pieceId={piece.id}
          redirectTo={redirectTo}
          className={buttonClassName}
        />
      </div>
    </section>
  )
}