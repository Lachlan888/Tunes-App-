"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeFocus,
  PracticeFocusStatus,
} from "@/lib/loaders/practice-foci"

type PracticeFocusListProps = {
  activeFoci: PracticeFocus[]
  pausedFoci: PracticeFocus[]
  completedFoci: PracticeFocus[]
  archivedFoci: PracticeFocus[]
}

type FocusGroupConfig = {
  status: PracticeFocusStatus
  title: string
  emptyMessage: string
  foci: PracticeFocus[]
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
  if (!dateOnly) return null

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function formatMeta(focus: PracticeFocus) {
  const tuneCount = focus.tunes.length
  const tuneLabel = tuneCount === 1 ? "1 tune" : `${tuneCount} tunes`
  const targetDate = formatDateOnly(focus.target_date)

  if (targetDate) {
    return `${tuneLabel} · target ${targetDate}`
  }

  return tuneLabel
}

function getFocusNoteCount(focus: PracticeFocus) {
  return focus.tunes.reduce((total, tune) => {
    return total + (typeof tune.id === "number" ? 0 : 0)
  }, 0)
}

function MobileFocusRow({
  focus,
  isSelected,
  onSelect,
}: {
  focus: PracticeFocus
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full gap-2 text-left"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-medium text-foreground">
              {focus.title}
            </p>

            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {formatMeta(focus)}
            </p>

            {focus.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {focus.description}
              </p>
            ) : null}
          </div>

          <span
            className={joinClasses(
              "shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : getStatusClasses(focus.status)
            )}
          >
            {isSelected ? "Selected" : getStatusLabel(focus.status)}
          </span>
        </div>
      </button>
    </li>
  )
}

function DesktopFocusPickerRow({
  focus,
  isSelected,
  onSelect,
}: {
  focus: PracticeFocus
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={joinClasses(
        "grid w-full gap-2 rounded-2xl border p-4 text-left shadow-sm transition hover:border-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isSelected
          ? "border-primary bg-card"
          : "border-border bg-background/70"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-serif text-xl font-bold leading-tight text-foreground">
            {focus.title}
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {formatMeta(focus)}
          </p>
        </div>

        <span
          className={joinClasses(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : getStatusClasses(focus.status)
          )}
        >
          {isSelected ? "Selected" : getStatusLabel(focus.status)}
        </span>
      </div>

      {focus.description ? (
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {focus.description}
        </p>
      ) : null}
    </button>
  )
}

function SelectedFocusCard({ focus }: { focus: PracticeFocus }) {
  return (
    <article className="grid gap-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {focus.title}
          </h2>

          <span
            className={joinClasses(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              getStatusClasses(focus.status)
            )}
          >
            {getStatusLabel(focus.status)}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {formatMeta(focus)}
        </p>

        {focus.description ? (
          <p className="mt-4 max-w-3xl break-words text-base leading-7 text-foreground">
            {focus.description}
          </p>
        ) : (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            No description yet.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/review/foci/${focus.id}`}
          className={buttonStyles.secondaryStrong}
        >
          Open focus
        </Link>
      </div>

      {focus.tunes.length > 0 ? (
        <div className="grid gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes in this focus
          </h3>

          <ul className="divide-y divide-border">
            {focus.tunes.map((focusTune) => (
              <li key={focusTune.id} className="py-3">
                {focusTune.piece ? (
                  <Link
                    href={`/library/${focusTune.piece.id}`}
                    className="font-medium text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary"
                  >
                    {focusTune.piece.title}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Unknown tune
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
          No tunes have been added to this focus yet.
        </p>
      )}
    </article>
  )
}

function FocusPickerModal({
  groups,
  selectedFocusId,
  onSelectFocus,
  onClose,
}: {
  groups: FocusGroupConfig[]
  selectedFocusId: number | null
  onSelectFocus: (focus: PracticeFocus) => void
  onClose: () => void
}) {
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
                Practice foci
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground">
                Choose a focus
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Select one focus to display on this page.
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
            {groups.map((group) => (
              <section key={group.status} className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {group.title}
                  </h3>

                  <p className="text-sm font-medium text-muted-foreground">
                    {group.foci.length}
                  </p>
                </div>

                {group.foci.length === 0 ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {group.emptyMessage}
                  </p>
                ) : (
                  <>
                    <ul className="md:hidden">
                      {group.foci.map((focus) => (
                        <MobileFocusRow
                          key={focus.id}
                          focus={focus}
                          isSelected={selectedFocusId === focus.id}
                          onSelect={() => onSelectFocus(focus)}
                        />
                      ))}
                    </ul>

                    <div className="hidden md:grid md:gap-3">
                      {group.foci.map((focus) => (
                        <DesktopFocusPickerRow
                          key={focus.id}
                          focus={focus}
                          isSelected={selectedFocusId === focus.id}
                          onSelect={() => onSelectFocus(focus)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PracticeFocusList({
  activeFoci,
  pausedFoci,
  completedFoci,
  archivedFoci,
}: PracticeFocusListProps) {
  const groups: FocusGroupConfig[] = useMemo(
    () => [
      {
        status: "active",
        title: "Active foci",
        emptyMessage:
          "No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal.",
        foci: activeFoci,
      },
      {
        status: "paused",
        title: "Paused foci",
        emptyMessage: "No paused foci.",
        foci: pausedFoci,
      },
      {
        status: "completed",
        title: "Completed foci",
        emptyMessage: "No completed foci.",
        foci: completedFoci,
      },
      {
        status: "archived",
        title: "Archived foci",
        emptyMessage: "No archived foci.",
        foci: archivedFoci,
      },
    ],
    [activeFoci, pausedFoci, completedFoci, archivedFoci]
  )

  const allFoci = useMemo(
    () => groups.flatMap((group) => group.foci),
    [groups]
  )

  const [selectedFocusId, setSelectedFocusId] = useState<number | null>(
    activeFoci[0]?.id ?? allFoci[0]?.id ?? null
  )
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const selectedFocus =
    allFoci.find((focus) => focus.id === selectedFocusId) ?? null

  function handleSelectFocus(focus: PracticeFocus) {
    setSelectedFocusId(focus.id)
    setIsPickerOpen(false)
  }

  if (allFoci.length === 0) {
    return (
      <section className="grid gap-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your foci
        </h2>

        <p className="text-sm leading-6 text-muted-foreground">
          No practice foci yet. Create one when a few tunes are connected by the
          same musical problem or preparation goal.
        </p>
      </section>
    )
  }

  return (
    <div className="grid min-w-0 gap-5 md:gap-6">
      <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Selected focus
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose one focus to display here.
            </p>
          </div>

          <button
            type="button"
            className={`${buttonStyles.secondaryStrong} w-full sm:w-auto`}
            onClick={() => setIsPickerOpen(true)}
          >
            Choose focus
          </button>
        </div>
      </section>

      {selectedFocus ? <SelectedFocusCard focus={selectedFocus} /> : null}

      {isPickerOpen ? (
        <FocusPickerModal
          groups={groups}
          selectedFocusId={selectedFocusId}
          onSelectFocus={handleSelectFocus}
          onClose={() => setIsPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}