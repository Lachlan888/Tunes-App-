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
          "min-w-0 border-t border-hairline py-3",
          className
        )}
        disabled={disabled}
      >
        <details open={defaultOpen || Boolean(count)}>
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
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
        "min-w-0 border-t border-hairline py-3",
        className
      )}
      disabled={disabled}
    >
      <legend className="pr-3 text-sm font-semibold text-text-primary">
        {titleWithCount}
      </legend>
      {content}
    </fieldset>
  )
}
