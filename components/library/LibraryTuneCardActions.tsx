"use client"

import TuneStatusActionSheet from "@/components/library/TuneStatusActionSheet"
import TuneStatusDropdown from "@/components/library/TuneStatusDropdown"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { Piece, UserPiece } from "@/lib/types"

type LibraryTuneCardActionsProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  isInAList: boolean
  isStatusOpen: boolean
  redirectTo: string
  onToggleStatus: () => void
  onCloseStatus: () => void
  onOpenAddToList: () => void
  onOpenFindReference: () => void
  startLearning: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
}

export default function LibraryTuneCardActions({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  isInAList,
  isStatusOpen,
  redirectTo,
  onToggleStatus,
  onCloseStatus,
  onOpenAddToList,
  onOpenFindReference,
  startLearning,
  removeTuneFromMyApp,
}: LibraryTuneCardActionsProps) {
  const hasReferenceUrl = Boolean(piece.reference_url)

  return (
    <div className="flex w-full flex-wrap items-start gap-3">
      <div className="hidden md:block">
        <TuneStatusDropdown
          piece={piece}
          activeUserPiece={activeUserPiece}
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          isInAList={isInAList}
          isOpen={isStatusOpen}
          redirectTo={redirectTo}
          onToggle={onToggleStatus}
          onClose={onCloseStatus}
          startLearning={startLearning}
          removeTuneFromMyApp={removeTuneFromMyApp}
        />
      </div>

      <div className="w-full md:hidden">
        <TuneStatusActionSheet
          piece={piece}
          activeUserPiece={activeUserPiece}
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          isInAList={isInAList}
          isOpen={isStatusOpen}
          redirectTo={redirectTo}
          onOpen={onToggleStatus}
          onClose={onCloseStatus}
          startLearning={startLearning}
          removeTuneFromMyApp={removeTuneFromMyApp}
        />
      </div>

      <button
        type="button"
        className={buttonStyles.secondaryStrong}
        onClick={onOpenAddToList}
      >
        Add to list
      </button>

      {!hasReferenceUrl ? (
        <button
          type="button"
          className={buttonStyles.secondary}
          onClick={onOpenFindReference}
        >
          Find reference
        </button>
      ) : null}
    </div>
  )
}
