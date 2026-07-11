import GettingStartedSection from "@/components/home/GettingStartedSection"
import HomeSummarySection from "@/components/home/HomeSummarySection"
import PageHeader from "@/components/ui/PageHeader"
import { loadHomepageData } from "@/lib/loaders/homepage"

export default async function HomePage() {
  const {
    summary,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  } = await loadHomepageData()

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 md:px-6 md:py-8">
      <PageHeader title="Home" className="hidden md:flex" />

      <GettingStartedSection state={gettingStartedState} />

      <HomeSummarySection
        summary={summary}
        recentFriendActivity={recentFriendActivity}
        streakSummary={streakSummary}
      />
    </main>
  )
}
