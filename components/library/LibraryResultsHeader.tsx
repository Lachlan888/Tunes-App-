type LibraryResultsHeaderProps = {
  displayedCount: number
  totalCount: number
  visibleCount: number | "all"
  currentPage: number
  totalPages: number
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  position?: "top" | "bottom"
}

type PageItem = number | "ellipsis"

function buildLibraryHref(options: {
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  visibleCount: number | "all"
  page?: number
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
    params.set("page", String(options.page ?? 1))
  }

  return params.toString() ? `/library?${params.toString()}` : "/library"
}

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PageItem[] = []
  const pages = new Set<number>()

  pages.add(1)
  pages.add(totalPages)
  pages.add(currentPage)
  pages.add(currentPage - 1)
  pages.add(currentPage + 1)

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index]
    const previousPage = sortedPages[index - 1]

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis")
    }

    items.push(page)
  }

  return items
}

const paginationButtonClass =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const disabledPaginationButtonClass =
  "rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-60"

const activeButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function LibraryResultsHeader({
  displayedCount,
  totalCount,
  visibleCount,
  currentPage,
  totalPages,
  searchQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  position = "top",
}: LibraryResultsHeaderProps) {
  const isBottom = position === "bottom"
  const isAll = visibleCount === "all"
  const hasMultiplePages = !isAll && totalPages > 1

  const previousPageHref =
    currentPage > 1
      ? buildLibraryHref({
          searchQuery,
          selectedKeys,
          selectedStyles,
          selectedTimeSignatures,
          visibleCount,
          page: currentPage - 1,
        })
      : null

  const nextPageHref =
    currentPage < totalPages
      ? buildLibraryHref({
          searchQuery,
          selectedKeys,
          selectedStyles,
          selectedTimeSignatures,
          visibleCount,
          page: currentPage + 1,
        })
      : null

  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <section
      className={
        isBottom
          ? "mt-8 hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:block"
          : "mb-4 hidden md:block"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          {!isBottom ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
                All tunes
              </h2>
            </>
          ) : null}

          <p
            className={
              isBottom
                ? "text-sm font-medium text-muted-foreground"
                : "mt-2 text-sm text-muted-foreground"
            }
          >
            Showing {displayedCount} of {totalCount} tune
            {totalCount === 1 ? "" : "s"}
            {!isAll && totalCount > 0
              ? `, page ${currentPage} of ${totalPages}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {hasMultiplePages ? (
            <nav
              aria-label="Tune catalogue pages"
              className="flex flex-wrap items-center gap-2"
            >
              {previousPageHref ? (
                <a href={previousPageHref} className={paginationButtonClass}>
                  Previous
                </a>
              ) : (
                <span className={disabledPaginationButtonClass}>Previous</span>
              )}

              {pageItems.map((pageItem, index) => {
                if (pageItem === "ellipsis") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-muted-foreground"
                    >
                      …
                    </span>
                  )
                }

                const isActive = pageItem === currentPage
                const href = buildLibraryHref({
                  searchQuery,
                  selectedKeys,
                  selectedStyles,
                  selectedTimeSignatures,
                  visibleCount,
                  page: pageItem,
                })

                return (
                  <a
                    key={pageItem}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? activeButtonClass : paginationButtonClass}
                  >
                    {pageItem}
                  </a>
                )
              })}

              {nextPageHref ? (
                <a href={nextPageHref} className={paginationButtonClass}>
                  Next
                </a>
              ) : (
                <span className={disabledPaginationButtonClass}>Next</span>
              )}
            </nav>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-muted-foreground">
              Per page
            </span>

            {([20, 50, 100, "all"] as const).map((countOption) => {
              const isActive = visibleCount === countOption
              const href = buildLibraryHref({
                searchQuery,
                selectedKeys,
                selectedStyles,
                selectedTimeSignatures,
                visibleCount: countOption,
                page: 1,
              })

              return (
                <a
                  key={String(countOption)}
                  href={href}
                  className={isActive ? activeButtonClass : paginationButtonClass}
                >
                  {countOption === "all" ? "All" : countOption}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}