"use client"

import { useState, useTransition } from "react"
import RemoveTuneFromListButton from "@/components/RemoveTuneFromListButton"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import type { Piece } from "@/lib/types"

type ManagedItem = {
  id: number
  piece: Piece
  isAlreadyInPractice: boolean
  isKnown: boolean
  stage: number | null
}

export default function ListOrderManager({
  listId,
  initialItems,
  positionOffset,
  redirectTo,
  reorderListItems,
}: {
  listId: number
  initialItems: ManagedItem[]
  positionOffset: number
  redirectTo: string
  reorderListItems: (input: { listId: number; orderedItemIds: number[] }) => Promise<{ status: "success" | "error"; message: string }>
}) {
  const [items, setItems] = useState(initialItems)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [message, setMessage] = useState("Drag a row, or use Move up and Move down.")
  const [isPending, startTransition] = useTransition()

  function save(nextItems: ManagedItem[], previousItems: ManagedItem[]) {
    setItems(nextItems)
    setMessage("Saving order…")
    startTransition(async () => {
      const result = await reorderListItems({ listId, orderedItemIds: nextItems.map((item) => item.id) })
      setMessage(result.message)
      if (result.status === "error") setItems(previousItems)
    })
  }

  function move(itemId: number, targetIndex: number) {
    if (isPending) return
    const fromIndex = items.findIndex((item) => item.id === itemId)
    const safeTarget = Math.max(0, Math.min(targetIndex, items.length - 1))
    if (fromIndex < 0 || fromIndex === safeTarget) return
    const nextItems = [...items]
    const [moved] = nextItems.splice(fromIndex, 1)
    nextItems.splice(safeTarget, 0, moved)
    save(nextItems, items)
  }

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable={!isPending}
            onDragStart={() => setDraggedId(item.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => { if (draggedId !== null) move(draggedId, index); setDraggedId(null) }}
            className={draggedId === item.id ? "opacity-50" : ""}
          >
            <TuneRow
              piece={item.piece}
              supportingContent={<span>Position {positionOffset + index + 1} · Drag to reorder</span>}
              personalState={<TuneStateIndicator isAlreadyInPractice={item.isAlreadyInPractice} isKnown={item.isKnown} stage={item.stage} />}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={isPending || index === 0} onClick={() => move(item.id, index - 1)} className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-semibold disabled:opacity-50">Move up</button>
                  <button type="button" disabled={isPending || index === items.length - 1} onClick={() => move(item.id, index + 1)} className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-semibold disabled:opacity-50">Move down</button>
                  <RemoveTuneFromListButton listId={listId} pieceId={item.piece.id} tuneTitle={item.piece.title} redirectTo={redirectTo} className="min-h-11 rounded-full border border-destructive px-4 text-sm font-semibold text-destructive" />
                </div>
              }
            />
          </li>
        ))}
      </ul>
    </>
  )
}
