"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  festivalSessionDays,
  sessionDayKey,
  sortFestivalSessions,
  UNKNOWN_SESSION_DAY,
} from "@/lib/festivals/schedule"
import type { PublicFestivalSession } from "@/lib/loaders/festivals"

function formatDay(value: string, compact = false) {
  if (value === UNKNOWN_SESSION_DAY) return compact ? "Date TBA" : "Date to be announced"
  return new Intl.DateTimeFormat("en-AU", {
    weekday: compact ? "short" : "long",
    day: "numeric",
    month: compact ? "short" : "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}

function formatTime(session: PublicFestivalSession) {
  if (!session.local_start_time) return "Time to be announced"
  const start = session.local_start_time.slice(0, 5)
  const end = session.local_end_time?.slice(0, 5)
  return end ? `${start}–${end}` : start
}

function SessionCard({ session }: { session: PublicFestivalSession }) {
  return (
    <article className="rounded-object border border-hairline bg-surface-paper p-5 shadow-material-rest">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
        <span>{formatTime(session)}</span>
        {session.status !== "scheduled" ? (
          <span className="rounded-pill border border-state-due/50 bg-state-due/15 px-2 py-1 text-state-due-foreground">
            {session.status === "cancelled" ? "Cancelled" : "Programme changed"}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 break-words font-serif text-2xl font-bold leading-tight text-text-primary">
        {session.title}
      </h3>
      {(session.leader_name || session.venue) ? (
        <p className="mt-2 break-words text-sm leading-6 text-text-muted">
          {[session.leader_name ? `Led by ${session.leader_name}` : null, session.venue].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      {session.collections.length > 0 ? (
        <div className="mt-4 border-t border-hairline pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Suggested repertoire</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.collections.map(({ festival_collection_id, collection }) => (
              <Link
                key={festival_collection_id}
                href={`/public-lists/${collection.learning_list.id}`}
                className={joinClasses(buttonStyles.secondary, "min-h-10 text-sm")}
              >
                {collection.display_title ?? collection.learning_list.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-text-muted">No repertoire list has been supplied for this session.</p>
      )}
    </article>
  )
}

export default function FestivalSessions({ sessions }: { sessions: PublicFestivalSession[] }) {
  const orderedSessions = useMemo(() => sortFestivalSessions(sessions), [sessions])
  const days = useMemo(() => festivalSessionDays(orderedSessions), [orderedSessions])
  const [selectedDay, setSelectedDay] = useState(days[0])
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const visibleSessions = orderedSessions.filter((session) => sessionDayKey(session) === selectedDay)

  function selectByKeyboard(index: number, key: string) {
    let nextIndex: number | null = null
    if (key === "ArrowRight") nextIndex = (index + 1) % days.length
    if (key === "ArrowLeft") nextIndex = (index - 1 + days.length) % days.length
    if (key === "Home") nextIndex = 0
    if (key === "End") nextIndex = days.length - 1
    if (nextIndex == null) return
    setSelectedDay(days[nextIndex])
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mt-5">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Choose a festival session day"
      >
        {days.map((day, index) => {
          const selected = day === selectedDay
          return (
            <button
              key={day}
              ref={(element) => { tabRefs.current[index] = element }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="festival-session-day"
              tabIndex={selected ? 0 : -1}
              onClick={() => setSelectedDay(day)}
              onKeyDown={(event) => {
                if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
                  event.preventDefault()
                  selectByKeyboard(index, event.key)
                }
              }}
              className={joinClasses(
                "min-h-11 shrink-0 rounded-pill border px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                selected
                  ? "border-action-primary bg-action-primary text-action-primary-foreground"
                  : "border-hairline bg-surface-paper text-text-primary"
              )}
            >
              {formatDay(day, true)}
            </button>
          )
        })}
      </div>
      <section
        id="festival-session-day"
        role="tabpanel"
        aria-label={formatDay(selectedDay)}
        className="mt-4"
      >
        <h3 className="sr-only">{formatDay(selectedDay)}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {visibleSessions.map((session) => <SessionCard key={session.id} session={session} />)}
        </div>
      </section>
    </div>
  )
}
