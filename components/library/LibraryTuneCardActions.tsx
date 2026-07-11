"use client"

import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import StartPracticeButton from "@/components/StartPracticeButton"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { Piece, UserPiece } from "@/lib/types"

type LibraryTuneCardActionsProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  redirectTo: string
  onOpenAddToList: () => void
  startLearning: (formData: FormData) => Promise<void>
}

export default function LibraryTuneCardActions({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  redirectTo,
  onOpenAddToList,
  startLearning,
}: LibraryTuneCardActionsProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <TuneStateIndicator
        isAlreadyInPractice={isAlreadyInPractice}
        isKnown={isKnown}
        stage={activeUserPiece?.stage ?? null}
        showNewToMe
      />

      <button
        type="button"
        className={buttonStyles.primary}
        onClick={onOpenAddToList}
      >
        Add to List
      </button>

      {!isAlreadyInPractice && !isKnown ? (
        <>
          <StartPracticeButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            startLearning={startLearning}
            className={buttonStyles.secondary}
          />

          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            className={buttonStyles.text}
          />
        </>
      ) : null}
    </div>
  )
}
