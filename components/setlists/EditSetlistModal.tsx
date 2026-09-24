"use client"

import { useState } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { Setlist } from "@/lib/types"

type EditSetlistModalProps = {
  canDelete?: boolean
  setlist: Setlist
  redirectTo: string
  updateSetlist: (formData: FormData) => Promise<void>
  deleteSetlist: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function EditSetlistModal({
  canDelete = false,
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
        className={buttonStyles.secondary}
      >
        Edit setlist
      </button>

      <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit setlist" mobileMode="sheet" desktopMaxWidth="md:max-w-2xl">
            <form action={updateSetlist} className="mt-6 space-y-4">
              <input type="hidden" name="setlist_id" value={setlist.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input type="hidden" name="expected_version" value={setlist.updated_at ?? setlist.created_at} />

              <div>
                <label htmlFor="EditSetlistModal-name" className="text-sm font-medium text-foreground">Name</label>
                <input
                  id="EditSetlistModal-name" name="name"
                  required
                  defaultValue={setlist.name}
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div>
                <label htmlFor="EditSetlistModal-description" className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  id="EditSetlistModal-description" name="description"
                  rows={3}
                  defaultValue={setlist.description ?? ""}
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="EditSetlistModal-event_date" className="text-sm font-medium text-foreground">Event date</label>
                  <input
                    type="date"
                    id="EditSetlistModal-event_date" name="event_date"
                    defaultValue={setlist.event_date ?? ""}
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label htmlFor="EditSetlistModal-location" className="text-sm font-medium text-foreground">Location</label>
                  <input
                    id="EditSetlistModal-location" name="location"
                    defaultValue={setlist.location ?? ""}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>

              <SubmitButton
                label="Save setlist"
                pendingLabel="Saving..."
                className={`w-full ${buttonStyles.primary}`}
              />
            </form>

            {canDelete ? <div className="mt-8 rounded-2xl border border-destructive bg-background/70 p-4">
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
                  className={buttonStyles.destructive}
                />
              </form>
            </div> : null}
      </ResponsiveModal>
    </>
  )
}