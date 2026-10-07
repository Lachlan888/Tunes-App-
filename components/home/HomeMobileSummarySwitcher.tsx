"use client"

import { preferenceStorage } from "@/lib/browser-storage"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import SocialActivityFeed from "@/components/activity/SocialActivityFeed"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import ResponsivePanels from "@/components/layout/ResponsivePanels"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { FriendActivityItem } from "@/lib/friend-activity"
import { formatPracticeDate, getReviewIntervalDays } from "@/lib/review"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"

type MobileHomeTab = "today" | "repertoire" | "social"
type HomeDensity = "compact" | "standard" | "spacious"

type HomeMobileSummarySwitcherProps = {
  summary: HomeSummaryData
  currentUserId: string
  recentFriendActivity: FriendActivityItem[]
  activityNextCursor: string | null
  streakSummary: StreakSummary
  density: HomeDensity
  leadingContent?: React.ReactNode
}

type MobileRowProps = {
  href?: string
  title: string
  meta?: string
  detail?: string
  actionLabel?: string
}

const HOME_TAB_STORAGE_KEY = "tunes.home.mobile-view"
const HOME_TAB_CHANGE_EVENT = "tunes:home-view-change"

function isMobileHomeTab(value: string | null): value is MobileHomeTab {
  return value === "today" || value === "repertoire" || value === "social"
}

function getStoredHomeTab(): MobileHomeTab {
  const value = preferenceStorage.getItem(HOME_TAB_STORAGE_KEY)
  return isMobileHomeTab(value) ? value : "today"
}

function getServerHomeTab(): MobileHomeTab {
  return "today"
}

function subscribeToHomeTab(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === HOME_TAB_STORAGE_KEY) onStoreChange()
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(HOME_TAB_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(HOME_TAB_CHANGE_EVENT, onStoreChange)
  }
}

function persistHomeTab(tab: MobileHomeTab) {
  preferenceStorage.setItem(HOME_TAB_STORAGE_KEY, tab)
  window.dispatchEvent(new Event(HOME_TAB_CHANGE_EVENT))
}

function getPreviewLimit(density: HomeDensity) {
  if (density === "spacious") return 4
  if (density === "compact") return 3

  return 3
}

function MobileSectionHeading({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-1">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function MobilePanel({ children }: { children: React.ReactNode }) {
  return <section className="border-t border-hairline py-5 first:border-t-0 first:pt-0">{children}</section>
}

function MobileStatGrid({
  items,
}: {
  items: { label: string; value: number; href: string }[]
}) {
  return (
    <div className="grid grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-2 odd:border-r odd:border-hairline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)]"
        >
          <p className="text-sm font-semibold text-foreground">{item.label}</p>

          <p className="font-serif text-2xl font-bold leading-none text-foreground">
            {item.value}
          </p>
        </Link>
      ))}
    </div>
  )
}

function MobileEmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-4 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  )
}

function MobileRow({
  href,
  title,
  meta,
  detail,
  actionLabel = "Open",
}: MobileRowProps) {
  const content = (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="line-clamp-2 text-base font-semibold leading-6 text-foreground">
          {title}
        </p>

        {meta ? (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{meta}</p>
        ) : null}

        {detail ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {detail}
          </p>
        ) : null}
      </div>

      {href ? (
        <span className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-muted-foreground underline underline-offset-4">
          {actionLabel}
        </span>
      ) : null}
    </div>
  )

  if (!href) return <div className="border-b border-hairline last:border-b-0">{content}</div>

  return (
    <Link
      href={href}
      className="block border-b border-hairline last:border-b-0 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      {content}
    </Link>
  )
}

