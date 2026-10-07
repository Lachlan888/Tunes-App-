"use client"

import { getReviewIntervalLabel } from "@/lib/review"
import Link from "next/link"
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
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

type ReferencePracticeStripProps = {
  piece: Piece
  userPiece: UserPiece | null
  userKnownPiece: UserKnownPiece | null
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

function pieceDetail(piece: Piece) {
  return [piece.style, piece.key ? `Key ${piece.key}` : null, piece.time_signature]
    .filter(Boolean)
    .join(" · ")
}

export default function ReferencePracticeStrip({
  piece,
  userPiece,
  userKnownPiece,
  learningLists,
  learningListItems,
  practiceDiaryEnabled,
  redirectTo,
  startLearning,
  addToLearningList,
}: ReferencePracticeStripProps) {
  const [isPracticeOpen, setIsPracticeOpen] = useState(false)
  const canMarkPractised = Boolean(userPiece) || practiceDiaryEnabled
  const detail = pieceDetail(piece)
  const status = userPiece
    ? `Learning · ${getReviewIntervalLabel(userPiece.stage)}`
    : userKnownPiece
      ? "Known"
      : null

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
        className="floating-material fixed bottom-4 left-[calc(var(--app-rail-width)+1rem)] right-4 z-[320] mx-auto hidden max-w-4xl items-center gap-4 rounded-sheet border border-hairline p-3 shadow-material-floating lg:flex"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg font-semibold text-text-primary">
            {piece.title}
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-text-muted">
            {status ? <span className="shrink-0 rounded-pill border border-hairline bg-surface-note px-2 py-1 font-semibold text-text-primary">
              {status}
            </span> : null}
            {detail ? <span className="truncate">{detail}</span> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

          <Link
            href={`/library/${piece.id}`}
            className={buttonStyles.secondaryStrong}
          >
            Back to tune
          </Link>
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
