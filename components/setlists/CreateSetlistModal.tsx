"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"

type CreateSetlistModalProps = {
  createSetlist: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function CreateSetlistModal({
  createSetlist,
}: CreateSetlistModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleOpen() {
    setIsSubmitting(false)
    setIsOpen(true)
  }

  function handleClose() {
    if (isSubmitting) return

    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Create setlist
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={isSubmitting}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-2xl"
        title="Create setlist"
      >
        <form
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            try { await createSetlist(formData) } finally { setIsSubmitting(false) }
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="CreateSetlistModal-name" className="text-sm font-medium text-foreground">Name</label>
            <input
              id="CreateSetlistModal-name" name="name"
              required
              placeholder="Festival set"
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="CreateSetlistModal-description" className="text-sm font-medium text-foreground">Description</label>
            <textarea
              id="CreateSetlistModal-description" name="description"
              rows={3}
              placeholder="Notes about the gig, jam, or rehearsal."
              className={`${inputClass} mt-2`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="CreateSetlistModal-event_date" className="text-sm font-medium text-foreground">Event date</label>
              <input
                type="date"
                id="CreateSetlistModal-event_date" name="event_date"
                className={`${inputClass} mt-2`}
              />
            </div>

            <div>
              <label htmlFor="CreateSetlistModal-location" className="text-sm font-medium text-foreground">Location</label>
              <input
                id="CreateSetlistModal-location" name="location"
                placeholder="Nathalia, Footscray, online..."
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>

          <SubmitButton
            label="Create setlist"
            pendingLabel="Creating..."
            className="w-full min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </ResponsiveModal>
    </>
  )
}
