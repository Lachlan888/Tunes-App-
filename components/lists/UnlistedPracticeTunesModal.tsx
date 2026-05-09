"use client"

import { useEffect, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import PendingLinkButton from "@/components/PendingLinkButton"
import { buttonStyles } from "@/components/ui/buttonStyles"

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
  summaryClassName?: string
}

export default function UnlistedPracticeTunesModal({
  unlistedPracticeTunes,
  learningLists,
  addToLearningList,
  redirectTo,
  summaryClassName = "rounded-2xl border border-border bg-card p-5 shadow-sm",
}: UnlistedPracticeTunesModalProps) {
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

  if (unlistedPracticeTunes.length === 0) {
    return null
  }

  return (
    <>
      <section className={summaryClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Practice
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
              In practice, not in a list
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {unlistedPracticeTunes.length} tune
              {unlistedPracticeTunes.length === 1 ? "" : "s"} ready to organise.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={buttonStyles.secondary}
          >
            Review tunes
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Practice
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    In practice, not in a list
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={buttonStyles.secondary}
                >
                  Close
                </button>
              </div>

              <ul className="space-y-3">
                {unlistedPracticeTunes.map((userPiece) => {
                  const piece = Array.isArray(userPiece.pieces)
                    ? userPiece.pieces[0] ?? null
                    : userPiece.pieces

                  const pieceTitle = piece?.title ?? "Untitled tune"

                  return (
                    <li
                      key={userPiece.id}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <PendingLinkButton
                            href={`/library/${userPiece.piece_id}`}
                            label={pieceTitle}
                            pendingLabel={`Opening ${pieceTitle}...`}
                            className="cursor-pointer text-left font-medium underline underline-offset-4"
                          />
                          <p className="mt-1 text-sm text-muted-foreground">
                            Stage {userPiece.stage}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={buttonStyles.secondary}
                          onClick={() => {
                            setSelectedPiece({
                              id: userPiece.piece_id,
                              title: pieceTitle,
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