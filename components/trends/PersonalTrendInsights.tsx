import Link from "next/link"
import type { PersonalTrendInsight } from "@/lib/loaders/trends"

const PERIODS = [4, 8, 12] as const

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "Australia/Melbourne",
  }).format(new Date(`${value}T12:00:00+10:00`))
}

function InsightHeader({
  id,
  title,
  takeaway,
}: {
  id: string
  title: string
  takeaway: string
}) {
  return (
    <div>
      <h2 id={id} className="font-sans text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{takeaway}</p>
    </div>
  )
}

export default function PersonalTrendInsights({
  insight,
}: {
  insight: PersonalTrendInsight
}) {
  const maxEvents = Math.max(...insight.weeks.map((week) => week.eventCount), 1)
  const maxStage = Math.max(...insight.stageDistribution.map((item) => item.count), 1)
  const hasPracticeData = insight.totalEvents > 0

  if (!hasPracticeData && insight.stageDistribution.length === 0) {
    return (
      <section className="border-b border-hairline py-7" aria-labelledby="trends-empty-title">
        <h2 id="trends-empty-title" className="font-sans text-2xl font-bold">
          Not enough data yet
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Complete a practice session to start seeing weekly volume, consistency,
          outcomes and movement.
        </p>
        <Link
          href="/review"
          className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          Start Practice
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-10">
      <section className="border-b border-hairline py-6" aria-labelledby="progress-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="progress-title" className="font-sans text-3xl font-bold tracking-tight">
              {insight.needsAttention.length > 0
                ? `${insight.needsAttention.length} tunes need attention`
                : `${insight.activeWeeks} active weeks out of ${insight.periodWeeks}`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {insight.totalEvents} practice event{insight.totalEvents === 1 ? "" : "s"} from {shortDate(insight.startDate)} to {shortDate(insight.endDate)}.
            </p>
          </div>
          <nav aria-label="Trend period" className="inline-flex w-fit border-b border-hairline">
            {PERIODS.map((period) => (
              <Link
                key={period}
                href={`/trends?period=${period}`}
                aria-current={period === insight.periodWeeks ? "page" : undefined}
                className={`inline-flex min-h-11 min-w-14 items-center justify-center border-b-2 px-3 text-sm font-semibold ${
                  period === insight.periodWeeks
                    ? "border-action-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {period}w
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {hasPracticeData ? (
          <section className="min-w-0" aria-labelledby="practice-volume-title">
            <InsightHeader
              id="practice-volume-title"
              title="Weekly rhythm"
              takeaway={`Practice volume · ${insight.activeWeeks} of ${insight.periodWeeks} weeks included practice. Each bar also shows its exact count.`}
            />
            <ol className="mt-5 flex h-44 items-end gap-2 border-b border-border px-1" aria-label="Practice events by week">
              {insight.weeks.map((week) => (
                <li key={week.weekStart} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center">
                  <span className="text-xs font-semibold tabular-nums">{week.eventCount}</span>
                  <span
                    className="min-h-1 rounded-t bg-primary"
                    style={{ height: `${Math.max((week.eventCount / maxEvents) * 100, 3)}%` }}
                    title={`${week.eventCount} events in week starting ${shortDate(week.weekStart)}`}
                  />
                  <span className="truncate pb-2 text-[11px] text-muted-foreground">{shortDate(week.weekStart)}</span>
                </li>
              ))}
            </ol>
            <details className="mt-3 text-sm text-muted-foreground">
              <summary className="min-h-11 cursor-pointer py-3 font-semibold text-foreground">View weekly data</summary>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Weekly practice events, reviews and active days</caption>
                  <thead><tr className="border-b border-border"><th className="py-2">Week</th><th>Events</th><th>Reviews</th><th>Days</th></tr></thead>
                  <tbody>{insight.weeks.map((week) => <tr key={week.weekStart} className="border-b border-border/70"><th className="py-2 font-medium">{shortDate(week.weekStart)}</th><td>{week.eventCount}</td><td>{week.reviewCount}</td><td>{week.activeDays}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </section>
        ) : null}

        {insight.stageDistribution.length > 0 ? (
          <section aria-labelledby="stage-title">
            <InsightHeader
              id="stage-title"
              title="Where your tunes sit"
              takeaway={`Stage distribution · ${insight.stageDistribution.reduce((sum, item) => sum + item.count, 0)} tunes are currently in active practice.`}
            />
            <ol className="mt-5 space-y-3" aria-label="Active tunes by practice stage">
              {insight.stageDistribution.map((item) => (
                <li key={item.stage} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="font-medium">Stage {item.stage}</span>
                  <span className="h-3 overflow-hidden rounded-control bg-muted">
                    <span className="block h-full rounded-control bg-primary" style={{ width: `${(item.count / maxStage) * 100}%` }} />
                  </span>
                  <span className="text-right font-semibold tabular-nums">{item.count}</span>
                </li>
              ))}
            </ol>
            {insight.improvedTuneCount > 0 ? (
              <p className="mt-5 border-l-4 border-primary pl-4 text-sm leading-6">
                <strong>{insight.improvedTuneCount} tune{insight.improvedTuneCount === 1 ? " has" : "s have"}</strong> moved from Rough to Solid during this period.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className="grid gap-10 border-t border-border pt-8 lg:grid-cols-2">
        {insight.needsAttention.length > 0 ? (
          <section aria-labelledby="attention-title">
            <InsightHeader id="attention-title" title="Catch up without guessing" takeaway="Needs attention · These overdue tunes are ordered by due date." />
            <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
              {insight.needsAttention.map((tune) => (
                <li key={tune.pieceId} className="flex min-h-14 items-center justify-between gap-4 py-2">
                  <Link href={`/library/${tune.pieceId}`} className="font-semibold underline-offset-4 hover:underline">{tune.title}</Link>
                  <span className="shrink-0 text-sm text-muted-foreground">Stage {tune.stage}</span>
                </li>
              ))}
            </ul>
            <Link href="/review" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Start practice</Link>
          </section>
        ) : null}

        {insight.exploreGap ? (
          <section aria-labelledby="gap-title">
            <InsightHeader id="gap-title" title={`Try ${insight.exploreGap.label}`} takeaway={`Explore a gap · Your repertoire has no ${insight.exploreGap.kind} match yet; the catalogue has ${insight.exploreGap.catalogueCount}.`} />
            <Link
              href={`/library?${insight.exploreGap.kind}=${encodeURIComponent(insight.exploreGap.label)}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-control border border-border px-5 text-sm font-semibold hover:bg-muted justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              Explore tunes
            </Link>
          </section>
        ) : null}
      </div>

      {(insight.personalStyleCoverage.length > 0 || insight.personalKeyCoverage.length > 0) ? (
        <section className="border-t border-border pt-8" aria-labelledby="coverage-title">
          <InsightHeader id="coverage-title" title="Styles and keys in your repertoire" takeaway="Coverage counts include your Known and active Practice tunes; duplicate membership is shown once per collection source." />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {[{ label: "Styles", items: insight.personalStyleCoverage }, { label: "Keys", items: insight.personalKeyCoverage }].map((group) => (
              <div key={group.label}>
                <h3 className="text-sm font-semibold">{group.label}</h3>
                <ul className="mt-2 divide-y divide-hairline border-t border-hairline">
                  {group.items.map((item) => <li key={item.label} className="flex min-h-11 items-center justify-between"><span>{item.label}</span><strong>{item.count}</strong></li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
