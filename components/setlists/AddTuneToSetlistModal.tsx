"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import TuneSearchSelect from "@/components/TuneSearchSelect"
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
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
                className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
                  className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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