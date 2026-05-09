"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import type { Setlist } from "@/lib/types"

type EditSetlistModalProps = {
  setlist: Setlist
  redirectTo: string
  updateSetlist: (formData: FormData) => Promise<void>
  deleteSetlist: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function EditSetlistModal({
  setlist,
  redirectTo,
  updateSetlist,
  deleteSetlist,
}: EditSetlistModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Edit setlist
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Edit setlist
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
                  Setlist details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Close
              </button>
            </div>

            <form action={updateSetlist} className="mt-6 space-y-4">
              <input type="hidden" name="setlist_id" value={setlist.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div>
                <label className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  name="name"
                  required
                  defaultValue={setlist.name}
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={setlist.description ?? ""}
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Event date
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    defaultValue={setlist.event_date ?? ""}
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Location
                  </label>
                  <input
                    name="location"
                    defaultValue={setlist.location ?? ""}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>

              <SubmitButton
                label="Save setlist"
                pendingLabel="Saving..."
                className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </form>

            <div className="mt-8 rounded-2xl border border-destructive bg-background/70 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-destructive">
                Danger zone
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deleting a setlist removes the shared setlist for all
                collaborators. It does not delete tunes or anyone’s repertoire
                state.
              </p>

              <form
                action={deleteSetlist}
                className="mt-4"
                onSubmit={(event) => {
                  const confirmed = window.confirm(
                    `Delete "${setlist.name}"? This removes the shared setlist for all collaborators.`
                  )

                  if (!confirmed) {
                    event.preventDefault()
                  }
                }}
              >
                <input type="hidden" name="setlist_id" value={setlist.id} />
                <SubmitButton
                  label="Delete setlist"
                  pendingLabel="Deleting..."
                  className="rounded-full border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}