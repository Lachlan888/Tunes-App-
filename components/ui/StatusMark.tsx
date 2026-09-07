import type { ReactNode } from "react"
import Icon, { type IconName } from "@/components/ui/Icon"
import { joinClasses } from "@/components/ui/buttonStyles"

export type StatusTone =
  | "neutral"
  | "known"
  | "practice"
  | "due"
  | "overdue"
  | "social"
  | "destructive"
  | "rough"
  | "shaky"
  | "solid"
  | "stage"

type StatusMarkProps = {
  tone: StatusTone
  children: ReactNode
  icon?: IconName
  className?: string
}

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-hairline bg-surface-note text-text-muted",
  known: "border-state-known bg-state-known text-state-known-foreground",
  practice:
    "border-state-practice bg-state-practice text-state-practice-foreground",
  due: "border-state-due bg-state-due text-state-due-foreground",
  overdue:
    "border-state-overdue bg-state-overdue text-state-overdue-foreground",
  social: "border-state-social bg-state-social text-state-social-foreground",
  destructive:
    "border-action-destructive bg-action-destructive text-action-destructive-foreground",
  rough: "border-state-overdue bg-state-overdue text-state-overdue-foreground",
  shaky: "border-state-due bg-state-due text-state-due-foreground",
  solid: "border-state-known bg-state-known text-state-known-foreground",
  stage: "border-state-due bg-state-due text-state-due-foreground",
}

const toneIcons: Record<StatusTone, IconName> = {
  neutral: "info",
  known: "check",
  practice: "music",
  due: "clock",
  overdue: "alert",
  social: "social",
  destructive: "trash",
  rough: "rough",
  shaky: "shaky",
  solid: "check",
  stage: "stage",
}

export default function StatusMark({
  tone,
  children,
  icon = toneIcons[tone],
  className,
}: StatusMarkProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex min-h-7 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold leading-none",
        toneClasses[tone],
        className
      )}
    >
      <Icon name={icon} size={14} className="shrink-0" />
      <span>{children}</span>
    </span>
  )
}
