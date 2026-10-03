import Link from "next/link"

const views = [
  ["my-lists", "My lists", "/learning-lists?view=my-lists"],
  ["discover", "Public lists", "/public-lists"],
  ["saved-shared", "Saved & shared", "/learning-lists?view=saved-shared"],
  ["learning-queue", "Learning Queue", "/learning-lists?view=learning-queue"],
  ["unsorted", "Unsorted tunes", "/learning-lists?view=unsorted"],
] as const

export default function ListsSectionNav({ activeView, counts = {} }: { activeView: string; counts?: Record<string, number> }) {
  return <nav aria-label="List views" className="floating-material sticky top-14 z-[300] -mx-4 mb-6 flex flex-wrap gap-1 border-b border-hairline p-3 md:static md:z-auto md:mx-0 md:rounded-object md:border md:bg-surface-paper md:p-1">
    {views.map(([id, label, href]) => <Link key={id} href={href} aria-current={activeView === id ? "page" : undefined} className={`inline-flex min-h-11 flex-wrap items-center justify-center gap-2 rounded-control px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${activeView === id ? "bg-action-primary text-action-primary-foreground underline underline-offset-4" : "text-text-primary hover:bg-surface-note"}`}>{label}{counts[id] !== undefined && <span className="text-xs tabular-nums">{counts[id]}</span>}</Link>)}
  </nav>
}
