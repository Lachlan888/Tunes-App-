"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type UnlistedPracticeTune = {
  id: number
  piece_id: number
  stage: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
}

type UnlistedPracticeTunesModalProps = {
  unlistedPracticeTunes: UnlistedPracticeTune[]
  learningLists: LearningList[] | null
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
}

export default function UnlistedPracticeTunesModal({
  unlistedPracticeTunes,
  learningLists,
  addToLearningList,
  redirectTo,
}: UnlistedPracticeTunesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  if (unlistedPracticeTunes.length === 0) {
    return null
  }

  return (
    <>
      <section className="mt-8 rounded border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">In practice, not in a list</h2>
            <p className="mt-1 text-sm text-gray-600">
              {unlistedPracticeTunes.length} tune
              {unlistedPracticeTunes.length === 1 ? "" : "s"} ready to organise
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded border px-3 py-1 text-sm"
          >
            Review tunes
          </button>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">In practice, not in a list</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm underline"
              >
                Close
              </button>
            </div>

            <ul className="space-y-3">
              {unlistedPracticeTunes.map((userPiece) => {
                const piece = Array.isArray(userPiece.pieces)
                  ? userPiece.pieces[0] ?? null
                  : userPiece.pieces

                return (
                  <li key={userPiece.id} className="rounded border p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {piece?.title ?? "Untitled tune"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Stage {userPiece.stage}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded border px-3 py-1 text-sm"
                        onClick={() => {
                          setSelectedPiece({
                            id: userPiece.piece_id,
                            title: piece?.title ?? "Untitled tune",
                            key: null,
                            style: null,
                            time_signature: null,
                          })
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
          </div>
        </div>
      )}

      {selectedPiece && (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={[]}
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