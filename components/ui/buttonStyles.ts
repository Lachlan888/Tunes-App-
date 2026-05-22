export const buttonStyles = {
  primary:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  secondary:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  secondaryStrong:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  destructive:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  destructiveSecondary:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  text:
    "inline-flex items-center justify-center rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  menuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  destructiveMenuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  filterPrimary:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  filterTrigger:
    "inline-flex min-h-10 w-full items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",

  statusTrigger:
    "inline-flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]",

  statusTriggerEmpty:
    "inline-flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]",

  icon:
    "inline-grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  iconDestructive:
    "inline-grid h-8 w-8 place-items-center rounded-lg border border-destructive bg-background/70 text-sm font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  modalClose:
    "shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  reviewRough:
    "w-full min-w-0 rounded-xl border border-destructive/40 bg-destructive/10 px-2 py-2 text-sm font-semibold text-destructive shadow-sm transition-colors hover:bg-destructive/15 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",

  reviewShaky:
    "w-full min-w-0 rounded-xl border border-warning-strong bg-warning/25 px-2 py-2 text-sm font-semibold text-warning-foreground shadow-sm transition-colors hover:bg-warning/35 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",

  reviewSolid:
    "w-full min-w-0 rounded-xl border border-success bg-success px-2 py-2 text-sm font-semibold text-success-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",
} as const

export function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ")
}