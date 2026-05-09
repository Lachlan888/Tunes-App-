"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"

type CreateSetlistModalProps = {
  createSetlist: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function CreateSetlistModal({
  createSetlist,
}: CreateSetlistModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Create setlist
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  New setlist
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
                  Create a shared working list
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Use setlists for gigs, sessions, rehearsals, workshops, or
                  any shared playing context.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Close
              </button>
            </div>

            <form action={createSetlist} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Name
                </label>
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
                className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}