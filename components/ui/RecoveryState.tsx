"use client"

import type { ReactNode } from "react"
import EmptyState from "@/components/EmptyState"
import { buttonStyles } from "@/components/ui/buttonStyles"

type RecoveryStateProps = {
  title: string
  description: string
  primaryActionHref?: string
  primaryActionLabel: string
  onPrimaryAction?: () => void
  secondaryActionHref?: string
  secondaryActionLabel?: string
  className?: string
  children?: ReactNode
}

export default function RecoveryState({
  title,
  description,
  primaryActionHref,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionHref,
  secondaryActionLabel,
  className,
  children,
}: RecoveryStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      primaryActionHref={onPrimaryAction ? undefined : primaryActionHref}
      primaryActionLabel={primaryActionLabel}
      secondaryActionHref={secondaryActionHref}
      secondaryActionLabel={secondaryActionLabel}
      className={className}
      icon="alert"
    >
      {onPrimaryAction ? (
        <button type="button" onClick={onPrimaryAction} className={buttonStyles.primary}>
          {primaryActionLabel}
        </button>
      ) : null}
      {children}
    </EmptyState>
  )
}
