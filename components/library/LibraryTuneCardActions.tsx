"use client"

import TuneCollectionActionButton from "@/components/tunes/TuneCollectionActionButton"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { markAsKnown } from "@/lib/actions/known-pieces"
import type { Piece, UserPiece } from "@/lib/types"

const compactSecondaryAction =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm font-semibold text-text-primary shadow-material-rest transition-colors hover:border-action-primary/45 hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const compactPracticeAction =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-state-practice bg-state-practice px-3 py-2 text-sm font-semibold text-state-practice-foreground shadow-material-rest transition-colors hover:bg-state-practice/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

type LibraryTuneCardActionsProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  redirectTo: string
  onOpenAddToList: () => void
  startLearning: (formData: FormData) => Promise<void>
  showState?: boolean
}

export default function LibraryTuneCardActions({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  redirectTo,
  onOpenAddToList,
  startLearning,
  showState = true,
}: LibraryTuneCardActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showState ? (
        <TuneStateIndicator
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          stage={activeUserPiece?.stage ?? null}
          showNewToMe
        />
      ) : null}

      <button
        type="button"
        className={compactSecondaryAction}
        onClick={onOpenAddToList}
      >
        Add to List
      </button>

      {!isAlreadyInPractice && !isKnown ? (
        <>
          <TuneCollectionActionButton
            action={startLearning}
            fields={{ piece_id: piece.id, redirect_to: redirectTo }}
            label="Start Practice"
            pendingLabel="Starting..."
            className={compactPracticeAction}
          />

          <TuneCollectionActionButton
            action={markAsKnown}
            fields={{ piece_id: piece.id, redirect_to: redirectTo }}
            label="Mark Known"
            pendingLabel="Saving..."
            className={buttonStyles.text}
          />
        </>
      ) : null}
    </div>
  )
}
