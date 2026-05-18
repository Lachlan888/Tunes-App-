"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import PracticeFocusTuneManager from "@/components/practice-foci/PracticeFocusTuneManager"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  archivePracticeFocus,
  deletePracticeFocus,
  updatePracticeFocus,
} from "@/lib/actions/practice-foci"
import type {
  ActivePracticeTuneOption,
  PracticeFocus,
  PracticeFocusRecentNote,
} from "@/lib/loaders/practice-foci"

type PracticeFocusDetailProps = {
  focus: PracticeFocus
  activePracticeTunes: ActivePracticeTuneOption[]
  recentNotes: PracticeFocusRecentNote[]
  redirectTo: string
}

function getStatusLabel(status: PracticeFocus["status"]) {
  if (status === "active") return "Active"
  if (status === "paused") return "Paused"
  if (status === "completed") return "Completed"

  return "Archived"
}

function getStatusClasses(status: PracticeFocus["status"]) {
  if (status === "active") {
    return "border-success bg-success text-success-foreground"
  }

  if (status === "completed") {
    return "border-primary bg-primary text-primary-foreground"
  }

  return "border-border bg-muted text-muted-foreground"
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

function FocusSummary({
  focus,
  recentNotes,
  isEditing,
  redirectTo,
  onToggleEdit,
}: {
  focus: PracticeFocus
  recentNotes: PracticeFocusRecentNote[]
  isEditing: boolean
  redirectTo: string
  onToggleEdit: () => void
}) {
  return (
    <section className="md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <div className="grid gap-5 md:flex md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2 md:mx-0 md:flex md:max-w-none md:flex-wrap">
            <span
              className={joinClasses(
                "flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold md:w-auto md:py-1",
                getStatusClasses(focus.status)
              )}
            >
              {getStatusLabel(focus.status)}
            </span>

            <span className="flex items-center justify-center rounded-full border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground md:w-auto md:py-1">
              {focus.tunes.length} {focus.tunes.length === 1 ? "tune" : "tunes"}
            </span>

            <span className="flex items-center justify-center rounded-full border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground md:w-auto md:py-1">
              {recentNotes.length}{" "}
              {recentNotes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {focus.target_date ? (
            <p className="mt-3 text-center text-sm text-muted-foreground md:text-left">
              Target date: {focus.target_date}
            </p>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 md:mx-0 md:w-auto md:max-w-none md:flex md:flex-wrap">
          <button
            type="button"
            className={`${buttonStyles.secondary} w-full md:w-auto`}
            onClick={onToggleEdit}
          >
            {isEditing ? "Close edit" : "Edit focus"}
          </button>

          {focus.status === "active" ? (
            <form action={archivePracticeFocus} className="w-full md:w-auto">
              <input type="hidden" name="focus_id" value={focus.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <SubmitButton
                label="Archive focus"
                pendingLabel="Archiving..."
                className={`${buttonStyles.secondary} w-full md:w-auto`}
              />
            </form>
          ) : null}
        </div>
      </div>
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

function DangerZone({ focus }: { focus: PracticeFocus }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-destructive">
        Danger zone
      </h2>

      <div className="border-t border-destructive/30 pt-4 md:rounded-2xl md:border md:border-destructive/40 md:bg-destructive/10 md:p-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Delete this focus permanently. This removes the focus and its tune
          links, but does not remove tunes from practice and does not delete
          diary notes.
        </p>

        <form
          action={deletePracticeFocus}
          className="mt-4"
          onSubmit={(event) => {
            const confirmed = window.confirm(
              `Delete "${focus.title}" permanently? This cannot be undone.`
            )

            if (!confirmed) {
              event.preventDefault()
            }
          }}
        >
          <input type="hidden" name="focus_id" value={focus.id} />
          <input type="hidden" name="redirect_to" value="/review/foci" />

          <SubmitButton
            label="Delete focus"
            pendingLabel="Deleting..."
            className={buttonStyles.destructive}
          />
        </form>
      </div>
    </section>
  )
}

export default function PracticeFocusDetail({
  focus,
  activePracticeTunes,
  recentNotes,
  redirectTo,
}: PracticeFocusDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <section className="grid gap-7 md:gap-6">
      <FocusSummary
        focus={focus}
        recentNotes={recentNotes}
        isEditing={isEditing}
        redirectTo={redirectTo}
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
          activePracticeTunes={activePracticeTunes}
          redirectTo={redirectTo}
        />
      </section>

      <section className="md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <DangerZone focus={focus} />
      </section>
    </section>
  )
}