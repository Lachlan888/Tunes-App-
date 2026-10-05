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
  neutral: "border-hairline text-text-muted",
  known: "border-state-known text-state-known",
  practice:
    "border-state-practice text-state-practice",
  due: "border-state-due text-text-primary",
  overdue:
    "border-state-overdue text-state-overdue",
  social: "border-state-social text-state-social",
  destructive:
    "border-action-destructive text-action-destructive",
  rough: "border-state-overdue text-state-overdue",
  shaky: "border-state-due text-text-primary",
  solid: "border-state-known text-state-known",
  stage: "border-state-due text-text-primary",
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
        "inline-flex min-h-7 items-center gap-1.5 border-l-2 px-2 py-1 text-xs font-semibold leading-none",
        toneClasses[tone],
        className
      )}
    >
      <Icon name={icon} size={14} className="shrink-0" />
      <span>{children}</span>
    </span>
  )
}
