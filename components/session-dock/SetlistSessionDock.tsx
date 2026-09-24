"use client"

import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import FocusModeShell from "@/components/practice/FocusModeShell"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"
import { resolvePerformanceItem, type ActiveSetlistPayload } from "@/lib/setlist-performance"

export default function SetlistSessionDock({ payload, userId, initialItemId }: {
  payload: ActiveSetlistPayload; userId: string; initialItemId?: number | null
}) {
  const sessionStorage = usePrivateSessionStorage()
  const router = useRouter()
  const { setlist, items } = payload
  const positionKey = `tunes.session.v2.setlist.${userId}.${setlist.id}.item`
  const [selectedId, setSelectedId] = useState<number | null>(initialItemId ?? null)
  const [restored, setRestored] = useState(false)
  const [seenVersion, setSeenVersion] = useState(setlist.updatedAt)
  const [notice, setNotice] = useState("")
  const currentItem = resolvePerformanceItem(items, selectedId)
  const currentIndex = items.findIndex(item => item.id === currentItem?.id)
  const nextItem = items[currentIndex + 1]

  // Preserve identity, not an index, when collaborators change the running order.
  if (seenVersion !== setlist.updatedAt) {
    setSeenVersion(setlist.updatedAt)
    setNotice(selectedId && !items.some(item => item.id === selectedId)
      ? "The current tune was removed. Showing the first available tune."
      : "The setlist changed. Your current tune is preserved in the latest order.")
    if (selectedId && !items.some(item => item.id === selectedId)) setSelectedId(currentItem?.id ?? null)
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let saved: number | null = null
      try { saved = Number(sessionStorage.getItem(positionKey)) || null } catch { /* Storage is optional. */ }
      setSelectedId(initialItemId ?? saved)
      setRestored(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [positionKey, initialItemId, sessionStorage])

  useEffect(() => {
    if (!restored || !currentItem) return
    try { sessionStorage.setItem(positionKey, String(currentItem.id)) } catch { /* URL still preserves position. */ }
    const url = new URL(window.location.href)
    url.searchParams.set("performance", String(currentItem.id))
    window.history.replaceState(null, "", url)
  }, [currentItem, positionKey, restored, sessionStorage])

  useEffect(() => {
    const refresh = () => { if (navigator.onLine && document.visibilityState === "visible") router.refresh() }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener("online", refresh)
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => { clearInterval(timer); window.removeEventListener("online", refresh); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh) }
  }, [router])

  const moveTo = useCallback((index: number) => {
    if (items[index]) { setSelectedId(items[index].id); setRestored(true) }
  }, [items])
  const model = useMemo<SessionDockModel>(() => ({
    id: `setlist-performance:${setlist.id}`,
    context: "setlist-performance",
    identity: { eyebrow: setlist.name, title: currentItem?.title ?? "Empty setlist", detail: nextItem ? `Next: ${nextItem.title}` : "Final tune" },
    primaryAction: { id: "next", label: "Next", disabled: !nextItem, onInvoke: () => moveTo(currentIndex + 1), tone: "practice" },
    secondaryActions: [
      { id: "previous", label: "Previous", disabled: currentIndex <= 0, onInvoke: () => moveTo(currentIndex - 1), tone: "secondary" },
      ...(currentItem ? [{ id: "open-tune", label: "Open tune", href: `/library/${currentItem.pieceId}`, tone: "secondary" as const }] : []),
    ],
    progress: { label: "Setlist position", current: currentIndex + 1, total: items.length, value: currentIndex + 1, max: Math.max(1, items.length) },
    status: { label: currentItem?.key ? `Key ${currentItem.key}` : "Key not set", tone: "neutral" },
    collapsedContent: { actionIds: ["previous", "next"], showProgress: true },
    expandedContent: { title: "Performance tools", actionIds: ["previous", "next", "open-tune"], tools: ["metronome"] },
    persistence: { shareable: "url", transient: "session", key: positionKey },
    announcement: currentItem ? `${currentItem.title}. Tune ${currentIndex + 1} of ${items.length}. ${currentItem.key ?? "Key not set"}.` : "No tunes in this setlist.",
  }), [currentItem, currentIndex, items.length, moveTo, nextItem, positionKey, setlist.id, setlist.name])
  useSessionDock(`setlist-performance:${setlist.id}`, model)

  return <FocusModeShell eyebrow="PERFORMANCE MODE" title={setlist.name} detail={`${Math.max(0, currentIndex + 1)} of ${items.length} tunes`} exitHref={`/setlists/${setlist.id}`}>
    <nav aria-label="Emergency navigation" className="flex gap-5 py-3 text-sm underline underline-offset-4"><Link className="inline-flex min-h-11 items-center" href="/setlists">All Setlists</Link><Link className="inline-flex min-h-11 items-center" href="/">Home</Link></nav>
    {notice ? <p role="status" className="border-y border-hairline py-3 text-sm">{notice}</p> : null}
    <section className="py-8 sm:py-12" aria-label="Current tune">
      {currentItem ? <>
        <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">TUNE {currentIndex + 1}</p>
        <h2 className="mt-4 break-words font-serif text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl">{currentItem.title}</h2>
        <p className="mt-6 text-3xl font-semibold sm:text-5xl">{currentItem.key ? `Key ${currentItem.key}` : "Key not set"}</p>
        <p className="mt-3 text-2xl text-text-muted">{currentItem.type}</p>
        {currentItem.note ? <p className="mt-6 max-w-3xl whitespace-pre-wrap break-words text-xl leading-relaxed">{currentItem.note}</p> : null}
        <div className="mt-10 border-t border-hairline pt-5"><p className="text-sm uppercase tracking-widest text-text-muted">{nextItem ? "UP NEXT" : "END OF SET"}</p><p className="mt-2 break-words text-2xl font-semibold sm:text-4xl">{nextItem?.title ?? "You’ve reached the final tune."}</p>{nextItem ? <p className="mt-2 text-lg text-text-muted">{[nextItem.key, nextItem.type].filter(Boolean).join(" · ")}</p> : null}</div>
      </> : <p>No tunes yet. Exit Performance Mode to prepare the running order.</p>}
    </section>
  </FocusModeShell>
}
