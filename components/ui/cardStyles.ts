export const cardStyles = {
  panel:
    "border-t border-hairline py-6",

  innerPanel:
    "border-t border-hairline py-5",

  displayCard:
    "border-b border-hairline py-5",

  clickableCard:
    "cursor-pointer border-b border-hairline py-5 transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  compactClickableCard:
    "cursor-pointer border-b border-hairline py-4 transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  actionCard:
    "border-b border-hairline py-5 transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note/50",

  reviewCard:
    "relative min-w-0 overflow-hidden border-b border-hairline py-3 transition-colors [transition-duration:var(--motion-standard)] hover:bg-surface-note/50 sm:py-5",

  summaryCard:
    "border-t border-hairline py-4",

  passiveCard:
    "border-b border-hairline py-5",

  mobileRowToCard:
    "border-b border-hairline py-4 last:border-b-0",

  modal:
    "max-h-[90vh] w-full overflow-y-auto rounded-sheet border border-hairline bg-surface-paper p-6 shadow-material-floating",

  modalOverlay:
    "modal-scrim fixed inset-0 z-50 flex items-center justify-center p-4",

  statusBadge:
    "inline-flex items-center gap-1.5 border-l-2 border-hairline px-2 py-1 text-xs font-semibold text-text-muted",

  successBadge:
    "inline-flex items-center gap-1.5 border-l-2 border-state-known bg-state-known/10 px-2 py-1 text-xs font-semibold text-state-known",

  warningBadge:
    "inline-flex items-center gap-1.5 border-l-2 border-state-due bg-state-due/10 px-2 py-1 text-xs font-semibold text-text-primary",

  destructiveBadge:
    "inline-flex items-center gap-1.5 border-l-2 border-action-destructive bg-action-destructive/10 px-2 py-1 text-xs font-semibold text-action-destructive",
} as const
