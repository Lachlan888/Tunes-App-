import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import CreateListModal from "@/components/lists/CreateListModal"
import ListOverviewCard from "@/components/lists/ListOverviewCard"
import ListSearchFilters from "@/components/lists/ListSearchFilters"
import {
  LearningQueueView,
  SavedSharedView,
  UnsortedView,
} from "@/components/lists/ListsPageViews"
import ListsResultsHeader from "@/components/lists/ListsResultsHeader"
import ListsStatusMessages from "@/components/lists/ListsStatusMessages"
import ListPager from "@/components/lists/ListPager"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import PageHeader from "@/components/ui/PageHeader"
import {
  addToLearningList,
  deleteList,
  removeTuneFromList,
  startSelectedListTunes,
  unbookmarkPublicList,
  updateList,
} from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadListsData } from "@/lib/loaders/lists"
import { paginateListItems, parseListPage } from "@/lib/list-view-state"
import {
  getListFilterOptions,
  listMatchesFilters,
  normaliseForSearch,
} from "@/lib/search-filters"

type LearningListsPageProps = {
  searchParams?: Promise<{
    create_list?: string
    edit_list?: string
    bookmark_public?: string
    q?: string | string[]
    size?: string | string[]
    style?: string | string[]
    source?: string | string[]
    visibility?: string | string[]
    view?: string | string[]
    page?: string | string[]
    list_batch?: string
    group?: string | string[]
  }>
}

type ListsView = "my-lists" | "learning-queue" | "unsorted" | "saved-shared"

const LISTS_VIEWS: Array<{
  id: ListsView
  label: string
}> = [
  {
    id: "my-lists",
    label: "My Lists",
  },
  {
    id: "learning-queue",
    label: "Learning Queue",
  },
  {
    id: "unsorted",
    label: "Unsorted",
  },
  {
    id: "saved-shared",
    label: "Saved and Shared",
  },
]

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function getSingleValue(value: string | string[] | undefined) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function getListsView(value: string): ListsView {
  return LISTS_VIEWS.some((view) => view.id === value)
    ? (value as ListsView)
    : "my-lists"
}

function getBookmarkMessage(status: string) {
  if (status === "removed") return "Bookmark removed."
  if (status === "error") return "Couldn’t update that bookmark."
  if (status === "not_found") return "That shared list could not be found."
  if (status === "unavailable") {
    return "Bookmarking is not available until the bookmark table migration has been applied."
  }

  return null
}

function buildListsHref(options: {
  q: string
  size: string
  styles: string[]
  source: string
  visibility: string
  view?: ListsView
  group?: string
}) {
  const params = new URLSearchParams()

  if (options.view && options.view !== "my-lists") {
    params.set("view", options.view)
  }

  if (options.q) {
    params.set("q", options.q)
  }

  if (options.size) {
    params.set("size", options.size)
  }

  for (const style of options.styles) {
    params.append("style", style)
  }

  if (options.source) {
    params.set("source", options.source)
  }

  if (options.visibility) {
    params.set("visibility", options.visibility)
  }
  if (options.group) params.set("group", options.group)

  return params.toString()
    ? `/learning-lists?${params.toString()}`
    : "/learning-lists"
}

function buildViewHref(view: ListsView) {
  return view === "my-lists" ? "/learning-lists" : `/learning-lists?view=${view}`
}

