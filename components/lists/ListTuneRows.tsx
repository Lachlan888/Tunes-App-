"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import AddToListModal from "@/components/AddToListModal"
import CataloguePreview from "@/components/library/CataloguePreview"
import LibraryTuneCardActions from "@/components/library/LibraryTuneCardActions"
import TuneMediaLauncher from "@/components/reference-media/TuneMediaLauncher"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import useScrollToPiece from "@/hooks/useScrollToPiece"
import { moveTuneInList, removeTuneFromList } from "@/lib/actions/lists"
import type { ContextAction } from "@/components/ui/ContextActionMenu"
import type { TuneMediaBundle } from "@/lib/tune-media"
import type { LearningList, Piece } from "@/lib/types"

export type ListTuneItem = {
  id: number
  piece: Piece
  activeUserPieceId?: number
  stage: number | null
  isKnown: boolean
  existingListIds: number[]
  mediaBundle: TuneMediaBundle | null
}

export default function ListTuneRows({
  items,
  positionOffset,
  totalItems,
  redirectTo,
  learningLists,
  isSignedIn,
  ownerListId,
  canSelectForCopy = false,
  scrollPieceId = "",
  startLearning,
  addToLearningList,
}: {
  items: ListTuneItem[]
  positionOffset: number
  totalItems: number
  redirectTo: string
  learningLists: LearningList[]
  isSignedIn: boolean
  ownerListId?: number
  canSelectForCopy?: boolean
  scrollPieceId?: string
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
}) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [previewItem, setPreviewItem] = useState<ListTuneItem | null>(null)
  const previewTrigger = useRef<HTMLButtonElement | null>(null)
  const selectedItem = items.find(item => item.piece.id === selectedPiece?.id)
  useScrollToPiece(scrollPieceId)

  function listActionData(item: ListTuneItem, direction?: "up" | "down") {
    const data = new FormData()
    data.set("learning_list_id", String(ownerListId))
    data.set("item_id", String(item.id))
    data.set("piece_id", String(item.piece.id))
    data.set("redirect_to", redirectTo)
    if (direction) data.set("direction", direction)
    return data
  }

  return (
    <>
      {previewItem ? (
        <CataloguePreview
          piece={previewItem.piece}
          mediaBundle={previewItem.mediaBundle ?? undefined}
          onClose={() => {
            setPreviewItem(null)
            if (previewTrigger.current?.isConnected) previewTrigger.current.focus()
          }}
        />
      ) : null}
      <ol aria-label="Tunes in playing order" className="mt-3 divide-y divide-border/70 border-y border-border/70">
        {items.map((item, index) => {
          const position = positionOffset + index + 1
          const listLinks = learningLists.filter(list => item.existingListIds.includes(list.id))
          const pieceRedirectTo = `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}scroll_piece=${item.piece.id}`
          const ownerActions: ContextAction[] = ownerListId ? [
            ...(position > 1 ? [{ id: "move-up", label: "Move up", onSelect: () => moveTuneInList(listActionData(item, "up")) }] : []),
            ...(position < totalItems ? [{ id: "move-down", label: "Move down", onSelect: () => moveTuneInList(listActionData(item, "down")) }] : []),
            {
              id: "remove-from-list",
              label: "Remove from this list",
              destructive: true,
              confirmMessage: `Remove "${item.piece.title}" from this list? This only removes the list membership. Known state, Practice state, other lists, and the shared tune will not be changed.`,
              onSelect: () => removeTuneFromList(listActionData(item)),
            },
          ] : []

          return (
            <li key={item.id} id={`piece-${item.piece.id}`} className="scroll-mt-28">
              <TuneRow
                piece={item.piece}
                titleControl={
                  <LibraryTuneCardActions
                    piece={item.piece}
                    isAlreadyInPractice={Boolean(item.activeUserPieceId)}
                    activeUserPieceId={item.activeUserPieceId}
                    isKnown={item.isKnown}
                    redirectTo={pieceRedirectTo}
                    onOpenAddToList={() => setSelectedPiece(item.piece)}
                    startLearning={startLearning}
                    onPreview={trigger => {
                      previewTrigger.current = trigger
                      setPreviewItem(item)
                    }}
                    referenceHref={item.mediaBundle?.effectiveReference ? `/library/${item.piece.id}/reference-media` : undefined}
                    showPersonalActions={isSignedIn}
                    extraActions={ownerActions}
                  />
                }
                supportingContent={
                  listLinks.length > 0 || item.mediaBundle?.effectiveReference ? (
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {listLinks.length > 0 ? (
                      <span>
                        In: {listLinks.slice(0, 3).map((list, index) => (
                          <span key={list.id}>
                            {index > 0 ? ", " : null}
                            <Link href={`/learning-lists/${list.id}`} className="font-medium underline underline-offset-4 hover:text-text-primary">{list.name}</Link>
                          </span>
                        ))}
                        {listLinks.length > 3 ? ` +${listLinks.length - 3} more` : ""}
                      </span>
                    ) : null}
                    {item.mediaBundle?.effectiveReference ? (
                      <TuneMediaLauncher
                        pieceId={item.piece.id}
                        title={item.piece.title}
                        mediaBundle={item.mediaBundle}
                        redirectTo={pieceRedirectTo}
                        label="Reference"
                        className="font-medium underline underline-offset-4 hover:text-text-primary"
                      />
                    ) : null}
                    </span>
                  ) : undefined
                }
                personalState={
                  isSignedIn ? <TuneStateIndicator isAlreadyInPractice={Boolean(item.activeUserPieceId)} isKnown={item.isKnown} stage={item.stage} /> : null
                }
                actions={canSelectForCopy ? (
                  <input
                    type="checkbox"
                    name="piece_ids"
                    value={item.piece.id}
                    form="selected-import-form"
                    aria-label={`Select ${item.piece.title} to copy`}
                    className="h-6 w-6 shrink-0 accent-primary"
                  />
                ) : undefined}
              />
            </li>
          )
        })}
      </ol>
      {selectedPiece ? (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId=""
          learningLists={learningLists}
          existingListIds={selectedItem?.existingListIds ?? []}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={() => {}}
          onClose={() => setSelectedPiece(null)}
        />
      ) : null}
    </>
  )
}