function TodayPanel({
  summary,
  density,
}: {
  summary: HomeSummaryData
  density: HomeDensity
}) {
  const previewLimit = getPreviewLimit(density)
  const readyCount = summary.dueTodayCount + summary.needsAttentionCount
  const hasRepertoire = summary.knownCount + summary.practiceCount > 0
  const queuedTune = summary.learningQueuePreview[0]
  const continueHref = readyCount > 0
    ? "/review"
    : queuedTune
      ? `/library/${queuedTune.piece_id}`
      : hasRepertoire
        ? summary.practiceCount > 0 ? "/library/practice" : "/library/known"
        : "/library"
  const continueTitle = readyCount > 0
    ? summary.dueTodayCount === 0 ? "Practice catch-up" : "Practice is ready"
    : queuedTune
      ? queuedTune.title
      : hasRepertoire ? "You’re caught up" : "Find a tune"
  const continueMeta = readyCount > 0
    ? summary.dueTodayCount === 0
      ? `${summary.needsAttentionCount} overdue tune${summary.needsAttentionCount === 1 ? "" : "s"} · oldest first`
      : `${readyCount} tune${readyCount === 1 ? "" : "s"} ready`
    : queuedTune
      ? `Saved in ${queuedTune.firstListName} · choose whether to practise it`
      : hasRepertoire ? "Your next reviews will appear here when due." : "Explore Tunes to start your repertoire."
  const dueQueuePreview = summary.dueTodayCount > 0
    ? summary.dueTodayPreview.slice(0, previewLimit)
    : summary.needsAttentionCount > 0
      ? summary.inPracticePreview.slice(0, previewLimit)
      : []
  const learningQueuePreview = readyCount === 0 ? summary.learningQueuePreview.slice(queuedTune ? 1 : 0, 2) : []
  const hasPreview = dueQueuePreview.length > 0 || learningQueuePreview.length > 0

  return (
    <div>
      <section className="py-5">
        <h2 className="mt-2 font-sans text-2xl font-bold leading-tight text-text-primary">{continueTitle}</h2>
        <p className="mt-1 text-sm text-text-muted">{continueMeta}</p>
        <Link href={continueHref} className={`${buttonStyles.primary} mt-4`}>
          {readyCount > 0
            ? summary.dueTodayCount === 0 ? "Catch up on Practice" : "Continue Practice"
            : queuedTune ? "Open tune" : hasRepertoire ? "View repertoire" : "Find a tune"}
        </Link>
      </section>

      {hasPreview ? <section className="space-y-2 border-t border-hairline py-5">
        <MobileSectionHeading title="Up next" action={readyCount > 0 ? <Link href="/review" className={buttonStyles.text}>View practice</Link> : null} />

          <div className="border-t border-hairline">
            {dueQueuePreview.map((userPiece) => (
                <MobileRow
                  key={userPiece.user_piece_id}
                  href={`/library/${userPiece.piece_id}`}
                  title={userPiece.title}
                  meta={`${getReviewIntervalDays(userPiece.stage)}-day review`}
                />
              ))}
            {learningQueuePreview.map((queueTune) => (
              <MobileRow
                key={queueTune.piece_id}
                href={`/library/${queueTune.piece_id}`}
                title={queueTune.title}
                meta={`From ${queueTune.firstListName}`}
              />
            ))}
          </div>
      </section> : null}

      {summary.dueTodayCount > 0 && summary.needsAttentionCount > 0 ? <section className="border-t border-hairline py-5"><MobileStatGrid
        items={[
          { label: "Due today", value: summary.dueTodayCount, href: "/review" },
          { label: "Overdue", value: summary.needsAttentionCount, href: "/review" },
        ]}
      /></section> : null}

    </div>
  )
}

