import TrendPublicListSection from "@/components/trends/TrendPublicListSection"
import TrendSummaryCards from "@/components/trends/TrendSummaryCards"
import TrendTuneList from "@/components/trends/TrendTuneList"
import { loadStyleTrendData } from "@/lib/loaders/trends"

type TrendsStylePageProps = {
  params: Promise<{
    style: string
  }>
}

function deslugifyStyle(styleSlug: string) {
  return styleSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function SectionShell({
  title,
  description,
  count,
  children,
}: {
  title: string
  description?: string
  count: number
  children: React.ReactNode
}) {
  return (
    <details className="group rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 p-5 md:p-6">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <p className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Top {count} item{count === 1 ? "" : "s"}
          </p>

          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 text-muted-foreground transition group-open:rotate-180 group-hover:bg-muted group-hover:text-foreground">
            ↓
          </span>
        </div>
      </summary>

      <div className="border-t border-border bg-background/35 p-5 md:p-6">
        {children}
      </div>
    </details>
  )
}

export default async function TrendsStylePage({
  params,
}: TrendsStylePageProps) {
  const { style } = await params

  const {
    isAuthenticated,
    styleName,
    summaryCards,
    popularAmongFriendsTunes,
    recommendedTunes,
    topKnownTunes,
    topPracticeTunes,
    topPublicLists,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
  } = await loadStyleTrendData(style)

  const resolvedStyleName = styleName ?? deslugifyStyle(style)
  const redirectTo = `/trends/${style}`

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Trends
        </p>

        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
              {resolvedStyleName} Trends
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Discovery and repertoire patterns for this style, drawn from
              known tunes, practice activity, public lists, and your friend
              network.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            Style view
          </div>
        </div>
      </section>

      <section className="mb-8">
        <TrendSummaryCards cards={summaryCards} />
      </section>

      <div className="space-y-5">
        {isAuthenticated ? (
          <SectionShell
            title={`Popular Among Your Friends in ${resolvedStyleName}`}
            description="Tunes in this style that are most common across your accepted friends’ repertoire."
            count={popularAmongFriendsTunes.length}
          >
            {popularAmongFriendsTunes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                No friend repertoire patterns found in this style yet.
              </div>
            ) : (
              <TrendTuneList
                entries={popularAmongFriendsTunes}
                metricLabel="Known or practised by"
                metricUnit="friends"
                userPieces={userPieces}
                userKnownPieces={userKnownPieces}
                learningLists={learningLists}
                learningListItems={learningListItems}
                redirectTo={redirectTo}
              />
            )}
          </SectionShell>
        ) : null}

        <SectionShell
          title={
            isAuthenticated
              ? `Popular in ${resolvedStyleName} you don’t know yet`
              : `Popular starting points in ${resolvedStyleName}`
          }
          description={
            isAuthenticated
              ? "Widely known tunes in this style that are not yet in your known or practice set."
              : "Strong entry-point tunes in this style based on how many players already know them."
          }
          count={recommendedTunes.length}
        >
          {recommendedTunes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              {isAuthenticated
                ? "You already know or practise the most popular tunes in this style."
                : "No starting-point tunes found for this style yet."}
            </div>
          ) : (
            <TrendTuneList
              entries={recommendedTunes}
              metricLabel="Known by"
              userPieces={userPieces}
              userKnownPieces={userKnownPieces}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
            />
          )}
        </SectionShell>

        <SectionShell
          title={`Most Known in ${resolvedStyleName}`}
          description="The tunes in this style most often marked as known across the app."
          count={topKnownTunes.length}
        >
          {topKnownTunes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No known-tune trends found for this style yet.
            </div>
          ) : (
            <TrendTuneList
              entries={topKnownTunes}
              metricLabel="Known by"
              userPieces={userPieces}
              userKnownPieces={userKnownPieces}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
            />
          )}
        </SectionShell>

        <SectionShell
          title={`Most In Practice in ${resolvedStyleName}`}
          description="The tunes in this style most often sitting in active practice."
          count={topPracticeTunes.length}
        >
          {topPracticeTunes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No practice trends found for this style yet.
            </div>
          ) : (
            <TrendTuneList
              entries={topPracticeTunes}
              metricLabel="In practice for"
              userPieces={userPieces}
              userKnownPieces={userKnownPieces}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
            />
          )}
        </SectionShell>

        <SectionShell
          title={`Top Public Lists in ${resolvedStyleName}`}
          description="Public lists with the strongest overlap with this style."
          count={topPublicLists.length}
        >
          <TrendPublicListSection entries={topPublicLists} />
        </SectionShell>
      </div>
    </main>
  )
}
