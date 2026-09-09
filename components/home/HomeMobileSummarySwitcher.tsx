"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import SocialActivityFeed from "@/components/activity/SocialActivityFeed"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import MobileViewSwitcher from "@/components/ui/MobileViewSwitcher"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"

type MobileHomeTab = "today" | "repertoire" | "social"
type HomeDensity = "compact" | "standard" | "spacious"

type HomeMobileSummarySwitcherProps = {
  summary: HomeSummaryData
  recentFriendActivity: FriendActivityItem[]
  streakSummary: StreakSummary
  density: HomeDensity
}

type MobileRowProps = {
  href?: string
  title: string
  meta?: string
  detail?: string
  actionLabel?: string
}

const tabs: { id: MobileHomeTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "repertoire", label: "Repertoire" },
  { id: "social", label: "Social" },
]

const HOME_TAB_STORAGE_KEY = "tunes.home.mobile-view"
const HOME_TAB_CHANGE_EVENT = "tunes:home-view-change"

function isMobileHomeTab(value: string | null): value is MobileHomeTab {
  return value === "today" || value === "repertoire" || value === "social"
}

function getStoredHomeTab(): MobileHomeTab {
  const value = window.localStorage.getItem(HOME_TAB_STORAGE_KEY)
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
  window.localStorage.setItem(HOME_TAB_STORAGE_KEY, tab)
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
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function MobilePanel({ children }: { children: React.ReactNode }) {
  return <section className="border-y border-border/70 py-4">{children}</section>
}

function MobileStatGrid({
  items,
}: {
  items: { label: string; value: number; href: string }[]
}) {
  return (
    <div className="grid grid-cols-2 border-y border-hairline">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex min-h-16 items-center justify-between gap-2 px-3 py-2 odd:border-r odd:border-hairline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)]"
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
    <p className="border-y border-dashed border-border py-4 text-sm leading-6 text-muted-foreground">
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
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-b-0">
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
        <span className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground">
          {actionLabel}
        </span>
      ) : null}
    </div>
  )

  if (!href) return content

  return (
    <Link
      href={href}
      className="block focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      {content}
    </Link>
  )
}

function MobileSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: MobileHomeTab
  onChange: (tab: MobileHomeTab) => void
}) {
  return (
    <MobileViewSwitcher
      value={activeTab}
      options={tabs}
      onChange={onChange}
    />
  )
}

