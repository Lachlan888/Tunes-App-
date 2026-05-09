import Link from "next/link"
import BadgeProgressSummary from "@/components/badges/BadgeProgressSummary"
import type { BadgeWithOwner } from "@/lib/types"

type BadgeCardProps = {
  badge: BadgeWithOwner
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getOwnerName(badge: BadgeWithOwner) {
  return (
    badge.owner_profile?.display_name ||
    badge.owner_profile?.username ||
    "Unknown user"
  )
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {titleCase(badge.category)} badge
          </p>

          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground">
            <Link
              href={`/badges/${encodeURIComponent(badge.slug)}`}
              className="underline-offset-4 hover:underline"
            >
              {badge.name}
            </Link>
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Awarded by {getOwnerName(badge)}
          </p>
        </div>

        <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {badge.recipient_count} recipient
          {badge.recipient_count === 1 ? "" : "s"}
        </p>
      </div>

      {badge.description ? (
        <p className="mt-4 text-sm leading-6 text-foreground">
          {badge.description}
        </p>
      ) : null}

      <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Condition
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {badge.condition_summary}
        </p>
      </div>

      <div className="mt-5">
        <BadgeProgressSummary
          viewerAward={badge.viewer_award}
          progress={badge.viewer_progress}
        />
      </div>
    </article>
  )
}