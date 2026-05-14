import Link from "next/link"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
} from "@/lib/friend-activity"
import HomeBadgesPanel from "@/components/home/HomeBadgesPanel"
import HomeFriendsActivityBox from "@/components/home/HomeFriendsActivityBox"
import MobileBrowseRow from "@/components/mobile/MobileBrowseRow"
import MobileDisclosureSection from "@/components/mobile/MobileDisclosureSection"
import MobileSummaryCard from "@/components/mobile/MobileSummaryCard"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
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

function badgeCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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

function MobileEmptyPreview({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  )
}

function MobileBadgeSummary({
  summary,
}: {
  summary: HomeSummaryData["badgeSummary"]
}) {
  const recentBadges = [
    ...summary.recentReceivedBadges.map((badge) => ({
      ...badge,
      kind: "Received" as const,
    })),
    ...summary.recentCreatedBadges.map((badge) => ({
      ...badge,
      kind: "Created" as const,
    })),
  ].slice(0, 4)

  return (
    <MobileDisclosureSection
      title="Badges"
      description={`${summary.receivedCount} received · ${summary.createdCount} created`}
      openLabel="Show"
      closeLabel="Hide"
      summary={
        recentBadges.length === 0 ? (
          <MobileEmptyPreview>No badges yet.</MobileEmptyPreview>
        ) : (
          <div className="space-y-2">
            {recentBadges.slice(0, 2).map((badge) => (
              <MobileBrowseRow
                key={`${badge.kind}-${badge.id}`}
                href={`/badges/${badge.slug}`}
                title={badge.name}
                subtitle={`${badge.kind} · ${badgeCategoryLabel(badge.category)}`}
              />
            ))}
          </div>
        )
      }
    >
      {recentBadges.length === 0 ? (
        <MobileEmptyPreview>
          No badges yet. Browse badges or create one to start making community
          recognition visible.
        </MobileEmptyPreview>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {recentBadges.map((badge) => (
            <MobileBrowseRow
              key={`${badge.kind}-${badge.id}`}
              href={`/badges/${badge.slug}`}
              title={badge.name}
              subtitle={`${badge.kind} · ${badgeCategoryLabel(badge.category)}`}
            />
          ))}
        </div>
      )}

      <div className="mt-3">
        <Link href="/badges" className={buttonStyles.secondary}>
          View all
        </Link>
      </div>
    </MobileDisclosureSection>
  )
}

