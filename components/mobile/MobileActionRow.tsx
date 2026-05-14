import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type MobileActionRowProps = {
  title: string
  description?: string
  leading?: ReactNode
  trailing?: ReactNode
  action?: ReactNode
  className?: string
}

export default function MobileActionRow({
  title,
  description,
  leading,
  trailing,
  action,
  className,
}: MobileActionRowProps) {
  return (
    <div
      className={joinClasses(
        "flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:hidden",
        className
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>

        {description ? (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}