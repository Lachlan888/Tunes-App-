export const segmentedControlStyles = {
  group:
    "rounded-pill border border-hairline bg-surface-note p-1 shadow-material-rest",
  item:
    "min-h-10 rounded-pill px-3 py-2 text-center text-sm font-semibold transition-[background-color,color,box-shadow] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
  active:
    "bg-state-practice text-state-practice-foreground shadow-material-rest",
  inactive:
    "text-text-muted hover:bg-surface-paper hover:text-text-primary",
} as const
