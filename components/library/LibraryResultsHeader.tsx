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
    <>
      <h2 className="mb-4 text-2xl font-semibold">All tunes</h2>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Showing {filteredCount} tune{filteredCount === 1 ? "" : "s"}
        </p>

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
                className={`rounded border px-3 py-1 text-sm ${
                  isActive ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {countOption === "all" ? "All" : countOption}
              </a>
            )
          })}
        </div>
      </div>
    </>
  )
}