"use client"

import { joinClasses } from "@/components/ui/buttonStyles"

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
        "sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur md:hidden",
        className
      )}
    >
      {label ? (
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      ) : null}

      <div
        className="grid rounded-full border border-border bg-card-strong/70 p-1 shadow-sm"
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
                "rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
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
