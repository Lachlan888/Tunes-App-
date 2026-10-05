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
        <div className="flex min-w-0 items-baseline gap-2">
          <h2
            className={joinClasses(
              variant === "editorial"
                ? "font-sans text-2xl font-bold leading-tight tracking-tight text-text-primary"
                : "font-sans text-xl font-bold leading-tight tracking-tight text-text-primary",
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
