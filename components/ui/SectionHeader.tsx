import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type SectionHeaderProps = {
  title: ReactNode
  count?: number | string
  actions?: ReactNode
  className?: string
  titleClassName?: string
}

export default function SectionHeader({
  title,
  count,
  actions,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={joinClasses(
        "mb-4 flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <h2
          className={joinClasses(
            "text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground",
            titleClassName
          )}
        >
          {title}
        </h2>
        {count !== undefined ? (
          <span className="text-sm font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
