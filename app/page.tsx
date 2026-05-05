import GettingStartedSection from "@/components/home/GettingStartedSection"
import HomeSummarySection from "@/components/home/HomeSummarySection"
import { loadHomepageData } from "@/lib/loaders/homepage"

export default async function HomePage() {
  const {
    user,
    pieces,
    userPieces,
    userKnownPieces,
    learningLists,
    dueToday,
    needsAttentionCount,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  } = await loadHomepageData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Home
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Tunes App
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              A working memory system for tunes you know, tunes you are
              practising, and the lists that hold them together.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">Signed in</p>
            <p className="mt-1 text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </section>

      <GettingStartedSection state={gettingStartedState} />

      <HomeSummarySection
        pieces={pieces}
        userPieces={userPieces}
        userKnownPieces={userKnownPieces}
        learningLists={learningLists}
        dueToday={dueToday}
        needsAttentionCount={needsAttentionCount}
        recentFriendActivity={recentFriendActivity}
        streakSummary={streakSummary}
      />
    </main>
  )
}