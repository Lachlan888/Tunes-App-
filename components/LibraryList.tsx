"use client"

import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import { markAsKnown } from "@/lib/actions/known-pieces"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItem = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

type LibraryListProps = {
  pieces: Piece[] | null
  userPieces: UserPiece[] | null
  userKnownPieces: UserKnownPiece[] | null
  learningLists: LearningList[] | null
  learningListItems: LearningListItem[] | null
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  redirectTo: string
}

export default function LibraryList({
  pieces,
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  startLearning,
  addToLearningList,
  removeTuneFromMyApp,
  redirectTo,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [visibleCount, setVisibleCount] = useState<number | "all">(20)

  const allPieces = pieces ?? []

  const visiblePieces = useMemo(() => {
    if (visibleCount === "all") {
      return allPieces
    }

    return allPieces.slice(0, visibleCount)
  }, [allPieces, visibleCount])

  const totalCount = allPieces.length
  const shownCount =
    visibleCount === "all" ? totalCount : Math.min(visibleCount, totalCount)

  if (totalCount === 0) {
    return <p className="text-gray-600">No tunes match this filter.</p>
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Showing {shownCount} of {totalCount}
        </p>

        {totalCount > 20 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleCount(20)}
              className={`rounded border px-3 py-1 text-sm ${
                visibleCount === 20
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              20
            </button>

            <button
              type="button"
              onClick={() => setVisibleCount(50)}
              className={`rounded border px-3 py-1 text-sm ${
                visibleCount === 50
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              50
            </button>

            <button
              type="button"
              onClick={() => setVisibleCount(100)}
              className={`rounded border px-3 py-1 text-sm ${
                visibleCount === 100
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              100
            </button>

            <button
              type="button"
              onClick={() => setVisibleCount("all")}
              className={`rounded border px-3 py-1 text-sm ${
                visibleCount === "all"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              All
            </button>
          </div>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visiblePieces.map((piece: Piece) => {
          const isAlreadyInPractice = (userPieces ?? []).some(
            (userPiece) => userPiece.piece_id === piece.id
          )

          const isKnown = (userKnownPieces ?? []).some(
            (userKnownPiece) => userKnownPiece.piece_id === piece.id
          )

          const listItemsForPiece = (learningListItems ?? []).filter(
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
                  className="border px-3 py-1 text-sm"
                  onClick={() => {
                    setSelectedPiece(piece)
                    setSelectedListId("")
                  }}
                >
                  Add to List
                </button>

                <form
                  action={removeTuneFromMyApp}
                  onSubmit={(event) => {
                    const confirmed = window.confirm(
                      `Remove "${piece.title}" from your practice, known tunes, and all your lists?`
                    )

                    if (!confirmed) {
                      event.preventDefault()
                    }
                  }}
                >
                  <input type="hidden" name="piece_id" value={piece.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <SubmitButton
                    label="Remove Tune"
                    pendingLabel="Removing..."
                    className="border px-3 py-1 text-sm"
                  />
                </form>
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
              (learningListItems ?? [])
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