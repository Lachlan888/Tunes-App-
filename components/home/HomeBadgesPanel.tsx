import Link from "next/link"
import type { HomeBadgeSummary } from "@/lib/types"

type HomeBadgesPanelProps = {
  badgeSummary: HomeBadgeSummary
}

function badgeCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function BadgeMiniLink({
  href,
  title,
  meta,
}: {
  href: string
  title: string
  meta: string
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold underline-offset-4 group-hover:underline">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        </div>

        <span
          aria-hidden="true"
          className="text-sm text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          →
        </span>
      </div>
    </Link>
  )
}

export default function HomeBadgesPanel({
  badgeSummary,
}: HomeBadgesPanelProps) {
  const hasRecentBadges =
    badgeSummary.recentReceivedBadges.length > 0 ||
    badgeSummary.recentCreatedBadges.length > 0

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Badges
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Recognition you have received and badges you award.
          </p>
        </div>

        <Link
          href="/badges"
          className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/badges"
          className="rounded-2xl border border-border bg-background/70 p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Received
          </p>
          <p className="mt-2 font-serif text-4xl font-bold leading-none text-foreground">
            {badgeSummary.receivedCount}
          </p>
        </Link>

        <Link
          href="/badges"
          className="rounded-2xl border border-border bg-background/70 p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Created
          </p>
          <p className="mt-2 font-serif text-4xl font-bold leading-none text-foreground">
            {badgeSummary.createdCount}
          </p>
        </Link>
      </div>

      {hasRecentBadges ? (
        <div className="mt-4 space-y-3">
          {badgeSummary.recentReceivedBadges.slice(0, 2).map((badge) => (
            <BadgeMiniLink
              key={`received-${badge.id}`}
              href={`/badges/${badge.slug}`}
              title={badge.name}
              meta={`Received · ${badgeCategoryLabel(badge.category)}`}
            />
          ))}

          {badgeSummary.recentCreatedBadges.slice(0, 2).map((badge) => (
            <BadgeMiniLink
              key={`created-${badge.id}`}
              href={`/badges/${badge.slug}`}
              title={badge.name}
              meta={`Created · ${badgeCategoryLabel(badge.category)}`}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No badges yet. Browse badges or create one to start making community
          recognition visible.
        </p>
      )}
    </section>
  )
}