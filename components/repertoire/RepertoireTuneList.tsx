"use client"

import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import PaginatedTuneCollection from "@/components/tunes/PaginatedTuneCollection"
import TuneCollectionActionButton from "@/components/tunes/TuneCollectionActionButton"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { removeFromPractice } from "@/lib/actions/user-pieces"
import { normaliseStoredDate } from "@/lib/review"
import {
  compareTuneGroupLabels,
  getKnownTuneGroupLabel,
  getPracticeTuneGroupLabel,
  type KnownTuneGrouping,
  type PracticeTuneGrouping,
} from "@/lib/tune-collections/grouping"
import type { LearningList, Piece } from "@/lib/types"
import type {
  PracticeTuneItem,
  RepertoireLearningListItem,
} from "@/lib/loaders/repertoire"

type KnownTuneItem = {
  piece: Piece
}

type RepertoireRenderItem = {
  key: string
  piece: Piece
  practiceItem: PracticeTuneItem | null
}

type RepertoireTuneListProps = {
  mode: "known" | "practice"
  knownItems?: KnownTuneItem[]
  practiceItems?: PracticeTuneItem[]
  learningLists: LearningList[]
  learningListItems: RepertoireLearningListItem[]
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
  totalCount: number
  previousHref: string | null
  nextHref: string | null
  hasActiveFilters: boolean
  activeConstraints?: string[]
  groupBy?: PracticeTuneGrouping
}

