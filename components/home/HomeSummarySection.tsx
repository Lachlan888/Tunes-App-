import Link from "next/link"
import PendingLinkButton from "@/components/PendingLinkButton"
import HomeBadgesPanel from "@/components/home/HomeBadgesPanel"
import HomeFriendsActivityBox from "@/components/home/HomeFriendsActivityBox"
import HomeMobileSummarySwitcher from "@/components/home/HomeMobileSummarySwitcher"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import { joinClasses } from "@/components/ui/buttonStyles"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"
import type { PageOptionsPreferences } from "@/lib/page-options/types"

type HomeSummarySectionProps = {
  summary: HomeSummaryData
  recentFriendActivity: FriendActivityItem[]
  streakSummary: StreakSummary
  homePreferences: PageOptionsPreferences
}

type StatCardTone = "success" | "practice" | "due" | "warning" | "neutral"

type OverviewCardProps = {
  href: string
  label: string
  value: number
  helper: string
  tone?: StatCardTone
  density: PageOptionsPreferences["density"]
}

type PreviewPanelProps = {
  title: string
  href: string
  linkLabel: string
  density: PageOptionsPreferences["density"]
  children: React.ReactNode
}

function isSectionVisible(
  homePreferences: PageOptionsPreferences,
  sectionId: string
) {
  return homePreferences.visibleSections[sectionId] ?? true
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

function getCardPadding(density: PageOptionsPreferences["density"]) {
  if (density === "compact") return "p-4"
  if (density === "spacious") return "p-6"

  return "p-5"
}

function getPanelPadding(density: PageOptionsPreferences["density"]) {
  if (density === "compact") return "p-4"
  if (density === "spacious") return "p-6"

  return "p-5"
}

function getPreviewRowPadding(density: PageOptionsPreferences["density"]) {
  if (density === "compact") return "p-3"
  if (density === "spacious") return "p-5"

  return "p-4"
}

function getPreviewLimit(density: PageOptionsPreferences["density"]) {
  if (density === "spacious") return 2
  if (density === "compact") return 5

  return 3
}

function getLowerGridClass(homePreferences: PageOptionsPreferences) {
  switch (homePreferences.columnMode) {
    case "compact":
      return "grid gap-4"
    case "comfortable":
      return "grid gap-4 xl:grid-cols-2"
    case "wide":
      return "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(22rem,1fr)]"
    case "auto":
    default:
      return "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(22rem,1fr)]"
  }
}

function getLearningQueueMeta(options: {
  firstListName: string
  listNames: string[]
}) {
  if (options.listNames.length <= 1) {
    return `In: ${options.firstListName}`
  }

  return `In: ${options.firstListName} + ${options.listNames.length - 1} more`
}

function OverviewCard({
  href,
  label,
  value,
  helper,
  tone = "neutral",
  density,
}: OverviewCardProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "group block rounded-2xl border border-border border-l-8 bg-card shadow-sm transition hover:-translate-y-0.5 hover:bg-card-strong hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
        getCardPadding(density),
        getToneClasses(tone)
      )}
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

function PreviewPanel({
  title,
  href,
  linkLabel,
  density,
  children,
}: PreviewPanelProps) {
  return (
    <section
      className={joinClasses(
        "rounded-2xl border border-border bg-card shadow-sm",
        getPanelPadding(density)
      )}
    >
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
  density,
}: {
  href: string
  title: string
  meta?: string
  density: PageOptionsPreferences["density"]
}) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "group block rounded-xl border border-border bg-background/70 transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
        getPreviewRowPadding(density)
      )}
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