function TodayPanel({
  summary,
  streakSummary,
  density,
}: {
  summary: HomeSummaryData
  streakSummary: StreakSummary
  density: HomeDensity
}) {
  const previewLimit = getPreviewLimit(density)
  const continueTune = summary.dueTodayPreview[0] ?? summary.inPracticePreview[0]
  const queuedTune = summary.learningQueuePreview[0]
  const continueHref = summary.dueTodayCount > 0
    ? "/review?session=due-today"
    : summary.needsAttentionCount > 0
      ? "/review?session=catch-up"
      : continueTune
        ? `/library/${continueTune.piece_id}`
        : queuedTune
          ? `/library/${queuedTune.piece_id}`
          : "/review"
  const continueTitle = summary.needsAttentionCount > 0 && summary.dueTodayCount === 0
    ? "Continue catch-up"
    : continueTune?.title ?? queuedTune?.title ?? "Open today’s practice"
  const continueMeta = summary.needsAttentionCount > 0 && summary.dueTodayCount === 0
    ? `${summary.needsAttentionCount} overdue tune${summary.needsAttentionCount === 1 ? "" : "s"} · oldest first`
    : continueTune
      ? summary.dueTodayPreview[0]?.piece_id === continueTune.piece_id
        ? `Due today · Stage ${continueTune.stage}`
        : `In practice · Stage ${continueTune.stage}`
      : queuedTune
        ? `Next from ${queuedTune.firstListName}`
        : "Your practice room is ready"
  const dueQueuePreview = summary.dueTodayPreview.slice(1, Math.min(previewLimit, 3))
  const learningQueuePreview = dueQueuePreview.length === 0
    ? summary.learningQueuePreview.slice(continueTune || queuedTune ? 1 : 0, 2)
    : []

  return (
    <div className="space-y-4">
      <section className="rounded-object border border-hairline bg-surface-paper p-4 shadow-material-rest">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Continue</p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-text-primary">{continueTitle}</h2>
        <p className="mt-1 text-sm text-text-muted">{continueMeta}</p>
        <Link href={continueHref} className={`${buttonStyles.primary} mt-4`}>
          {summary.dueTodayCount > 0 || summary.needsAttentionCount > 0
            ? "Continue Practice"
            : continueTune || queuedTune
              ? "Open tune"
              : "Start Practice"}
        </Link>
      </section>

      <section className="space-y-2">
        <MobileSectionHeading title="Up next" action={<Link href="/review" className={buttonStyles.text}>View practice</Link>} />

        {dueQueuePreview.length === 0 && learningQueuePreview.length === 0 ? (
          <MobileEmptyBlock>No more tunes are due today.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {dueQueuePreview.map((userPiece) => (
                <MobileRow
                  key={userPiece.user_piece_id}
                  href={`/library/${userPiece.piece_id}`}
                  title={userPiece.title}
                  meta={`Stage ${userPiece.stage}`}
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
        )}
      </section>

      <MobileStatGrid
        items={[
          { label: "Due today", value: summary.dueTodayCount, href: "/review?session=due-today" },
          { label: "Needs attention", value: summary.needsAttentionCount, href: "/review?session=catch-up" },
        ]}
      />

      <StreakSummarySection streakSummary={streakSummary} />
    </div>
  )
}

function RepertoirePanel({
  summary,
  density,
}: {
  summary: HomeSummaryData
  density: HomeDensity
}) {
  const previewLimit = getPreviewLimit(density)
  const recentTunes = summary.inPracticePreview.slice(0, previewLimit)
  const recentBadges = [
    ...summary.badgeSummary.recentReceivedBadges.map((badge) => ({ ...badge, kind: "Badge received" })),
    ...summary.badgeSummary.recentCreatedBadges.map((badge) => ({ ...badge, kind: "Badge created" })),
  ].slice(0, Math.max(0, previewLimit - recentTunes.length))

  return (
    <div className="space-y-5">
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
                label: "Practice",
                value: summary.practiceCount,
                href: "/library/practice",
              },
              {
                label: "Lists",
                value: summary.listCount,
                href: "/learning-lists",
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

      <section className="space-y-2">
        <MobileSectionHeading title="Recent changes" action={<Link href="/library" className={buttonStyles.text}>View tunes</Link>} />

        {recentTunes.length === 0 && recentBadges.length === 0 ? (
          <MobileEmptyBlock>Your recent repertoire changes will appear here.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {recentTunes.map((userPiece) => (
                <MobileRow
                  key={userPiece.user_piece_id}
                  href={`/library/${userPiece.piece_id}`}
                  title={userPiece.title}
                  meta={`In practice · Stage ${userPiece.stage}`}
                />
              ))}
            {recentBadges.map((badge) => (
              <MobileRow
                key={`${badge.kind}-${badge.id}`}
                href={`/badges/${badge.slug}`}
                title={badge.name}
                meta={badge.kind}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SocialPanel({
  recentFriendActivity,
}: {
  recentFriendActivity: FriendActivityItem[]
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
          redirectTo="/"
          limit={5}
        />
      </section>
    </div>
  )
}

export default function HomeMobileSummarySwitcher({
  summary,
  recentFriendActivity,
  streakSummary,
  density,
}: HomeMobileSummarySwitcherProps) {
  const activeTab = useSyncExternalStore(
    subscribeToHomeTab,
    getStoredHomeTab,
    getServerHomeTab
  )

  return (
    <section className="space-y-4 md:hidden">
      <MobileSwitcher activeTab={activeTab} onChange={persistHomeTab} />

      {activeTab === "today" ? (
        <TodayPanel
          summary={summary}
          streakSummary={streakSummary}
          density={density}
        />
      ) : null}

      {activeTab === "repertoire" ? (
        <RepertoirePanel summary={summary} density={density} />
      ) : null}

      {activeTab === "social" ? (
        <SocialPanel recentFriendActivity={recentFriendActivity} />
      ) : null}
    </section>
  )
}
