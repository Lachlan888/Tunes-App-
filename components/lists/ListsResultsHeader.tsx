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
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Collections
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          Your lists
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} list
          {totalCount === 1 ? "" : "s"}
        </p>
      </div>

      {hasActiveFilters && (
        <a
          href="/learning-lists"
          className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Reset view
        </a>
      )}
    </section>
  )
}