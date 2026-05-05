"use client"

import Link from "next/link"
import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import SubmitButton from "@/components/SubmitButton"
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
  return `${metricLabel} ${count} ${
    count === 1 ? metricUnit.slice(0, -1) : metricUnit
  }`
}

function getPieceMetadata(piece: Piece) {
  return [
    piece.key ? `Key: ${piece.key}` : null,
    piece.style ? `Style: ${piece.style}` : null,
    piece.time_signature ? `Time: ${piece.time_signature}` : null,
  ]
    .filter(Boolean)
    .join(" | ")
}

function getUniqueListLinks(listItemsForPiece: LearningListItemForPiece[]) {
  const seenListIds = new Set<number>()

  return listItemsForPiece
    .map((item) => ({
      id: item.learning_lists.id,
      name: item.learning_lists.name,
    }))
    .filter((list) => {
      if (seenListIds.has(list.id)) {
        return false
      }

      seenListIds.add(list.id)
      return true
    })
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
    return (
      <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        No tunes found for this section yet.
      </p>
    )
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

          const listLinks = getUniqueListLinks(listItemsForPiece)
          const metadata = getPieceMetadata(piece)

          return (
            <li
              key={piece.id}
              className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5">
                <div>
                  <Link
                    href={`/library/${piece.id}`}
                    className="font-serif text-3xl font-bold leading-tight text-foreground underline-offset-4 hover:underline"
                  >
                    {piece.title}
                  </Link>

                  {metadata && (
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      {metadata}
                    </p>
                  )}

                  <p className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
                    {renderCountText(metricLabel, entry.count, metricUnit)}
                  </p>

                  {listLinks.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span>In these lists: </span>
                      {listLinks.map((list, index) => (
                        <span key={list.id}>
                          {index > 0 ? ", " : ""}
                          <Link
                            href={`/learning-lists/${list.id}`}
                            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                          >
                            {list.name}
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isAlreadyInPractice ? (
                    <span className="rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm">
                      Already in practice
                    </span>
                  ) : (
                    <form action={startLearning}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input type="hidden" name="redirect_to" value={redirectTo} />
                      <SubmitButton
                        label="Start Practice"
                        pendingLabel="Starting..."
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  )}

                  {!isAlreadyInPractice &&
                    (isKnown ? (
                      <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                        Known
                      </span>
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
                          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                        />
                      </form>
                    ))}

                  <button
                    type="button"
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      setSelectedPiece(piece)
                      setSelectedListId("")
                    }}
                  >
                    Add to List
                  </button>
                </div>
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