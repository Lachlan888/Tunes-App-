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
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Create setlist
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={isSubmitting}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-2xl"
        eyebrow="New setlist"
        title="Create a shared working list"
        description="Use setlists for gigs, sessions, rehearsals, workshops, or any shared playing context."
      >
        <form
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            await createSetlist(formData)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              name="name"
              required
              placeholder="Festival set"
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
              placeholder="Notes about the gig, jam, or rehearsal."
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
                className={`${inputClass} mt-2`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Location
              </label>
              <input
                name="location"
                placeholder="Nathalia, Footscray, online..."
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>

          <SubmitButton
            label="Create setlist"
            pendingLabel="Creating..."
            className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </ResponsiveModal>
    </>
  )
}