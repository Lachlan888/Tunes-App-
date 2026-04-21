import Link from "next/link"
import BacklogSummarySection from "@/components/BacklogSummarySection"
import HomeFriendsActivityBox from "@/components/HomeFriendsActivityBox"
import StreakSummarySection from "@/components/StreakSummarySection"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type {
  BacklogGroupSummary,
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
  backlogSummary: BacklogGroupSummary[]
  needsAttentionCount: number
  recentFriendActivity: FriendActivityItem[]
  streakSummary: StreakSummary
}

export default function HomeSummarySection({
  pieces,
  userPieces,
  userKnownPieces,
  learningLists,
  dueToday,
  backlogSummary,
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

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Due today</p>
            <p className="mt-1 text-3xl font-bold">{dueTodayCount}</p>
            <a href="/review" className="mt-3 inline-block text-sm underline">
              Go to Practice
            </a>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Needs attention</p>
            <p className="mt-1 text-3xl font-bold">{needsAttentionCount}</p>
            <a
              href="/review?mode=catch-up"
              className="mt-3 inline-block text-sm underline"
            >
              Catch up
            </a>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Known tunes</p>
            <p className="mt-1 text-3xl font-bold">{totalKnown}</p>
            <a href="/library" className="mt-3 inline-block text-sm underline">
              Open Tunes
            </a>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Lists</p>
            <p className="mt-1 text-3xl font-bold">{totalLists}</p>
            <a
              href="/learning-lists"
              className="mt-3 inline-block text-sm underline"
            >
              Open Lists
            </a>
          </div>
        </div>
      </section>

      {needsAttentionCount > 0 && (
        <BacklogSummarySection
          groups={backlogSummary}
          actionHref="/review?mode=catch-up"
          actionLabel="Catch up"
        />
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Due next</h3>
            <a href="/review" className="text-sm underline">
              View all
            </a>
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
            <a href="/review" className="text-sm underline">
              View all
            </a>
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
            <a href="/learning-lists" className="text-sm underline">
              View all
            </a>
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