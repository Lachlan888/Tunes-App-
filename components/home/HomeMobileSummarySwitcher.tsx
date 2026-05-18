"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
} from "@/lib/friend-activity"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"
import type { PageOptionsPreferences } from "@/lib/page-options/types"

type MobileHomeTab = "today" | "repertoire" | "social"

type HomeMobileSummarySwitcherProps = {
  summary: HomeSummaryData
  recentFriendActivity: FriendActivityItem[]
  streakSummary: StreakSummary
  homePreferences: PageOptionsPreferences
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

function isSectionVisible(
  homePreferences: PageOptionsPreferences,
  sectionId: string
) {
  return homePreferences.visibleSections[sectionId] ?? true
}

function badgeCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getPreviewLimit(density: PageOptionsPreferences["density"]) {
  if (density === "spacious") return 4
  if (density === "compact") return 3

  return 3
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

function MobileSectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function MobilePanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card/80 p-4 shadow-sm">
      {children}
    </section>
  )
}

function MobileStatGrid({
  items,
}: {
  items: { label: string; value: number; href: string }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-2xl border border-border bg-background/60 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 font-serif text-3xl font-bold leading-none text-foreground">
            {item.value}
          </p>
        </Link>
      ))}
    </div>
  )
}

function MobileEmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
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
    <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 rounded-full border border-border bg-card-strong/70 p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={joinClasses(
                "rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MobileStreaks({ streakSummary }: { streakSummary: StreakSummary }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-2xl border border-border bg-background/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Revision
        </p>
        <p className="mt-2 font-serif text-3xl font-bold leading-none text-foreground">
          {streakSummary.current_revision_streak}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Longest {streakSummary.longest_revision_streak}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Practice
        </p>
        <p className="mt-2 font-serif text-3xl font-bold leading-none text-foreground">
          {streakSummary.current_practice_streak}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Longest {streakSummary.longest_practice_streak}
        </p>
      </div>
    </div>
  )
}

