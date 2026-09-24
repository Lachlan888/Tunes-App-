"use client"

import type { FormEvent, ReactNode, RefObject } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Icon from "@/components/ui/Icon"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { formStyles } from "@/components/ui/formStyles"

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
  resultsStatement?: string
  sticky?: boolean
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
  resultsStatement,
  sticky = false,
  className,
}: FilterShellProps) {
  return (
    <div
      ref={panelRef}
      className={joinClasses(
        "relative mb-5 transition-opacity md:mb-8",
        sticky &&
          "sticky top-14 z-20 -mx-4 border-b border-hairline bg-surface-canvas/95 px-4 pb-3 pt-3 shadow-material-rest backdrop-blur md:top-0 md:mx-0 md:rounded-object md:border md:bg-surface-paper/95 md:px-5 md:py-4",
        isPending ? "opacity-80" : "opacity-100",
        className
      )}
    >
      <form
        onSubmit={onSearchSubmit}
        className={joinClasses(
          !sticky &&
            "md:rounded-object md:bg-surface-paper md:p-5 md:shadow-material-rest"
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 md:flex md:gap-3">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${panelId}-search`}
              className={formStyles.label}
            >
              {searchLabel}
            </label>

            <input
              id={`${panelId}-search`}
              name="q"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder={searchPlaceholder}
              className={formStyles.input}
              aria-busy={isPending}
            />
          </div>

          <button
            type="submit"
            className={joinClasses(buttonStyles.filterPrimary, "w-auto px-3 sm:w-auto")}
            disabled={isPending}
          >
            {isPending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <LoadingSpinner label="Searching..." size="sm" decorative />
                <span className="sr-only sm:not-sr-only">Searching...</span>
              </span>
            ) : (
              <>
                <Icon name="search" size={17} />
                <span className="sr-only sm:not-sr-only">Search</span>
              </>
            )}
          </button>

          <div className="col-span-2 grid grid-cols-3 gap-2 md:flex md:flex-wrap md:items-center">
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
                className={buttonStyles.text}
                disabled={isPending}
              >
                Clear
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
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {activeChips}
          </div>
        ) : null}

        {resultsStatement ? (
          <p className="mt-3 text-sm font-semibold text-text-muted" aria-live="polite">
            {resultsStatement}
          </p>
        ) : null}
      </form>

      {isPanelOpen ? panel : null}
    </div>
  )
}
