import Link from "next/link"

const views = [
  ["my-lists", "My lists", "/learning-lists?view=my-lists"],
  ["discover", "Public lists", "/public-lists"],
  ["saved-shared", "Saved & shared", "/learning-lists?view=saved-shared"],
  ["learning-queue", "Learning Queue", "/learning-lists?view=learning-queue"],
  ["unsorted", "Unsorted tunes", "/learning-lists?view=unsorted"],
] as const

export default function ListsSectionNav({ activeView, counts = {} }: { activeView: string; counts?: Record<string, number> }) {
  return <nav aria-label="List views" className="sticky top-14 z-[300] -mx-4 mb-6 flex flex-wrap gap-x-1 border-b border-hairline bg-surface-canvas px-4 md:static md:z-auto md:mx-0 md:px-0">
    {views.map(([id, label, href]) => <Link key={id} href={href} aria-current={activeView === id ? "page" : undefined} className={`inline-flex min-h-11 flex-wrap items-center justify-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${activeView === id ? "border-action-primary text-foreground" : "border-transparent text-text-muted hover:text-foreground"}`}>{label}{counts[id] !== undefined && <span className="text-xs font-normal tabular-nums">{counts[id]}</span>}</Link>)}
  </nav>
}
