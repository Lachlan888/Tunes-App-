const controlBase =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border px-4 py-2 text-sm font-semibold shadow-material-rest transition-[background-color,border-color,color,box-shadow,transform] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"

const compactControlBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control border px-3 py-2 text-sm font-semibold shadow-material-rest transition-[background-color,border-color,color,box-shadow,transform] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:cursor-not-allowed disabled:opacity-60"

export const buttonStyles = {
  primary: `${controlBase} border-action-primary bg-action-primary text-action-primary-foreground hover:-translate-y-px hover:bg-action-primary-hover hover:shadow-material-raised active:translate-y-0`,

  secondary: `${controlBase} border-hairline bg-surface-paper text-text-muted hover:border-action-primary/45 hover:bg-surface-note hover:text-text-primary`,

  secondaryStrong: `${controlBase} border-hairline bg-surface-paper text-text-primary hover:border-action-primary/45 hover:bg-surface-note`,

  practice: `${controlBase} border-state-practice bg-state-practice text-state-practice-foreground hover:-translate-y-px hover:bg-state-practice/90 hover:shadow-material-raised active:translate-y-0`,

  social: `${controlBase} border-state-social bg-state-social text-state-social-foreground hover:-translate-y-px hover:bg-state-social/90 hover:shadow-material-raised active:translate-y-0`,

  due: `${controlBase} border-state-due bg-state-due text-state-due-foreground hover:-translate-y-px hover:bg-state-due/88 hover:shadow-material-raised active:translate-y-0`,

  destructive: `${controlBase} border-action-destructive bg-action-destructive text-action-destructive-foreground hover:-translate-y-px hover:bg-action-destructive-hover hover:shadow-material-raised active:translate-y-0`,

  destructiveSecondary: `${controlBase} border-action-destructive bg-surface-paper text-action-destructive hover:bg-action-destructive/10`,

  text:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-2 py-2 text-sm font-semibold text-text-muted underline-offset-4 transition-colors [transition-duration:var(--motion-quick)] [transition-timing-function:var(--ease-folk)] hover:text-text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  menuItem:
    "flex min-h-11 w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm font-medium text-text-primary transition-colors [transition-duration:var(--motion-quick)] hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  destructiveMenuItem:
    "flex min-h-11 w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm font-medium text-action-destructive transition-colors [transition-duration:var(--motion-quick)] hover:bg-action-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",

  filterPrimary: `${controlBase} border-action-primary bg-action-primary text-action-primary-foreground hover:bg-action-primary-hover`,

  filterTrigger: `${controlBase} border-hairline bg-surface-paper text-text-muted hover:border-state-practice/55 hover:bg-surface-note hover:text-text-primary`,

  statusTrigger:
    "inline-flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-control border border-hairline bg-surface-paper px-4 py-2 text-sm font-semibold text-text-primary shadow-material-rest transition-colors [transition-duration:var(--motion-standard)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-surface-note sm:w-auto sm:min-w-[180px]",

  statusTriggerEmpty:
    "inline-flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-control border border-action-primary bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-foreground shadow-material-rest transition-colors [transition-duration:var(--motion-standard)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-action-primary-hover sm:w-auto sm:min-w-[180px]",

  icon: `${compactControlBase} h-11 w-11 border-hairline bg-surface-paper p-0 text-text-muted hover:border-action-primary/45 hover:bg-surface-note hover:text-text-primary`,

  iconDestructive: `${compactControlBase} h-11 w-11 border-action-destructive bg-surface-paper p-0 text-action-destructive hover:bg-action-destructive/10`,

  modalClose: `${compactControlBase} border-hairline bg-surface-paper text-text-muted hover:bg-surface-note hover:text-text-primary`,

  reviewRough:
    "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-pill border border-state-overdue bg-state-overdue px-2 py-2 text-sm font-semibold text-state-overdue-foreground shadow-material-rest transition-[background-color,box-shadow,transform] [transition-duration:var(--motion-standard)] hover:-translate-y-px hover:bg-state-overdue/90 hover:shadow-material-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",

  reviewShaky:
    "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-pill border border-state-due bg-state-due px-2 py-2 text-sm font-semibold text-state-due-foreground shadow-material-rest transition-[background-color,box-shadow,transform] [transition-duration:var(--motion-standard)] hover:-translate-y-px hover:bg-state-due/88 hover:shadow-material-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",

  reviewSolid:
    "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-pill border border-state-known bg-state-known px-2 py-2 text-sm font-semibold text-state-known-foreground shadow-material-rest transition-[background-color,box-shadow,transform] [transition-duration:var(--motion-standard)] hover:-translate-y-px hover:bg-state-known/90 hover:shadow-material-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[104px] sm:px-4",
} as const

export type ButtonVariant = keyof typeof buttonStyles

export function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ")
}
