"use client"

import { joinClasses } from "@/components/ui/buttonStyles"
import { segmentedControlStyles } from "@/components/ui/segmentedControlStyles"

type MobileViewOption<T extends string> = {
  id: T
  label: string
}

type MobileViewSwitcherProps<T extends string> = {
  value: T
  options: readonly MobileViewOption<T>[]
  onChange: (value: T) => void
  label?: string
  className?: string
}

export default function MobileViewSwitcher<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: MobileViewSwitcherProps<T>) {
  return (
    <div
      className={joinClasses(
        "floating-material sticky top-14 z-10 -mx-4 px-4 py-3 md:hidden",
        className
      )}
    >
      {label ? (
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </p>
      ) : null}

      <div
        className={joinClasses("grid", segmentedControlStyles.group)}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="tablist"
        aria-label={label ?? "View"}
      >
        {options.map((option) => {
          const isActive = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.id)}
              className={joinClasses(
                segmentedControlStyles.item,
                isActive
                  ? segmentedControlStyles.active
                  : segmentedControlStyles.inactive
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
