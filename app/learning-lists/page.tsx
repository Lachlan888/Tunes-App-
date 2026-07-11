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
import { joinClasses } from "@/components/ui/buttonStyles"
import PageHeader from "@/components/ui/PageHeader"
import {
  addToLearningList,
  deleteList,
  removeTuneFromList,
  unbookmarkPublicList,
  updateList,
} from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadListsData } from "@/lib/loaders/lists"
import {
  getListFilterOptions,
  listMatchesFilters,
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
  const activeViewConfig =
    LISTS_VIEWS.find((view) => view.id === activeView) ?? LISTS_VIEWS[0]

  const {
    learningLists,
    listOverviews,
    personalTuneCounts,
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
  })

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

      <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm md:mb-8 md:p-6">
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {LISTS_VIEWS.map((view) => {
            const isActive = activeView === view.id

            return (
              <Link
                key={view.id}
                href={buildViewHref(view.id)}
                aria-current={isActive ? "page" : undefined}
                className={joinClasses(
                  "rounded-2xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background/70 text-foreground hover:bg-muted"
                )}
              >
                <span
                  className={joinClasses(
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isActive
                      ? "text-primary-foreground/85"
                      : "text-muted-foreground"
                  )}
                >
                  {view.label}
                </span>
                <span className="mt-2 block font-serif text-3xl font-bold leading-none">
                  {viewCounts[view.id]}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm font-semibold text-foreground">
            My Tunes lives in Tunes now.
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            You have {personalTuneCounts.total} personal tune
            {personalTuneCounts.total === 1 ? "" : "s"}:{" "}
            {personalTuneCounts.inPractice} in Practice and{" "}
            {personalTuneCounts.known} Known.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/library/practice"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Practice Tunes
            </Link>
            <Link
              href="/library/known"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Known Tunes
            </Link>
          </div>
        </div>
      </section>

      {showSection("status_messages") ? (
        <ListsStatusMessages
          createListStatus={createListStatus}
          editListStatus={editListStatus}
        />
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
                  {filteredListOverviews.map((list) => (
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
              </section>
            )}
          </>
        ) : null}
        </>
      ) : null}

      {activeView === "learning-queue" ? (
        <LearningQueueView
          learningQueueTunes={learningQueueTunes}
          startLearning={startLearning}
          redirectTo={redirectTo}
        />
      ) : null}

      {activeView === "unsorted" ? (
        <UnsortedView
          unlistedPracticeTunes={unlistedPracticeTunes}
          unlistedKnownTunes={unlistedKnownTunes}
          learningLists={learningLists}
          addToLearningList={addToLearningList}
          redirectTo={redirectTo}
        />
      ) : null}

      {activeView === "saved-shared" ? (
        <SavedSharedView
          bookmarkedSharedLists={bookmarkedSharedLists}
          directSharedLists={directSharedLists}
          unbookmarkPublicList={unbookmarkPublicList}
          redirectTo={redirectTo}
        />
      ) : null}
    </main>
  )
}
