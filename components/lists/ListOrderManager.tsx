"use client"

import { useState, useTransition } from "react"
import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import { removeTuneFromList } from "@/lib/actions/lists"
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
  const [message, setMessage] = useState("Drag a row or use More to change its order.")
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
        {items.map((item, index) => {
          const actions: ContextAction[] = [
            { id: "open", label: "Open tune", href: `/library/${item.piece.id}` },
            { id: "reference", label: "Open Reference", href: `/library/${item.piece.id}/reference-media` },
            ...(!isPending && index > 0 ? [{ id: "up", label: "Move up", onSelect: () => move(item.id, index - 1), completionMessage: null }] : []),
            ...(!isPending && index < items.length - 1 ? [{ id: "down", label: "Move down", onSelect: () => move(item.id, index + 1), completionMessage: null }] : []),
            {
              id: "remove",
              label: "Remove from this list",
              destructive: true,
              confirmMessage: `Remove "${item.piece.title}" from this list? This only removes the list membership. Known state, Practice state, other lists, and the shared tune will not be changed.`,
              onSelect: () => {
                const data = new FormData()
                data.set("learning_list_id", String(listId))
                data.set("piece_id", String(item.piece.id))
                data.set("redirect_to", redirectTo)
                return removeTuneFromList(data)
              },
            },
          ]
          return (
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
              supportingContent={<span>Position {positionOffset + index + 1}</span>}
              personalState={<TuneStateIndicator isAlreadyInPractice={item.isAlreadyInPractice} isKnown={item.isKnown} stage={item.stage} />}
              actions={<ContextActionMenu label={`More actions for ${item.piece.title} in this list`} title={item.piece.title} actions={actions} />}
            />
          </li>
          )
        })}
      </ul>
    </>
  )
}