function TodayActionPanel({
  summary,
  density,
  previewLimit,
}: {
  summary: HomeSummaryData
  density: PageOptionsPreferences["density"]
  previewLimit: number
}) {
  return (
    <section
      className={joinClasses(
        "hidden rounded-2xl border border-border bg-card shadow-sm md:block",
        getPanelPadding(density)
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Today
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Practice action state
          </h2>
        </div>

        <PendingLinkButton
          href="/review#due-today"
          label="Start Practice"
          pendingLabel="Opening Practice..."
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/review#due-today"
            className="rounded-xl border border-border border-l-8 border-l-accent bg-background/70 p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Due today
            </p>
            <p className="mt-2 font-serif text-4xl font-bold leading-none">
              {summary.dueTodayCount}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Scheduled reviews ready now.
            </p>
          </Link>

          <Link
            href="/review?mode=catch-up#catch-up"
            className="rounded-xl border border-border border-l-8 border-l-warning-strong bg-background/70 p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Attention
            </p>
            <p className="mt-2 font-serif text-4xl font-bold leading-none">
              {summary.needsAttentionCount}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Overdue tunes for catch-up.
            </p>
          </Link>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-foreground">Due next</p>
            <Link
              href="/review#due-today"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              View all
            </Link>
          </div>

          {summary.dueTodayPreview.length === 0 ? (
            <EmptyPreview>Nothing due today.</EmptyPreview>
          ) : (
            <ul className="space-y-3">
              {summary.dueTodayPreview
                .slice(0, previewLimit)
                .map((userPiece) => (
                  <li key={userPiece.user_piece_id}>
                    <PreviewLink
                      href={`/library/${userPiece.piece_id}`}
                      title={userPiece.title}
                      meta={`Stage ${userPiece.stage}`}
                      density={density}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default function HomeSummarySection({
  summary,
  recentFriendActivity,
  streakSummary,
  homePreferences,
}: HomeSummarySectionProps) {
  const density = homePreferences.density
  const previewLimit = getPreviewLimit(density)
  const showRepertoireState = isSectionVisible(
    homePreferences,
    "repertoire_state"
  )
  const showLearningQueue = isSectionVisible(homePreferences, "learning_queue")
  const showDueNext = isSectionVisible(homePreferences, "due_next")
  const showCurrentlyInPractice = isSectionVisible(
    homePreferences,
    "currently_in_practice"
  )
  const showCurrentlyInPracticePanel =
    showCurrentlyInPractice && !showRepertoireState

  return (
    <section className="space-y-5 md:space-y-8">
      <HomeMobileSummarySwitcher
        summary={summary}
        recentFriendActivity={recentFriendActivity}
        streakSummary={streakSummary}
        homePreferences={homePreferences}
      />

      {showDueNext ? (
        <TodayActionPanel
          summary={summary}
          density={density}
          previewLimit={previewLimit}
        />
      ) : null}

      {showRepertoireState ? (
        <section className="hidden md:block">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Repertoire state
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <OverviewCard
              href="/library/known"
              label="Known"
              value={summary.knownCount}
              helper="Tunes already in your hands."
              tone="success"
              density={density}
            />

            <OverviewCard
              href="/library/practice"
              label="In practice"
              value={summary.practiceCount}
              helper="Tunes inside Stage review."
              tone="practice"
              density={density}
            />

            <OverviewCard
              href="/learning-lists"
              label="Lists"
              value={summary.listCount}
              helper="Collections, plans, and repertoire shelves."
              tone="neutral"
              density={density}
            />
          </div>
        </section>
      ) : null}

      <section
        className={joinClasses(
          "hidden md:grid",
          getLowerGridClass(homePreferences)
        )}
      >
        {showLearningQueue || showCurrentlyInPracticePanel ? (
          <div className="space-y-4">
            {showLearningQueue ? (
              <PreviewPanel
                title="Learning queue"
                href="/learning-lists"
                linkLabel="Open queue"
                density={density}
              >
                {summary.learningQueuePreview.length === 0 ? (
                  <EmptyPreview>
                    No saved tunes waiting to start. Add tunes to lists before
                    starting Practice to build this queue.
                  </EmptyPreview>
                ) : (
                  <ul className="space-y-3">
                    {summary.learningQueuePreview
                      .slice(0, previewLimit)
                      .map((queueTune) => (
                        <li key={queueTune.piece_id}>
                          <PreviewLink
                            href={`/library/${queueTune.piece_id}`}
                            title={queueTune.title}
                            meta={getLearningQueueMeta({
                              firstListName: queueTune.firstListName,
                              listNames: queueTune.listNames,
                            })}
                            density={density}
                          />
                        </li>
                      ))}
                  </ul>
                )}
              </PreviewPanel>
            ) : null}

            {showCurrentlyInPracticePanel ? (
              <PreviewPanel
                title="Currently in practice"
                href="/library/practice"
                linkLabel="View all"
                density={density}
              >
                {summary.inPracticePreview.length === 0 ? (
                  <EmptyPreview>No tunes in practice yet.</EmptyPreview>
                ) : (
                  <ul className="space-y-3">
                    {summary.inPracticePreview
                      .slice(0, previewLimit)
                      .map((userPiece) => (
                        <li key={userPiece.user_piece_id}>
                          <PreviewLink
                            href={`/library/${userPiece.piece_id}`}
                            title={userPiece.title}
                            meta={`Stage ${userPiece.stage}`}
                            density={density}
                          />
                        </li>
                      ))}
                  </ul>
                )}
              </PreviewPanel>
            ) : null}
          </div>
        ) : null}

        {isSectionVisible(homePreferences, "streaks") ||
        isSectionVisible(homePreferences, "badges") ||
        isSectionVisible(homePreferences, "lists") ? (
          <div className="space-y-4">
            {isSectionVisible(homePreferences, "streaks") ? (
              <StreakSummarySection streakSummary={streakSummary} />
            ) : null}

            {isSectionVisible(homePreferences, "badges") ? (
              <HomeBadgesPanel badgeSummary={summary.badgeSummary} />
            ) : null}

            {isSectionVisible(homePreferences, "lists") ? (
              <PreviewPanel
                title="Your lists"
                href="/learning-lists"
                linkLabel="View all"
                density={density}
              >
                {summary.listPreview.length === 0 ? (
                  <EmptyPreview>No lists yet.</EmptyPreview>
                ) : (
                  <ul className="space-y-3">
                    {summary.listPreview
                      .slice(0, previewLimit)
                      .map((learningList) => (
                        <li key={learningList.id}>
                          <PreviewLink
                            href={`/learning-lists/${learningList.id}`}
                            title={learningList.name}
                            density={density}
                          />
                        </li>
                      ))}
                  </ul>
                )}
              </PreviewPanel>
            ) : null}
          </div>
        ) : null}

        {isSectionVisible(homePreferences, "friend_activity") ? (
          <div className="space-y-4">
            <HomeFriendsActivityBox items={recentFriendActivity} />
          </div>
        ) : null}
      </section>
    </section>
  )
}
