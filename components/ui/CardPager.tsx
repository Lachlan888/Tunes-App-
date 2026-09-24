"use client"

import { useMemo, useRef, useState } from "react"
import type { ReactNode, TouchEvent } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type CardPagerProps<T> = {
  items?: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T, index: number) => ReactNode
  emptyState: ReactNode
  label: string
  className?: string
  cardClassName?: string
  controlsClassName?: string
  previousLabel?: string
  nextLabel?: string
  unstyledCard?: boolean
  index?: number
  onIndexChange?: (index: number) => void
  /** Small finite sets only. Use PaginatedTuneCollection for datasets. */
  maxItems?: number
}

const minimumSwipeDistance = 48
export const CARD_PAGER_DEFAULT_MAX_ITEMS = 50

export default function CardPager<T>({
  items = [],
  getKey,
  renderItem,
  emptyState,
  label,
  className,
  cardClassName,
  controlsClassName,
  previousLabel = "Previous",
  nextLabel = "Next",
  unstyledCard = false,
  index,
  onIndexChange,
  maxItems = CARD_PAGER_DEFAULT_MAX_ITEMS,
}: CardPagerProps<T>) {
  if (items.length > maxItems) {
    throw new Error(
      `CardPager received ${items.length} items; its limit is ${maxItems}. Use server-side PaginatedTuneCollection for large or growing datasets.`
    )
  }

  const [internalIndex, setInternalIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const currentIndex = index ?? internalIndex

  const safeIndex = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(currentIndex, items.length - 1)
  }, [currentIndex, items.length])

  const currentItem = items[safeIndex] ?? null
  const canGoPrevious = safeIndex > 0
  const canGoNext = safeIndex < items.length - 1

  function setCurrentIndex(nextIndex: number) {
    if (index === undefined) setInternalIndex(nextIndex)
    onIndexChange?.(nextIndex)
  }

  function goPrevious() {
    if (!canGoPrevious) return
    setCurrentIndex(Math.max(0, safeIndex - 1))
  }

  function goNext() {
    if (!canGoNext) return
    setCurrentIndex(Math.min(items.length - 1, safeIndex + 1))
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]

    if (!touch) return

    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0]

    if (!touch || touchStartX.current === null || touchStartY.current === null) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }

    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (Math.abs(deltaX) < minimumSwipeDistance) return

    if (deltaX < 0) {
      goNext()
      return
    }

    goPrevious()
  }

  if (!currentItem) {
    return <>{emptyState}</>
  }

  return (
    <section
      className={joinClasses("grid gap-3", className)}
      aria-label={label}
    >
      <div
        className={joinClasses(
          unstyledCard
            ? ""
            : "rounded-object bg-surface-paper p-4 shadow-material-rest",
          cardClassName
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderItem(currentItem, safeIndex)}
      </div>

      <div
        className={joinClasses(
          "grid grid-cols-[1fr_auto_1fr] items-center gap-3",
          controlsClassName
        )}
      >
        <button
          type="button"
          onClick={goPrevious}
          disabled={!canGoPrevious}
          className="min-h-11 rounded-control border border-hairline bg-surface-paper px-4 py-2 text-sm font-semibold text-text-muted shadow-material-rest transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {previousLabel}
        </button>

        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-semibold text-text-muted">
          {safeIndex + 1} / {items.length}
        </p>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="min-h-11 rounded-control border border-hairline bg-surface-paper px-4 py-2 text-sm font-semibold text-text-muted shadow-material-rest transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {nextLabel}
        </button>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {items.slice(0, 12).map((item, index) => (
          <span
            key={getKey(item)}
            className={joinClasses(
              "h-2 rounded-full transition",
              index === safeIndex
                ? "w-5 bg-state-practice"
                : "w-2 bg-hairline"
            )}
          />
        ))}

        {items.length > 12 ? (
          <span className="ml-1 text-xs font-semibold text-text-muted">
            +{items.length - 12}
          </span>
        ) : null}
      </div>
    </section>
  )
}
