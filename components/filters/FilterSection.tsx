import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type FilterSectionProps = {
  title: string
  count?: number
  children: ReactNode
  disabled?: boolean
  className?: string
}

export default function FilterSection({
  title,
  count,
  children,
  disabled = false,
  className,
}: FilterSectionProps) {
  const titleWithCount =
    typeof count === "number" ? `${title} (${count})` : title

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

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {children}
      </div>
    </fieldset>
  )
}