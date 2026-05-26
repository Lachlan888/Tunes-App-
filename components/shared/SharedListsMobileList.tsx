import Link from "next/link"
import PendingLinkButton from "@/components/PendingLinkButton"
import type { SharedList } from "@/lib/loaders/public-lists"

type SharedListsMobileListProps = {
  lists: SharedList[]
}

function tuneCountLabel(count: number) {
  return `${count} tune${count === 1 ? "" : "s"}`
}

export default function SharedListsMobileList({
  lists,
}: SharedListsMobileListProps) {
  return (
    <section className="md:hidden">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Public lists
      </h2>

      <div className="mt-2 divide-y divide-border/70 border-y border-border/70">
        {lists.map((list) => {
          const ownerHref = list.ownerUsername
            ? `/users/${encodeURIComponent(list.ownerUsername)}`
            : null
          const listHref = `/public-lists/${list.id}`

          return (
            <article
              key={list.id}
              className="flex min-w-0 items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-foreground">
                  <Link
                    href={listHref}
                    className="underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    {list.name}
                  </Link>
                </h3>

                <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span className="min-w-0 truncate">
                    By{" "}
                    {ownerHref ? (
                      <Link
                        href={ownerHref}
                        className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      >
                        {list.ownerLabel}
                      </Link>
                    ) : (
                      list.ownerLabel
                    )}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{tuneCountLabel(list.tuneCount)}</span>
                </p>

                {list.isOwnedByCurrentUser ? (
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Your public list
                  </p>
                ) : null}
              </div>

              <PendingLinkButton
                href={listHref}
                label="Open"
                pendingLabel="Opening..."
                className="min-h-10 shrink-0 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
