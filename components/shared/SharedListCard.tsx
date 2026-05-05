import PendingLinkButton from "@/components/PendingLinkButton"
import type { SharedList } from "@/lib/loaders/public-lists"

type SharedListCardProps = {
  list: SharedList
}

export default function SharedListCard({ list }: SharedListCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-md">
      <div className="flex h-full flex-col gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold leading-tight text-foreground">
              {list.name}
            </h2>

            {list.isOwnedByCurrentUser && (
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                Your public list
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
            <span>By {list.ownerLabel}</span>
            <span aria-hidden="true">•</span>
            <span>
              {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
            </span>
          </div>

          {list.description ? (
            <p className="mt-4 text-sm leading-6 text-foreground">
              {list.description}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No description yet.
            </p>
          )}
        </div>

        <div>
          <PendingLinkButton
            href={`/public-lists/${list.id}`}
            label="Browse and import"
            pendingLabel="Opening..."
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      </div>
    </article>
  )
}