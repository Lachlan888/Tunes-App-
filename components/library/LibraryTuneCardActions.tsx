"use client"

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
  startLearning,
  removeTuneFromMyApp,
}: LibraryTuneCardActionsProps) {
  return (
    <div className="flex w-full flex-wrap items-start gap-3">
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

      <button
        type="button"
        className={buttonStyles.secondaryStrong}
        onClick={onOpenAddToList}
      >
        Add to list
      </button>
    </div>
  )
}