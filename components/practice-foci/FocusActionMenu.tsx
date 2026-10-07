"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  archivePracticeFocus,
  deletePracticeFocus,
} from "@/lib/actions/practice-foci"
import type { PracticeFocus } from "@/lib/loaders/practice-foci"
import { formatPracticeDate } from "@/lib/review"

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
  return formatPracticeDate(dateOnly) ?? "Undated"
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

export default function FocusActionMenu({
  focus,
  allFoci,
  redirectTo,
  isEditing,
  onToggleEdit,
}: FocusActionMenuProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const openPicker = useCallback(() => setIsPickerOpen(true), [])
  const closePicker = useCallback(() => setIsPickerOpen(false), [])
  const focusData = (destination: string) => {
    const data = new FormData()
    data.set("focus_id", String(focus.id))
    data.set("redirect_to", destination)
    return data
  }
  const actions: ContextAction[] = [
    { id: "change", label: "Change focus", onSelect: openPicker, completionMessage: null },
    { id: "edit", label: isEditing ? "Close edit" : "Edit focus", onSelect: onToggleEdit, completionMessage: null },
    ...(focus.status === "active" ? [{ id: "archive", label: "Archive focus", onSelect: () => archivePracticeFocus(focusData(redirectTo)) }] : []),
    {
      id: "delete",
      label: "Delete focus",
      destructive: true,
      confirmMessage: `Delete "${focus.title}" permanently? This cannot be undone.`,
      onSelect: () => deletePracticeFocus(focusData("/review/foci")),
    },
  ]

  return (
    <>
      <section className="grid gap-3 border-b border-hairline pb-5 md:flex md:items-center md:justify-end">
        <ContextActionMenu label={`Focus actions for ${focus.title}`} title={focus.title} actions={actions} triggerClassName={`${buttonStyles.secondaryStrong} w-full md:w-auto`} />
      </section>

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
