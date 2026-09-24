"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { mergeActivityPage, ACTIVITY_WINDOW_SIZE } from "@/lib/activity-pagination"
import { buttonStyles } from "@/components/ui/buttonStyles"
import ActivityReactionBar from "@/components/activity/ActivityReactionBar"
import ActivityReplyForm from "@/components/activity/ActivityReplyForm"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
  type FriendActivityItem,
} from "@/lib/friend-activity"

type SocialActivityFeedProps = {
  items: FriendActivityItem[]
  redirectTo: string
  emptyMessage?: string
  initialNextCursor: string | null
  scrollRegionLabel?: string
}

function replyAuthor(item: FriendActivityItem["replies"][number]) {
  return item.author?.display_name || item.author?.username || "Unknown player"
}

export default function SocialActivityFeed({
  items,
  initialNextCursor,
  redirectTo,
  emptyMessage = "No recent friend activity yet.",
  scrollRegionLabel,
}: SocialActivityFeedProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loadedItems, setLoadedItems] = useState(items)
  // The cursor follows the last scanned row, including rows hidden by privacy.
  const [cursor, setCursor] = useState(initialNextCursor)
  const [hasMore, setHasMore] = useState(Boolean(initialNextCursor))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removedHeight, setRemovedHeight] = useState(0)
  const busy = useRef(false)
  const request = useRef<AbortController | null>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const scrollRegion = useRef<HTMLDivElement>(null)
  const visibleItems = loadedItems.map(item => items.find(fresh => fresh.id === item.id) ?? item)
  const selectedItem = visibleItems.find(item => item.id === selectedId) ?? null
  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore || selectedId !== null) return
    busy.current = true; setLoading(true); setError(null)
    const controller = new AbortController()
    request.current = controller
    try {
      const response = await fetch(`/api/activity${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store", signal: controller.signal })
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in again to load activity." : "Could not load more activity. Try again.")
      const page = await response.json() as { items: FriendActivityItem[]; nextCursor: string | null }
      const merged = mergeActivityPage(loadedItems, page.items)
      const excess = Math.max(0, merged.length - ACTIVITY_WINDOW_SIZE)
      if (excess) {
        const rows = Array.from(list.current?.children ?? []).slice(0, excess)
        setRemovedHeight(value => value + rows.reduce((sum, row) => sum + row.getBoundingClientRect().height, 0))
      }
      setLoadedItems(merged.slice(excess)); setCursor(page.nextCursor); setHasMore(Boolean(page.nextCursor))
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Could not load more activity.") }
    finally { busy.current = false; setLoading(false) }
  }, [cursor, hasMore, loadedItems, selectedId])
  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (!sentinel.current || error || !hasMore || selectedId !== null) return
    const observer = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) void loadMore() }, {
      root: scrollRegionLabel ? scrollRegion.current : null,
      rootMargin: "160px",
    })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [error, hasMore, loadMore, scrollRegionLabel, selectedId])

  const returnToNewest = () => {
    setLoadedItems(items)
    setCursor(initialNextCursor)
    setHasMore(Boolean(initialNextCursor))
    setRemovedHeight(0)

    if (scrollRegionLabel) scrollRegion.current?.scrollTo({ top: 0 })
    else list.current?.scrollIntoView()
  }

  return (
    <>
      <div
        ref={scrollRegion}
        role={scrollRegionLabel ? "region" : undefined}
        aria-label={scrollRegionLabel}
        tabIndex={scrollRegionLabel ? 0 : undefined}
        className={scrollRegionLabel
          ? "max-h-[clamp(18rem,55dvh,36rem)] min-h-0 touch-pan-y overflow-y-auto overscroll-contain pr-1 outline-none [scrollbar-gutter:stable] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          : undefined}
      >
        {removedHeight > 0 && <><button type="button" disabled={loading} className={buttonStyles.secondary} onClick={returnToNewest}>Back to newest activity</button><div aria-hidden="true" style={{ height: removedHeight }} /></>}
        <ol ref={list} className="divide-y divide-border border-y border-border">
          {visibleItems.map((item) => {
            const commentCount = item.replies.length

            return (
              <li key={item.activity_key} className="py-3">
                <article className="border-l-4 border-state-social pl-3">
                  <p className="text-sm leading-6 text-foreground">
                    {renderFriendActivityText(item)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                    <time dateTime={item.created_at}>
                      {formatFriendActivityRelativeTime(item.created_at)}
                    </time>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setSelectedId(item.id)}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-state-social underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    >
                      Comment ({commentCount})
                    </button>
                    <ActivityReactionBar activityEventId={item.id} reactions={item.reactions} redirectTo={redirectTo} />
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
        <div ref={sentinel} className="py-3">
          {error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}
          {hasMore ? <button type="button" onClick={() => void loadMore()} disabled={loading} className={buttonStyles.secondary}>{loading ? "Loading activity…" : error ? "Retry loading activity" : "Load more activity"}</button> : <p role="status" className="text-sm text-text-muted">{visibleItems.length ? "You’re up to date with this activity." : emptyMessage}</p>}
        </div>
      </div>

      {selectedItem ? (
        <ResponsiveModal
          isOpen
          onClose={() => setSelectedId(null)}
          title="Discussion"
          mobileMode="sheet"
          desktopMaxWidth="md:max-w-lg"
        >
          <div className="space-y-5">
            <div className="border-l-4 border-state-social pl-3 text-sm leading-6">
              {renderFriendActivityText(selectedItem)}
            </div>

            <ActivityReactionBar
              activityEventId={selectedItem.id}
              reactions={selectedItem.reactions}
              redirectTo={redirectTo}
            />

            {selectedItem.replies.length > 0 ? (
              <ol className="divide-y divide-border border-y border-border">
                {selectedItem.replies.map((reply) => (
                  <li key={reply.id} className="py-3 text-sm">
                    <p className="whitespace-pre-wrap leading-6">{reply.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {replyAuthor(reply)} · {formatFriendActivityRelativeTime(reply.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}

            <ActivityReplyForm
              activityEventId={selectedItem.id}
              redirectTo={redirectTo}
              isCommentActivity={selectedItem.event_type === "comment_added"}
            />
          </div>
        </ResponsiveModal>
      ) : null}
    </>
  )
}
