"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  archivePracticeFocus,
  deletePracticeFocus,
} from "@/lib/actions/practice-foci"
import type { PracticeFocus } from "@/lib/loaders/practice-foci"

type FocusActionMenuProps = {
  focus: PracticeFocus
  allFoci: PracticeFocus[]
  redirectTo: string
  isEditing: boolean
  onToggleEdit: () => void
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

function formatFocusMeta(focus: PracticeFocus) {
  const tuneCount = focus.tunes.length
  const tuneLabel = tuneCount === 1 ? "1 tune" : `${tuneCount} tunes`

  if (focus.target_date) {
    return `${tuneLabel} · target ${formatDateOnly(focus.target_date)}`
  }

  return tuneLabel
}

function FocusPickerModal({
  foci,
  currentFocusId,
  onClose,
}: {
  foci: PracticeFocus[]
  currentFocusId: number
  onClose: () => void
}) {
  const groups = [
    {
      title: "Active focus areas",
      foci: foci.filter((focus) => focus.status === "active"),
    },
    {
      title: "Paused focus areas",
      foci: foci.filter((focus) => focus.status === "paused"),
    },
    {
      title: "Completed focus areas",
      foci: foci.filter((focus) => focus.status === "completed"),
    },
    {
      title: "Archived focus areas",
      foci: foci.filter((focus) => focus.status === "archived"),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-foreground/30 px-3 pb-3 md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Choose practice focus"
    >
      <div className="max-h-[88vh] w-full overflow-hidden rounded-t-3xl border border-border bg-background shadow-xl md:max-w-3xl md:rounded-3xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Practice focus areas
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">
                Choose a focus
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Open another focus from your current focus areas.
              </p>
            </div>

            <button
              type="button"
              className={buttonStyles.text}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[calc(88vh-8rem)] overflow-y-auto px-4 py-4 md:px-6">
          <div className="grid gap-6">
            {groups.map((group) =>
              group.foci.length > 0 ? (
                <section key={group.title} className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {group.title}
                    </h3>

                    <p className="text-sm font-medium text-muted-foreground">
                      {group.foci.length}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {group.foci.map((focusOption) => {
                      const isCurrent = focusOption.id === currentFocusId

                      return (
                        <Link
                          key={focusOption.id}
                          href={`/review/foci/${focusOption.id}`}
                          className={joinClasses(
                            "grid gap-2 rounded-2xl border p-4 text-left shadow-sm transition hover:border-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            isCurrent
                              ? "border-primary bg-card"
                              : "border-border bg-background/70"
                          )}
                        >
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words font-serif text-xl font-bold leading-tight text-foreground">
                                {focusOption.title}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {formatFocusMeta(focusOption)}
                              </p>
                            </div>

                            <span
                              className={joinClasses(
                                "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
                                isCurrent
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : getStatusClasses(focusOption.status)
                              )}
                            >
                              {isCurrent
                                ? "Current"
                                : getStatusLabel(focusOption.status)}
                            </span>
                          </div>

                          {focusOption.description ? (
                            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {focusOption.description}
                            </p>
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FocusActionsSheet({
  focus,
  redirectTo,
  isEditing,
  onToggleEdit,
  onOpenPicker,
  onClose,
}: {
  focus: PracticeFocus
  redirectTo: string
  isEditing: boolean
  onToggleEdit: () => void
  onOpenPicker: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-foreground/30 px-3 pb-3 md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Focus actions"
    >
      <div className="w-full rounded-t-3xl border border-border bg-background p-4 shadow-xl md:max-w-md md:rounded-3xl md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Focus actions
            </p>

            <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">
              {focus.title}
            </h2>
          </div>

          <button type="button" className={buttonStyles.text} onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            className={`${buttonStyles.secondaryStrong} w-full`}
            onClick={() => {
              onOpenPicker()
              onClose()
            }}
          >
            Change focus
          </button>

          <button
            type="button"
            className={`${buttonStyles.secondary} w-full`}
            onClick={() => {
              onToggleEdit()
              onClose()
            }}
          >
            {isEditing ? "Close edit" : "Edit focus"}
          </button>

          {focus.status === "active" ? (
            <form action={archivePracticeFocus} className="w-full">
              <input type="hidden" name="focus_id" value={focus.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <SubmitButton
                label="Archive focus"
                pendingLabel="Archiving..."
                className={`${buttonStyles.secondary} w-full`}
              />
            </form>
          ) : null}

          <form
            action={deletePracticeFocus}
            className="w-full border-t border-destructive/30 pt-3"
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
              className={`${buttonStyles.destructiveSecondary} w-full`}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default function FocusActionMenu({
  focus,
  allFoci,
  redirectTo,
  isEditing,
  onToggleEdit,
}: FocusActionMenuProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  return (
    <>
      <section className="grid gap-3 md:flex md:items-center md:justify-between md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <div className="hidden md:block">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current focus
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {formatFocusMeta(focus)}
          </p>
        </div>

        <button
          type="button"
          className={`${buttonStyles.secondaryStrong} w-full md:w-auto`}
          onClick={() => setIsActionsOpen(true)}
        >
          Focus actions
        </button>
      </section>

      {isActionsOpen ? (
        <FocusActionsSheet
          focus={focus}
          redirectTo={redirectTo}
          isEditing={isEditing}
          onToggleEdit={onToggleEdit}
          onOpenPicker={() => setIsPickerOpen(true)}
          onClose={() => setIsActionsOpen(false)}
        />
      ) : null}

      {isPickerOpen ? (
        <FocusPickerModal
          foci={allFoci}
          currentFocusId={focus.id}
          onClose={() => setIsPickerOpen(false)}
        />
      ) : null}
    </>
  )
}
