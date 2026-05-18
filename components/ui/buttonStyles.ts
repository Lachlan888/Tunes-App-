export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  secondary:
    "inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  secondaryStrong:
    "inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  destructive:
    "inline-flex items-center justify-center rounded-full border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  destructiveSecondary:
    "inline-flex items-center justify-center rounded-full border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  text:
    "inline-flex items-center justify-center rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  menuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  destructiveMenuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  filterPrimary:
    "inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  filterTrigger:
    "inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  statusTrigger:
    "inline-flex min-w-[180px] items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  statusTriggerEmpty:
    "inline-flex min-w-[180px] items-center justify-between gap-3 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  icon:
    "inline-grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  iconDestructive:
    "inline-grid h-8 w-8 place-items-center rounded-lg border border-destructive bg-background/70 text-sm font-medium text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  modalClose:
    "shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  reviewRough:
    "min-w-[104px] rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/15 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  reviewShaky:
    "min-w-[104px] rounded-xl border border-warning-strong bg-warning/25 px-4 py-2 text-sm font-semibold text-warning-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-warning/35 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  reviewSolid:
    "min-w-[104px] rounded-xl border border-success bg-success px-4 py-2 text-sm font-semibold text-success-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
} as const

export function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ")
}