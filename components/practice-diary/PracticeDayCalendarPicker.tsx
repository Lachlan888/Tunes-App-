"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

type PracticeDayCalendarPickerProps = {
  selectedDate: string
  today: string
}

type CalendarDay = {
  dateOnly: string
  dayNumber: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function parseDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number)

  return {
    year,
    month,
    day,
  }
}

function toDateOnly(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function getMondayFirstWeekdayIndex(year: number, month: number) {
  const nativeDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()

  return nativeDay === 0 ? 6 : nativeDay - 1
}

function addMonths(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1))

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

function formatMonthHeading(year: number, month: number) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function buildCalendarDays({
  visibleYear,
  visibleMonth,
  selectedDate,
  today,
}: {
  visibleYear: number
  visibleMonth: number
  selectedDate: string
  today: string
}) {
  const days: CalendarDay[] = []
  const daysInVisibleMonth = getDaysInMonth(visibleYear, visibleMonth)
  const leadingBlankCount = getMondayFirstWeekdayIndex(
    visibleYear,
    visibleMonth
  )

  const previousMonth = addMonths(visibleYear, visibleMonth, -1)
  const daysInPreviousMonth = getDaysInMonth(
    previousMonth.year,
    previousMonth.month
  )

  for (let index = leadingBlankCount - 1; index >= 0; index -= 1) {
    const dayNumber = daysInPreviousMonth - index
    const dateOnly = toDateOnly(
      previousMonth.year,
      previousMonth.month,
      dayNumber
    )

    days.push({
      dateOnly,
      dayNumber,
      isCurrentMonth: false,
      isSelected: dateOnly === selectedDate,
      isToday: dateOnly === today,
    })
  }

  for (let dayNumber = 1; dayNumber <= daysInVisibleMonth; dayNumber += 1) {
    const dateOnly = toDateOnly(visibleYear, visibleMonth, dayNumber)

    days.push({
      dateOnly,
      dayNumber,
      isCurrentMonth: true,
      isSelected: dateOnly === selectedDate,
      isToday: dateOnly === today,
    })
  }

  const trailingDayCount = 42 - days.length
  const nextMonth = addMonths(visibleYear, visibleMonth, 1)

  for (let dayNumber = 1; dayNumber <= trailingDayCount; dayNumber += 1) {
    const dateOnly = toDateOnly(nextMonth.year, nextMonth.month, dayNumber)

    days.push({
      dateOnly,
      dayNumber,
      isCurrentMonth: false,
      isSelected: dateOnly === selectedDate,
      isToday: dateOnly === today,
    })
  }

  return days
}

function formatSelectedDateLabel(dateOnly: string) {
  const { year, month, day } = parseDateOnly(dateOnly)

  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export default function PracticeDayCalendarPicker({
  selectedDate,
  today,
}: PracticeDayCalendarPickerProps) {
  const selected = parseDateOnly(selectedDate)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState({
    year: selected.year,
    month: selected.month,
  })

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) return

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const days = useMemo(
    () =>
      buildCalendarDays({
        visibleYear: visibleMonth.year,
        visibleMonth: visibleMonth.month,
        selectedDate,
        today,
      }),
    [visibleMonth, selectedDate, today]
  )

  const previousVisibleMonth = addMonths(
    visibleMonth.year,
    visibleMonth.month,
    -1
  )

  const nextVisibleMonth = addMonths(visibleMonth.year, visibleMonth.month, 1)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="w-full rounded-2xl border border-border bg-background/70 px-5 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        aria-expanded={isOpen}
      >
        <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice Day
        </span>

        <span className="mt-1 block font-serif text-3xl font-bold text-foreground">
          {formatSelectedDateLabel(selectedDate)}
        </span>

        <span className="mt-1 block text-sm text-muted-foreground">
          Open calendar
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 z-30 mt-3 w-[min(92vw,26rem)] -translate-x-1/2 rounded-3xl border border-border bg-card p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setVisibleMonth(previousVisibleMonth)}
              className="rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Previous
            </button>

            <h3 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {formatMonthHeading(visibleMonth.year, visibleMonth.month)}
            </h3>

            <button
              type="button"
              onClick={() => setVisibleMonth(nextVisibleMonth)}
              className="rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Next
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                {label}
              </div>
            ))}

            {days.map((day) => {
              const href =
                day.dateOnly === today
                  ? "/review/diary"
                  : `/review/diary?date=${day.dateOnly}`

              return (
                <Link
                  key={day.dateOnly}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "rounded-xl border px-2 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                    day.isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : day.isToday
                        ? "border-accent bg-accent text-accent-foreground"
                        : day.isCurrentMonth
                          ? "border-border bg-background/70 text-foreground hover:bg-muted"
                          : "border-transparent bg-transparent text-muted-foreground/50 hover:border-border hover:bg-background/50",
                  ].join(" ")}
                  aria-current={day.isSelected ? "date" : undefined}
                >
                  {day.dayNumber}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                const parsedToday = parseDateOnly(today)

                setVisibleMonth({
                  year: parsedToday.year,
                  month: parsedToday.month,
                })
              }}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Show this month
            </button>

            <Link
              href="/review/diary"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Today
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}