function MobileFriendActivitySummary({
  items,
}: {
  items: FriendActivityItem[]
}) {
  return (
    <MobileDisclosureSection
      title="Friend activity"
      description={
        items.length === 0
          ? "No recent friend activity yet."
          : `${items.length} recent item${items.length === 1 ? "" : "s"}`
      }
      openLabel="Show"
      closeLabel="Hide"
      summary={
        items.length === 0 ? (
          <MobileEmptyPreview>No recent friend activity yet.</MobileEmptyPreview>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-background/70 p-3 text-sm"
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
        )
      }
    >
      {items.length === 0 ? (
        <MobileEmptyPreview>No recent friend activity yet.</MobileEmptyPreview>
      ) : (
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-background/70 p-3 text-sm"
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

      <div className="mt-3">
        <Link href="/friends" className={buttonStyles.secondary}>
          View all
        </Link>
      </div>
    </MobileDisclosureSection>
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

  return (
    <section className="space-y-5 md:space-y-8">
      <section className="space-y-3 md:hidden">
        {isSectionVisible(homePreferences, "badges") ? (
          <MobileBadgeSummary summary={summary.badgeSummary} />
        ) : null}

        {isSectionVisible(homePreferences, "friend_activity") ? (
          <MobileFriendActivitySummary items={recentFriendActivity} />
        ) : null}

        {isSectionVisible(homePreferences, "learning_queue") ? (
          <MobileDisclosureSection
            title="Learning queue"
            description={
              summary.learningQueuePreview.length === 0
                ? "No saved tunes waiting to start."
                : "Tunes saved in lists before starting Practice."
            }
            openLabel="Show"
            closeLabel="Hide"
            summary={
              summary.learningQueuePreview.length === 0 ? (
                <MobileEmptyPreview>
                  Add tunes to lists before starting Practice to build this
                  queue.
                </MobileEmptyPreview>
              ) : (
                <div className="space-y-2">
                  {summary.learningQueuePreview
                    .slice(0, 2)
                    .map((queueTune) => (
                      <MobileBrowseRow
                        key={queueTune.piece_id}
                        href={`/library/${queueTune.piece_id}`}
                        title={queueTune.title}
                        subtitle={getLearningQueueMeta({
                          firstListName: queueTune.firstListName,
                          listNames: queueTune.listNames,
                        })}
                      />
                    ))}
                </div>
              )
            }
          >
            {summary.learningQueuePreview.length === 0 ? (
              <MobileEmptyPreview>
                Add tunes to lists before starting Practice to build this queue.
              </MobileEmptyPreview>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {summary.learningQueuePreview
                  .slice(0, previewLimit)
                  .map((queueTune) => (
                    <MobileBrowseRow
                      key={queueTune.piece_id}
                      href={`/library/${queueTune.piece_id}`}
                      title={queueTune.title}
                      subtitle={getLearningQueueMeta({
                        firstListName: queueTune.firstListName,
                        listNames: queueTune.listNames,
                      })}
                    />
                  ))}
              </div>
            )}

            <div className="mt-3">
              <Link href="/learning-lists" className={buttonStyles.secondary}>
                Open queue
              </Link>
            </div>
          </MobileDisclosureSection>
        ) : null}

        {isSectionVisible(homePreferences, "due_next") ? (
          <MobileSummaryCard
            eyebrow="Due today"
            title={`${summary.dueTodayCount} due`}
            description={
              summary.dueTodayCount === 0
                ? "Nothing due today."
                : "Scheduled reviews waiting on the Practice page."
            }
            action={
              <Link href="/review#due-today" className={buttonStyles.primary}>
                Review
              </Link>
            }
          />
        ) : null}

        {isSectionVisible(homePreferences, "currently_in_practice") ? (
          <MobileDisclosureSection
            title="Currently in practice"
            description={`${summary.practiceCount} tune${
              summary.practiceCount === 1 ? "" : "s"
            } in the review system.`}
            openLabel="Show"
            closeLabel="Hide"
            summary={
              summary.inPracticePreview.length === 0 ? (
                <MobileEmptyPreview>No tunes in practice yet.</MobileEmptyPreview>
              ) : (
                <div className="space-y-2">
                  {summary.inPracticePreview.slice(0, 2).map((userPiece) => (
                    <MobileBrowseRow
                      key={userPiece.user_piece_id}
                      href={`/library/${userPiece.piece_id}`}
                      title={userPiece.title}
                      subtitle={`Stage ${userPiece.stage}`}
                    />
                  ))}
                </div>
              )
            }
          >
            {summary.inPracticePreview.length === 0 ? (
              <MobileEmptyPreview>No tunes in practice yet.</MobileEmptyPreview>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {summary.inPracticePreview
                  .slice(0, previewLimit)
                  .map((userPiece) => (
                    <MobileBrowseRow
                      key={userPiece.user_piece_id}
                      href={`/library/${userPiece.piece_id}`}
                      title={userPiece.title}
                      subtitle={`Stage ${userPiece.stage}`}
                    />
                  ))}
              </div>
            )}

            <div className="mt-3">
              <Link href="/library/practice" className={buttonStyles.secondary}>
                View all
              </Link>
            </div>
          </MobileDisclosureSection>
        ) : null}

        {isSectionVisible(homePreferences, "lists") ? (
          <MobileDisclosureSection
            title="Lists"
            description={`${summary.listCount} collection${
              summary.listCount === 1 ? "" : "s"
            }`}
            openLabel="Show"
            closeLabel="Hide"
            summary={
              summary.listPreview.length === 0 ? (
                <MobileEmptyPreview>No lists yet.</MobileEmptyPreview>
              ) : (
                <div className="space-y-2">
                  {summary.listPreview.slice(0, 2).map((learningList) => (
                    <MobileBrowseRow
                      key={learningList.id}
                      href={`/learning-lists/${learningList.id}`}
                      title={learningList.name}
                    />
                  ))}
                </div>
              )
            }
          >
            {summary.listPreview.length === 0 ? (
              <MobileEmptyPreview>No lists yet.</MobileEmptyPreview>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {summary.listPreview.slice(0, previewLimit).map((learningList) => (
                  <MobileBrowseRow
                    key={learningList.id}
                    href={`/learning-lists/${learningList.id}`}
                    title={learningList.name}
                  />
                ))}
              </div>
            )}

            <div className="mt-3">
              <Link href="/learning-lists" className={buttonStyles.secondary}>
                View lists
              </Link>
            </div>
          </MobileDisclosureSection>
        ) : null}

        {isSectionVisible(homePreferences, "streaks") ? (
          <StreakSummarySection streakSummary={streakSummary} />
        ) : null}
      </section>

      {isSectionVisible(homePreferences, "repertoire_state") ? (
        <section className="hidden md:block">
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
              density={density}
            />

            <OverviewCard
              href="/library/practice"
              label="Practice"
              value={summary.practiceCount}
              helper="Tunes inside the review system."
              tone="practice"
              density={density}
            />

            <OverviewCard
              href="/review#due-today"
              label="Due today"
              value={summary.dueTodayCount}
              helper="Scheduled reviews for today."
              tone="due"
              density={density}
            />

            <OverviewCard
              href="/review?mode=catch-up#catch-up"
              label="Attention"
              value={summary.needsAttentionCount}
              helper="Overdue tunes waiting for catch-up."
              tone="warning"
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
        className={joinClasses("hidden md:grid", getLowerGridClass(homePreferences))}
      >
        {(isSectionVisible(homePreferences, "learning_queue") ||
          isSectionVisible(homePreferences, "due_next") ||
          isSectionVisible(homePreferences, "currently_in_practice")) ? (
          <div className="space-y-4">
            {isSectionVisible(homePreferences, "learning_queue") ? (
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

            {isSectionVisible(homePreferences, "due_next") ? (
              <PreviewPanel
                title="Due next"
                href="/review#due-today"
                linkLabel="View all"
                density={density}
              >
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
              </PreviewPanel>
            ) : null}

            {isSectionVisible(homePreferences, "currently_in_practice") ? (
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

        {(isSectionVisible(homePreferences, "streaks") ||
          isSectionVisible(homePreferences, "badges") ||
          isSectionVisible(homePreferences, "lists")) ? (
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