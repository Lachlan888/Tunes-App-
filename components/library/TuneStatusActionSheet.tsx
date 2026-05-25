"use client"

import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  getStatusLabel,
  TuneStatusActionForms,
} from "@/components/library/TuneStatusDropdown"
import type { Piece, UserPiece } from "@/lib/types"

type TuneStatusActionSheetProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  isInAList: boolean
  isOpen: boolean
  redirectTo: string
  onOpen: () => void
  onClose: () => void
  startLearning: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
}

const sheetActionClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-border bg-background/70 px-4 py-3 text-center text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const destructiveSheetActionClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-destructive bg-background/70 px-4 py-3 text-center text-sm font-semibold text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function TuneStatusActionSheet({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  isInAList,
  isOpen,
  redirectTo,
  onOpen,
  onClose,
  startLearning,
  removeTuneFromMyApp,
}: TuneStatusActionSheetProps) {
  const hasUserRelationship = isAlreadyInPractice || isKnown || isInAList
  const statusLabel = getStatusLabel({
    isAlreadyInPractice,
    isKnown,
    isInAList,
  })

  return (
    <>
      <button
        type="button"
        className={
          hasUserRelationship
            ? buttonStyles.statusTrigger
            : buttonStyles.statusTriggerEmpty
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={onOpen}
      >
        <span>
          {hasUserRelationship ? (
            <>
              <span className="text-muted-foreground">My status: </span>
              {statusLabel}
            </>
          ) : (
            statusLabel
          )}
        </span>

        <span
          aria-hidden="true"
          className={
            hasUserRelationship
              ? "text-muted-foreground"
              : "text-primary-foreground"
          }
        >
          ▾
        </span>
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={onClose}
        mobileMode="sheet"
        eyebrow="Tune status"
        title={piece.title}
        description={
          hasUserRelationship
            ? "Choose how this tune sits in your account."
            : "Start practising this tune, or mark it as already known."
        }
        bodyClassName="min-h-0 min-w-0 flex-1 overflow-y-auto p-4"
        footer={
          <button
            type="button"
            onClick={onClose}
            className={joinClasses(buttonStyles.secondary, "sm:w-full")}
          >
            Close
          </button>
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-background/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Current status
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {statusLabel}
            </p>
          </div>

          <TuneStatusActionForms
            piece={piece}
            activeUserPiece={activeUserPiece}
            isAlreadyInPractice={isAlreadyInPractice}
            isKnown={isKnown}
            hasUserRelationship={hasUserRelationship}
            redirectTo={redirectTo}
            startLearning={startLearning}
            removeTuneFromMyApp={removeTuneFromMyApp}
            itemClassName={sheetActionClassName}
            destructiveClassName={destructiveSheetActionClassName}
          />
        </div>
      </ResponsiveModal>
    </>
  )
}
