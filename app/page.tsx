import GettingStartedSection from "@/components/home/GettingStartedSection"
import HomeSummarySection from "@/components/home/HomeSummarySection"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import { loadHomepageData } from "@/lib/loaders/homepage"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { HOME_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type HomePageProps = {
  searchParams?: Promise<{
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getStatusMessage(pageOptions: string) {
  if (pageOptions === "saved") return "Home page options saved."
  if (pageOptions === "reset") return "Home page options reset."
  if (pageOptions === "error") return "Could not save page options."

  return null
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const homePreferences = await loadPagePreferences(
    HOME_PAGE_OPTIONS_CONFIG.pageKey
  )

  const {
    user,
    summary,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  } = await loadHomepageData()

  const statusMessage = getStatusMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

  const showGettingStarted =
    homePreferences.visibleSections.getting_started ?? true

  const showSignedInCard =
    homePreferences.visibleSections.signed_in_card ?? true

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 md:px-6 md:py-8">
      {statusMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {statusMessage}
        </div>
      ) : null}

      <section className="mb-8 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
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

          <div className="flex flex-wrap items-end gap-3">
            {showSignedInCard ? (
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm">
                <p className="font-semibold text-foreground">Signed in</p>
                <p className="mt-1 text-muted-foreground">{user.email}</p>
              </div>
            ) : null}

            <PageOptionsModal
              config={HOME_PAGE_OPTIONS_CONFIG}
              preferences={homePreferences}
              redirectTo="/"
            />
          </div>
        </div>
      </section>

      {showGettingStarted ? (
        <GettingStartedSection state={gettingStartedState} />
      ) : null}

      <HomeSummarySection
        summary={summary}
        recentFriendActivity={recentFriendActivity}
        streakSummary={streakSummary}
        homePreferences={homePreferences}
      />
    </main>
  )
}