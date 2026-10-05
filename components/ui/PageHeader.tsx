import Link from "next/link"
import type { ReactNode } from "react"
import Icon from "@/components/ui/Icon"
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
        "mb-8 flex flex-col gap-4 border-b border-hairline pb-5 md:mb-10 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-control text-sm font-semibold text-text-muted underline-offset-4 transition-colors [transition-duration:var(--motion-quick)] hover:text-text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <Icon name="arrow-left" size={17} />
            <span>{backLabel}</span>
          </Link>
        ) : null}

        <h1
          className={joinClasses(
            "break-words font-sans text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-6xl",
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
