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
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <details className="rounded-xl border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-zinc-600">
          Top {count} item{count === 1 ? "" : "s"}
        </p>
      </summary>

      <div className="border-t border-zinc-200 p-4">{children}</div>
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{resolvedStyleName} Trends</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Discovery and repertoire patterns for this style.
        </p>
      </div>

      <section className="mb-10">
        <TrendSummaryCards cards={summaryCards} />
      </section>

      <div className="space-y-6">
        {isAuthenticated ? (
          <SectionShell
            title={`Popular Among Your Friends in ${resolvedStyleName}`}
            count={popularAmongFriendsTunes.length}
          >
            <p className="mb-4 text-sm text-zinc-600">
              Tunes in this style that are most common across your accepted
              friends’ repertoire.
            </p>

            {popularAmongFriendsTunes.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
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
          count={recommendedTunes.length}
        >
          <p className="mb-4 text-sm text-zinc-600">
            {isAuthenticated
              ? "These are widely known tunes in this style that are not yet in your known or practice set."
              : "These are strong entry-point tunes in this style based on how many users already know them."}
          </p>

          {recommendedTunes.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
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
          count={topKnownTunes.length}
        >
          {topKnownTunes.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
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
          count={topPracticeTunes.length}
        >
          {topPracticeTunes.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
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
          count={topPublicLists.length}
        >
          <TrendPublicListSection entries={topPublicLists} />
        </SectionShell>
      </div>
    </main>
  )
}