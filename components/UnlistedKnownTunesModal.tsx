"use client"

import { useEffect, useState } from "react"
import AddToListModal from "@/components/AddToListModal"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type UnlistedKnownTune = {
  id: number
  piece_id: number
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

type UnlistedKnownTunesModalProps = {
  unlistedKnownTunes: UnlistedKnownTune[]
  learningLists: LearningList[] | null
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
}

export default function UnlistedKnownTunesModal({
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  redirectTo,
}: UnlistedKnownTunesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  if (unlistedKnownTunes.length === 0) {
    return null
  }

  return (
    <>
      <section className="mt-8 rounded border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Known, not in a list</h2>
            <p className="mt-1 text-sm text-gray-600">
              {unlistedKnownTunes.length} tune
              {unlistedKnownTunes.length === 1 ? "" : "s"} ready to organise
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
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg max-h-[85vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">Known, not in a list</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Close
                </button>
              </div>

              <ul className="space-y-3">
                {unlistedKnownTunes.map((userKnownPiece) => {
                  const piece = Array.isArray(userKnownPiece.pieces)
                    ? userKnownPiece.pieces[0] ?? null
                    : userKnownPiece.pieces

                  return (
                    <li key={userKnownPiece.id} className="rounded border p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {piece?.title ?? "Untitled tune"}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="rounded border px-3 py-1 text-sm"
                          onClick={() => {
                            setSelectedPiece({
                              id: userKnownPiece.piece_id,
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