function TodayPanel({
  summary,
  streakSummary,
  homePreferences,
}: {
  summary: HomeSummaryData
  streakSummary: StreakSummary
  homePreferences: PageOptionsPreferences
}) {
  const previewLimit = getPreviewLimit(homePreferences.density)

  return (
    <div className="space-y-5">
      {isSectionVisible(homePreferences, "due_next") ||
      isSectionVisible(homePreferences, "repertoire_state") ? (
        <MobilePanel>
          <MobileSectionHeading
            title="Today"
            description={
              summary.dueTodayCount === 0 && summary.needsAttentionCount === 0
                ? "Nothing urgent today."
                : "Reviews and catch-up work needing attention."
            }
            action={
              <Link href="/review" className={buttonStyles.primary}>
                Practice
              </Link>
            }
          />

          <div className="mt-4">
            <MobileStatGrid
              items={[
                {
                  label: "Due",
                  value: summary.dueTodayCount,
                  href: "/review#due-today",
                },
                {
                  label: "Attention",
                  value: summary.needsAttentionCount,
                  href: "/review?mode=catch-up#catch-up",
                },
              ]}
            />
          </div>
        </MobilePanel>
      ) : null}

      {isSectionVisible(homePreferences, "streaks") ? (
        <MobilePanel>
          <MobileSectionHeading title="Streaks" />
          <div className="mt-4">
            <MobileStreaks streakSummary={streakSummary} />
          </div>
        </MobilePanel>
      ) : null}

      {isSectionVisible(homePreferences, "due_next") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Due next"
            description={
              summary.dueTodayPreview.length === 0
                ? "No due tunes waiting."
                : "The first few tunes waiting in Practice."
            }
          />

          {summary.dueTodayPreview.length === 0 ? (
            <MobileEmptyBlock>Nothing due today.</MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {summary.dueTodayPreview.slice(0, previewLimit).map((userPiece) => (
                <MobileRow
                  key={userPiece.user_piece_id}
                  href={`/library/${userPiece.piece_id}`}
                  title={userPiece.title}
                  meta={`Stage ${userPiece.stage}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function RepertoirePanel({
  summary,
  homePreferences,
}: {
  summary: HomeSummaryData
  homePreferences: PageOptionsPreferences
}) {
  const previewLimit = getPreviewLimit(homePreferences.density)

  const recentBadges = useMemo(
    () =>
      [
        ...summary.badgeSummary.recentReceivedBadges.map((badge) => ({
          ...badge,
          kind: "Received" as const,
        })),
        ...summary.badgeSummary.recentCreatedBadges.map((badge) => ({
          ...badge,
          kind: "Created" as const,
        })),
      ].slice(0, previewLimit),
    [
      summary.badgeSummary.recentCreatedBadges,
      summary.badgeSummary.recentReceivedBadges,
      previewLimit,
    ]
  )

  return (
    <div className="space-y-5">
      {isSectionVisible(homePreferences, "repertoire_state") ? (
        <MobilePanel>
          <MobileSectionHeading
            title="Repertoire state"
            description="Known tunes, active practice, and collections."
          />
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
      ) : null}

      {isSectionVisible(homePreferences, "currently_in_practice") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Currently in practice"
            description={`${summary.practiceCount} tune${
              summary.practiceCount === 1 ? "" : "s"
            } in the review system.`}
          />
          {summary.inPracticePreview.length === 0 ? (
            <MobileEmptyBlock>No tunes in practice yet.</MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {summary.inPracticePreview.slice(0, previewLimit).map((userPiece) => (
                <MobileRow
                  key={userPiece.user_piece_id}
                  href={`/library/${userPiece.piece_id}`}
                  title={userPiece.title}
                  meta={`Stage ${userPiece.stage}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {isSectionVisible(homePreferences, "learning_queue") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Learning queue"
            description="Tunes saved in lists before starting Practice."
          />
          {summary.learningQueuePreview.length === 0 ? (
            <MobileEmptyBlock>
              Add tunes to lists before starting Practice to build this queue.
            </MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {summary.learningQueuePreview.slice(0, previewLimit).map((queueTune) => (
                <MobileRow
                  key={queueTune.piece_id}
                  href={`/library/${queueTune.piece_id}`}
                  title={queueTune.title}
                  meta={getLearningQueueMeta({
                    firstListName: queueTune.firstListName,
                    listNames: queueTune.listNames,
                  })}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {isSectionVisible(homePreferences, "lists") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Your lists"
            description={`${summary.listCount} collection${
              summary.listCount === 1 ? "" : "s"
            }`}
            action={
              <Link href="/learning-lists" className={buttonStyles.secondary}>
                View
              </Link>
            }
          />
          {summary.listPreview.length === 0 ? (
            <MobileEmptyBlock>No lists yet.</MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {summary.listPreview.slice(0, previewLimit).map((learningList) => (
                <MobileRow
                  key={learningList.id}
                  href={`/learning-lists/${learningList.id}`}
                  title={learningList.name}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {isSectionVisible(homePreferences, "badges") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Badges"
            description={`${summary.badgeSummary.receivedCount} received · ${summary.badgeSummary.createdCount} created`}
            action={
              <Link href="/badges" className={buttonStyles.secondary}>
                View
              </Link>
            }
          />
          {recentBadges.length === 0 ? (
            <MobileEmptyBlock>No badges yet.</MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {recentBadges.map((badge) => (
                <MobileRow
                  key={`${badge.kind}-${badge.id}`}
                  href={`/badges/${badge.slug}`}
                  title={badge.name}
                  meta={`${badge.kind} · ${badgeCategoryLabel(badge.category)}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function SocialPanel({
  recentFriendActivity,
  homePreferences,
}: {
  recentFriendActivity: FriendActivityItem[]
  homePreferences: PageOptionsPreferences
}) {
  return (
    <div className="space-y-5">
      <MobilePanel>
        <MobileSectionHeading
          title="Social"
          description="Friend activity, repertoire comparison, and shared discovery."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/friends" className={buttonStyles.primary}>
            Friends
          </Link>
          <Link href="/compare" className={buttonStyles.secondary}>
            Compare
          </Link>
          <Link href="/public-lists" className={buttonStyles.secondary}>
            Shared
          </Link>
        </div>
      </MobilePanel>

      {isSectionVisible(homePreferences, "friend_activity") ? (
        <section className="space-y-2">
          <MobileSectionHeading
            title="Friend activity"
            description={
              recentFriendActivity.length === 0
                ? "No recent friend activity yet."
                : `${recentFriendActivity.length} recent item${
                    recentFriendActivity.length === 1 ? "" : "s"
                  }`
            }
          />
          {recentFriendActivity.length === 0 ? (
            <MobileEmptyBlock>No recent friend activity yet.</MobileEmptyBlock>
          ) : (
            <div className="rounded-3xl border border-border bg-card/70 px-4">
              {recentFriendActivity.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="border-b border-border/70 py-3 text-sm last:border-b-0"
                >
                  <p className="leading-6 text-foreground">
                    {renderFriendActivityText(item)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {formatFriendActivityRelativeTime(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

export default function HomeMobileSummarySwitcher({
  summary,
  recentFriendActivity,
  streakSummary,
  homePreferences,
}: HomeMobileSummarySwitcherProps) {
  const [activeTab, setActiveTab] = useState<MobileHomeTab>("today")

  return (
    <section className="space-y-4 md:hidden">
      <MobileSwitcher activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "today" ? (
        <TodayPanel
          summary={summary}
          streakSummary={streakSummary}
          homePreferences={homePreferences}
        />
      ) : null}

      {activeTab === "repertoire" ? (
        <RepertoirePanel summary={summary} homePreferences={homePreferences} />
      ) : null}

      {activeTab === "social" ? (
        <SocialPanel
          recentFriendActivity={recentFriendActivity}
          homePreferences={homePreferences}
        />
      ) : null}
    </section>
  )
}