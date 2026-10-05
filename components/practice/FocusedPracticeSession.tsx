"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import FocusModeShell from "@/components/practice/FocusModeShell"
import PracticeSessionSummary from "@/components/practice/PracticeSessionSummary"
import PracticeReferencePlayer from "@/components/reference-media/PracticeReferencePlayer"
import Icon from "@/components/ui/Icon"
import { completeFormalReviewInPlace } from "@/lib/actions/reviews"
import { loadNextPracticeBatch } from "@/lib/actions/practice-session"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import { ACTIVE_PRACTICE_SESSION_KEY, getResultingPracticeStage, type PracticeLane, type PracticeRating, type PracticeSessionResult } from "@/lib/practice-session"
import { formatPracticeDate, getReviewIntervalDays } from "@/lib/review"

const RATING_UNDO_WINDOW_MS = 3500
const outcomes = [
  { id: "failed", label: "Rough", icon: "rough" },
  { id: "shaky", label: "Shaky", icon: "shaky" },
  { id: "solid", label: "Solid", icon: "check" },
] as const

type PendingRating = { item: ReviewQueueItem; outcome: PracticeRating; submissionKey: string }

export default function FocusedPracticeSession({ lane, initialQueue, queueTotal, sessionDate, sessionLabel, sessionKey, scopeId, practiceDiaryEnabled }: {
  lane: PracticeLane; initialQueue: ReviewQueueItem[]; queueTotal: number; sessionDate: string
  sessionLabel?: string; sessionKey?: string; scopeId?: number; practiceDiaryEnabled: boolean
}) {
  const storage = usePrivateSessionStorage()
  const online = useOnlineStatus()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const run = searchParams.get("run") ?? "default"
  const storagePrefix = `tunes.session.v2.practice.${sessionDate}.${sessionKey ?? lane}.${run}`
  const currentHref = `${pathname}?${searchParams.toString()}`
  const [queue, setQueue] = useState(initialQueue)
  const [results, setResults] = useState<PracticeSessionResult[]>([])
  const [pendingRating, setPendingRating] = useState<PendingRating | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [unloadedCount, setUnloadedCount] = useState(Math.max(0, queueTotal - initialQueue.length))
  const batchCursor = useRef(Math.max(0, ...initialQueue.map(item => item.id)))
  const timer = useRef<number | null>(null)
  const submission = useRef<PendingRating | null>(null)
  const submitting = useRef(false)
  const currentItem = queue[0] ?? null
  const busy = Boolean(pendingRating) || saving || loading || Boolean(error)


  useEffect(() => {
    if ((currentItem || loading) && !ended) {
      // Canonicalize legacy due/catch-up URLs so resume uses the combined queue.
      const url = new URL(currentHref, "https://tunes.invalid")
      url.searchParams.set("session", lane)
      storage.setItem(ACTIVE_PRACTICE_SESSION_KEY, JSON.stringify({ href: `${url.pathname}${url.search}`, lane, sessionDate }))
    } else {
      storage.removeItem(ACTIVE_PRACTICE_SESSION_KEY)
    }
  }, [currentHref, currentItem, ended, lane, loading, sessionDate, storage])

  useEffect(() => {
    // Long tunes can scroll; the next tune should always start at its heading.
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [currentItem?.id])

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])
  useEffect(() => {
    if (!pendingRating && !saving && !submission.current) return
    const preventLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", preventLeave)
    return () => window.removeEventListener("beforeunload", preventLeave)
  }, [pendingRating, saving, error])

  const loadMore = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await loadNextPracticeBatch((lane === "list" || lane === "focus") && scopeId ? { lane, scopeId, afterId: batchCursor.current } : undefined)
      if (!next.ok) { setError(next.error); return }
      batchCursor.current = Math.max(batchCursor.current, ...next.items.map(item => item.id))
      setQueue(next.items)
      setUnloadedCount(Math.max(0, next.total - next.items.length))
    } catch { setError("Couldn’t load the next tune. Your ratings are saved.") }
    finally { setLoading(false) }
  }, [lane, scopeId])

  const hydrated = useRef(false)
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    try {
      const saved = JSON.parse(storage.getItem(`${storagePrefix}.results`) ?? "[]") as PracticeSessionResult[]
      if (!Array.isArray(saved)) return
      const valid = saved.filter(result => result && Number.isInteger(result.userPieceId) && typeof result.title === "string" && ["failed", "shaky", "solid"].includes(result.outcome))
      // Hydrate private storage after the server render.
      setResults(valid)
      if (lane === "list" || lane === "focus") {
        const lastReviewedId = Math.max(0, ...valid.map(result => result.userPieceId))
        batchCursor.current = Math.max(batchCursor.current, lastReviewedId)
        const remaining = initialQueue.filter(item => item.id > lastReviewedId)
        setQueue(remaining)
        if (remaining.length === 0 && queueTotal > 0) void loadMore()
      }
    } catch { storage.removeItem(`${storagePrefix}.results`) }
  }, [initialQueue, lane, loadMore, queueTotal, storage, storagePrefix])

  const commitRating = useCallback(async (pending: PendingRating) => {
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError(null)
    const form = new FormData()
    form.set("userPieceId", String(pending.item.id))
    form.set("reviewSubmissionKey", pending.submissionKey)
    form.set("outcome", pending.outcome)
    try {
      const response = await completeFormalReviewInPlace(form)
      if (!response.ok) { setError(response.error); setPendingRating(null); return }
      const saved: PracticeSessionResult = {
        userPieceId: pending.item.id, pieceId: pending.item.piece_id,
        title: pending.item.piece?.title ?? "Untitled tune", outcome: pending.outcome,
        previousStage: pending.item.stage, resultingStage: getResultingPracticeStage(pending.item.stage, pending.outcome), movedToKnown: response.movedToKnown,
      }
      const nextResults = [...results, saved]
      setResults(nextResults)
      storage.setItem(`${storagePrefix}.results`, JSON.stringify(nextResults))
      submission.current = null
      setPendingRating(null)
      const nextQueue = queue.filter(item => item.id !== pending.item.id)
      setQueue(nextQueue)
      if (nextQueue.length === 0 && unloadedCount > 0) await loadMore()
    } catch {
      setError("Couldn’t save that rating. Please try again.")
      setPendingRating(null)
    } finally { setSaving(false); submitting.current = false }
  }, [loadMore, queue, results, storage, storagePrefix, unloadedCount])

  const rate = useCallback((outcome: PracticeRating) => {
    if (!currentItem || !online || busy || controlsOpen || submission.current) return
    const pending = { item: currentItem, outcome, submissionKey: `formal-review:${currentItem.id}:${outcome}:${crypto.randomUUID()}` }
    submission.current = pending
    setPendingRating(pending)
    timer.current = window.setTimeout(() => { timer.current = null; void commitRating(pending) }, RATING_UNDO_WINDOW_MS)
  }, [busy, commitRating, controlsOpen, currentItem, online])

  function undo() {
    if (saving || !pendingRating) return
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    submission.current = null
    setPendingRating(null)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || document.querySelector('[role="dialog"]')) return
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, button, a, iframe, [data-reference-player], [contenteditable='true']")) return
      const outcome = ({ "1": "failed", "2": "shaky", "3": "solid" } as const)[event.key as "1" | "2" | "3"]
      if (outcome) rate(outcome)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [rate])

  function finish() { setEnded(true); storage.removeItem(ACTIVE_PRACTICE_SESSION_KEY) }
  function done() { storage.removeItem(`${storagePrefix}.results`); storage.removeItem(ACTIVE_PRACTICE_SESSION_KEY) }

  if (ended || (!currentItem && !loading && !error)) return <PracticeSessionSummary count={results.length} remainingCount={queue.length + unloadedCount} sessionDate={sessionDate} practiceDiaryEnabled={practiceDiaryEnabled} onDone={done} />

  const title = currentItem?.piece?.title ?? "Preparing your next tune"
  return (
    <FocusModeShell eyebrow="" title="Practice" detail={sessionLabel ?? "One tune at a time"} onEnd={finish} endDisabled={Boolean(pendingRating) || saving || Boolean(submission.current)}>
      <article className="practice-session-content" aria-busy={loading}>
        <header className="practice-tune-heading">
          {sessionLabel ? <p className="mb-2 text-sm text-text-muted">{sessionLabel}</p> : null}
          <h1 className="font-sans text-4xl font-bold leading-tight tracking-tight sm:text-5xl" aria-live="polite">{title}</h1>
          {currentItem ? <>
            <p className="mt-3 text-sm text-text-muted">{[currentItem.piece?.key, currentItem.piece?.style, currentItem.piece?.time_signature].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 border-l-2 border-state-practice pl-3 text-sm font-semibold text-text-primary">
              Stage {currentItem.stage} · {getReviewIntervalDays(currentItem.stage)}-day review
              {currentItem.overdue_days > 0 && formatPracticeDate(currentItem.next_review_due)
                ? ` · Overdue since ${formatPracticeDate(currentItem.next_review_due)}`
                : currentItem.due_date_only === sessionDate
                  ? " due today"
                  : formatPracticeDate(currentItem.next_review_due)
                    ? ` · Next review ${formatPracticeDate(currentItem.next_review_due)}`
                    : ""}
            </p>
          </> : null}
        </header>
        {currentItem?.piece ? <PracticeReferencePlayer key={currentItem.id} piece={currentItem.piece} mediaBundle={currentItem.media_bundle} returnTo={currentHref} navigationDisabled={Boolean(pendingRating) || saving || Boolean(submission.current)} onControlsOpenChange={setControlsOpen} /> : loading ? <p role="status" className="py-12 text-center text-text-muted">Getting the next tune ready…</p> : null}
      </article>
      <footer className="practice-rating-bar" aria-label="How did that feel?">
        <div className="mx-auto max-w-2xl">
          {!online ? <p role="status" className="mb-3 text-center text-sm text-text-muted">Reconnect to save your rating. Your tune is still here.</p> : null}
          {error ? <div role="alert" className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm"><p>{error}</p><button type="button" className="min-h-11 font-semibold underline underline-offset-4" disabled={!online || saving || loading} onClick={() => submission.current ? void commitRating(submission.current) : void loadMore()}>{submission.current ? "Retry saving" : "Retry loading"}</button></div> : null}
          {pendingRating || saving ? <div role="status" className="flex min-h-16 items-center justify-center gap-5"><p className="font-semibold">{saving ? "Saving…" : `${outcomes.find(item => item.id === pendingRating?.outcome)?.label} · next tune shortly`}</p>{!saving ? <button type="button" onClick={undo} className="min-h-11 px-3 font-semibold underline underline-offset-4">Undo</button> : null}</div> : (
            <><p className="mb-3 text-center text-xs font-medium text-text-muted">How did that feel?</p><div className="grid grid-cols-3 gap-2 sm:gap-3">{outcomes.map((outcome, index) => <button key={outcome.id} type="button" data-outcome={outcome.id} disabled={!currentItem || !online || busy || controlsOpen} onClick={() => rate(outcome.id)} className={`practice-rating practice-rating-${outcome.id}`}><Icon name={outcome.icon} size={19} /><span>{outcome.label}</span><kbd className="ml-auto hidden text-xs opacity-45 sm:inline">{index + 1}</kbd></button>)}</div></>
          )}
        </div>
      </footer>
    </FocusModeShell>
  )
}
