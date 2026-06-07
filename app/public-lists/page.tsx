import EmptyState from "@/components/EmptyState"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import PublicListSearchFilters from "@/components/shared/PublicListSearchFilters"
import SharedListCard from "@/components/shared/SharedListCard"
import SharedListsEmptyState from "@/components/shared/SharedListsEmptyState"
import SharedListsErrorState from "@/components/shared/SharedListsErrorState"
import SharedListsHeader from "@/components/shared/SharedListsHeader"
import SharedListsMobileList from "@/components/shared/SharedListsMobileList"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import {
  loadPublicListsData,
  type SharedList,
} from "@/lib/loaders/public-lists"
import { SHARED_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import { normaliseForSearch } from "@/lib/search-filters"

type PublicListSortValue = "recent" | "alpha" | "tune-count"

type PublicListsPageProps = {
  searchParams?: Promise<{
    page_options?: string | string[]
    q?: string | string[]
    sort?: string | string[]
    style?: string | string[]
  }>
}

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Public lists display options saved."
  if (status === "reset") return "Public lists display options reset."
  if (status === "error") return "Couldn’t save display options."

  return null
}

function getSortValue(value: string): PublicListSortValue {
  if (value === "alpha") return "alpha"
  if (value === "tune-count") return "tune-count"

  return "recent"
}

function buildPublicListsHref(options: {
  q: string
  styles: string[]
  sort: PublicListSortValue
}) {
  const params = new URLSearchParams()

  if (options.q) {
    params.set("q", options.q)
  }

  for (const style of options.styles) {
    params.append("style", style)
  }

  if (options.sort !== "recent") {
    params.set("sort", options.sort)
  }

  return params.toString() ? `/public-lists?${params.toString()}` : "/public-lists"
}

function listMatchesPublicFilters(
  list: SharedList,
  filters: {
    q: string
    styles: string[]
  }
) {
  const hasSearch = filters.q.trim() !== ""

  const searchableText = [
    list.name,
    list.description,
    list.ownerLabel,
    list.ownerUsername,
    list.ownerDisplayName,
    list.dominantStyle,
    ...list.stylesPresent,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")

  const matchesSearch =
    !hasSearch ||
    normaliseForSearch(searchableText).includes(normaliseForSearch(filters.q))

  const matchesStyle =
    filters.styles.length === 0 ||
    filters.styles.some((selectedStyle) => list.stylesPresent.includes(selectedStyle))

  return matchesSearch && matchesStyle
}

function sortPublicLists(lists: SharedList[], sort: PublicListSortValue) {
  const sortedLists = [...lists]

  if (sort === "alpha") {
    return sortedLists.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (sort === "tune-count") {
    return sortedLists.sort((a, b) => {
      if (b.tuneCount !== a.tuneCount) {
        return b.tuneCount - a.tuneCount
      }

      return a.name.localeCompare(b.name)
    })
  }

  return sortedLists.sort((a, b) => b.id - a.id)
}

function getAvailableStyles(lists: SharedList[]) {
  return Array.from(new Set(lists.flatMap((list) => list.stylesPresent))).sort()
}

export default async function PublicListsPage({
  searchParams,
}: PublicListsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pagePreferences = await loadPagePreferences(
    SHARED_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

  const searchQuery = getSingleValue(resolvedSearchParams?.q)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedSort = getSortValue(getSingleValue(resolvedSearchParams?.sort))

  const publicListsData = await loadPublicListsData()

  if (publicListsData.status === "error") {
    return <SharedListsErrorState message={publicListsData.message} />
  }

  const availableStyles = getAvailableStyles(publicListsData.sharedLists)

  const filteredLists = sortPublicLists(
    publicListsData.sharedLists.filter((list) =>
      listMatchesPublicFilters(list, {
        q: searchQuery,
        styles: selectedStyles,
      })
    ),
    selectedSort
  )

  const hasActiveFilters =
    searchQuery !== "" || selectedStyles.length > 0 || selectedSort !== "recent"

  const redirectTo = buildPublicListsHref({
    q: searchQuery,
    styles: selectedStyles,
    sort: selectedSort,
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {pageOptionsMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="mb-8 hidden flex-wrap items-center justify-end gap-3 md:flex">
        <PageOptionsModal
          config={SHARED_PAGE_OPTIONS_CONFIG}
          preferences={pagePreferences}
          redirectTo={redirectTo}
        />
      </section>

      {showSection("shared_header") ? <SharedListsHeader /> : null}

      {publicListsData.sharedLists.length === 0 ? (
        showSection("empty_state") ? (
          <SharedListsEmptyState />
        ) : null
      ) : showSection("public_lists") ? (
        <>
          <div className="mb-5 md:mb-8">
            <PublicListSearchFilters
              basePath="/public-lists"
              searchValue={searchQuery}
              selectedStyles={selectedStyles}
              selectedSort={selectedSort}
              availableStyles={availableStyles}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          <section className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Showing {filteredLists.length} of{" "}
                {publicListsData.sharedLists.length} public list
                {publicListsData.sharedLists.length === 1 ? "" : "s"}
              </p>
            </div>

            {hasActiveFilters ? (
              <a
                href="/public-lists"
                className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Reset view
              </a>
            ) : null}
          </section>

          {filteredLists.length === 0 ? (
            <EmptyState
              title="No public lists match this view"
              description="Try clearing the search or filters."
              primaryActionHref="/public-lists"
              primaryActionLabel="Reset view"
              className="bg-card p-5"
              titleClassName="font-serif text-2xl font-bold text-foreground"
            />
          ) : (
            <>
              <SharedListsMobileList lists={filteredLists} />

              <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Public lists
                </h2>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {filteredLists.map((list) => (
                    <SharedListCard key={list.id} list={list} />
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  )
}
