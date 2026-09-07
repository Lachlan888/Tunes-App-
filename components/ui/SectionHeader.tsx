import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type SectionHeaderProps = {
  title: ReactNode
  count?: number | string
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
  variant?: "label" | "editorial"
}

export default function SectionHeader({
  title,
  count,
  eyebrow,
  description,
  actions,
  className,
  titleClassName,
  variant = "label",
}: SectionHeaderProps) {
  return (
    <div
      className={joinClasses(
        "mb-4 flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            {eyebrow}
          </p>
        ) : null}

        <div className="flex min-w-0 items-baseline gap-2">
          <h2
            className={joinClasses(
              variant === "editorial"
                ? "font-serif text-2xl font-semibold leading-tight tracking-tight text-text-primary"
                : "text-sm font-semibold uppercase tracking-[0.16em] text-text-muted",
              titleClassName
            )}
          >
            {title}
          </h2>
          {count !== undefined ? (
            <span className="text-sm font-medium text-text-muted">{count}</span>
          ) : null}
        </div>

        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
