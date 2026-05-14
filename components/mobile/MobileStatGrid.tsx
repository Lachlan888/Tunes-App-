import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type MobileStatGridItem = {
  label: string
  value: ReactNode
  description?: string
  href?: string
  action?: ReactNode
}

type MobileStatGridProps = {
  items: MobileStatGridItem[]
  columns?: 2 | 3
  className?: string
}

export default function MobileStatGrid({
  items,
  columns = 2,
  className,
}: MobileStatGridProps) {
  const gridColumns = columns === 3 ? "grid-cols-3" : "grid-cols-2"

  return (
    <div className={joinClasses("grid gap-2 md:hidden", gridColumns, className)}>
      {items.map((item) => {
        const content = (
          <div className="min-h-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {item.label}
            </p>

            <div className="mt-3 font-serif text-3xl font-bold leading-none tracking-tight text-foreground">
              {item.value}
            </div>

            {item.description ? (
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {item.description}
              </p>
            ) : null}

            {item.action ? <div className="mt-3">{item.action}</div> : null}
          </div>
        )

        if (!item.href) {
          return <div key={item.label}>{content}</div>
        }

        return (
          <a
            key={item.label}
            href={item.href}
            className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            {content}
          </a>
        )
      })}
    </div>
  )
}