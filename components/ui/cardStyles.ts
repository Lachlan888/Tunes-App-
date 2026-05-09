export const cardStyles = {
  panel:
    "rounded-3xl border border-border bg-card p-6 shadow-sm",

  innerPanel:
    "rounded-2xl border border-border bg-background/70 p-5 shadow-sm",

  passiveCard:
    "rounded-2xl border border-border bg-background/70 p-5 shadow-sm",

  clickableCard:
    "cursor-pointer rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  compactClickableCard:
    "cursor-pointer rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",

  modal:
    "max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-lg",

  modalOverlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-foreground/55 p-4",

  statusBadge:
    "rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground",

  successBadge:
    "rounded-full border border-success bg-success px-3 py-1 text-xs font-medium text-success-foreground",

  warningBadge:
    "rounded-full border border-warning-strong bg-warning/25 px-3 py-1 text-xs font-medium text-warning-foreground",

  destructiveBadge:
    "rounded-full border border-destructive bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
} as const