function formatDueDate(dateValue: string | null | undefined) {
  const dateOnly = normaliseStoredDate(dateValue)
  if (!dateOnly) return "No due date"

  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateOnly}T00:00:00Z`))
}

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm font-semibold text-text-muted shadow-material-rest transition-colors hover:border-action-primary/45 hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const removeButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm font-semibold text-text-muted shadow-material-rest transition-colors hover:border-action-primary/45 hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const destructiveButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-action-destructive bg-surface-paper px-3 py-2 text-sm font-semibold text-action-destructive shadow-material-rest transition-colors hover:bg-action-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function RepertoireTuneList({
  mode,
  knownItems = [],
  practiceItems = [],
  learningLists,
  learningListItems,
  addToLearningList,
  redirectTo,
  totalCount,
  previousHref,
  nextHref,
  hasActiveFilters,
  activeConstraints = [],
  groupBy = "none",
}: RepertoireTuneListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const listItemsByPiece = useMemo(() => {
    const itemsByPiece = new Map<number, RepertoireLearningListItem[]>()

    for (const item of learningListItems) {
      const existingItems = itemsByPiece.get(item.piece_id) ?? []
      existingItems.push(item)
      itemsByPiece.set(item.piece_id, existingItems)
    }

    return itemsByPiece
  }, [learningListItems])

  const items: RepertoireRenderItem[] =
    mode === "known"
      ? knownItems.map((item) => ({
          key: `known-${item.piece.id}`,
          piece: item.piece,
          practiceItem: null,
        }))
      : practiceItems.map((item) => ({
          key: `practice-${item.id}`,
          piece: item.piece,
          practiceItem: item,
        }))

  const groupedItems = new Map<string, typeof items>()

  for (const item of items) {
    const knownGrouping: KnownTuneGrouping =
      groupBy === "key" || groupBy === "style" ? groupBy : "none"
    const groupLabel =
      mode === "practice" && item.practiceItem
        ? getPracticeTuneGroupLabel(item.practiceItem, groupBy)
        : getKnownTuneGroupLabel(item.piece, knownGrouping)
    const group = groupedItems.get(groupLabel) ?? []
    group.push(item)
    groupedItems.set(groupLabel, group)
  }

  const groups = Array.from(groupedItems.entries()).sort(([first], [second]) =>
    compareTuneGroupLabels(first, second, groupBy)
  )

  function renderItem({
    key,
    piece,
    practiceItem,
  }: (typeof items)[number]) {
    const listItemsForPiece = listItemsByPiece.get(piece.id) ?? []
    const listNames = Array.from(
      new Set(listItemsForPiece.map((item) => item.learning_lists.name))
    )

    return (
      <li key={key}>
        <TuneRow
          piece={piece}
          sourceSummary={
            piece.composer ? `Source / composer: ${piece.composer}` : null
          }
          personalState={
            <TuneStateIndicator
              isAlreadyInPractice={mode === "practice"}
              isKnown={mode === "known"}
              stage={practiceItem?.stage ?? null}
            />
          }
          supportingContent={
            listNames.length > 0 || (mode === "practice" && practiceItem) ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {listNames.length > 0 ? <span>In: {listNames.join(", ")}</span> : null}
                {mode === "practice" && practiceItem ? (
                  <span>Due {formatDueDate(practiceItem.next_review_due)}</span>
                ) : null}
              </div>
            ) : null
          }
          actions={
            <>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setSelectedPiece(piece)
                  setSelectedListId("")
                }}
              >
                Add to List
              </button>

              {mode === "practice" && practiceItem ? (
                <TuneCollectionActionButton
                  action={removeFromPractice}
                  fields={{
                    user_piece_id: practiceItem.id,
                    redirect_to: redirectTo,
                  }}
                  label="Stop Practice"
                  pendingLabel="Stopping..."
                  confirmMessage="Stop Practice for this tune? Review scheduling will stop. The tune will remain in any lists, the shared tune will not be deleted, and stopping Practice does not automatically mark it Known."
                  className={removeButtonClass}
                />
              ) : (
                <TuneCollectionActionButton
                  action={removeTuneFromMyApp}
                  fields={{ piece_id: piece.id, redirect_to: redirectTo }}
                  label="Remove from app"
                  pendingLabel="Removing..."
                  confirmMessage={`Remove "${piece.title}" from my app? This removes it from all of your lists, removes Known state, and stops Practice scheduling. The shared tune remains available to other users.`}
                  className={destructiveButtonClass}
                />
              )}
            </>
          }
        />
      </li>
    )
  }

  return (
    <>
      <PaginatedTuneCollection
        label={mode === "known" ? "Known tunes" : "Practice tunes"}
        itemCount={items.length}
        totalCount={totalCount}
        previousHref={previousHref}
        nextHref={nextHref}
        emptyTitle={
          hasActiveFilters
            ? "No tunes match these filters"
            : mode === "known"
              ? "No known tunes yet"
              : "No tunes in practice yet"
        }
        emptyDescription={
          hasActiveFilters
            ? activeConstraints.length > 0
              ? `Active constraints: ${activeConstraints.join("; ")}. Clear filters to see the full collection.`
              : "Try a broader search or clear one of the filters."
            : undefined
        }
        resetHref={
          hasActiveFilters
            ? mode === "known"
              ? "/library/known"
              : "/library/practice"
            : undefined
        }
        resetLabel={hasActiveFilters ? "Reset filters" : undefined}
        className="rounded-object bg-surface-paper px-4 shadow-material-rest md:px-5"
        items={
          groupBy === "none"
            ? items.map(renderItem)
            : groups.map(([groupLabel, groupItems]) => (
                <li key={groupLabel} className="py-3 first:pt-0 last:pb-0">
                  <section aria-labelledby={`group-${groupLabel.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
                    <h2
                      id={`group-${groupLabel.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                      className="border-b border-hairline bg-surface-paper py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted"
                    >
                      {groupLabel} · {groupItems.length}
                    </h2>
                    <ul className="divide-y divide-hairline" role="list">
                      {groupItems.map(renderItem)}
                    </ul>
                  </section>
                </li>
              ))
        }
      />

      {selectedPiece ? (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={Array.from(
            new Set(
              learningListItems
                .filter((item) => item.piece_id === selectedPiece.id)
                .map((item) => item.learning_list_id)
            )
          )}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      ) : null}
    </>
  )
}
