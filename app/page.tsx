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
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Tunes App</h1>
      <p className="mb-6 text-gray-600">Logged in as {user.email}</p>

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