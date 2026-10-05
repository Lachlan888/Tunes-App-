"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
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
    return "text-success"
  }

  if (status === "completed") {
    return "text-primary"
  }

  return "text-muted-foreground"
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
    <ResponsiveModal
      isOpen
      onClose={onClose}
      mobileMode="full-screen"
      desktopMaxWidth="md:max-w-3xl"
      title="Choose a focus"
      description="Open another focus from your current focus areas."
      bodyClassName="min-h-0 flex-1 overflow-y-auto px-4 py-2 md:px-6"
    >
      <div className="grid gap-7 pb-4">
        {groups.map((group) =>
          group.foci.length > 0 ? (
            <section key={group.title} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-3 border-b border-hairline py-3">
                <h3 className="font-sans text-lg font-bold tracking-tight text-foreground">
                  {group.title}
                </h3>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {group.foci.length}
                </p>
              </div>

              <div className="divide-y divide-hairline">
                {group.foci.map((focusOption) => {
                  const isCurrent = focusOption.id === currentFocusId

                  return (
                    <Link
                      key={focusOption.id}
                      href={`/review/foci/${focusOption.id}`}
                      className={joinClasses(
                        "grid gap-2 border-l-2 px-3 py-4 text-left transition hover:bg-surface-note/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                        isCurrent
                          ? "border-action-primary bg-surface-note"
                          : "border-transparent"
                      )}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-sans text-lg font-bold leading-tight text-foreground">
                            {focusOption.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {formatFocusMeta(focusOption)}
                          </p>
                        </div>
                        <span
                          className={joinClasses(
                            "shrink-0 text-xs font-bold",
                            isCurrent
                              ? "text-action-primary"
                              : getStatusClasses(focusOption.status)
                          )}
                        >
                          {isCurrent ? "Current" : getStatusLabel(focusOption.status)}
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
    </ResponsiveModal>
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
    <ResponsiveModal
      isOpen
      onClose={onClose}
      desktopMaxWidth="md:max-w-md"
      title={focus.title}
      description="Change this focus or its linked workflow."
    >
        <div className="grid gap-3">
          <button
            type="button"
            className={`${buttonStyles.secondaryStrong} w-full`}
            onClick={() => {
              onOpenPicker()
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
    </ResponsiveModal>
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
  const openPicker = useCallback(() => setIsPickerOpen(true), [])
  const closePicker = useCallback(() => setIsPickerOpen(false), [])
  const closeActions = useCallback(() => setIsActionsOpen(false), [])

  return (
    <>
      <section className="grid gap-3 border-b border-hairline pb-5 md:flex md:items-center md:justify-between">
        <div className="hidden md:block">
          <p className="text-sm leading-6 text-muted-foreground">
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
          onOpenPicker={openPicker}
          onClose={closeActions}
        />
      ) : null}

      {isPickerOpen ? (
        <FocusPickerModal
          foci={allFoci}
          currentFocusId={focus.id}
          onClose={closePicker}
        />
      ) : null}
    </>
  )
}
