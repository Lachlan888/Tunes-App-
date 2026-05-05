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

type StatCardTone = "success" | "practice" | "due" | "warning" | "neutral"

type OverviewCardProps = {
  href: string
  label: string
  value: number
  helper: string
  tone?: StatCardTone
}

function getToneClasses(tone: StatCardTone = "neutral") {
  switch (tone) {
    case "success":
      return "border-l-success"
    case "practice":
      return "border-l-primary"
    case "due":
      return "border-l-accent"
    case "warning":
      return "border-l-warning-strong"
    case "neutral":
    default:
      return "border-l-border"
  }
}

function OverviewCard({
  href,
  label,
  value,
  helper,
  tone = "neutral",
}: OverviewCardProps) {
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border border-border border-l-8 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-card-strong hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${getToneClasses(
        tone
      )}`}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 font-serif text-5xl font-bold leading-none text-foreground">
            {value}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="max-w-52 text-sm text-muted-foreground">{helper}</p>
          <span
            aria-hidden="true"
            className="text-lg text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}

type PreviewPanelProps = {
  title: string
  href: string
  linkLabel: string
  children: React.ReactNode
}

function PreviewPanel({
  title,
  href,
  linkLabel,
  children,
}: PreviewPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
        </div>

        <Link
          href={href}
          className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          {linkLabel}
        </Link>
      </div>

      {children}
    </section>
  )
}

function EmptyPreview({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
      {children}
    </p>
  )
}

function PreviewLink({
  href,
  title,
  meta,
}: {
  href: string
  title: string
  meta?: string
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold underline-offset-4 group-hover:underline">
            {title}
          </p>
          {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
        </div>
        <span
          aria-hidden="true"
          className="text-sm text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
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
      <section>
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Repertoire state
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <OverviewCard
            href="/library/known"
            label="Known"
            value={totalKnown}
            helper="Tunes already in your hands."
            tone="success"
          />

          <OverviewCard
            href="/library/practice"
            label="Practice"
            value={totalInPractice}
            helper="Tunes inside the review system."
            tone="practice"
          />

          <OverviewCard
            href="/review#due-today"
            label="Due today"
            value={dueTodayCount}
            helper="Scheduled reviews for today."
            tone="due"
          />

          <OverviewCard
            href="/review?mode=catch-up#catch-up"
            label="Attention"
            value={needsAttentionCount}
            helper="Overdue tunes waiting for catch-up."
            tone="warning"
          />

          <OverviewCard
            href="/learning-lists"
            label="Lists"
            value={totalLists}
            helper="Collections, plans, and repertoire shelves."
            tone="neutral"
          />
        </div>
      </section>

      <StreakSummarySection streakSummary={streakSummary} />

      <section className="grid gap-4 xl:grid-cols-2">
        <PreviewPanel title="Due next" href="/review#due-today" linkLabel="View all">
          {dueTodayPreview.length === 0 ? (
            <EmptyPreview>Nothing due today.</EmptyPreview>
          ) : (
            <ul className="space-y-3">
              {dueTodayPreview.map((userPiece) => (
                <li key={userPiece.id}>
                  <PreviewLink
                    href={`/library/${userPiece.piece_id}`}
                    title={
                      pieceTitleById.get(userPiece.piece_id) ?? "Untitled tune"
                    }
                    meta={`Stage ${userPiece.stage ?? 1}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </PreviewPanel>

        <PreviewPanel
          title="Currently in practice"
          href="/library/practice"
          linkLabel="View all"
        >
          {inPracticePreview.length === 0 ? (
            <EmptyPreview>No tunes in practice yet.</EmptyPreview>
          ) : (
            <ul className="space-y-3">
              {inPracticePreview.map((userPiece) => (
                <li key={userPiece.id}>
                  <PreviewLink
                    href={`/library/${userPiece.piece_id}`}
                    title={
                      pieceTitleById.get(userPiece.piece_id) ?? "Untitled tune"
                    }
                    meta={`Stage ${userPiece.stage ?? 1}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </PreviewPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PreviewPanel title="Your lists" href="/learning-lists" linkLabel="View all">
          {listPreview.length === 0 ? (
            <EmptyPreview>No lists yet.</EmptyPreview>
          ) : (
            <ul className="space-y-3">
              {listPreview.map((learningList) => (
                <li key={learningList.id}>
                  <PreviewLink
                    href={`/learning-lists/${learningList.id}`}
                    title={learningList.name}
                  />
                </li>
              ))}
            </ul>
          )}
        </PreviewPanel>

        <HomeFriendsActivityBox items={recentFriendActivity} />
      </section>
    </section>
  )
}