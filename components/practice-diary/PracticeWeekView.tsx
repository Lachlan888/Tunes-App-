import Link from "next/link"
import PracticeCategorySummaryList from "@/components/practice-diary/PracticeCategorySummaryList"
import PracticeFocusSummaryList from "@/components/practice-diary/PracticeFocusSummaryList"
import PracticeTuneSummaryList from "@/components/practice-diary/PracticeTuneSummaryList"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeDiaryWeekData } from "@/lib/loaders/practice-diary"

type WeekTab = "summary" | "focus" | "notes"
function tabFrom(value?: string): WeekTab { return value === "focus" || value === "notes" ? value : "summary" }
function tabHref(data: PracticeDiaryWeekData, tab: WeekTab) { return `/review/diary?view=week&date=${data.selectedDate}&tab=${tab}` }

export default function PracticeWeekView({ data, activeTab }: { data: PracticeDiaryWeekData; activeTab?: string }) {
  const tab = tabFrom(activeTab)
  const outcomes = data.tuneSummaries.reduce((counts, tune) => {
    if (tune.latestOutcome === "Solid") counts.solid += 1
    if (tune.latestOutcome === "Shaky") counts.shaky += 1
    if (tune.latestOutcome === "Rough") counts.rough += 1
    return counts
  }, { solid: 0, shaky: 0, rough: 0 })

  return <div className="space-y-6">
    <nav aria-label="Week details" className="grid grid-cols-3 rounded-full border border-border bg-muted/60 p-1 sm:max-w-lg">
      {(["summary", "focus", "notes"] as const).map((item) => <Link key={item} href={tabHref(data, item)} aria-current={tab === item ? "page" : undefined} className={joinClasses("flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]", tab === item ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{item}</Link>)}
    </nav>

    {tab === "summary" ? <>
      <section className="grid gap-6 border-b border-border pb-6 lg:grid-cols-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What did I practise?</p><p className="mt-2 font-serif text-3xl font-bold">{data.summary.uniqueTunesTouched} tunes</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Across {data.summary.activeDays} active days and {data.summary.formalReviews + data.summary.practiceChecks} entries.</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What improved?</p><p className="mt-2 font-serif text-3xl font-bold">{outcomes.solid} solid</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Tunes whose latest result this week was Solid.</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What needs attention next?</p><p className="mt-2 font-serif text-3xl font-bold">{outcomes.rough + outcomes.shaky} tunes</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Latest result was Rough or Shaky; {data.summary.dueTunes} are scheduled this week.</p><Link href="/review?session=catch-up" className={`${buttonStyles.primary} mt-4`}>Practise with this context</Link></div>
      </section>
      <section aria-labelledby="week-days-heading"><h2 id="week-days-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Week chronology</h2><ol className="mt-3 divide-y divide-border border-y border-border">{data.daySummaries.map((day, index) => <li key={day.date}><Link href={`/review/diary?view=day&date=${day.date}`} className="flex min-h-16 items-center justify-between gap-4 px-2 py-3 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"><div><span className="font-semibold">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]} {day.date.slice(5)}</span>{day.isToday ? <span className="ml-2 text-xs font-semibold text-primary">Today</span> : null}<p className="mt-1 text-sm text-muted-foreground">{day.hasPractice ? `${day.uniqueTuneCount} tunes · ${day.formalReviewCount + day.practiceCheckCount} entries · ${day.noteCount} notes` : "No practice logged"}</p></div><span aria-hidden="true">→</span></Link></li>)}</ol></section>
      <section><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tunes touched</h2><PracticeTuneSummaryList summaries={data.tuneSummaries} emptyMessage="No tune practice has been logged this week yet." sortMode="recent" /></section>
    </> : tab === "focus" ? <section><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Focus areas touched</h2><p className="mt-2 text-sm text-muted-foreground">The intentions connected to your practice evidence this week.</p><PracticeFocusSummaryList summaries={data.focusSummaries} emptyMessage="No focus-linked notes this week. Open a focus area and choose tunes to practise with intent." /></section> : <section><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notes and patterns</h2><p className="mt-2 text-sm text-muted-foreground">Categories that appeared in your notes this week.</p><PracticeCategorySummaryList summaries={data.categorySummaries} emptyMessage="No categorised notes this week. Add a note from Day view to start seeing patterns." /></section>}
  </div>
}
