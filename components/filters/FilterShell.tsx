"use client"

import type { FormEvent, ReactNode, RefObject } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type FilterShellProps = {
  panelRef?: RefObject<HTMLDivElement | null>
  searchLabel: string
  searchPlaceholder: string
  searchValue: string
  onSearchValueChange: (value: string) => void
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void
  isPending?: boolean
  isPanelOpen: boolean
  onTogglePanel: () => void
  panelId: string
  activeFilterCount: number
  hasActiveFilters: boolean
  onClearFilters?: () => void
  activeChips?: ReactNode
  panel?: ReactNode
  children?: ReactNode
  className?: string
}

export default function FilterShell({
  panelRef,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
  isPending = false,
  isPanelOpen,
  onTogglePanel,
  panelId,
  activeFilterCount,
  hasActiveFilters,
  onClearFilters,
  activeChips,
  panel,
  children,
  className,
}: FilterShellProps) {
  return (
    <div
      ref={panelRef}
      className={joinClasses(
        "relative mb-5 transition-opacity md:mb-8",
        isPending ? "opacity-80" : "opacity-100",
        className
      )}
    >
      <form
        onSubmit={onSearchSubmit}
        className="md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm"
      >
        <div className="grid gap-3 md:flex md:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${panelId}-search`}
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {searchLabel}
            </label>

            <input
              id={`${panelId}-search`}
              name="q"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-busy={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
            <button
              type="submit"
              className={buttonStyles.filterPrimary}
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoadingSpinner label="Searching..." size="sm" decorative />
                  <span>Searching...</span>
                </span>
              ) : (
                "Search"
              )}
            </button>

            <button
              type="button"
              onClick={onTogglePanel}
              className={buttonStyles.filterTrigger}
              disabled={isPending}
              aria-expanded={isPanelOpen}
              aria-controls={panelId}
            >
              {isPending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoadingSpinner label="Updating..." size="sm" decorative />
                  <span>Updating...</span>
                </span>
              ) : activeFilterCount > 0
                  ? `Filters (${activeFilterCount})`
                  : "Filters"}
            </button>

            {hasActiveFilters && onClearFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className={joinClasses(buttonStyles.text, "col-span-2 md:col-span-1")}
                disabled={isPending}
              >
                Clear filters
              </button>
            ) : null}

            {children}
          </div>
        </div>

        {isPending ? (
          <LoadingSpinner
            label="Updating filters..."
            showLabel
            size="sm"
            className="mt-3"
          />
        ) : null}

        {activeChips ? (
          <div className="mt-4 flex flex-wrap gap-2">{activeChips}</div>
        ) : null}
      </form>

      {isPanelOpen ? panel : null}
    </div>
  )
}
