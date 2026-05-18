import { joinClasses } from "@/components/ui/buttonStyles"

type FilterChipProps = {
  label: string
  onRemove?: () => void
  disabled?: boolean
  removeLabel?: string
  className?: string
}

export default function FilterChip({
  label,
  onRemove,
  disabled = false,
  removeLabel,
  className,
}: FilterChipProps) {
  if (!onRemove) {
    return (
      <span
        className={joinClasses(
          "rounded-full border border-border bg-background/70 px-3 py-1 text-sm text-muted-foreground",
          className
        )}
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      className={joinClasses(
        "rounded-full border border-border bg-background/70 px-3 py-1 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={disabled}
      aria-label={removeLabel ?? `Remove filter ${label}`}
    >
      {label} ×
    </button>
  )
}