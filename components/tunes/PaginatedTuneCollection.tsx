import Link from "next/link"
import type { ReactNode } from "react"
import EmptyState from "@/components/EmptyState"
import RecoveryState from "@/components/ui/RecoveryState"
import { LoadingState } from "@/components/ui/Skeleton"
import { joinClasses } from "@/components/ui/buttonStyles"

type ReadyCollectionProps = {
  state?: "ready"
  label: string
  items: ReactNode
  itemCount: number
  totalCount: number
  previousHref?: string | null
  nextHref?: string | null
  emptyTitle: string
  emptyDescription?: string
  resetHref?: string
  resetLabel?: string
  className?: string
}

type LoadingCollectionProps = {
  state: "loading"
  label: string
  rows?: number
  className?: string
}

type ErrorCollectionProps = {
  state: "error"
  label: string
  title: string
  description: string
  retryHref: string
  className?: string
}

type PaginatedTuneCollectionProps =
  | ReadyCollectionProps
  | LoadingCollectionProps
  | ErrorCollectionProps

const pageLinkClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-4 py-2 text-sm font-semibold text-text-muted shadow-material-rest transition-colors hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"

function CollectionPagination({
  label,
  previousHref,
  nextHref,
}: {
  label: string
  previousHref?: string | null
  nextHref?: string | null
}) {
  if (!previousHref && !nextHref) return null

  return (
    <nav
      aria-label={`${label} pages`}
      className="mt-5 flex items-center justify-between gap-3"
    >
      {previousHref ? (
        <Link href={previousHref} rel="prev" className={pageLinkClass}>
          Previous
        </Link>
      ) : (
        <span />
      )}

      {nextHref ? (
        <Link href={nextHref} rel="next" className={pageLinkClass}>
          Next
        </Link>
      ) : null}
    </nav>
  )
}

export default function PaginatedTuneCollection(
  props: PaginatedTuneCollectionProps
) {
  if (props.state === "loading") {
    return (
      <LoadingState
        label={props.label}
        rows={props.rows ?? 6}
        className={props.className}
      />
    )
  }

  if (props.state === "error") {
    return (
      <RecoveryState
        title={props.title}
        description={props.description}
        primaryActionHref={props.retryHref}
        primaryActionLabel="Retry"
        className={props.className}
      />
    )
  }

  if (props.itemCount === 0) {
    const cursorPageIsEmpty = props.totalCount > 0 && Boolean(props.previousHref)

    return (
      <section aria-label={props.label}>
        <EmptyState
          title={cursorPageIsEmpty ? "No tunes on this page" : props.emptyTitle}
          description={
            cursorPageIsEmpty
              ? "The collection may have changed. Return to the previous page and continue browsing."
              : props.emptyDescription
          }
          primaryActionHref={
            cursorPageIsEmpty
              ? props.previousHref ?? undefined
              : props.resetHref
          }
          primaryActionLabel={
            cursorPageIsEmpty ? "Previous page" : props.resetLabel
          }
          className={props.className}
        />
        <CollectionPagination
          label={props.label}
          previousHref={props.previousHref}
          nextHref={props.nextHref}
        />
      </section>
    )
  }

  return (
    <section
      aria-label={props.label}
      className={joinClasses("overflow-hidden", props.className)}
    >
      <p className="mb-2 text-sm text-text-muted" aria-live="polite">
        Showing {props.itemCount} of {props.totalCount} tune
        {props.totalCount === 1 ? "" : "s"}
      </p>

      <ul className="divide-y divide-hairline" role="list">
        {props.items}
      </ul>

      <CollectionPagination
        label={props.label}
        previousHref={props.previousHref}
        nextHref={props.nextHref}
      />
    </section>
  )
}
