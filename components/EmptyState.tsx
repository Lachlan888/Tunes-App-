"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import Icon, { type IconName } from "@/components/ui/Icon"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type EmptyStateProps = {
  title: string
  headingAs?: "h1" | "h2" | "h3"
  description?: string
  primaryActionHref?: string
  primaryActionLabel?: string
  secondaryActionHref?: string
  secondaryActionLabel?: string
  className?: string
  showTopRule?: boolean
  titleClassName?: string
  icon?: IconName
  children?: React.ReactNode
}

export default function EmptyState({
  title,
  headingAs: Heading = "h3",
  description,
  primaryActionHref,
  primaryActionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  className = "",
  showTopRule = true,
  titleClassName,
  icon = "music",
  children,
}: EmptyStateProps) {
  const hasPrimaryAction = Boolean(primaryActionHref && primaryActionLabel)
  const hasSecondaryAction = Boolean(secondaryActionHref && secondaryActionLabel)

  return (
    <div
      className={joinClasses(
        showTopRule ? "border-t border-hairline py-7" : "py-7",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 text-action-primary" aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
        <Heading className={joinClasses(
          Heading === "h1"
            ? "font-sans text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl"
            : "font-sans text-2xl font-bold leading-tight tracking-tight text-text-primary",
          titleClassName
        )}>{title}</Heading>
      </div>

      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
          {description}
        </p>
      ) : null}

      {(hasPrimaryAction || hasSecondaryAction || children) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hasPrimaryAction && (
            <PendingLinkButton
              href={primaryActionHref!}
              label={primaryActionLabel!}
              pendingLabel="Loading..."
              className={buttonStyles.primary}
            />
          )}

          {hasSecondaryAction && (
            <PendingLinkButton
              href={secondaryActionHref!}
              label={secondaryActionLabel!}
              pendingLabel="Loading..."
              className={buttonStyles.secondary}
            />
          )}

          {children}
        </div>
      )}
    </div>
  )
}
