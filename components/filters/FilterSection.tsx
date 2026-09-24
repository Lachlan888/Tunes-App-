import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type FilterSectionProps = {
  title: string
  count?: number
  children: ReactNode
  disabled?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export default function FilterSection({
  title,
  count,
  children,
  disabled = false,
  collapsible = false,
  defaultOpen = false,
  className,
}: FilterSectionProps) {
  const titleWithCount =
    typeof count === "number" ? `${title} (${count})` : title

  const content = <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 [&>label]:min-w-0">{children}</div>

  if (collapsible) {
    return (
      <fieldset
        aria-label={titleWithCount}
        className={joinClasses(
          "min-w-0 rounded-object border border-hairline bg-surface-paper p-4",
          className
        )}
        disabled={disabled}
      >
        <details open={defaultOpen || Boolean(count)}>
          <summary className="min-h-11 cursor-pointer rounded-control py-2 text-sm font-semibold uppercase tracking-[0.14em] text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
            {titleWithCount}
          </summary>
          {content}
        </details>
      </fieldset>
    )
  }

  return (
    <fieldset
      className={joinClasses(
        "min-w-0 rounded-2xl border border-border bg-background/70 p-4",
        className
      )}
      disabled={disabled}
    >
      <legend className="px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {titleWithCount}
      </legend>
      {content}
    </fieldset>
  )
}