export default async function LearningListsPage({
  searchParams,
}: LearningListsPageProps) {
  const resolvedSearchParams = await searchParams
  const showSection = (sectionId: string) => {
    void sectionId
    return true
  }

  const createListStatus = resolvedSearchParams?.create_list ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""
  const bookmarkMessage = getBookmarkMessage(
    getSingleValue(resolvedSearchParams?.bookmark_public)
  )
  const searchQuery = getSingleValue(resolvedSearchParams?.q)
  const selectedSize = getSingleValue(resolvedSearchParams?.size)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedSource = getSingleValue(resolvedSearchParams?.source)
  const selectedVisibility = getSingleValue(resolvedSearchParams?.visibility)
  const activeView = getListsView(getSingleValue(resolvedSearchParams?.view))
  const requestedPage = parseListPage(resolvedSearchParams?.page)
  const batchStatus = resolvedSearchParams?.list_batch ?? ""
  const selectedGroup = getSingleValue(resolvedSearchParams?.group)
  const activeViewConfig =
    LISTS_VIEWS.find((view) => view.id === activeView) ?? LISTS_VIEWS[0]

  const {
    learningLists,
    listOverviews,
    learningQueueTunes,
    unlistedPracticeTunes,
    unlistedKnownTunes,
    bookmarkedSharedLists,
    directSharedLists,
  } = await loadListsData()

  const { styles: availableStyles } = getListFilterOptions(listOverviews)

  const filteredListOverviews = listOverviews.filter((list) =>
    listMatchesFilters(list, {
      q: searchQuery,
      size: selectedSize,
      styles: selectedStyles,
      source: selectedSource,
      visibility: selectedVisibility,
    })
  )
  const normalizedQuery = normaliseForSearch(searchQuery)
  const matchesQuery = (value: string) =>
    !normalizedQuery || normaliseForSearch(value).includes(normalizedQuery)
  const filteredLearningQueueTunes = learningQueueTunes.filter(
    (item) =>
      matchesQuery(`${item.piece.title} ${item.listNames.join(" ")}`) &&
      (!selectedGroup || item.listIds.includes(Number(selectedGroup)))
  )
  const filteredPracticeTunes = unlistedPracticeTunes.filter((item) => {
    const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces
    return matchesQuery(piece?.title ?? "") && (!selectedGroup || selectedGroup === "practice")
  })
  const filteredKnownTunes = unlistedKnownTunes.filter((item) => {
    const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces
    return matchesQuery(piece?.title ?? "") && (!selectedGroup || selectedGroup === "known")
  })
  const filteredBookmarkedLists = bookmarkedSharedLists.filter(
    (item) => matchesQuery(`${item.name} ${item.ownerLabel}`) && (!selectedGroup || selectedGroup === "saved")
  )
  const filteredDirectSharedLists = directSharedLists.filter(
    (item) => matchesQuery(`${item.name} ${item.ownerLabel}`) && (!selectedGroup || selectedGroup === "shared")
  )

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedSize !== "" ||
    selectedStyles.length > 0 ||
    selectedSource !== "" ||
    selectedVisibility !== ""

  const redirectTo = buildListsHref({
    q: searchQuery,
    size: selectedSize,
    styles: selectedStyles,
    source: selectedSource,
    visibility: selectedVisibility,
    view: activeView,
    group: selectedGroup,
  })

  const visibleSourceIds: number[] =
    activeView === "my-lists"
      ? filteredListOverviews.map((item) => item.id)
      : activeView === "learning-queue"
        ? filteredLearningQueueTunes.map((item) => item.piece.id)
        : activeView === "unsorted"
          ? [...filteredPracticeTunes, ...filteredKnownTunes].map((item) => item.piece_id)
          : [...filteredBookmarkedLists, ...filteredDirectSharedLists].map((item) => item.id)
  const pagination = paginateListItems(visibleSourceIds, requestedPage)
  const visibleIds = new Set(pagination.items)
  const visibleLearningQueueTunes = filteredLearningQueueTunes.filter((item) =>
    visibleIds.has(item.piece.id)
  )
  const visiblePracticeTunes = filteredPracticeTunes.filter((item) =>
    visibleIds.has(item.piece_id)
  )
  const visibleKnownTunes = filteredKnownTunes.filter((item) =>
    visibleIds.has(item.piece_id)
  )
  const visibleBookmarkedLists = filteredBookmarkedLists.filter((item) =>
    visibleIds.has(item.id)
  )
  const visibleDirectSharedLists = filteredDirectSharedLists.filter((item) =>
    visibleIds.has(item.id)
  )
  const visibleListOverviews = filteredListOverviews.filter((item) =>
    visibleIds.has(item.id)
  )

  const unsortedCount = unlistedPracticeTunes.length + unlistedKnownTunes.length
  const savedSharedCount =
    bookmarkedSharedLists.length + directSharedLists.length
  const viewCounts: Record<ListsView, number> = {
    "my-lists": learningLists.length,
    "learning-queue": learningQueueTunes.length,
    unsorted: unsortedCount,
    "saved-shared": savedSharedCount,
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {bookmarkMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {bookmarkMessage}
        </div>
      ) : null}

      <PageHeader title="Lists" />

      <nav aria-label="List views" className="mb-6 overflow-x-auto border-y border-border/70 py-2 md:mb-8 md:rounded-full md:border md:bg-card md:p-1 md:shadow-sm">
        <div className="grid min-w-[620px] grid-cols-4">
          {LISTS_VIEWS.map((view) => {
            const isActive = activeView === view.id

            return (
              <Link
                key={view.id}
                href={buildViewHref(view.id)}
                aria-current={isActive ? "page" : undefined}
                className={joinClasses(
                  "flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span
                  className={joinClasses(
                    "text-sm font-semibold",
                    isActive
                      ? "text-primary-foreground/85"
                      : "text-muted-foreground"
                  )}
                >
                  {view.label}
                </span>
                <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs font-bold tabular-nums">
                  {viewCounts[view.id]}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {showSection("status_messages") ? (
        <ListsStatusMessages
          createListStatus={createListStatus}
          editListStatus={editListStatus}
        />
      ) : null}
      {batchStatus ? (
        <p role="status" className="mb-5 border-y border-border/70 py-3 text-sm font-medium text-foreground">
          {batchStatus.startsWith("started-")
            ? `${batchStatus.replace("started-", "")} tune${batchStatus === "started-1" ? "" : "s"} added to Practice.`
            : batchStatus === "empty"
              ? "Select at least one tune."
              : "Couldn’t start the selected tunes. Nothing outside your owned lists was changed."}
        </p>
      ) : null}

      <section className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {activeViewConfig.label}
            </h2>
          </div>

          {activeView === "my-lists" && showSection("create_list") ? (
            <CreateListModal />
          ) : null}
        </div>
      </section>

      {activeView !== "my-lists" ? (
        <form method="get" action="/learning-lists" className="mb-5 grid gap-3 border-y border-border/70 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input type="hidden" name="view" value={activeView} />
          <label className="sr-only" htmlFor="list-collection-search">Search this view</label>
          <input id="list-collection-search" name="q" defaultValue={searchQuery} placeholder={`Search ${activeViewConfig.label.toLowerCase()}`} className="min-h-11 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" />
          <label className="sr-only" htmlFor="list-collection-group">Group</label>
          <select id="list-collection-group" name="group" defaultValue={selectedGroup} className="min-h-11 rounded-full border border-border bg-card px-4 text-sm">
            <option value="">All groups</option>
            {activeView === "learning-queue" ? learningLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>) : null}
            {activeView === "unsorted" ? <><option value="practice">In Practice</option><option value="known">Known</option></> : null}
            {activeView === "saved-shared" ? <><option value="saved">Saved</option><option value="shared">Shared with me</option></> : null}
          </select>
          <button className={buttonStyles.primary}>Apply</button>
        </form>
      ) : null}

      {activeView === "my-lists" ? (
        <>
        {listOverviews.length > 0 &&
        (showSection("filters") || showSection("results_header")) ? (
          <>
            {showSection("filters") ? (
              <ListSearchFilters
                basePath="/learning-lists"
                searchLabel="Search by list name"
                searchPlaceholder="Search lists"
                searchValue={searchQuery}
                selectedSize={selectedSize}
                selectedStyles={selectedStyles}
                selectedSource={selectedSource}
                selectedVisibility={selectedVisibility}
                availableStyles={availableStyles}
                hasActiveFilters={hasActiveFilters}
              />
            ) : null}

            {showSection("results_header") ? (
              <ListsResultsHeader
                filteredCount={filteredListOverviews.length}
                totalCount={listOverviews.length}
                hasActiveFilters={hasActiveFilters}
              />
            ) : null}
          </>
        ) : null}

        {showSection("list_results") ? (
          <>
            {listOverviews.length === 0 ? (
              <EmptyState
                title="No lists yet"
                secondaryActionHref="/library"
                secondaryActionLabel="Browse Tunes"
                className="bg-card p-5"
                titleClassName="font-serif text-2xl font-bold text-foreground"
              />
            ) : filteredListOverviews.length === 0 ? (
              <EmptyState
                title="No lists match this view"
                primaryActionHref="/learning-lists"
                primaryActionLabel="Reset view"
              />
            ) : (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Your lists
                  </h2>
                </div>

                <div className="space-y-4">
                  {visibleListOverviews.map((list) => (
                    <ListOverviewCard
                      key={list.id}
                      list={list}
                      redirectTo={redirectTo}
                      updateList={updateList}
                      removeTuneFromList={removeTuneFromList}
                      deleteList={deleteList}
                    />
                  ))}
                </div>
                <ListPager href={redirectTo} page={pagination.page} totalPages={pagination.totalPages} label="Your lists" />
              </section>
            )}
          </>
        ) : null}
        </>
      ) : null}

      {activeView === "learning-queue" ? (
        <>
          <LearningQueueView
            learningQueueTunes={visibleLearningQueueTunes}
            startLearning={startLearning}
            startSelectedListTunes={startSelectedListTunes}
            redirectTo={redirectTo}
          />
          <ListPager href={redirectTo} page={pagination.page} totalPages={pagination.totalPages} label="Learning Queue" />
        </>
      ) : null}

      {activeView === "unsorted" ? (
        <>
          <UnsortedView
            unlistedPracticeTunes={visiblePracticeTunes}
            unlistedKnownTunes={visibleKnownTunes}
            learningLists={learningLists}
            addToLearningList={addToLearningList}
            redirectTo={redirectTo}
          />
          <ListPager href={redirectTo} page={pagination.page} totalPages={pagination.totalPages} label="Unsorted tunes" />
        </>
      ) : null}

      {activeView === "saved-shared" ? (
        <>
          <SavedSharedView
            bookmarkedSharedLists={visibleBookmarkedLists}
            directSharedLists={visibleDirectSharedLists}
            unbookmarkPublicList={unbookmarkPublicList}
            redirectTo={redirectTo}
          />
          <ListPager href={redirectTo} page={pagination.page} totalPages={pagination.totalPages} label="Saved and shared lists" />
        </>
      ) : null}
    </main>
  )
}
