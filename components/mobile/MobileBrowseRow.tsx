import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type MobileBrowseRowProps = {
  title: string
  subtitle?: string
  meta?: ReactNode
  action?: ReactNode
  href?: string
  className?: string
}

export default function MobileBrowseRow({
  title,
  subtitle,
  meta,
  action,
  href,
  className,
}: MobileBrowseRowProps) {
  const content = (
    <div
      className={joinClasses(
        "flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:hidden",
        className
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-foreground">{title}</p>

        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}

        {meta ? <div className="mt-2 text-sm text-muted-foreground">{meta}</div> : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )

  if (!href) return content

  return (
    <a
      href={href}
      className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:hidden"
    >
      {content}
    </a>
  )
}