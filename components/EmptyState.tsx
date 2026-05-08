"use client"

import PendingLinkButton from "@/components/PendingLinkButton"

type EmptyStateProps = {
  title: string
  description: string
  primaryActionHref?: string
  primaryActionLabel?: string
  secondaryActionHref?: string
  secondaryActionLabel?: string
  className?: string
  titleClassName?: string
  children?: React.ReactNode
}

export default function EmptyState({
  title,
  description,
  primaryActionHref,
  primaryActionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  className = "",
  titleClassName = "text-base font-semibold text-foreground",
  children,
}: EmptyStateProps) {
  const hasPrimaryAction = Boolean(primaryActionHref && primaryActionLabel)
  const hasSecondaryAction = Boolean(secondaryActionHref && secondaryActionLabel)

  return (
    <div
      className={`rounded-2xl border border-border bg-background/70 p-4 shadow-sm ${className}`}
    >
      <h3 className={titleClassName}>{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {(hasPrimaryAction || hasSecondaryAction || children) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hasPrimaryAction && (
            <PendingLinkButton
              href={primaryActionHref!}
              label={primaryActionLabel!}
              pendingLabel="Loading..."
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          )}

          {hasSecondaryAction && (
            <PendingLinkButton
              href={secondaryActionHref!}
              label={secondaryActionLabel!}
              pendingLabel="Loading..."
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          )}

          {children}
        </div>
      )}
    </div>
  )
}