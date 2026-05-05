type LibraryResultsHeaderProps = {
  filteredCount: number
  visibleCount: number | "all"
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
}

function buildLibraryHref(options: {
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  visibleCount: number | "all"
}) {
  const params = new URLSearchParams()

  if (options.searchQuery) {
    params.set("q", options.searchQuery)
  }

  for (const key of options.selectedKeys) {
    params.append("key", key)
  }

  for (const style of options.selectedStyles) {
    params.append("style", style)
  }

  for (const timeSignature of options.selectedTimeSignatures) {
    params.append("time_signature", timeSignature)
  }

  if (options.visibleCount === "all") {
    params.set("visible", "all")
  } else {
    params.set("visible", String(options.visibleCount))
  }

  return params.toString() ? `/library?${params.toString()}` : "/library"
}

export default function LibraryResultsHeader({
  filteredCount,
  visibleCount,
  searchQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
}: LibraryResultsHeaderProps) {
  return (
    <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Catalogue
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          All tunes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {filteredCount} tune{filteredCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([20, 50, 100, "all"] as const).map((countOption) => {
          const isActive = visibleCount === countOption
          const href = buildLibraryHref({
            searchQuery,
            selectedKeys,
            selectedStyles,
            selectedTimeSignatures,
            visibleCount: countOption,
          })

          return (
            <a
              key={String(countOption)}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {countOption === "all" ? "All" : countOption}
            </a>
          )
        })}
      </div>
    </section>
  )
}