import PendingLinkButton from "@/components/PendingLinkButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { DirectSharedListSummary } from "@/lib/loaders/lists"

type DirectSharedListsSectionProps = {
  directSharedLists: DirectSharedListSummary[]
  className?: string
}

export default function DirectSharedListsSection({
  directSharedLists,
  className = "",
}: DirectSharedListsSectionProps) {
  if (directSharedLists.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Shared with me
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Private lists you have read-only access to.
        </p>
      </div>

      <div className="divide-y divide-border/70 border-y border-border/70 md:space-y-3 md:divide-y-0 md:border-y-0">
        {directSharedLists.map((list) => (
          <div
            key={list.id}
            className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:rounded-2xl md:border md:border-border md:bg-card md:p-4 md:shadow-sm"
          >
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-tight text-foreground">
                {list.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Shared by {list.ownerLabel} · {list.tuneCount} tune
                {list.tuneCount === 1 ? "" : "s"}
              </p>
            </div>

            <PendingLinkButton
              href={`/learning-lists/${list.id}`}
              label="Open"
              pendingLabel="Opening..."
              className={buttonStyles.primary}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
