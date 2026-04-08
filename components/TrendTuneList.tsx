"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import { addToLearningList } from "@/lib/actions/lists"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import type { TrendTuneEntry } from "@/lib/loaders/trends"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItemForPiece = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

type TrendTuneListProps = {
  entries: TrendTuneEntry[]
  metricLabel: string
  metricUnit?: "users" | "friends"
  userPieces: UserPiece[]
  userKnownPieces: UserKnownPiece[]
  learningLists: LearningList[]
  learningListItems: LearningListItemForPiece[]
  redirectTo: string
}

function renderCountText(
  metricLabel: string,
  count: number,
  metricUnit: "users" | "friends"
) {
  return `${metricLabel} ${count} ${count === 1 ? metricUnit.slice(0, -1) : metricUnit}`
}

export default function TrendTuneList({
  entries,
  metricLabel,
  metricUnit = "users",
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  redirectTo,
}: TrendTuneListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  if (entries.length === 0) {
    return <p className="text-gray-600">No tunes found for this section yet.</p>
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {entries.map((entry) => {
          const piece = entry.piece

          const isAlreadyInPractice = userPieces.some(
            (userPiece) => userPiece.piece_id === piece.id
          )

          const isKnown = userKnownPieces.some(
            (userKnownPiece) => userKnownPiece.piece_id === piece.id
          )

          const listItemsForPiece = learningListItems.filter(
            (item) => item.piece_id === piece.id
          )

          const listNames = Array.from(
            new Set(listItemsForPiece.map((item) => item.learning_lists.name))
          )

          return (
            <li key={piece.id}>
              <TuneCard
                id={piece.id}
                title={piece.title}
                keyValue={piece.key}
                style={piece.style}
                timeSignature={piece.time_signature}
                referenceUrl={piece.reference_url}
                listNames={listNames}
              >
                <p className="text-sm text-gray-600">
                  {renderCountText(metricLabel, entry.count, metricUnit)}
                </p>

                {isAlreadyInPractice ? (
                  <p className="text-sm text-gray-600">Already in practice</p>
                ) : (
                  <form action={startLearning}>
                    <input type="hidden" name="piece_id" value={piece.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Start Practice"
                      pendingLabel="Starting..."
                      className="bg-black px-3 py-1 text-sm text-white"
                    />
                  </form>
                )}

                {!isAlreadyInPractice &&
                  (isKnown ? (
                    <p className="text-sm text-gray-600">Known</p>
                  ) : (
                    <form action={markAsKnown}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label="Mark as known"
                        pendingLabel="Saving..."
                        className="border px-3 py-1 text-sm"
                      />
                    </form>
                  ))}

                <button
                  type="button"
                  className="border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    setSelectedPiece(piece)
                    setSelectedListId("")
                  }}
                >
                  Add to List
                </button>
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