export const formStyles = {
  label:
    "mb-2 block text-sm font-semibold text-text-primary",

  input:
    "min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-4 py-2.5 text-sm text-text-primary shadow-material-rest outline-none transition-[border-color,box-shadow] [transition-duration:var(--motion-standard)] placeholder:text-text-muted/75 focus:border-action-primary focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-surface-note disabled:opacity-70",

  select:
    "min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-4 py-2.5 text-sm text-text-primary shadow-material-rest outline-none transition-[border-color,box-shadow] [transition-duration:var(--motion-standard)] focus:border-action-primary focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-surface-note disabled:opacity-70",

  textarea:
    "min-h-28 w-full resize-y rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm leading-6 text-text-primary shadow-material-rest outline-none transition-[border-color,box-shadow] [transition-duration:var(--motion-standard)] placeholder:text-text-muted/75 focus:border-action-primary focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-surface-note disabled:opacity-70",

  checkbox:
    "h-5 w-5 rounded border-hairline bg-surface-paper text-action-primary focus:ring-2 focus:ring-[var(--focus-ring)]",

  helpText: "mt-2 text-sm leading-6 text-text-muted",
} as const
