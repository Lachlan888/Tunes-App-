"use client"

import { useState } from "react"
import type { RecentPracticeNoteForReview } from "@/lib/loaders/review"

type RecentPracticeNotesProps = {
  notes: RecentPracticeNoteForReview[]
}

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return "Undated"

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

export default function RecentPracticeNotes({
  notes,
}: RecentPracticeNotesProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (notes.length === 0) {
    return null
  }

  return (
    <section className="mt-5 border-t border-border pt-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent notes
          </span>

          <span className="mt-1 block text-sm text-muted-foreground">
            {notes.length} recent note{notes.length === 1 ? "" : "s"} for this
            tune
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen ? (
        <ol className="mt-4 divide-y divide-border">
          {notes.map((note) => (
            <li key={note.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>{formatDateOnly(note.practice_date)}</span>

                {note.category_name ? (
                  <>
                    <span aria-hidden="true">|</span>
                    <span>{note.category_name}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-6 text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}