import Link from "next/link"
import HomeFriendsActivityBox from "@/components/home/HomeFriendsActivityBox"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type {
  LearningList,
  Piece,
  StreakSummary,
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

type HomeSummarySectionProps = {
  pieces: Piece[] | null
  userPieces: UserPiece[] | null
  userKnownPieces: UserKnownPiece[] | null
  learningLists: LearningList[] | null
  dueToday: UserPiece[] | null
  needsAttentionCount: number
  recentFriendActivity: FriendActivityItem[]
  streakSummary: StreakSummary
}

type OverviewCardProps = {
  href: string
  label: string
  value: number
  helper: string
}

function OverviewCard({ href, label, value, helper }: OverviewCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border p-4 transition hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-2 text-sm text-gray-600">{helper}</p>
        </div>

        <span
          aria-hidden="true"
          className="text-sm text-gray-400 transition group-hover:text-gray-600"
        >
          →
        </span>
      </div>
    </Link>
  )
}

export default function HomeSummarySection({
  pieces,
  userPieces,
  userKnownPieces,
  learningLists,
  dueToday,
  needsAttentionCount,
  recentFriendActivity,
  streakSummary,
}: HomeSummarySectionProps) {
  const totalLists = learningLists?.length ?? 0
  const totalInPractice = userPieces?.length ?? 0
  const totalKnown = userKnownPieces?.length ?? 0
  const dueTodayItems = dueToday ?? []
  const dueTodayCount = dueTodayItems.length

  const dueTodayPreview = dueTodayItems.slice(0, 3)

  const inPracticePreview = [...(userPieces ?? [])]
    .sort((a, b) => {
      const aStage = a.stage ?? 999
      const bStage = b.stage ?? 999
      return aStage - bStage
    })
    .slice(0, 3)

  const listPreview = (learningLists ?? []).slice(0, 3)

  const pieceTitleById = new Map(
    (pieces ?? []).map((piece) => [piece.id, piece.title ?? "Untitled tune"])
  )

  return (
    <section className="space-y-8">
      <StreakSummarySection streakSummary={streakSummary} />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Overview</h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-semibold">Your repertoire</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <OverviewCard
                href="/library/known"
                label="Known tunes"
                value={totalKnown}
                helper="Tunes you have marked as already known."
              />

              <OverviewCard
                href="/library/practice"
                label="In practice"
                value={totalInPractice}
                helper="Tunes currently in your review system."
              />
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-semibold">Practice status</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <OverviewCard
                href="/review#due-today"
                label="Due today"
                value={dueTodayCount}
                helper="Reviews scheduled for today."
              />

              <OverviewCard
                href="/review?mode=catch-up#catch-up"
                label="Needs attention"
                value={needsAttentionCount}
                helper="Overdue tunes waiting for catch-up."
              />
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-semibold">Organisation</h3>

            <OverviewCard
              href="/learning-lists"
              label="Lists"
              value={totalLists}
              helper="Your tune collections and planning lists."
            />
          </section>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Due next</h3>
            <Link href="/review#due-today" className="text-sm underline">
              View all
            </Link>
          </div>

          {dueTodayPreview.length === 0 ? (
            <p className="text-sm text-gray-600">Nothing due today.</p>
          ) : (
            <ul className="space-y-2">
              {dueTodayPreview.map((userPiece) => (
                <li key={userPiece.id}>
                  <Link
                    href={`/library/${userPiece.piece_id}`}
                    className="group block rounded border p-3 transition hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium underline-offset-4 group-hover:underline">
                          {pieceTitleById.get(userPiece.piece_id) ??
                            "Untitled tune"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Stage {userPiece.stage ?? 1}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="text-sm text-gray-400 transition group-hover:text-gray-600"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Currently in practice</h3>
            <Link href="/library/practice" className="text-sm underline">
              View all
            </Link>
          </div>

          {inPracticePreview.length === 0 ? (
            <p className="text-sm text-gray-600">No tunes in practice yet.</p>
          ) : (
            <ul className="space-y-2">
              {inPracticePreview.map((userPiece) => (
                <li key={userPiece.id}>
                  <Link
                    href={`/library/${userPiece.piece_id}`}
                    className="group block rounded border p-3 transition hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium underline-offset-4 group-hover:underline">
                          {pieceTitleById.get(userPiece.piece_id) ??
                            "Untitled tune"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Stage {userPiece.stage ?? 1}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="text-sm text-gray-400 transition group-hover:text-gray-600"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Your lists</h3>
            <Link href="/learning-lists" className="text-sm underline">
              View all
            </Link>
          </div>

          {listPreview.length === 0 ? (
            <p className="text-sm text-gray-600">No lists yet.</p>
          ) : (
            <ul className="space-y-2">
              {listPreview.map((learningList) => (
                <li key={learningList.id}>
                  <Link
                    href={`/learning-lists/${learningList.id}`}
                    className="group block rounded border p-3 transition hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium underline-offset-4 group-hover:underline">
                        {learningList.name}
                      </p>
                      <span
                        aria-hidden="true"
                        className="text-sm text-gray-400 transition group-hover:text-gray-600"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <HomeFriendsActivityBox items={recentFriendActivity} />
      </section>
    </section>
  )
}