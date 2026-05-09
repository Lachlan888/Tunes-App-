import Link from "next/link"
import HomeBadgesPanel from "@/components/home/HomeBadgesPanel"
import HomeFriendsActivityBox from "@/components/home/HomeFriendsActivityBox"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"

type HomeSummarySectionProps = {
  summary: HomeSummaryData
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
          {meta ? (
            <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          ) : null}
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
  summary,
  recentFriendActivity,
  streakSummary,
}: HomeSummarySectionProps) {
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
            value={summary.knownCount}
            helper="Tunes already in your hands."
            tone="success"
          />

          <OverviewCard
            href="/library/practice"
            label="Practice"
            value={summary.practiceCount}
            helper="Tunes inside the review system."
            tone="practice"
          />

          <OverviewCard
            href="/review#due-today"
            label="Due today"
            value={summary.dueTodayCount}
            helper="Scheduled reviews for today."
            tone="due"
          />

          <OverviewCard
            href="/review?mode=catch-up#catch-up"
            label="Attention"
            value={summary.needsAttentionCount}
            helper="Overdue tunes waiting for catch-up."
            tone="warning"
          />

          <OverviewCard
            href="/learning-lists"
            label="Lists"
            value={summary.listCount}
            helper="Collections, plans, and repertoire shelves."
            tone="neutral"
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(22rem,1fr)]">
        <div className="space-y-4">
          <PreviewPanel
            title="Due next"
            href="/review#due-today"
            linkLabel="View all"
          >
            {summary.dueTodayPreview.length === 0 ? (
              <EmptyPreview>Nothing due today.</EmptyPreview>
            ) : (
              <ul className="space-y-3">
                {summary.dueTodayPreview.map((userPiece) => (
                  <li key={userPiece.user_piece_id}>
                    <PreviewLink
                      href={`/library/${userPiece.piece_id}`}
                      title={userPiece.title}
                      meta={`Stage ${userPiece.stage}`}
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
            {summary.inPracticePreview.length === 0 ? (
              <EmptyPreview>No tunes in practice yet.</EmptyPreview>
            ) : (
              <ul className="space-y-3">
                {summary.inPracticePreview.map((userPiece) => (
                  <li key={userPiece.user_piece_id}>
                    <PreviewLink
                      href={`/library/${userPiece.piece_id}`}
                      title={userPiece.title}
                      meta={`Stage ${userPiece.stage}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </PreviewPanel>
        </div>

        <div className="space-y-4">
          <StreakSummarySection streakSummary={streakSummary} />

          <HomeBadgesPanel badgeSummary={summary.badgeSummary} />

          <PreviewPanel
            title="Your lists"
            href="/learning-lists"
            linkLabel="View all"
          >
            {summary.listPreview.length === 0 ? (
              <EmptyPreview>No lists yet.</EmptyPreview>
            ) : (
              <ul className="space-y-3">
                {summary.listPreview.map((learningList) => (
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
        </div>

        <div className="space-y-4">
          <HomeFriendsActivityBox items={recentFriendActivity} />
        </div>
      </section>
    </section>
  )
}