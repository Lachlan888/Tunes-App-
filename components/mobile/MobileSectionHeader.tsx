import type { ReactNode } from "react"

type MobileSectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export default function MobileSectionHeader({
  title,
  description,
  action,
}: MobileSectionHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}