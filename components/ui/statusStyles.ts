export const statusStyles = {
  success: "border-state-known/55 bg-state-known/12 text-text-primary",
  warning: "border-state-due bg-state-due/25 text-text-primary",
  error: "border-action-destructive/55 bg-action-destructive/10 text-action-destructive",
  info: "border-state-practice/55 bg-state-practice/12 text-text-primary",
  social: "border-state-social/55 bg-state-social/12 text-text-primary",
  neutral: "border-hairline bg-surface-note text-text-muted",
} as const

export type StatusTone = keyof typeof statusStyles
