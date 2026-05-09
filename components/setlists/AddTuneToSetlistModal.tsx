"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import TuneSearchSelect from "@/components/TuneSearchSelect"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { Piece } from "@/lib/types"

type AddTuneToSetlistModalProps = {
  setlistId: number
  pieces: Piece[]
  existingPieceIds: number[]
  redirectTo: string
  addTuneToSetlist: (formData: FormData) => Promise<void>
}

export default function AddTuneToSetlistModal({
  setlistId,
  pieces,
  existingPieceIds,
  redirectTo,
  addTuneToSetlist,
}: AddTuneToSetlistModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPieces, setSelectedPieces] = useState<Piece[]>([])

  function handleClose() {
    setIsOpen(false)
    setSelectedPieces([])
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonStyles.primary}
      >
        Add tune
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Add tune
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
                  Add a tune to this setlist
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Start typing to pick from quick matches, or run a broader
                  normalised search if the tune does not appear immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className={buttonStyles.secondary}
              >
                Close
              </button>
            </div>

            <form action={addTuneToSetlist} className="mt-6 space-y-5">
              <input type="hidden" name="setlist_id" value={setlistId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <TuneSearchSelect
                pieces={pieces}
                inputName="piece_id"
                mode="single"
                excludedPieceIds={existingPieceIds}
                selectedLabel="Selected tune"
                emptySelectionLabel="Choose a tune from quick matches or search results before adding it to the setlist."
                onSelectionChange={setSelectedPieces}
              />

              {selectedPieces.length > 0 ? (
                <SubmitButton
                  label="Add to setlist"
                  pendingLabel="Adding..."
                  className={`w-full ${buttonStyles.primary}`}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-border bg-muted px-4 py-3 text-sm font-medium text-muted-foreground opacity-75"
                >
                  Select a tune first
                </button>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}