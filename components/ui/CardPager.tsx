"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
}

const minimumSwipeDistance = 48

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
}: CardPagerProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    setCurrentIndex(0)
  }, [items])

  const safeIndex = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(currentIndex, items.length - 1)
  }, [currentIndex, items.length])

  const currentItem = items[safeIndex] ?? null
  const canGoPrevious = safeIndex > 0
  const canGoNext = safeIndex < items.length - 1

  function goPrevious() {
    if (!canGoPrevious) return
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  function goNext() {
    if (!canGoNext) return
    setCurrentIndex((index) => Math.min(items.length - 1, index + 1))
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
            : "rounded-2xl border border-border bg-background/70 p-4 shadow-sm",
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
          className="min-h-11 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          {previousLabel}
        </button>

        <p className="text-sm font-semibold text-muted-foreground">
          {safeIndex + 1} / {items.length}
        </p>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="min-h-11 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          {nextLabel}
        </button>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {items.slice(0, 12).map((item, index) => (
          <button
            key={getKey(item)}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={joinClasses(
              "h-2 rounded-full transition",
              index === safeIndex
                ? "w-5 bg-primary"
                : "w-2 bg-border hover:bg-muted-foreground"
            )}
            tabIndex={-1}
          />
        ))}

        {items.length > 12 ? (
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            +{items.length - 12}
          </span>
        ) : null}
      </div>
    </section>
  )
}