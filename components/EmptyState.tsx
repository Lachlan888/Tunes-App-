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
  children,
}: EmptyStateProps) {
  const hasPrimaryAction = Boolean(primaryActionHref && primaryActionLabel)
  const hasSecondaryAction = Boolean(secondaryActionHref && secondaryActionLabel)

  return (
    <div className={`rounded-lg border bg-white p-4 ${className}`}>
      <h3 className="text-base font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-gray-600">{description}</p>

      {(hasPrimaryAction || hasSecondaryAction || children) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hasPrimaryAction && (
            <PendingLinkButton
              href={primaryActionHref!}
              label={primaryActionLabel!}
              pendingLabel="Loading..."
              className="rounded border bg-black px-3 py-2 text-sm font-medium text-white"
            />
          )}

          {hasSecondaryAction && (
            <PendingLinkButton
              href={secondaryActionHref!}
              label={secondaryActionLabel!}
              pendingLabel="Loading..."
              className="rounded border px-3 py-2 text-sm font-medium"
            />
          )}

          {children}
        </div>
      )}
    </div>
  )
}