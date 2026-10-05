import GettingStartedSection from "@/components/home/GettingStartedSection"
import HomeSummarySection from "@/components/home/HomeSummarySection"
import FestivalPromotion from "@/components/home/FestivalPromotion"
import PageHeader from "@/components/ui/PageHeader"
import { loadFestivalPromotion } from "@/lib/loaders/festivals"
import { loadHomepageData } from "@/lib/loaders/homepage"

export default async function HomePage() {
  const [homepageData, promotion] = await Promise.all([
    loadHomepageData(),
    loadFestivalPromotion(),
  ])
  const {
    summary,
    recentFriendActivity,
    activityNextCursor,
    streakSummary,
    gettingStartedState,
  } = homepageData

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-5 pt-0 md:px-6 md:py-8">
      <PageHeader title="Home" />

      <HomeSummarySection
        summary={summary}
        recentFriendActivity={recentFriendActivity}
        activityNextCursor={activityNextCursor}
        streakSummary={streakSummary}
        leadingContent={promotion.festival ? <FestivalPromotion festival={promotion.festival} /> : null}
      />

      <GettingStartedSection state={gettingStartedState} />
    </main>
  )
}
