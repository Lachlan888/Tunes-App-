"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import RemoveFromPracticeButton from "@/components/RemoveFromPracticeButton"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import TuneCard from "@/components/TuneCard"
import { APP_TIME_ZONE } from "@/lib/review"
import type {
  LearningList,
  Piece,
} from "@/lib/types"
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
      <p className="rounded border p-4 text-sm text-gray-600">
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
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>Stage {practiceItem.stage ?? 1}</span>
                    <span>Due: {formatDueDate(practiceItem.next_review_due)}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="border px-3 py-1 text-sm"
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
                    className="border px-3 py-1 text-sm"
                  />
                ) : (
                  <RemoveTuneButton
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                    confirmMessage={`Remove "${piece.title}" from your known tunes, practice, and all your lists?`}
                    className="border px-3 py-1 text-sm"
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