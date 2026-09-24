import Link from "next/link"

type ListsResultsHeaderProps = {
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
}

export default function ListsResultsHeader({
  filteredCount,
  totalCount,
  hasActiveFilters,
}: ListsResultsHeaderProps) {
  return (
    <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} list
          {totalCount === 1 ? "" : "s"}
        </p>
      </div>

      {hasActiveFilters && (
        <Link
          href="/learning-lists"
          className="min-h-11 inline-flex items-center justify-center rounded-control border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Reset view
        </Link>
      )}
    </section>
  )
}
