import TrendFriendPatternsSection from "@/components/trends/TrendFriendPatternsSection"
import TrendSummaryCards from "@/components/trends/TrendSummaryCards"
import TrendTuneList from "@/components/trends/TrendTuneList"
import PendingLinkButton from "@/components/PendingLinkButton"
import { loadTrendLandingData } from "@/lib/loaders/trends"

export default async function TrendsPage() {
  const {
    summaryCards,
    styleEntries,
    isAuthenticated,
    friendOverview,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
  } = await loadTrendLandingData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Trends &amp; Patterns
        </h1>

        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Explore overall repertoire trends, then drill into a specific style.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Overall summary
        </h2>
        <TrendSummaryCards cards={summaryCards} />
      </section>

      <section className="mb-10 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Browse by style
        </h2>

        {styleEntries.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No styles found yet.
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {styleEntries.map((entry, index) => (
              <li
                key={`${entry.slug}-${entry.styleName}-${index}`}
                className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm"
              >
                <div className="text-lg font-semibold text-foreground">
                  {entry.styleName}
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    {entry.tuneCount} tune{entry.tuneCount === 1 ? "" : "s"}
                  </p>
                  <p>
                    {entry.publicListCount} public list
                    {entry.publicListCount === 1 ? "" : "s"}
                  </p>
                  <p>
                    Top known tune: {entry.topKnownTuneTitle ?? "None yet"}
                  </p>
                </div>

                <div className="mt-4">
                  <PendingLinkButton
                    href={`/trends/${entry.slug}`}
                    label="View style trends"
                    pendingLabel="Opening..."
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAuthenticated && friendOverview ? (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Popular among your friends
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
              Social overview of the repertoire world your friends inhabit.
            </p>
          </div>

          <div className="mb-6">
            <TrendFriendPatternsSection
              friendCount={friendOverview.friendCount}
              styleEntries={friendOverview.styles}
              keyEntries={friendOverview.keys}
            />
          </div>

          {friendOverview.topTunes.length > 0 ? (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Top tunes among your friends
              </h3>

              <TrendTuneList
                entries={friendOverview.topTunes}
                metricLabel="Known or practised by"
                metricUnit="friends"
                userPieces={userPieces}
                userKnownPieces={userKnownPieces}
                learningLists={learningLists}
                learningListItems={learningListItems}
                redirectTo="/trends"
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}