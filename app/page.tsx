import GettingStartedSection from "@/components/home/GettingStartedSection"
import HomeSummarySection from "@/components/home/HomeSummarySection"
import { loadHomepageData } from "@/lib/loaders/homepage"

export default async function HomePage() {
  const {
    user,
    summary,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  } = await loadHomepageData()

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 md:px-6 md:py-8">
      <section className="mb-6 hidden md:block">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Home
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Tunes App
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Keep track of the tunes you know, the ones you’re practising, and
              the lists that organise them.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-xs text-right text-sm">
              <p className="font-semibold text-foreground">Signed in</p>
              <p className="truncate text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <GettingStartedSection state={gettingStartedState} />

      <HomeSummarySection
        summary={summary}
        recentFriendActivity={recentFriendActivity}
        streakSummary={streakSummary}
      />
    </main>
  )
}
