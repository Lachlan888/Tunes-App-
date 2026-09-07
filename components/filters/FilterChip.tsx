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
          "rounded-pill border border-hairline bg-surface-note px-3 py-1 text-sm font-medium text-text-muted",
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
        "min-h-9 shrink-0 whitespace-nowrap rounded-pill border border-hairline bg-surface-note px-3 py-1 text-sm font-medium text-text-muted transition-colors [transition-duration:var(--motion-quick)] hover:border-action-primary/45 hover:bg-surface-paper hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={disabled}
      aria-label={removeLabel ?? `Remove filter ${label}`}
    >
      {label} ×
    </button>
  )
}
