"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import EmptyState from "@/components/EmptyState"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import { markAsKnown } from "@/lib/actions/known-pieces"
import type {
  LearningList,
  LearningListItemMembership,
  Piece,
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

type LibraryListProps = {
  pieces: Piece[] | null
  userPieces: UserPiece[] | null
  userKnownPieces: UserKnownPiece[] | null
  learningLists: LearningList[] | null
  learningListItems: LearningListItemMembership[] | null
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  redirectTo: string
  hasActiveFilters: boolean
}

const primaryButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const secondaryButtonClass =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const destructiveButtonClass =
  "rounded-full border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f2dfd6] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const statePillClass =
  "rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"

export default function LibraryList({
  pieces,
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  startLearning,
  addToLearningList,
  removeTuneFromMyApp,
  redirectTo,
  hasActiveFilters,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const allPieces = pieces ?? []

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
          const isAlreadyInPractice = (userPieces ?? []).some(
            (userPiece) => userPiece.piece_id === piece.id
          )

          const isKnown = (userKnownPieces ?? []).some(
            (userKnownPiece) => userKnownPiece.piece_id === piece.id
          )

          const listItemsForPiece = (learningListItems ?? []).filter(
            (item) => item.piece_id === piece.id
          )

          const listNames = Array.from(
            new Set(listItemsForPiece.map((item) => item.learning_lists.name))
          )

          return (
            <li key={piece.id}>
              <TuneCard
                id={piece.id}
                title={piece.title}
                keyValue={piece.key}
                style={piece.style}
                timeSignature={piece.time_signature}
                referenceUrl={piece.reference_url}
                listNames={listNames}
              >
                {isAlreadyInPractice ? (
                  <p className={statePillClass}>Already in practice</p>
                ) : (
                  <form action={startLearning}>
                    <input type="hidden" name="piece_id" value={piece.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Start Practice"
                      pendingLabel="Starting..."
                      className={primaryButtonClass}
                    />
                  </form>
                )}

                {isKnown ? (
                  <p className={statePillClass}>Known</p>
                ) : (
                  <form action={markAsKnown}>
                    <input type="hidden" name="piece_id" value={piece.id} />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value={redirectTo}
                    />
                    <SubmitButton
                      label={
                        isAlreadyInPractice ? "Set as known" : "Mark as known"
                      }
                      pendingLabel="Saving..."
                      className={secondaryButtonClass}
                    />
                  </form>
                )}

                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => {
                    setSelectedPiece(piece)
                    setSelectedListId("")
                  }}
                >
                  Add to List
                </button>

                <form
                  action={removeTuneFromMyApp}
                  onSubmit={(event) => {
                    const confirmed = window.confirm(
                      `Remove "${piece.title}" from your practice, known tunes, and all your lists?`
                    )

                    if (!confirmed) {
                      event.preventDefault()
                    }
                  }}
                >
                  <input type="hidden" name="piece_id" value={piece.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <SubmitButton
                    label="Remove Tune"
                    pendingLabel="Removing..."
                    className={destructiveButtonClass}
                  />
                </form>
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
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      )}
    </>
  )
}