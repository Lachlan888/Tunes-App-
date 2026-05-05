"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import TuneCard from "@/components/TuneCard"
import { APP_TIME_ZONE } from "@/lib/review"
import type { LearningList, Piece } from "@/lib/types"
import type {
  PracticeTuneItem,
  RepertoireLearningListItem,
} from "@/lib/loaders/repertoire"

type KnownTuneItem = {
  piece: Piece
}

type RepertoireTuneListProps = {
  mode: "known" | "practice"
  knownItems?: KnownTuneItem[]
  practiceItems?: PracticeTuneItem[]
  learningLists: LearningList[]
  learningListItems: RepertoireLearningListItem[]
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
}

function formatDueDate(dateValue: string | null | undefined) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

const secondaryButtonClass =
  "inline-flex min-w-[140px] items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const removeButtonClass =
  "inline-flex min-w-[180px] items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const destructiveButtonClass =
  "inline-flex min-w-[140px] items-center justify-center rounded-full border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function RepertoireTuneList({
  mode,
  knownItems = [],
  practiceItems = [],
  learningLists,
  learningListItems,
  addToLearningList,
  redirectTo,
}: RepertoireTuneListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const items =
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

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        {mode === "known"
          ? "No known tunes yet."
          : "No tunes in practice yet."}
      </p>
    )
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map(({ key, piece, practiceItem }) => {
          const listItemsForPiece = learningListItems.filter(
            (item) => item.piece_id === piece.id
          )

          const listNames = Array.from(
            new Set(listItemsForPiece.map((item) => item.learning_lists.name))
          )

          return (
            <li key={key}>
              <TuneCard
                id={piece.id}
                title={piece.title}
                keyValue={piece.key}
                style={piece.style}
                timeSignature={piece.time_signature}
                referenceUrl={piece.reference_url}
                pieceStyles={piece.piece_styles}
                listNames={listNames}
              >
                {mode === "practice" && practiceItem && (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground">
                    <span>
                      Stage{" "}
                      <span className="font-semibold text-foreground">
                        {practiceItem.stage ?? 1}
                      </span>
                    </span>

                    <span aria-hidden="true" className="text-border">
                      |
                    </span>

                    <span>
                      Due{" "}
                      <span className="font-semibold text-foreground">
                        {formatDueDate(practiceItem.next_review_due)}
                      </span>
                    </span>
                  </div>
                )}

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
                  <RemoveFromPracticeButton
                    userPieceId={practiceItem.id}
                    redirectTo={redirectTo}
                    className={removeButtonClass}
                  />
                ) : (
                  <RemoveTuneButton
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                    confirmMessage={`Remove "${piece.title}" from your known tunes, practice, and all your lists?`}
                    className={destructiveButtonClass}
                  />
                )}
              </TuneCard>
            </li>
          )
        })}
      </ul>

      {selectedPiece && (
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
      )}
    </>
  )
}