"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FocusModeShell from "@/components/practice/FocusModeShell"
import PracticeProgress from "@/components/practice/PracticeProgress"
import { completeFormalReviewInPlace } from "@/lib/actions/reviews"
import {
  useSessionDock,
  useSessionDockPosition,
} from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"
import Icon from "@/components/ui/Icon"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import {
  getPracticeResultCounts,
  getPracticeSessionSuggestion,
  getResultingPracticeStage,
  canBeginPracticeRating,
  canUndoPracticeRating,
  removeRatedPracticeItem,
  type PracticeLane,
  type PracticeRating,
  type PracticeSessionResult,
} from "@/lib/practice-session"

const RATING_UNDO_WINDOW_MS = 3500

const ratingPresentation = {
  failed: { label: "Rough", icon: "rough", tone: "rough" },
  shaky: { label: "Shaky", icon: "shaky", tone: "shaky" },
  solid: { label: "Solid", icon: "check", tone: "solid" },
} as const

type PendingRating = {
  item: ReviewQueueItem
  outcome: PracticeRating
  submissionKey: string
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(
    target.closest("input, textarea, select, button, a, [contenteditable='true']")
  )
}

function SessionSummary({
  results,
  remainingCount,
  onContinue,
}: {
  results: PracticeSessionResult[]
  remainingCount: number
  onContinue: () => void
}) {
  const counts = getPracticeResultCounts(results)

  return (
    <FocusModeShell
      eyebrow="Practice complete"
      title={`${results.length} tune${results.length === 1 ? "" : "s"} practised`}
      detail={remainingCount > 0 ? `${remainingCount} left in this lane` : "This lane is clear"}
    >
      <section className="mx-auto mt-8 max-w-3xl">
        <div className="grid grid-cols-3 border-y border-hairline text-center">
          <div className="py-4 text-state-overdue">
            <Icon name="rough" className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">Rough</p>
            <p className="font-serif text-3xl font-bold">{counts.failed}</p>
          </div>
          <div className="border-x border-hairline py-4 text-state-due-foreground">
            <Icon name="shaky" className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">Shaky</p>
            <p className="font-serif text-3xl font-bold">{counts.shaky}</p>
          </div>
          <div className="py-4 text-state-known">
            <Icon name="check" className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">Solid</p>
            <p className="font-serif text-3xl font-bold">{counts.solid}</p>
          </div>
        </div>

        {results.length > 0 ? (
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {results.map((result) => (
              <li key={`${result.userPieceId}:${result.outcome}`} className="flex items-center justify-between gap-4 py-3">
                <span className="font-semibold">{result.title}</span>
                <span className="text-sm text-text-muted">
                  {result.movedToKnown
                    ? "Moved to Known"
                    : `Stage ${result.previousStage} → ${result.resultingStage}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 border-y border-hairline py-5 text-text-muted">
            No ratings were recorded in this session.
          </p>
        )}

        <section className="mt-6 border-l-4 border-state-practice bg-surface-note px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Next suggestion</p>
          <p className="mt-1 leading-6">{getPracticeSessionSuggestion(results)}</p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          {remainingCount > 0 ? (
            <button type="button" onClick={onContinue} className={buttonStyles.practice}>
              Continue practice
            </button>
          ) : null}
          <Link href="/review" className={buttonStyles.primary}>Back to Practice</Link>
          <Link href="/learning-lists?view=learning-queue" className={buttonStyles.secondary}>Open learning queue</Link>
        </div>
      </section>
    </FocusModeShell>
  )
}

export default function FocusedPracticeSession({
  lane,
  initialQueue,
  sessionDate,
  noteCategories,
  sessionLabel,
  sessionKey,
}: {
  lane: PracticeLane
  initialQueue: ReviewQueueItem[]
  sessionDate: string
  noteCategories: PracticeNoteCategory[]
  sessionLabel?: string
  sessionKey?: string
}) {
  const [queue, setQueue] = useState(initialQueue)
  const [results, setResults] = useState<PracticeSessionResult[]>([])
  const [pendingRating, setPendingRating] = useState<PendingRating | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [noteBody, setNoteBody] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [focusId, setFocusId] = useState("")
  const [addTuneToFocus, setAddTuneToFocus] = useState(false)
  const undoTimerRef = useRef<number | null>(null)
  const storagePrefix = `tunes.session.v1.practice.${sessionDate}.${sessionKey ?? lane}`
  const [currentIndex, setCurrentIndex] = useSessionDockPosition(
    `${storagePrefix}.position`,
    queue.length
  )
  const currentItem = queue[currentIndex] ?? null
  const ratingState = isSubmitting
    ? "submitting"
    : pendingRating
      ? "undo-window"
      : "idle"
  const isBusy = !canBeginPracticeRating(ratingState)
  const laneLabel =
    sessionLabel ?? (lane === "catch-up" ? "Catch-up" : lane === "list" ? "List practice" : lane === "focus" ? "Focus practice" : "Due today")

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.sessionStorage.getItem(`${storagePrefix}.results`) ?? "[]"
      ) as PracticeSessionResult[]
      if (Array.isArray(stored)) {
        // Restore only display-safe session history; the server remains authoritative.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResults(stored.slice(-50))
      }
    } catch {
      window.sessionStorage.removeItem(`${storagePrefix}.results`)
    }
  }, [storagePrefix])

  useEffect(() => {
    window.sessionStorage.setItem(`${storagePrefix}.results`, JSON.stringify(results))
  }, [results, storagePrefix])

  useEffect(() => () => {
    if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current)
  }, [])

  const commitRating = useCallback(async (pending: PendingRating) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.set("userPieceId", String(pending.item.id))
    formData.set("reviewSubmissionKey", pending.submissionKey)
    formData.set("outcome", pending.outcome)
    formData.set("practice_note", noteBody)
    if (categoryId) formData.set("category_id", categoryId)
    if (focusId) formData.set("focus_id", focusId)
    if (focusId && addTuneToFocus) formData.set("add_tune_to_focus", "on")

    let result
    try {
      result = await completeFormalReviewInPlace(formData)
    } catch {
      setIsSubmitting(false)
      setPendingRating(null)
      setErrorMessage("The rating could not be saved. Check your connection and try again.")
      return
    }
    setIsSubmitting(false)

    if (!result.ok) {
      setPendingRating(null)
      setErrorMessage(result.error)
      return
    }

    const presentation = ratingPresentation[pending.outcome]
    const resultingStage = getResultingPracticeStage(
      pending.item.stage,
      pending.outcome
    )
    const sessionResult: PracticeSessionResult = {
      userPieceId: pending.item.id,
      pieceId: pending.item.piece_id,
      title: pending.item.piece?.title ?? "Untitled tune",
      outcome: pending.outcome,
      previousStage: pending.item.stage,
      resultingStage,
      movedToKnown: result.movedToKnown,
    }

    setResults((current) => [...current, sessionResult])
    const next = removeRatedPracticeItem(queue, pending.item.id, currentIndex)
    setQueue(next.queue)
    setCurrentIndex(next.index)
    setPendingRating(null)
    setNoteBody("")
    setCategoryId("")
    setFocusId("")
    setAddTuneToFocus(false)
    window.sessionStorage.setItem(
      `${storagePrefix}.announcement`,
      `${presentation.label} recorded for ${sessionResult.title}`
    )
  }, [addTuneToFocus, categoryId, currentIndex, focusId, noteBody, queue, setCurrentIndex, storagePrefix])

  const rate = useCallback((outcome: PracticeRating) => {
    if (!currentItem || !canBeginPracticeRating(ratingState)) return

    const pending: PendingRating = {
      item: currentItem,
      outcome,
      submissionKey: `formal-review:${currentItem.id}:${outcome}:${crypto.randomUUID()}`,
    }
    setErrorMessage(null)
    setPendingRating(pending)
    undoTimerRef.current = window.setTimeout(() => {
      undoTimerRef.current = null
      void commitRating(pending)
    }, RATING_UNDO_WINDOW_MS)
  }, [commitRating, currentItem, ratingState])

  const undoRating = useCallback(() => {
    if (!pendingRating || !canUndoPracticeRating(ratingState)) return
    if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current)
    undoTimerRef.current = null
    setPendingRating(null)
  }, [pendingRating, ratingState])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === "1") rate("failed")
      if (event.key === "2") rate("shaky")
      if (event.key === "3") rate("solid")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [rate])

  const dockModel = useMemo<SessionDockModel | null>(() => {
    if (!currentItem || ended) return null
    const title = currentItem.piece?.title ?? "Untitled tune"
    const ratingActions: SessionDockModel["secondaryActions"] = (
      ["failed", "shaky", "solid"] as const
    ).map((outcome) => ({
      id: outcome,
      label: ratingPresentation[outcome].label,
      icon: ratingPresentation[outcome].icon,
      tone: ratingPresentation[outcome].tone,
      disabled: isBusy,
      onInvoke: () => rate(outcome),
      closeOnInvoke: false,
    }))
    if (currentItem.media_bundle.effectiveReference && currentItem.piece) {
      ratingActions.push({
        id: "reference",
        label: "Reference",
        href: `/library/${currentItem.piece.id}/reference-media`,
        tone: "secondary",
      })
    }

    return {
      id: `focused-practice:${lane}:${currentItem.id}`,
      context: "focused-practice",
      identity: {
        eyebrow: pendingRating ? "Rating selected" : laneLabel,
        title,
        detail: pendingRating
          ? `${ratingPresentation[pendingRating.outcome].label} · Undo available`
          : `Stage ${currentItem.stage}`,
      },
      primaryAction: {
        id: "end",
        label: "End session",
        disabled: isBusy,
        onInvoke: () => setEnded(true),
        tone: "secondary",
      },
      secondaryActions: ratingActions,
      progress: {
        label: "Queue progress",
        current: results.length + 1,
        total: results.length + queue.length,
        value: results.length,
        max: results.length + queue.length,
      },
      status: {
        label: isSubmitting ? "Saving rating…" : `Stage ${currentItem.stage}`,
        tone: currentItem.overdue_days > 0 ? "overdue" : "due",
      },
      collapsedContent: { actionIds: ["failed", "shaky", "solid"], showProgress: true },
      expandedContent: {
        title: `${title} practice controls`,
        description: "Rate recall quality, open the reference or use the metronome without leaving the session context.",
        actionIds: ["failed", "shaky", "solid", "reference", "end"],
        tools: ["metronome"],
      },
      persistence: { shareable: "url", transient: "session", key: storagePrefix },
      announcement: pendingRating
        ? `${ratingPresentation[pendingRating.outcome].label} selected for ${title}. Undo before it is saved.`
        : `${title}. Stage ${currentItem.stage}. Tune ${results.length + 1} of ${results.length + queue.length}.`,
    }
  }, [currentItem, ended, isBusy, isSubmitting, lane, laneLabel, pendingRating, queue.length, rate, results.length, storagePrefix])

  useSessionDock(`focused-practice:${lane}`, dockModel)

  if (ended || !currentItem) {
    return (
      <SessionSummary
        results={results}
        remainingCount={queue.length}
        onContinue={() => setEnded(false)}
      />
    )
  }

  const activeFocus = currentItem.active_practice_foci[0]

  return (
    <FocusModeShell
      eyebrow={laneLabel}
      title="Focused Practice"
      detail={`Tune ${results.length + 1} of ${results.length + queue.length}`}
      onEnd={() => setEnded(true)}
      endDisabled={isBusy}
    >
      <article className="mx-auto mt-6 max-w-3xl md:mt-10 md:rounded-object md:border md:border-hairline md:bg-surface-paper md:p-8 md:shadow-material-rest">
        <div className="flex items-center justify-between gap-4 text-sm text-text-muted">
          <span className={joinClasses(
            "inline-flex items-center gap-2 font-semibold",
            currentItem.overdue_days > 0 ? "text-state-overdue" : "text-state-due-foreground"
          )}>
            <Icon name="clock" size={17} />
            {currentItem.overdue_days > 0
              ? `${currentItem.overdue_days} day${currentItem.overdue_days === 1 ? "" : "s"} overdue`
              : "Due today"}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold">
            <Icon name="stage" size={17} /> Stage {currentItem.stage}
          </span>
        </div>

        <h2 className="mt-7 text-center font-serif text-4xl font-bold leading-tight sm:text-5xl">
          {currentItem.piece?.title ?? "Untitled tune"}
        </h2>
        <p className="mt-3 text-center text-sm text-text-muted">
          {[currentItem.piece?.key, currentItem.piece?.style, currentItem.piece?.time_signature]
            .filter(Boolean)
            .join(" · ") || "No catalogue details"}
        </p>

        {activeFocus ? (
          <p className="mx-auto mt-5 max-w-xl border-l-4 border-state-practice pl-3 text-sm leading-6 text-text-muted">
            Focus area: <span className="font-semibold text-text-primary">{activeFocus.title}</span>
          </p>
        ) : null}

        <PracticeProgress stage={currentItem.stage} className="mx-auto mt-7 max-w-xl" />

        {pendingRating ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-y border-hairline bg-surface-note px-4 py-4" role="status" aria-live="assertive">
            <p className="font-semibold">
              {ratingPresentation[pendingRating.outcome].label} selected. Saving shortly…
            </p>
            <button type="button" onClick={undoRating} className={buttonStyles.secondaryStrong}>
              Undo rating
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-6 border-l-4 border-action-destructive bg-action-destructive/10 px-4 py-3 text-sm font-medium text-action-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {currentItem.media_bundle.effectiveReference && currentItem.piece ? (
            <details className="border-y border-hairline py-3 sm:col-span-2">
              <summary className="cursor-pointer font-semibold text-text-muted">Reveal reference</summary>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-muted">{currentItem.media_bundle.effectiveReference.label}</p>
                <Link href={`/library/${currentItem.piece.id}/reference-media`} className={buttonStyles.secondary}>
                  Open Reference Mode
                </Link>
              </div>
            </details>
          ) : null}

          <details className="border-y border-hairline py-3 sm:col-span-2">
            <summary className="cursor-pointer font-semibold text-text-muted">Add an optional review note</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select aria-label="Practice note category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm">
                <option value="">No category</option>
                {noteCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <select aria-label="Practice focus" value={focusId} onChange={(event) => { setFocusId(event.target.value); setAddTuneToFocus(false) }} className="rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm">
                <option value="">No focus area</option>
                {currentItem.practice_focus_options.map((focus) => <option key={focus.id} value={focus.id}>{focus.title}</option>)}
              </select>
              {focusId && !currentItem.active_practice_foci.some((focus) => String(focus.id) === focusId) ? (
                <label className="flex items-center gap-2 text-sm text-text-muted sm:col-span-2">
                  <input type="checkbox" checked={addTuneToFocus} onChange={(event) => setAddTuneToFocus(event.target.checked)} /> Add this tune to the selected focus area
                </label>
              ) : null}
              <textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} rows={3} placeholder="What happened with this tune today?" className="rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm sm:col-span-2" />
            </div>
          </details>
        </div>

        <p className="mt-7 hidden text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted md:block">
          Keyboard: 1 Rough · 2 Shaky · 3 Solid
        </p>
        <p className="mt-3 text-center text-sm text-text-muted">
          Rate this tune with the persistent controls below.
        </p>
      </article>
    </FocusModeShell>
  )
}