function RepertoirePanel({
  summary,
  streakSummary,
}: {
  summary: HomeSummaryData
  streakSummary: StreakSummary
}) {
  const hasTuneEntries = summary.knownCount > 0 || summary.practiceCount > 0 || summary.learningQueueCount > 0
  const hasStreakHistory = streakSummary.current_revision_streak > 0 || streakSummary.longest_revision_streak > 0 || streakSummary.current_practice_streak > 0 || streakSummary.longest_practice_streak > 0
  return (
    <div>
      <MobilePanel>
        <MobileSectionHeading title="Repertoire" />

        <div className="mt-4">
          <MobileStatGrid
            items={[
              {
                label: "Known",
                value: summary.knownCount,
                href: "/library/known",
              },
              {
                label: "Currently practising",
                value: summary.practiceCount,
                href: "/library/practice",
              },
              {
                label: "Learning queue",
                value: summary.learningQueueCount,
                href: "/learning-lists?view=learning-queue",
              },
              {
                label: "Badges",
                value: summary.badgeSummary.receivedCount,
                href: "/badges",
              },
            ]}
          />
        </div>
      </MobilePanel>

      {!hasTuneEntries ? <p className="text-sm leading-6 text-text-muted">Your repertoire will grow here. <Link href="/library" className={buttonStyles.text}>Browse tunes</Link></p> : <>

      <MobilePanel>
        <MobileSectionHeading
          title="Learning queue"
          action={<Link href="/learning-lists?view=learning-queue" className={buttonStyles.text}>View all</Link>}
        />
        <div className="mt-3">
          {summary.learningQueuePreview.length === 0 ? (
            <MobileEmptyBlock>Tunes saved to your lists appear here until you start practising or mark them Known.</MobileEmptyBlock>
          ) : summary.learningQueuePreview.map((queueTune) => (
            <MobileRow
              key={queueTune.piece_id}
              href={`/library/${queueTune.piece_id}`}
              title={queueTune.title}
              meta={`From ${queueTune.firstListName}`}
              actionLabel="Open"
            />
          ))}
        </div>
      </MobilePanel>

      <MobilePanel>
        <MobileSectionHeading
          title="Currently practising"
          action={<Link href="/library/practice" className={buttonStyles.text}>View all</Link>}
        />
        <div className="mt-3">
          {summary.inPracticePreview.length === 0 ? (
            <MobileEmptyBlock>No tunes are currently in Practice.</MobileEmptyBlock>
          ) : summary.inPracticePreview.map((userPiece) => (
            <MobileRow
              key={userPiece.user_piece_id}
              href={`/library/${userPiece.piece_id}`}
              title={userPiece.title}
              meta={`${getReviewIntervalDays(userPiece.stage)}-day review`}
              detail={formatPracticeDate(userPiece.nextReviewDue) ? `Next review ${formatPracticeDate(userPiece.nextReviewDue)}` : "No review date set"}
              actionLabel="Open"
            />
          ))}
        </div>
      </MobilePanel>

      </>}

      {hasTuneEntries || hasStreakHistory ? <StreakSummarySection streakSummary={streakSummary} /> : null}
    </div>
  )
}

function SocialPanel({
  recentFriendActivity,
  activityNextCursor,
  currentUserId,
}: {
  recentFriendActivity: FriendActivityItem[]
  activityNextCursor: string | null
  currentUserId: string
}) {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <MobileSectionHeading
          title="Friend activity"
          action={
            <Link href="/friends" className={buttonStyles.text}>
              Manage friends
            </Link>
          }
        />

        <SocialActivityFeed
          items={recentFriendActivity}
          currentUserId={currentUserId}
          redirectTo="/"
          initialNextCursor={activityNextCursor}
          scrollRegionLabel="Friend activity feed"
        />
      </section>
    </div>
  )
}

export default function HomeMobileSummarySwitcher({
  summary,
  currentUserId,
  recentFriendActivity,
  activityNextCursor,
  streakSummary,
  density,
  leadingContent,
}: HomeMobileSummarySwitcherProps) {
  const activeTab = useSyncExternalStore(
    subscribeToHomeTab,
    getStoredHomeTab,
    getServerHomeTab
  )

  return <ResponsivePanels
    className="home-workbench"
    label="Home views"
    showSwitcherLabel={false}
    leadingContent={leadingContent}
    active={activeTab}
    onChange={persistHomeTab}
    panels={[
      { id: "today", label: "Today", content: <TodayPanel summary={summary} density={density} /> },
      { id: "repertoire", label: "Repertoire", content: <RepertoirePanel summary={summary} streakSummary={streakSummary} /> },
      { id: "social", label: "Social", content: <SocialPanel recentFriendActivity={recentFriendActivity} activityNextCursor={activityNextCursor} currentUserId={currentUserId} /> },
    ]}
  />
}
