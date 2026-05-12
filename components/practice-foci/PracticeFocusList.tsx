"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import {
  archivePracticeFocus,
  deletePracticeFocus,
  updatePracticeFocus,
} from "@/lib/actions/practice-foci"
import type {
  ActivePracticeTuneOption,
  PracticeFocus,
} from "@/lib/loaders/practice-foci"
import PracticeFocusTuneManager from "./PracticeFocusTuneManager"

type PracticeFocusListProps = {
  activeFoci: PracticeFocus[]
  pausedFoci: PracticeFocus[]
  completedFoci: PracticeFocus[]
  archivedFoci: PracticeFocus[]
  activePracticeTunes: ActivePracticeTuneOption[]
}

function getStatusLabel(status: PracticeFocus["status"]) {
  if (status === "active") return "Active"
  if (status === "paused") return "Paused"
  if (status === "completed") return "Completed"
  return "Archived"
}

function getStatusClasses(status: PracticeFocus["status"]) {
  if (status === "active") {
    return "border border-success bg-success px-3 py-1 text-xs font-semibold text-success-foreground"
  }

  if (status === "completed") {
    return "border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
  }

  return "border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
}

function FocusEditPanel({
  focus,
  onCancel,
}: {
  focus: PracticeFocus
  onCancel: () => void
}) {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Edit focus
      </p>

      <form action={updatePracticeFocus} className="mt-4 grid gap-4">
        <input type="hidden" name="focus_id" value={focus.id} />
        <input type="hidden" name="redirect_to" value="/review/foci" />

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Title
          <input
            name="title"
            required
            defaultValue={focus.title}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={focus.description ?? ""}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Optional target date
          <input
            name="target_date"
            type="date"
            defaultValue={focus.target_date ?? ""}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            label="Save focus"
            pendingLabel="Saving..."
            className={buttonStyles.primary}
          />

          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
        <p className="text-sm font-semibold text-destructive">Danger zone</p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
    </div>
  )
}

function FocusCard({
  focus,
  activePracticeTunes,
}: {
  focus: PracticeFocus
  activePracticeTunes: ActivePracticeTuneOption[]
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {focus.title}
            </h2>

            <span className={getStatusClasses(focus.status)}>
              {getStatusLabel(focus.status)}
            </span>
          </div>

          {focus.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {focus.description}
            </p>
          ) : (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              No description yet.
            </p>
          )}

          {focus.target_date ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Target date: {focus.target_date}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "Close edit" : "Edit focus"}
          </button>

          {focus.status === "active" ? (
            <form action={archivePracticeFocus}>
              <input type="hidden" name="focus_id" value={focus.id} />
              <input type="hidden" name="redirect_to" value="/review/foci" />

              <SubmitButton
                label="Archive focus"
                pendingLabel="Archiving..."
                className={buttonStyles.secondary}
              />
            </form>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <FocusEditPanel focus={focus} onCancel={() => setIsEditing(false)} />
      ) : null}

      <PracticeFocusTuneManager
        focus={focus}
        activePracticeTunes={activePracticeTunes}
      />
    </article>
  )
}

function FocusGroup({
  title,
  emptyMessage,
  foci,
  activePracticeTunes,
}: {
  title: string
  emptyMessage?: string
  foci: PracticeFocus[]
  activePracticeTunes: ActivePracticeTuneOption[]
}) {
  if (foci.length === 0 && !emptyMessage) {
    return null
  }

  return (
    <section className="grid gap-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>

      {foci.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-sm">
          {emptyMessage}
        </div>
      ) : (
        foci.map((focus) => (
          <FocusCard
            key={focus.id}
            focus={focus}
            activePracticeTunes={activePracticeTunes}
          />
        ))
      )}
    </section>
  )
}

export default function PracticeFocusList({
  activeFoci,
  pausedFoci,
  completedFoci,
  archivedFoci,
  activePracticeTunes,
}: PracticeFocusListProps) {
  return (
    <div className="grid gap-6">
      <FocusGroup
        title="Active foci"
        emptyMessage="No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal."
        foci={activeFoci}
        activePracticeTunes={activePracticeTunes}
      />

      <FocusGroup
        title="Paused foci"
        foci={pausedFoci}
        activePracticeTunes={activePracticeTunes}
      />

      <FocusGroup
        title="Completed foci"
        foci={completedFoci}
        activePracticeTunes={activePracticeTunes}
      />

      <FocusGroup
        title="Archived foci"
        foci={archivedFoci}
        activePracticeTunes={activePracticeTunes}
      />
    </div>
  )
}