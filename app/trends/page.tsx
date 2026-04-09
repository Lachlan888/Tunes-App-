import TrendFriendPatternsSection from "@/components/TrendFriendPatternsSection"
import TrendSummaryCards from "@/components/TrendSummaryCards"
import TrendTuneList from "@/components/TrendTuneList"
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trends &amp; Patterns</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Explore overall repertoire trends, then drill into a specific style.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Overall summary</h2>
        <TrendSummaryCards cards={summaryCards} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Browse by style</h2>

        {styleEntries.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No styles found yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {styleEntries.map((entry, index) => (
              <li
                key={`${entry.slug}-${entry.styleName}-${index}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="text-lg font-semibold">{entry.styleName}</div>

                <div className="mt-3 space-y-1 text-sm text-zinc-600">
                  <p>
                    {entry.tuneCount} tune{entry.tuneCount === 1 ? "" : "s"}
                  </p>
                  <p>
                    {entry.publicListCount} public list
                    {entry.publicListCount === 1 ? "" : "s"}
                  </p>
                  <p>Top known tune: {entry.topKnownTuneTitle ?? "None yet"}</p>
                </div>

                <div className="mt-4">
                  <PendingLinkButton
                    href={`/trends/${entry.slug}`}
                    label="View style trends"
                    pendingLabel="Opening..."
                    className="rounded border px-3 py-1 text-sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAuthenticated && friendOverview ? (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Popular Among Your Friends</h2>
            <p className="mt-2 text-sm text-zinc-600">
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
              <h3 className="mb-4 text-lg font-semibold">
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