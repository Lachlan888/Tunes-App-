"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import FocusActionMenu from "@/components/practice-foci/FocusActionMenu"
import PracticeFocusTuneManager from "@/components/practice-foci/PracticeFocusTuneManager"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { updatePracticeFocus } from "@/lib/actions/practice-foci"
import { formatPracticeDate } from "@/lib/review"
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
  return formatPracticeDate(dateOnly) ?? "Undated"
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
    <section className="grid max-w-3xl gap-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
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
            className="min-w-0 rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={focus.description ?? ""}
            className="min-w-0 rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Optional target date
          <input
            name="target_date"
            type="date"
            defaultValue={focus.target_date ?? ""}
            className="min-w-0 rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
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
    <section className="grid gap-3">
      <div>
        <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
          Evidence
        </h2>

      </div>

      {recentNotes.length === 0 ? (
        <p className="border-b border-hairline bg-surface-note p-4 text-sm leading-6 text-muted-foreground">
          No focus-linked notes yet. Add one from a review card by choosing this
          focus in the practice diary note modal.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {recentNotes.map((note) => (
            <li key={note.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
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
      <section className="grid gap-5 border-b border-border pb-5 sm:grid-cols-3">
        <div><p className="text-sm font-bold text-foreground">Intent</p><p className="mt-2 text-sm leading-6 text-foreground">{focus.description || "Not set"}</p></div>
        <div><p className="text-sm font-bold text-foreground">Evidence</p><p className="mt-2 text-sm leading-6 text-foreground">{recentNotes.length} linked {recentNotes.length === 1 ? "note" : "notes"} across {focus.tunes.length} {focus.tunes.length === 1 ? "tune" : "tunes"}.</p></div>
        <div><p className="text-sm font-bold text-foreground">Next review</p><p className="mt-2 text-sm leading-6 text-foreground">{focus.target_date ? formatDateOnly(focus.target_date) : "Not set"}</p></div>
      </section>

      <FocusActionMenu
        focus={focus}
        allFoci={allFoci}
        redirectTo={redirectTo}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((current) => !current)}
      />

      {isEditing ? (
        <section>
          <FocusEditPanel
            focus={focus}
            redirectTo={redirectTo}
            onCancel={() => setIsEditing(false)}
          />
        </section>
      ) : null}

      <RecentFocusNotes recentNotes={recentNotes} />

      <section className="grid gap-4 border-t border-hairline pt-6">
        <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
          Linked tunes
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
