export const cardStyles = {
  panel:
    "rounded-sheet bg-surface-paper p-6 shadow-material-raised",

  innerPanel:
    "rounded-object bg-surface-note p-5",

  displayCard:
    "rounded-object bg-surface-paper p-5 shadow-material-rest",

  clickableCard:
    "cursor-pointer rounded-object bg-surface-paper p-5 shadow-material-rest transition-[background-color,box-shadow,transform] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] hover:-translate-y-px hover:bg-surface-note hover:shadow-material-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  compactClickableCard:
    "cursor-pointer rounded-object bg-surface-paper p-4 shadow-material-rest transition-[background-color,box-shadow,transform] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] hover:-translate-y-px hover:bg-surface-note hover:shadow-material-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  actionCard:
    "rounded-object bg-surface-note p-5 transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-paper",

  reviewCard:
    "relative min-w-0 overflow-hidden rounded-object bg-surface-paper p-3 shadow-material-rest transition-[background-color,box-shadow] [transition-duration:var(--motion-standard)] hover:bg-surface-note hover:shadow-material-raised sm:p-5",

  summaryCard:
    "rounded-object bg-surface-note p-4",

  passiveCard:
    "rounded-object bg-surface-paper p-5 shadow-material-rest",

  mobileRowToCard:
    "border-b border-hairline py-4 last:border-b-0 md:rounded-object md:border-0 md:bg-surface-paper md:p-4 md:shadow-material-rest",

  modal:
    "max-h-[90vh] w-full overflow-y-auto rounded-sheet border border-hairline bg-surface-paper p-6 shadow-material-floating",

  modalOverlay:
    "modal-scrim fixed inset-0 z-50 flex items-center justify-center p-4",

  statusBadge:
    "inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-surface-note px-3 py-1 text-xs font-semibold text-text-muted",

  successBadge:
    "inline-flex items-center gap-1.5 rounded-pill border border-state-known bg-state-known px-3 py-1 text-xs font-semibold text-state-known-foreground",

  warningBadge:
    "inline-flex items-center gap-1.5 rounded-pill border border-state-due bg-state-due px-3 py-1 text-xs font-semibold text-state-due-foreground",

  destructiveBadge:
    "inline-flex items-center gap-1.5 rounded-pill border border-action-destructive bg-action-destructive px-3 py-1 text-xs font-semibold text-action-destructive-foreground",
} as const
