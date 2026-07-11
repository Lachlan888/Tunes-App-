import Link from "next/link"
import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type PageHeaderProps = {
  title: ReactNode
  actions?: ReactNode
  backHref?: string
  backLabel?: string
  className?: string
  titleClassName?: string
}

export default function PageHeader({
  title,
  actions,
  backHref,
  backLabel = "Back",
  className,
  titleClassName,
}: PageHeaderProps) {
  return (
    <header
      className={joinClasses(
        "mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            {backLabel}
          </Link>
        ) : null}

        <h1
          className={joinClasses(
            "break-words font-serif text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl",
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  )
}
