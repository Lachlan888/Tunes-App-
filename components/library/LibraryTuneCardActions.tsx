"use client"

import TuneCollectionActionButton from "@/components/tunes/TuneCollectionActionButton"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { markAsKnown } from "@/lib/actions/known-pieces"
import type { Piece, UserPiece } from "@/lib/types"

const compactSecondaryAction =
  "inline-flex min-h-11 min-w-0 w-full items-center justify-center whitespace-nowrap rounded-control border border-hairline bg-surface-paper px-1 py-2 text-xs font-semibold text-text-primary shadow-material-rest transition-colors hover:border-action-primary/45 hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-3 md:text-sm"

const compactPracticeAction =
  "inline-flex min-h-11 min-w-0 w-full items-center justify-center whitespace-nowrap rounded-control border border-state-practice bg-state-practice px-1 py-2 text-xs font-semibold text-state-practice-foreground shadow-material-rest transition-colors hover:bg-state-practice/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-3 md:text-sm"

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
    <div className={showState ? "flex flex-wrap items-center gap-2" : "contents"}>
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
        aria-label={`Add ${piece.title} to List`}
        onClick={onOpenAddToList}
      >
        <span className="md:hidden">Add</span>
        <span className="hidden md:inline">Add to List</span>
      </button>

      {!isAlreadyInPractice && !isKnown ? (
        <>
          <TuneCollectionActionButton
            action={startLearning}
            fields={{ piece_id: piece.id, redirect_to: redirectTo }}
            label="Start Practice"
            mobileLabel="Practice"
            pendingLabel="Starting..."
            mobilePendingLabel="Starting"
            ariaLabel={`Start Practice for ${piece.title}`}
            className={compactPracticeAction}
          />

          <TuneCollectionActionButton
            action={markAsKnown}
            fields={{ piece_id: piece.id, redirect_to: redirectTo }}
            label="Mark Known"
            mobileLabel="Known"
            pendingLabel="Saving..."
            mobilePendingLabel="Saving"
            ariaLabel={`Mark ${piece.title} Known`}
            className={compactSecondaryAction}
          />
        </>
      ) : (
        <>
          <button
            type="button"
            className={`${compactPracticeAction} md:hidden`}
            disabled
            aria-label={`Start Practice for ${piece.title} — ${isAlreadyInPractice ? "already in practice" : "already known"}`}
          >
            Practice
          </button>
          <button
            type="button"
            className={`${compactSecondaryAction} md:hidden`}
            disabled
            aria-label={`Mark ${piece.title} Known — ${isAlreadyInPractice ? "already in practice" : "already known"}`}
          >
            Known
          </button>
        </>
      )}
    </div>
  )
}
