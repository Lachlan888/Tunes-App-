"use client"

import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import PaginatedTuneCollection from "@/components/tunes/PaginatedTuneCollection"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { removeFromPractice, startLearning } from "@/lib/actions/user-pieces"
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

function actionData(fields: Record<string, string | number>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, String(value))
  return data
}

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

    const actions: ContextAction[] = [
      { id: "open", label: "Open tune", href: `/library/${piece.id}` },
      { id: "reference", label: "Open Reference", href: `/library/${piece.id}/reference-media` },
      { id: "list", label: "Add to List", onSelect: () => { setSelectedPiece(piece); setSelectedListId("") }, completionMessage: null },
      ...(mode === "practice" ? [{
        id: "known", label: "Move to Known",
        onSelect: () => markAsKnown(actionData({ piece_id: piece.id, redirect_to: redirectTo })),
        confirmMessage: "Move this tune to Known? Practice scheduling will stop.",
      }] : [{
        id: "practice", label: "Move to Practice",
        onSelect: () => startLearning(actionData({ piece_id: piece.id, redirect_to: redirectTo })),
        confirmMessage: "Move this tune from Known to Practice? Review scheduling will begin.",
      }]),
      ...(mode === "practice" && practiceItem ? [{
        id: "stop-practice",
        label: "Stop Practice",
        onSelect: () => removeFromPractice(actionData({ user_piece_id: practiceItem.id, redirect_to: redirectTo })),
        confirmMessage: "Stop Practice for this tune? Review scheduling will stop. The tune will remain in any lists, the shared tune will not be deleted, and stopping Practice does not automatically mark it Known.",
      }] : [{
        id: "remove",
        label: "Remove from app",
        destructive: true,
        onSelect: () => removeTuneFromMyApp(actionData({ piece_id: piece.id, redirect_to: redirectTo })),
        confirmMessage: `Remove "${piece.title}" from my app? This removes it from all of your lists, removes Known state, and stops Practice scheduling. The shared tune remains available to other users.`,
      }]),
    ]

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
          actions={<ContextActionMenu label={`More actions for ${piece.title}`} title={piece.title} actions={actions} />}
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
        className="border-b border-hairline"
        items={
          groupBy === "none"
            ? items.map(renderItem)
            : groups.map(([groupLabel, groupItems]) => (
                <li key={groupLabel} className="py-3 first:pt-0 last:pb-0">
                  <section aria-labelledby={`group-${groupLabel.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
                    <h2
                      id={`group-${groupLabel.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                      className="border-b border-hairline py-3 text-sm font-semibold text-text-primary"
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
