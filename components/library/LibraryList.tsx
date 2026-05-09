"use client"

import { useEffect, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import EmptyState from "@/components/EmptyState"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { removeFromPractice } from "@/lib/actions/user-pieces"
import type {
  LearningList,
  LearningListItemMembership,
  Piece,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"

type LibraryListProps = {
  pieces: Piece[] | null
  userPieces: UserPiece[] | null
  userKnownPieces: UserKnownPiece[] | null
  learningLists: LearningList[] | null
  learningListItems: LearningListItemMembership[] | null
  currentUserRole: UserRole
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  deleteCanonicalTuneAsModerator: (formData: FormData) => Promise<void>
  redirectTo: string
  scrollPieceId: string
  hasActiveFilters: boolean
}

const statusTriggerClass =
  "inline-flex min-w-[180px] items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const emptyStatusTriggerClass =
  "inline-flex min-w-[180px] items-center justify-between gap-3 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const secondaryButtonClass =
  "inline-flex min-w-[132px] items-center justify-center rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const menuSubmitButtonClass =
  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const destructiveMenuButtonClass = buttonStyles.destructiveMenuItem

const moderatorDeleteTriggerClass =
  "grid h-8 w-8 place-items-center rounded-lg border border-destructive bg-background/70 text-lg font-medium leading-none text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function canUseModeratorTools(role: UserRole) {
  return role === "moderator" || role === "admin"
}

function buildPieceRedirectTo(redirectTo: string, pieceId: number) {
  const separator = redirectTo.includes("?") ? "&" : "?"
  return `${redirectTo}${separator}scroll_piece=${pieceId}`
}

function getStatusLabel({
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

function StatusDropdown({
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
}: {
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
}) {
  const hasUserRelationship = isAlreadyInPractice || isKnown || isInAList

  const statusLabel = getStatusLabel({
    isAlreadyInPractice,
    isKnown,
    isInAList,
  })

  return (
    <div className="relative" data-status-dropdown-root>
      <button
        type="button"
        className={
          hasUserRelationship ? statusTriggerClass : emptyStatusTriggerClass
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
        <div className="absolute left-0 z-40 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl">
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

          {!isAlreadyInPractice ? (
            <form
              action={startLearning}
              onSubmit={(event) => {
                if (!isKnown) return

                const confirmed = window.confirm(
                  `Move "${piece.title}" from Known into Practice? This removes its known-only state and starts the review schedule.`
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
                className={menuSubmitButtonClass}
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
                className={menuSubmitButtonClass}
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
                className={menuSubmitButtonClass}
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
                  className={destructiveMenuButtonClass}
                />
              </form>
            </>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Close menu
          </button>
        </div>
      ) : null}
    </div>
  )
}

function DeleteCanonicalTuneModal({
  piece,
  redirectTo,
  deleteCanonicalTuneAsModerator,
  onClose,
}: {
  piece: Piece
  redirectTo: string
  deleteCanonicalTuneAsModerator: (formData: FormData) => Promise<void>
  onClose: () => void
}) {
  const confirmationText = `DELETE ${piece.title}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-destructive bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-destructive">
              Moderator destructive action
            </p>

            <h3 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
              Delete canonical tune
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              This permanently removes this tune from the shared catalogue for
              everyone. It may also remove connected practice state, known
              status, list entries, comments, lore, media links, moderation
              requests, and notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">
            To confirm, type this exactly:
          </p>
          <p className="mt-2 break-words font-mono text-sm font-semibold text-foreground">
            {confirmationText}
          </p>
        </div>

        <form action={deleteCanonicalTuneAsModerator} className="mt-5 space-y-3">
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <input
            name="confirmation"
            placeholder={confirmationText}
            className={inputClassName}
            autoComplete="off"
            required
          />

          <div className="grid gap-2 pt-2">
            <SubmitButton
              label="Delete canonical tune"
              pendingLabel="Deleting..."
              className="w-full rounded-xl border border-destructive bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LibraryList({
  pieces,
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  currentUserRole,
  startLearning,
  addToLearningList,
  removeTuneFromMyApp,
  deleteCanonicalTuneAsModerator,
  redirectTo,
  scrollPieceId,
  hasActiveFilters,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")
  const [openStatusPieceId, setOpenStatusPieceId] = useState<number | null>(null)
  const [deletePiece, setDeletePiece] = useState<Piece | null>(null)

  const allPieces = pieces ?? []
  const isModerator = canUseModeratorTools(currentUserRole)

  useEffect(() => {
    if (!scrollPieceId) return

    const element = document.getElementById(`piece-${scrollPieceId}`)

    if (!element) return

    requestAnimationFrame(() => {
      element.scrollIntoView({
        block: "center",
      })
    })
  }, [scrollPieceId])

  useEffect(() => {
    if (openStatusPieceId === null) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) return

      if (!target.closest("[data-status-dropdown-root]")) {
        setOpenStatusPieceId(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenStatusPieceId(null)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [openStatusPieceId])

  if (allPieces.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No tunes match this search"
        description="Try removing a filter, changing the title search, or creating the tune if it is genuinely missing."
        primaryActionHref="/library"
        primaryActionLabel="Reset filters"
      />
    ) : (
      <EmptyState
        title="No tunes in the library yet"
        description="Use Create Tune or Bulk Import Known Tunes above to start building the canonical tune library."
      />
    )
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {allPieces.map((piece) => {
          const pieceRedirectTo = buildPieceRedirectTo(redirectTo, piece.id)

          const activeUserPiece =
            (userPieces ?? []).find(
              (userPiece) => userPiece.piece_id === piece.id
            ) ?? null

          const isAlreadyInPractice = Boolean(activeUserPiece)

          const isKnown = (userKnownPieces ?? []).some(
            (userKnownPiece) => userKnownPiece.piece_id === piece.id
          )

          const listItemsForPiece = (learningListItems ?? []).filter(
            (item) => item.piece_id === piece.id
          )

          const listNames = Array.from(
            new Set(listItemsForPiece.map((item) => item.learning_lists.name))
          )

          const isInAList = listNames.length > 0
          const isStatusOpen = openStatusPieceId === piece.id

          return (
            <li
              key={piece.id}
              id={`piece-${piece.id}`}
              className="scroll-mt-28"
            >
              <TuneCard
                id={piece.id}
                title={piece.title}
                keyValue={piece.key}
                style={piece.style}
                timeSignature={piece.time_signature}
                referenceUrl={piece.reference_url}
                listNames={listNames}
                topRightAction={
                  isModerator ? (
                    <button
                      type="button"
                      className={moderatorDeleteTriggerClass}
                      title="Moderator only. Review the warning before deleting this shared tune for everyone."
                      aria-label={`Delete canonical tune ${piece.title}`}
                      onClick={() => setDeletePiece(piece)}
                    >
                      ×
                    </button>
                  ) : null
                }
              >
                <div className="flex w-full flex-wrap items-start gap-3">
                  <StatusDropdown
                    piece={piece}
                    activeUserPiece={activeUserPiece}
                    isAlreadyInPractice={isAlreadyInPractice}
                    isKnown={isKnown}
                    isInAList={isInAList}
                    isOpen={isStatusOpen}
                    redirectTo={pieceRedirectTo}
                    onToggle={() =>
                      setOpenStatusPieceId(isStatusOpen ? null : piece.id)
                    }
                    onClose={() => setOpenStatusPieceId(null)}
                    startLearning={startLearning}
                    removeTuneFromMyApp={removeTuneFromMyApp}
                  />

                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => {
                      setSelectedPiece(piece)
                      setSelectedListId("")
                      setOpenStatusPieceId(null)
                    }}
                  >
                    Add to list
                  </button>
                </div>
              </TuneCard>
            </li>
          )
        })}
      </ul>

      {selectedPiece && (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={Array.from(
            new Set(
              (learningListItems ?? [])
                .filter((item) => item.piece_id === selectedPiece.id)
                .map((item) => item.learning_list_id)
            )
          )}
          redirectTo={buildPieceRedirectTo(redirectTo, selectedPiece.id)}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      )}

      {deletePiece ? (
        <DeleteCanonicalTuneModal
          piece={deletePiece}
          redirectTo={redirectTo}
          deleteCanonicalTuneAsModerator={deleteCanonicalTuneAsModerator}
          onClose={() => setDeletePiece(null)}
        />
      ) : null}
    </>
  )
}