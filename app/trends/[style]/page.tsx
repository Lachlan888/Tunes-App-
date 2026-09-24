import Link from "next/link"
import type { Metadata } from "next"
import TrendPublicListSection from "@/components/trends/TrendPublicListSection"
import TrendTuneList from "@/components/trends/TrendTuneList"
import { loadStyleTrendData } from "@/lib/loaders/trends"

type TrendsStylePageProps = {
  params: Promise<{ style: string }>
}

function deslugifyStyle(styleSlug: string) {
  return styleSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function generateMetadata({
  params,
}: TrendsStylePageProps): Promise<Metadata> {
  const { style } = await params
  return {
    title: `${deslugifyStyle(style)} Trends | Tunes`,
  }
}

export default async function TrendsStylePage({ params }: TrendsStylePageProps) {
  const { style } = await params
  const data = await loadStyleTrendData(style)
  const resolvedStyleName = data.styleName ?? deslugifyStyle(style)
  const redirectTo = `/trends/${style}`
  const personalTotal =
    (data.coverageSummary?.personalKnownCount ?? 0) +
    (data.coverageSummary?.personalPracticeCount ?? 0)
  const hasDiscoveryData =
    data.recommendedTunes.length > 0 ||
    data.topPracticeTunes.length > 0 ||
    data.topPublicLists.length > 0

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <Link
        href="/trends"
        className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
      >
        ← All trends
      </Link>

      <header className="border-b border-border pb-7">
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          {resolvedStyleName}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Compare your repertoire with the visible catalogue and community
          memberships. Private users and private lists are not included.
        </p>
      </header>

      {data.coverageSummary ? (
        <section className="py-8" aria-labelledby="style-coverage-title">
          <h2 id="style-coverage-title" className="mt-1 font-serif text-2xl font-bold">
            {data.isAuthenticated
              ? `${personalTotal} of ${data.coverageSummary.catalogueTuneCount} catalogue tunes are in your repertoire`
              : `${data.coverageSummary.catalogueTuneCount} tunes in the catalogue`}
          </h2>
          <dl className="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border sm:grid-cols-4">
            {data.isAuthenticated ? (
              <>
                <div className="px-3 py-4 first:pl-0">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">You know</dt>
                  <dd className="mt-1 font-serif text-3xl font-bold">{data.coverageSummary.personalKnownCount}</dd>
                </div>
                <div className="px-3 py-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">In practice</dt>
                  <dd className="mt-1 font-serif text-3xl font-bold">{data.coverageSummary.personalPracticeCount}</dd>
                </div>
              </>
            ) : null}
            <div className="px-3 py-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Common key</dt>
              <dd className="mt-1 font-serif text-3xl font-bold">{data.coverageSummary.commonKey ?? "—"}</dd>
            </div>
            <div className="px-3 py-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Common time</dt>
              <dd className="mt-1 font-serif text-3xl font-bold">{data.coverageSummary.commonTimeSignature ?? "—"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Personal counts use your Known and active Practice memberships. Catalogue count is the current visible {resolvedStyleName} set; community rankings use only memberships allowed by privacy rules.
          </p>
        </section>
      ) : null}

      {!hasDiscoveryData ? (
        <section className="border-y border-border py-7" aria-labelledby="style-empty-title">
          <h2 id="style-empty-title" className="font-serif text-2xl font-bold">Not enough data yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Browse the catalogue to find a {resolvedStyleName} tune and start building this view.</p>
          <Link href={`/library?style=${encodeURIComponent(resolvedStyleName)}`} className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Explore {resolvedStyleName}</Link>
        </section>
      ) : null}

      {data.recommendedTunes.length > 0 ? (
        <section className="border-t border-border py-8" aria-labelledby="recommended-title">
          <h2 id="recommended-title" className="mt-1 font-serif text-2xl font-bold">
            {data.isAuthenticated ? "Popular tunes not in your repertoire" : "Popular starting points"}
          </h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">Ranked by visible Known memberships; counts are not the number of all app users.</p>
          <TrendTuneList entries={data.recommendedTunes} metricLabel="Known by" userPieces={data.userPieces} userKnownPieces={data.userKnownPieces} learningLists={data.learningLists} learningListItems={data.learningListItems} redirectTo={redirectTo} />
        </section>
      ) : null}

      {data.topPracticeTunes.length > 0 ? (
        <section className="border-t border-border py-8" aria-labelledby="practice-title">
          <h2 id="practice-title" className="mt-1 font-serif text-2xl font-bold">Most often in active practice</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">Based on visible active Practice memberships in this style.</p>
          <TrendTuneList entries={data.topPracticeTunes} metricLabel="In practice for" userPieces={data.userPieces} userKnownPieces={data.userKnownPieces} learningLists={data.learningLists} learningListItems={data.learningListItems} redirectTo={redirectTo} />
        </section>
      ) : null}

      {data.topPublicLists.length > 0 ? (
        <section className="border-t border-border py-8" aria-labelledby="lists-title">
          <h2 id="lists-title" className="mt-1 font-serif text-2xl font-bold">Lists with the strongest overlap</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">Ranked by the number of {resolvedStyleName} tunes in each public list.</p>
          <TrendPublicListSection entries={data.topPublicLists} />
        </section>
      ) : null}
    </main>
  )
}
