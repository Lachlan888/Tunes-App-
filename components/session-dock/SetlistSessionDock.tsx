"use client"

import { useCallback, useMemo } from "react"
import {
  useSessionDock,
  useSessionDockPosition,
} from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"

type SetlistDockItem = {
  id: number
  pieceId: number
  title: string
  key: string | null
}

export default function SetlistSessionDock({
  setlistId,
  setlistName,
  items,
  initialItemId,
}: {
  setlistId: number
  setlistName: string
  items: SetlistDockItem[]
  initialItemId?: number | null
}) {
  const requestedPosition = initialItemId
    ? items.findIndex((item) => item.id === initialItemId)
    : -1
  const initialPosition = requestedPosition >= 0 ? requestedPosition : undefined
  const positionKey = `tunes.session.v1.setlist.${setlistId}.position`
  const [currentIndex, setCurrentIndex] = useSessionDockPosition(
    positionKey,
    items.length,
    initialPosition
  )
  const currentItem = items[currentIndex] ?? null

  const moveTo = useCallback(
    (nextIndex: number) => {
      const nextItem = items[nextIndex]
      if (!nextItem) return

      setCurrentIndex(nextIndex)
      const url = new URL(window.location.href)
      url.searchParams.set("performance", String(nextItem.id))
      window.history.replaceState(null, "", url)
    },
    [items, setCurrentIndex]
  )

  const model = useMemo<SessionDockModel>(() => {
    if (!currentItem) {
      return {
        id: `setlist-performance:${setlistId}:empty`,
        context: "setlist-performance",
        identity: {
          eyebrow: "Setlist",
          title: setlistName,
          detail: "Add a tune to begin Performance Mode.",
        },
        primaryAction: null,
        secondaryActions: [],
        status: { label: "No tunes in this setlist", tone: "neutral" },
        collapsedContent: {},
        expandedContent: {
          title: `${setlistName} tools`,
          description:
            "The metronome is ready while this setlist is being prepared.",
          tools: ["metronome"],
        },
        persistence: {
          shareable: "url",
          transient: "session",
          key: positionKey,
        },
      }
    }

    const canGoPrevious = currentIndex > 0
    const canGoNext = currentIndex < items.length - 1

    return {
      id: `setlist-performance:${setlistId}:${currentItem.id}`,
      context: "setlist-performance",
      identity: {
        eyebrow: setlistName,
        title: currentItem.title,
        detail: currentItem.key ? `Key ${currentItem.key}` : "Key not set",
      },
      primaryAction: {
        id: "next",
        label: "Next",
        ariaLabel: canGoNext
          ? `Next tune after ${currentItem.title}`
          : "This is the final tune",
        disabled: !canGoNext,
        onInvoke: () => moveTo(currentIndex + 1),
        tone: "practice",
      },
      secondaryActions: [
        {
          id: "previous",
          label: "Previous",
          icon: "arrow-left",
          disabled: !canGoPrevious,
          onInvoke: () => moveTo(currentIndex - 1),
          tone: "secondary",
        },
        {
          id: "open-tune",
          label: "Open tune",
          href: `/library/${currentItem.pieceId}`,
          tone: "secondary",
        },
      ],
      progress: {
        label: "Setlist position",
        current: currentIndex + 1,
        total: items.length,
        value: currentIndex + 1,
        max: items.length,
      },
      status: {
        label: currentItem.key ? `Performance key ${currentItem.key}` : "Key not set",
        tone: "neutral",
      },
      collapsedContent: {
        actionIds: ["previous", "next"],
        showProgress: true,
      },
      expandedContent: {
        title: `${currentItem.title} performance tools`,
        description:
          "Move through the running order, confirm the key, open Tune Detail or use the metronome.",
        actionIds: ["previous", "next", "open-tune"],
        tools: ["metronome"],
      },
      persistence: {
        shareable: "url",
        transient: "session",
        key: positionKey,
      },
      announcement: `${currentItem.title}. Tune ${currentIndex + 1} of ${
        items.length
      }. ${currentItem.key ? `Key ${currentItem.key}.` : "Key not set."}`,
    }
  }, [
    currentIndex,
    currentItem,
    items.length,
    moveTo,
    positionKey,
    setlistId,
    setlistName,
  ])

  useSessionDock(`setlist-performance:${setlistId}`, model)
  return null
}
