"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import FocusActionMenu from "@/components/practice-foci/FocusActionMenu"
import PracticeFocusTuneManager from "@/components/practice-foci/PracticeFocusTuneManager"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { updatePracticeFocus } from "@/lib/actions/practice-foci"
import type {
  FocusTuneOption,
  PracticeFocus,
  PracticeFocusRecentNote,
} from "@/lib/loaders/practice-foci"

type PracticeFocusDetailProps = {
  focus: PracticeFocus
  allFoci: PracticeFocus[]
  focusTuneOptions: FocusTuneOption[]
  recentNotes: PracticeFocusRecentNote[]
  redirectTo: string
}

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return "Undated"

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function FocusEditPanel({
  focus,
  redirectTo,
  onCancel,
}: {
  focus: PracticeFocus
  redirectTo: string
  onCancel: () => void
}) {
  return (
    <section className="grid gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Edit focus
      </h2>

      <form action={updatePracticeFocus} className="grid gap-4">
        <input type="hidden" name="focus_id" value={focus.id} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Title
          <input
            name="title"
            required
            defaultValue={focus.title}
            className="min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={focus.description ?? ""}
            className="min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Optional target date
          <input
            name="target_date"
            type="date"
            defaultValue={focus.target_date ?? ""}
            className="min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
          <SubmitButton
            label="Save focus"
            pendingLabel="Saving..."
            className={`${buttonStyles.primary} w-full sm:w-auto`}
          />

          <button
            type="button"
            className={`${buttonStyles.secondary} w-full sm:w-auto`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

function RecentFocusNotes({
  recentNotes,
}: {
  recentNotes: PracticeFocusRecentNote[]
}) {
  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Recent notes
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Notes saved from review cards or diary entries against this focus.
        </p>
      </div>

      {recentNotes.length === 0 ? (
        <p className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-4">
          No focus-linked notes yet. Add one from a review card by choosing this
          focus in the practice diary note modal.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {recentNotes.map((note) => (
            <li key={note.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>{formatDateOnly(note.practice_date)}</span>

                {note.category_name ? (
                  <>
                    <span aria-hidden="true">|</span>
                    <span>{note.category_name}</span>
                  </>
                ) : null}

                {note.piece ? (
                  <>
                    <span aria-hidden="true">|</span>
                    <Link
                      href={`/library/${note.piece.id}`}
                      className="underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
                    >
                      {note.piece.title}
                    </Link>
                  </>
                ) : null}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function PracticeFocusDetail({
  focus,
  allFoci,
  focusTuneOptions,
  recentNotes,
  redirectTo,
}: PracticeFocusDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <section className="grid gap-7 md:gap-6">
      <FocusActionMenu
        focus={focus}
        allFoci={allFoci}
        redirectTo={redirectTo}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((current) => !current)}
      />

      {isEditing ? (
        <section className="md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
          <FocusEditPanel
            focus={focus}
            redirectTo={redirectTo}
            onCancel={() => setIsEditing(false)}
          />
        </section>
      ) : null}

      <RecentFocusNotes recentNotes={recentNotes} />

      <section className="grid gap-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes in this focus
        </h2>

        <PracticeFocusTuneManager
          focus={focus}
          focusTuneOptions={focusTuneOptions}
          redirectTo={redirectTo}
        />
      </section>
    </section>
  )
}