import type { ReactNode } from "react"

type MobileEmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export default function MobileEmptyState({
  title,
  description,
  action,
}: MobileEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 md:hidden">
      <p className="font-semibold text-foreground">{title}</p>

      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}