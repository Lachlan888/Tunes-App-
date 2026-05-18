import type { ReactNode } from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type FilterPanelProps = {
  id: string
  title: string
  description?: string
  children: ReactNode
  hasActiveFilters?: boolean
  isPending?: boolean
  onClearAll?: () => void
  onClose: () => void
  className?: string
}

export default function FilterPanel({
  id,
  title,
  description,
  children,
  hasActiveFilters = false,
  isPending = false,
  onClearAll,
  onClose,
  className,
}: FilterPanelProps) {
  return (
    <div
      id={id}
      className={joinClasses(
        "absolute left-0 right-0 z-20 mt-2 rounded-3xl border border-border bg-card p-5 shadow-lg",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {title}
          </h3>

          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && onClearAll ? (
            <button
              type="button"
              onClick={onClearAll}
              className={buttonStyles.filterTrigger}
              disabled={isPending}
            >
              Clear all
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.modalClose}
          >
            Close
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}