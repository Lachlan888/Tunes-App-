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
  titleClassName = "font-serif text-xl font-semibold text-text-primary",
  icon = "music",
  children,
}: EmptyStateProps) {
  const hasPrimaryAction = Boolean(primaryActionHref && primaryActionLabel)
  const hasSecondaryAction = Boolean(secondaryActionHref && secondaryActionLabel)

  return (
    <div
      className={joinClasses(
        "rounded-object bg-surface-note p-5",
        className
      )}
    >
      <span className="mb-4 inline-grid h-10 w-10 place-items-center rounded-full bg-surface-paper text-action-primary shadow-material-rest">
        <Icon name={icon} size={20} />
      </span>

      <Heading className={titleClassName}>{title}</Heading>

      {description ? (
        <p className="mt-2 text-sm leading-6 text-text-muted">
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
