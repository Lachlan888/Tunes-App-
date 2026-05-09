export const statusStyles = {
  success: "border-success bg-success/15 text-foreground",
  warning: "border-warning-strong bg-warning/25 text-warning-foreground",
  error: "border-destructive bg-destructive/10 text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
} as const

export type StatusTone = keyof typeof statusStyles