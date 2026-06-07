"use client"

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { removeFromPractice } from "@/lib/actions/user-pieces"
import type { Piece, UserPiece } from "@/lib/types"

type TuneStatusDropdownProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  isInAList: boolean
  isOpen: boolean
  redirectTo: string
  onToggle: () => void
  onClose: () => void
  startLearning: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
}

export function getStatusLabel({
  isAlreadyInPractice,
  isKnown,
  isInAList,
}: {
  isAlreadyInPractice: boolean
  isKnown: boolean
  isInAList: boolean
}) {
  if (isAlreadyInPractice) return "In practice"
  if (isKnown) return "Known"
  if (isInAList) return "In my lists"
  return "Add to my tunes"
}

type TuneStatusActionFormsProps = {
  piece: Piece
  activeUserPiece: UserPiece | null
  isAlreadyInPractice: boolean
  isKnown: boolean
  hasUserRelationship: boolean
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  itemClassName?: string
  destructiveClassName?: string
}

export function TuneStatusActionForms({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  hasUserRelationship,
  redirectTo,
  startLearning,
  removeTuneFromMyApp,
  itemClassName = buttonStyles.menuItem,
  destructiveClassName = buttonStyles.destructiveMenuItem,
}: TuneStatusActionFormsProps) {
  return (
    <>
      {!isAlreadyInPractice ? (
        <form
          action={startLearning}
          onSubmit={(event) => {
            if (!isKnown) return

            const confirmed = window.confirm(
              `Move "${piece.title}" from Known into Practice? This removes its Known-only status and starts the review schedule.`
            )

            if (!confirmed) {
              event.preventDefault()
            }
          }}
        >
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <SubmitButton
            label="Start Practice"
            pendingLabel="Starting..."
            className={itemClassName}
          />
        </form>
      ) : null}

      {!isKnown ? (
        <form
          action={markAsKnown}
          onSubmit={(event) => {
            if (!isAlreadyInPractice) return

            const confirmed = window.confirm(
              `Mark "${piece.title}" as known? This removes it from active practice.`
            )

            if (!confirmed) {
              event.preventDefault()
            }
          }}
        >
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <SubmitButton
            label={isAlreadyInPractice ? "Set as known" : "Mark as known"}
            pendingLabel="Saving..."
            className={itemClassName}
          />
        </form>
      ) : null}

      {isAlreadyInPractice && activeUserPiece ? (
        <form
          action={removeFromPractice}
          onSubmit={(event) => {
            const confirmed = window.confirm(
              `Remove "${piece.title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists.`
            )

            if (!confirmed) {
              event.preventDefault()
            }
          }}
        >
          <input
            type="hidden"
            name="user_piece_id"
            value={activeUserPiece.id}
          />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <SubmitButton
            label="Remove from practice"
            pendingLabel="Removing..."
            className={itemClassName}
          />
        </form>
      ) : null}

      {hasUserRelationship ? (
        <>
          <div className="my-2 border-t border-border" />

          <form
            action={removeTuneFromMyApp}
            onSubmit={(event) => {
              const confirmed = window.confirm(
                `Remove "${piece.title}" from your library? This removes it from your practice, known tunes, and your lists, but does not delete the shared tune.`
              )

              if (!confirmed) {
                event.preventDefault()
              }
            }}
          >
            <input type="hidden" name="piece_id" value={piece.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <SubmitButton
              label="Remove from my library"
              pendingLabel="Removing..."
              className={destructiveClassName}
            />
          </form>
        </>
      ) : null}
    </>
  )
}

export default function TuneStatusDropdown({
  piece,
  activeUserPiece,
  isAlreadyInPractice,
  isKnown,
  isInAList,
  isOpen,
  redirectTo,
  onToggle,
  onClose,
  startLearning,
  removeTuneFromMyApp,
}: TuneStatusDropdownProps) {
  const hasUserRelationship = isAlreadyInPractice || isKnown || isInAList

  const statusLabel = getStatusLabel({
    isAlreadyInPractice,
    isKnown,
    isInAList,
  })

  return (
    <div
      className={isOpen ? "relative z-[70]" : "relative"}
      data-status-dropdown-root
    >
      <button
        type="button"
        className={
          hasUserRelationship
            ? buttonStyles.statusTrigger
            : buttonStyles.statusTriggerEmpty
        }
        aria-expanded={isOpen}
        onClick={onToggle}
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

      {isOpen ? (
        <div className="absolute left-0 z-[80] mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {hasUserRelationship ? "Change status" : "Add to my tunes"}
            </p>

            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {hasUserRelationship
                ? "Choose how this tune sits in your account."
                : "Start practising this tune, or mark it as already known."}
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
          />

          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.menuItem}
          >
            Close menu
          </button>
        </div>
      ) : null}
    </div>
  )
}
