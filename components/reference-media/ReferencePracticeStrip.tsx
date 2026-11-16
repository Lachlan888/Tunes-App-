"use client"

import { useEffect, useState } from "react"
import AddToListAction from "@/components/AddToListAction"
import StartPracticeButton from "@/components/StartPracticeButton"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { logTunePracticeCheck } from "@/lib/actions/practice-diary"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import type {
  LearningList,
  Piece,
  UserPiece,
} from "@/lib/types"

type ReferencePracticeStripProps = {
  piece: Piece
  userPiece: UserPiece | null
  learningLists: LearningList[] | null
  learningListItems: Array<{ learning_list_id: number; piece_id: number }> | null
  practiceDiaryEnabled: boolean
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
}

const outcomes = [
  {
    id: "rough",
    label: "Rough",
    formalAction: markFailed,
    className: buttonStyles.reviewRough,
  },
  {
    id: "shaky",
    label: "Shaky",
    formalAction: markShaky,
    className: buttonStyles.reviewShaky,
  },
  {
    id: "solid",
    label: "Solid",
    formalAction: markSolid,
    className: buttonStyles.reviewSolid,
  },
] as const

export default function ReferencePracticeStrip({
  piece,
  userPiece,
  learningLists,
  learningListItems,
  practiceDiaryEnabled,
  redirectTo,
  startLearning,
  addToLearningList,
}: ReferencePracticeStripProps) {
  const [isPracticeOpen, setIsPracticeOpen] = useState(false)
  const canMarkPractised = Boolean(userPiece) || practiceDiaryEnabled

  useEffect(() => {
    const root = document.documentElement
    root.dataset.referencePractice = "active"

    return () => {
      delete root.dataset.referencePractice
    }
  }, [])

  return (
    <>
      <aside
        aria-label={`${piece.title} practice actions`}
        className="mb-5 flex flex-wrap items-center justify-end gap-3 border-b border-hairline pb-4"
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canMarkPractised ? (
            <button
              type="button"
              className={buttonStyles.practice}
              onClick={() => setIsPracticeOpen(true)}
            >
              Mark practised
            </button>
          ) : (
            <StartPracticeButton
              pieceId={piece.id}
              redirectTo={redirectTo}
              startLearning={startLearning}
              label="Add to Practice"
              className={buttonStyles.practice}
            />
          )}

          <AddToListAction
            piece={piece}
            learningLists={learningLists}
            learningListItems={learningListItems}
            redirectTo={redirectTo}
            addToLearningList={addToLearningList}
            buttonClassName={buttonStyles.secondary}
            buttonLabel="Add to list"
          />

        </div>
      </aside>

      <ResponsiveModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        eyebrow={userPiece ? "Formal review" : "Practice diary"}
        title={`How did ${piece.title} feel?`}
        description={
          userPiece
            ? "This updates the tune’s review interval and next review date."
            : "This records today’s practice without changing a review schedule."
        }
        desktopMaxWidth="md:max-w-lg"
      >
        <div className="grid grid-cols-3 gap-2">
          {outcomes.map((outcome) => (
            <form
              key={outcome.id}
              action={userPiece ? outcome.formalAction : logTunePracticeCheck}
            >
              {userPiece ? (
                <>
                  <input type="hidden" name="userPieceId" value={userPiece.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                </>
              ) : (
                <>
                  <input type="hidden" name="piece_id" value={piece.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <input
                    type="hidden"
                    name="practice_outcome"
                    value={outcome.id}
                  />
                </>
              )}
              <SubmitButton
                label={outcome.label}
                pendingLabel="Saving..."
                className={joinClasses(outcome.className, "w-full")}
              />
            </form>
          ))}
        </div>
      </ResponsiveModal>
    </>
  )
}
