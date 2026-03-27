"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import { markAsKnown } from "@/lib/actions/known-pieces"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  reference_url: string | null
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

type UserKnownPiece = {
  id: number
  piece_id: number
}

type LearningList = {
  id: number
  name: string
  description: string | null
}

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
  redirectTo,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState<string>("")

  if (!pieces || pieces.length === 0) {
    return <p className="text-gray-600">No tunes match this filter.</p>
  }

  return (
    <>
      <ul className="space-y-3">
        {pieces.map((piece: Piece) => {
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
            <li key={piece.id} className="rounded border p-3">
              <div>
                {piece.title}
                {piece.key ? `, key ${piece.key}` : ""}
                {piece.style ? `, ${piece.style}` : ""}
                {piece.time_signature ? `, ${piece.time_signature}` : ""}
              </div>

              {piece.reference_url && (
                <p className="mt-1 text-sm">
                  <a
                    href={piece.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Reference
                  </a>
                </p>
              )}

              {listNames.length > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  In: {listNames.join(", ")}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2">
                {isAlreadyInPractice ? (
                  <p className="text-sm text-gray-600">Already in practice</p>
                ) : (
                  <form action={startLearning}>
                    <input type="hidden" name="piece_id" value={piece.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <button className="bg-black px-3 py-1 text-sm text-white">
                      Start Practice
                    </button>
                  </form>
                )}

                {!isAlreadyInPractice &&
                  (isKnown ? (
                    <p className="text-sm text-gray-600">Known</p>
                  ) : (
                    <form action={markAsKnown}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <button className="border px-3 py-1 text-sm">
                        Mark as known
                      </button>
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
              </div>
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