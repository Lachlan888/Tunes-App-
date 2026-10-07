"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { formatPracticeDate } from "@/lib/review"
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
    return "text-state-known"
  }

  if (status === "completed") {
    return "text-state-practice"
  }

  return "text-muted-foreground"
}

function formatDateOnly(dateOnly: string | null) {
  return formatPracticeDate(dateOnly)
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
              "shrink-0 text-xs font-semibold",
              isSelected
                ? "text-state-practice"
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
        "grid w-full gap-2 border-b border-hairline p-4 text-left transition hover:bg-surface-note focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isSelected
          ? "border-state-practice bg-surface-note"
          : "bg-transparent"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-sans text-xl font-bold leading-tight text-foreground">
            {focus.title}
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {formatMeta(focus)}
          </p>
        </div>

        <span
          className={joinClasses(
            "shrink-0 text-xs font-semibold",
            isSelected
              ? "text-state-practice"
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
    <article className="grid gap-4 border-b border-hairline pb-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words font-sans text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {focus.title}
          </h2>

          <span
            className={joinClasses(
              "text-xs font-semibold",
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
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {focus.status === "active" && focus.tunes.length > 0 ? (
          <Link
            href={`/review?session=focus&focus_id=${focus.id}`}
            className={buttonStyles.primary}
          >
            Practise this focus
          </Link>
        ) : null}
        <Link
          href={`/review/foci/${focus.id}`}
          className={buttonStyles.secondaryStrong}
        >
          Open focus
        </Link>
      </div>

      {focus.tunes.length > 0 ? (
        <div className="grid gap-2 border-t border-border pt-4">
          <h3 className="font-sans text-xl font-bold tracking-tight text-foreground">
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
    <ResponsiveModal
      isOpen
      onClose={onClose}
      mobileMode="full-screen"
      desktopMaxWidth="md:max-w-3xl"
      title="Choose a focus"
      description="Choose which focus to display on this page."
      bodyClassName="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6"
    >
          <div className="grid gap-6">
            {groups.map((group) => (
              <section key={group.status} className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans text-lg font-bold text-foreground">
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
    </ResponsiveModal>
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
        title: "Active focus areas",
        emptyMessage: "No active focus areas.",
        foci: activeFoci,
      },
      {
        status: "paused",
        title: "Paused focus areas",
        emptyMessage: "No paused focus areas.",
        foci: pausedFoci,
      },
      {
        status: "completed",
        title: "Completed focus areas",
        emptyMessage: "No completed focus areas.",
        foci: completedFoci,
      },
      {
        status: "archived",
        title: "Archived focus areas",
        emptyMessage: "No archived focus areas.",
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
  const pickerTriggerRef = useRef<HTMLButtonElement>(null)

  const selectedFocus =
    allFoci.find((focus) => focus.id === selectedFocusId) ?? null

  function handleSelectFocus(focus: PracticeFocus) {
    setSelectedFocusId(focus.id)
    closePicker()
  }

  function closePicker() {
    setIsPickerOpen(false)
    requestAnimationFrame(() => pickerTriggerRef.current?.focus({ preventScroll: true }))
  }

  if (allFoci.length === 0) {
    return (
      <section className="grid gap-4 border-b border-hairline pb-6">
        <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
          Your focus areas
        </h2>

        <p className="text-sm leading-6 text-muted-foreground">
          No focus areas yet. Create one when several tunes share the same
          problem or goal.
        </p>
      </section>
    )
  }

  return (
    <div className="grid min-w-0 gap-5 md:gap-6">
      <section className="grid gap-3 border-b border-hairline pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
              Current intention
            </h2>
          </div>

          <button
            ref={pickerTriggerRef}
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
          onClose={closePicker}
        />
      ) : null}
    </div>
  )
}
