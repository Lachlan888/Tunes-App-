import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import FocusedPracticeSession from "@/components/practice/FocusedPracticeSession"
import PracticeEntryResolver from "@/components/practice/PracticeEntryResolver"
import { loadReviewPageData } from "@/lib/loaders/review"
import { parsePracticeLane } from "@/lib/practice-session"

type ReviewPageProps = {
  searchParams?: Promise<{
    remove_from_practice?: string; practice_update?: string
    preferred_reference?: string | string[]; loop?: string | string[]
    session?: string; list_id?: string; focus_id?: string; run?: string
  }>
}
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? ""

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams
  const requestedLane = parsePracticeLane(params?.session)
  // Old bookmarks enter the same automatic due + overdue queue.
  const practiceLane = requestedLane === "due-today" || requestedLane === "catch-up" ? "ready" : requestedLane
  const data = await loadReviewPageData({ lane: practiceLane, listId: Number(params?.list_id), focusId: Number(params?.focus_id) })
  if (practiceLane) {
    return <FocusedPracticeSession
      key={`${data.today}:${practiceLane}:${data.sessionKey ?? ""}:${params?.run ?? ""}`}
      lane={practiceLane} initialQueue={data.practiceItems} queueTotal={data.queueTotal}
      sessionDate={data.today} sessionLabel={data.sessionLabel} sessionKey={data.sessionKey} scopeId={data.scopeId}
      practiceDiaryEnabled={data.practiceDiaryEnabled}
    />
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-6 text-text-primary sm:px-8">
      <PracticeStatusMessages practiceUpdate={params?.practice_update ?? ""} removeFromPracticeStatus={params?.remove_from_practice ?? ""} loopStatus={single(params?.loop)} preferredReferenceStatus={single(params?.preferred_reference)} />
      <PracticeEntryResolver today={data.today} readyCount={data.dueTodayCount + data.catchUpCount} activeCount={data.activeCount} />
    </main>
  )
}
