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
  summaryClassName?: string
  summaryVariant?: "card" | "compact"
  triggerClassName?: string
}

export default function UnlistedKnownTunesModal({
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  redirectTo,
  summaryClassName = "rounded-2xl border border-border bg-card p-5 shadow-sm",
  triggerClassName,
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
      <section className={summaryClassName}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Known tunes
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {unlistedKnownTunes.length} tune
              {unlistedKnownTunes.length === 1 ? "" : "s"} need organising.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={triggerClassName ?? buttonStyles.secondary}
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
                    Known tunes
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    Known, not in a list
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
                {unlistedKnownTunes.map((userKnownPiece) => {
                  const piece = Array.isArray(userKnownPiece.pieces)
                    ? userKnownPiece.pieces[0] ?? null
                    : userKnownPiece.pieces

                  const pieceTitle = piece?.title ?? "Untitled tune"

                  return (
                    <li
                      key={userKnownPiece.id}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <PendingLinkButton
                            href={`/library/${userKnownPiece.piece_id}`}
                            label={pieceTitle}
                            pendingLabel={`Opening ${pieceTitle}...`}
                            className="cursor-pointer text-left font-medium underline underline-offset-4"
                          />
                        </div>

                        <button
                          type="button"
                          className={buttonStyles.secondary}
                          onClick={() => {
                            setSelectedPiece({
                              id: userKnownPiece.piece_id,
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
