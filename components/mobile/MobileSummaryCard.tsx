import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type MobileSummaryCardProps = {
  eyebrow?: string
  title: string
  description?: string
  meta?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  children?: ReactNode
  className?: string
}

export default function MobileSummaryCard({
  eyebrow,
  title,
  description,
  meta,
  action,
  secondaryAction,
  children,
  className,
}: MobileSummaryCardProps) {
  return (
    <section
      className={joinClasses(
        "rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="mt-1">
        <h3 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h3>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}

        {meta ? <div className="mt-3 text-sm text-muted-foreground">{meta}</div> : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      {action || secondaryAction ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  )
}