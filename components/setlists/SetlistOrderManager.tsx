"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import EditSetlistItemModal from "@/components/setlists/EditSetlistItemModal"
import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import type { SetlistItemWithCoverage } from "@/lib/types"

type ReorderResult = {
  status: "success" | "conflict" | "error"
  message: string
  version?: string
}

export default function SetlistOrderManager({
  setlistId,
  currentUserId,
  initialItems,
  initialVersion,
  redirectTo,
  reorderSetlistItems,
  removeTuneFromSetlist,
  updateSetlistItem,
}: {
  setlistId: number
  currentUserId: string
  initialItems: SetlistItemWithCoverage[]
  initialVersion: string
  redirectTo: string
  reorderSetlistItems: (input: { setlistId: number; orderedItemIds: number[]; expectedVersion: string }) => Promise<ReorderResult>
  removeTuneFromSetlist: (formData: FormData) => Promise<void>
  updateSetlistItem: (formData: FormData) => Promise<void>
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [version, setVersion] = useState(initialVersion)
  const [serverVersion, setServerVersion] = useState(initialVersion)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [message, setMessage] = useState("Drag a row or use More to change its order.")
  const [isPending, startTransition] = useTransition()

  if (serverVersion !== initialVersion) {
    setServerVersion(initialVersion)
    setVersion(initialVersion)
    setItems(initialItems)
    setMessage("Latest running order loaded.")
  }

  function save(nextItems: SetlistItemWithCoverage[], previousItems: SetlistItemWithCoverage[]) {
    setItems(nextItems)
    setMessage("Saving order…")
    startTransition(async () => {
      try {
      const result = await reorderSetlistItems({
        setlistId,
        orderedItemIds: nextItems.map((item) => item.id),
        expectedVersion: version,
      })
      setMessage(result.message)
      if (result.status === "success" && result.version) {
        setVersion(result.version)
        router.refresh()
        return
      }
      setItems(previousItems)
      if (result.status === "conflict") router.refresh()
      } catch {
        setItems(previousItems)
        setMessage("Connection interrupted. Previous order restored; refresh before retrying.")
        router.refresh()
      }
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
      <p className="mt-2 text-sm text-text-muted" aria-live="polite">{message}</p>
      <ol className="mt-3 divide-y divide-hairline border-y border-hairline">
        {items.map((item, index) => {
          const ownState = item.coverage.find((row) => row.user_id === currentUserId)
          if (!item.piece) return null
          const supportingDetails = [item.performance_key ? `Performance key ${item.performance_key}` : null, item.notes ? item.notes.slice(0, 100) : null].filter(Boolean).join(" · ")
          const title = item.piece.title
          const actions: ContextAction[] = [
            { id: "open", label: "Open tune", href: `/library/${item.piece_id}` },
            { id: "reference", label: "Open Reference", href: `/library/${item.piece_id}/reference-media` },
            { id: "edit", label: "Edit performance details", onSelect: () => setEditingItemId(item.id), completionMessage: null },
            ...(!isPending && index > 0 ? [{ id: "up", label: "Move up", onSelect: () => move(item.id, index - 1), completionMessage: null }] : []),
            ...(!isPending && index < items.length - 1 ? [{ id: "down", label: "Move down", onSelect: () => move(item.id, index + 1), completionMessage: null }] : []),
            { id: "remove", label: "Remove from setlist", destructive: true, confirmMessage: `Remove "${title}" from this setlist?`, onSelect: () => {
              const data = new FormData()
              data.set("setlist_id", String(setlistId))
              data.set("setlist_item_id", String(item.id))
              data.set("redirect_to", redirectTo)
              return removeTuneFromSetlist(data)
            } },
          ]
          return (
            <li
              key={item.id}
              draggable={!isPending}
              onDragStart={() => setDraggedId(item.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (draggedId !== null) move(draggedId, index); setDraggedId(null) }}
              className={`grid grid-cols-[2rem_minmax(0,1fr)] gap-2 ${draggedId === item.id ? "opacity-50" : ""}`}
            >
              <span className="pt-5 text-lg font-bold tabular-nums text-text-muted">{index + 1}</span>
              <TuneRow
                piece={item.piece}
                personalState={<TuneStateIndicator isKnown={ownState?.status === "known"} isAlreadyInPractice={ownState?.status === "practice"} stage={ownState?.stage} showNewToMe={!ownState || ownState.status === "gap"} />}
                supportingContent={supportingDetails ? <span>{supportingDetails}</span> : undefined}
                actions={<><ContextActionMenu label={`More setlist actions for ${title}`} title={title} actions={actions} /><EditSetlistItemModal item={item} redirectTo={redirectTo} updateSetlistItem={updateSetlistItem} controlledOpen={editingItemId === item.id} onControlledClose={() => setEditingItemId(null)} /></>}
              />
            </li>
          )
        })}
      </ol>
    </>
  )
}
