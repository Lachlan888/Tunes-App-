import Link from "next/link"
import type { Metadata } from "next"
import PersonalTrendInsights from "@/components/trends/PersonalTrendInsights"
import PageHeader from "@/components/ui/PageHeader"
import { loadTrendLandingData } from "@/lib/loaders/trends"
import { parseTrendPeriod } from "@/lib/trends-insights"

type TrendsPageProps = {
  searchParams: Promise<{ period?: string }>
}

export const metadata: Metadata = {
  title: "Trends | Tunes",
  description: "Practice patterns, repertoire coverage and useful next steps.",
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  const { period } = await searchParams
  const periodWeeks = parseTrendPeriod(period)
  const { styleEntries, isAuthenticated, personalInsights, friendOverview } =
    await loadTrendLandingData(periodWeeks)
  const visibleStyles = styleEntries
    .toSorted(
      (a, b) =>
        b.tuneCount - a.tuneCount || a.styleName.localeCompare(b.styleName)
    )
    .slice(0, 10)
  const friendTakeaway = friendOverview?.styles[0]

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <PageHeader title="Trends" />

      {isAuthenticated && personalInsights ? (
        <PersonalTrendInsights insight={personalInsights} />
      ) : (
        <section
          className="border-y border-border py-7"
          aria-labelledby="signed-out-trends-title"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Catalogue view
          </p>
          <h2
            id="signed-out-trends-title"
            className="mt-2 font-serif text-2xl font-bold"
          >
            Find a strong place to start
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Sign in to see your weekly practice, Stage distribution, review
            consistency and repertoire gaps.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </section>
      )}

      {friendOverview && friendOverview.friendCount > 0 && friendTakeaway ? (
        <section
          className="mt-10 border-t border-border pt-8"
          aria-labelledby="friend-pattern-title"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Friend pattern
          </p>
          <h2
            id="friend-pattern-title"
            className="mt-1 font-serif text-2xl font-bold"
          >
            {friendTakeaway.label} is common among your friends
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {friendTakeaway.count} of your {friendOverview.friendCount} accepted
            friends have a tune in this style. Only accepted-friend repertoire is
            included.
          </p>
          {friendTakeaway.href ? (
            <Link
              href={friendTakeaway.href}
              className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              Explore the style
            </Link>
          ) : null}
        </section>
      ) : null}

      <section
        className="mt-10 border-t border-border pt-8"
        aria-labelledby="styles-title"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Catalogue coverage
            </p>
            <h2 id="styles-title" className="mt-1 font-serif text-2xl font-bold">
              Browse by style
            </h2>
          </div>
          <Link
            href="/library"
            className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
          >
            View all tunes
          </Link>
        </div>

        {visibleStyles.length > 0 ? (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {visibleStyles.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/trends/${entry.slug}`}
                  className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 py-2 hover:bg-muted/40 sm:grid-cols-[1fr_auto_auto] sm:px-2"
                >
                  <span className="font-semibold">{entry.styleName}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {entry.tuneCount} tunes
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Not enough catalogue data yet.
          </p>
        )}
      </section>
    </main>
  )
}
