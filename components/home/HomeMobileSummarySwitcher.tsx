"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import MobileViewSwitcher from "@/components/ui/MobileViewSwitcher"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
} from "@/lib/friend-activity"
import { addActivityReply } from "@/lib/actions/activity-interactions"
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

function badgeCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getPreviewLimit(density: HomeDensity) {
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
    <div className="divide-y divide-border/70 border-y border-border/70">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center justify-between gap-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <p className="text-sm font-semibold text-foreground">{item.label}</p>

          <p className="font-serif text-3xl font-bold leading-none text-foreground">
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

function getActivityCommentLabel(item: FriendActivityItem) {
  const commentCount = item.replies.length

  if (commentCount === 0) {
    return "Comment"
  }

  return `Comment · ${commentCount} comment${commentCount === 1 ? "" : "s"}`
}

function getActivityAuthorName(reply: FriendActivityItem["replies"][number]) {
  return reply.author?.display_name || reply.author?.username || "Unknown player"
}

function ActivityCommentModal({
  item,
  onClose,
}: {
  item: FriendActivityItem
  onClose: () => void
}) {
  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      eyebrow="Friend activity"
      title="Comments"
      mobileMode="sheet"
      desktopMaxWidth="md:max-w-lg"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm leading-6 text-foreground">
            {renderFriendActivityText(item)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {formatFriendActivityRelativeTime(item.created_at)}
          </p>
        </div>

        <div className="space-y-3">
          {item.replies.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No comments yet.
            </p>
          ) : (
            item.replies.map((reply) => (
              <article
                key={reply.id}
                className="rounded-2xl border border-border bg-muted/70 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap leading-6 text-foreground">
                  {reply.body}
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {reply.author?.username ? (
                    <Link
                      href={`/users/${encodeURIComponent(reply.author.username)}`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {getActivityAuthorName(reply)}
                    </Link>
                  ) : (
                    getActivityAuthorName(reply)
                  )}{" "}
                  · {formatFriendActivityRelativeTime(reply.created_at)}
                </p>
              </article>
            ))
          )}
        </div>

        <form action={addActivityReply} className="space-y-3">
          <input type="hidden" name="activity_event_id" value={item.id} />
          <input type="hidden" name="redirect_to" value="/" />

          <textarea
            name="body"
            rows={3}
            placeholder="Add a comment"
            required
            className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
          />

          <SubmitButton
            label="Post"
            pendingLabel="Posting..."
            className={buttonStyles.primary}
          />
        </form>
      </div>
    </ResponsiveModal>
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

  return (
    <div className="space-y-5">
      <MobilePanel>
        <MobileSectionHeading
          title="Today"
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

      <StreakSummarySection streakSummary={streakSummary} />

      <section className="space-y-2">
        <MobileSectionHeading title="Due next" />

        {summary.dueTodayPreview.length === 0 ? (
          <MobileEmptyBlock>Nothing due today.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {summary.dueTodayPreview
              .slice(0, previewLimit)
              .map((userPiece) => (
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
        <MobileSectionHeading title="Currently in practice" />

        {summary.inPracticePreview.length === 0 ? (
          <MobileEmptyBlock>No tunes in practice yet.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {summary.inPracticePreview
              .slice(0, previewLimit)
              .map((userPiece) => (
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

      <section className="space-y-2">
        <MobileSectionHeading title="Learning queue" />

        {summary.learningQueuePreview.length === 0 ? (
          <MobileEmptyBlock>
            Add tunes to lists before starting Practice to build this queue.
          </MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {summary.learningQueuePreview
              .slice(0, previewLimit)
              .map((queueTune) => (
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

      <section className="space-y-2">
        <MobileSectionHeading
          title="Your lists"
          action={
            <Link href="/learning-lists" className={buttonStyles.secondary}>
              View
            </Link>
          }
        />

        {summary.listPreview.length === 0 ? (
          <MobileEmptyBlock>No lists yet.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
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

      <section className="space-y-2">
        <MobileSectionHeading
          title="Badges"
          action={
            <Link href="/badges" className={buttonStyles.secondary}>
              View
            </Link>
          }
        />

        {recentBadges.length === 0 ? (
          <MobileEmptyBlock>No badges yet.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
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
    </div>
  )
}

function SocialPanel({
  recentFriendActivity,
}: {
  recentFriendActivity: FriendActivityItem[]
}) {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const visibleActivity = recentFriendActivity.slice(0, 5)
  const selectedItem =
    visibleActivity.find((item) => item.id === selectedItemId) ?? null

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

        {visibleActivity.length === 0 ? (
          <MobileEmptyBlock>No recent friend activity yet.</MobileEmptyBlock>
        ) : (
          <div className="border-y border-border/70">
            {visibleActivity.map((item) => (
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

                <button
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className="mt-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  {getActivityCommentLabel(item)}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedItem ? (
        <ActivityCommentModal
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
        />
      ) : null}
    </div>
  )
}

export default function HomeMobileSummarySwitcher({
  summary,
  recentFriendActivity,
  streakSummary,
  density,
}: HomeMobileSummarySwitcherProps) {
  const [activeTab, setActiveTab] = useState<MobileHomeTab>("today")

  return (
    <section className="space-y-4 md:hidden">
      <MobileSwitcher activeTab={activeTab} onChange={setActiveTab} />

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
