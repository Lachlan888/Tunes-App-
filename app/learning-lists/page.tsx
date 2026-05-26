import EmptyState from "@/components/EmptyState"
import CreateListModal from "@/components/lists/CreateListModal"
import ListOverviewCard from "@/components/lists/ListOverviewCard"
import ListSearchFilters from "@/components/lists/ListSearchFilters"
import ListsMobileSwitcher from "@/components/lists/ListsMobileSwitcher"
import ListsResultsHeader from "@/components/lists/ListsResultsHeader"
import ListsStatusMessages from "@/components/lists/ListsStatusMessages"
import ListsSummaryGrid from "@/components/lists/ListsSummaryGrid"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import {
  addToLearningList,
  deleteList,
  removeTuneFromList,
  updateList,
} from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadListsData } from "@/lib/loaders/lists"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { LISTS_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import {
  getListFilterOptions,
  listMatchesFilters,
} from "@/lib/search-filters"

type LearningListsPageProps = {
  searchParams?: Promise<{
    create_list?: string
    edit_list?: string
    page_options?: string | string[]
    q?: string | string[]
    size?: string | string[]
    style?: string | string[]
    source?: string | string[]
    visibility?: string | string[]
  }>
}

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function getSingleValue(value: string | string[] | undefined) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Lists page options saved."
  if (status === "reset") return "Lists page options reset."
  if (status === "error") return "Could not save Lists page options."

  return null
}

function buildListsHref(options: {
  q: string
  size: string
  styles: string[]
  source: string
  visibility: string
}) {
  const params = new URLSearchParams()

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

export default async function LearningListsPage({
  searchParams,
}: LearningListsPageProps) {
  const resolvedSearchParams = await searchParams
  const pagePreferences = await loadPagePreferences(
    LISTS_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const createListStatus = resolvedSearchParams?.create_list ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""
  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

  const searchQuery = getSingleValue(resolvedSearchParams?.q)
  const selectedSize = getSingleValue(resolvedSearchParams?.size)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedSource = getSingleValue(resolvedSearchParams?.source)
  const selectedVisibility = getSingleValue(resolvedSearchParams?.visibility)

  const {
    user,
    learningLists,
    listOverviews,
    myTunes,
    learningQueueTunes,
    unlistedPracticeTunes,
    unlistedKnownTunes,
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
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {pageOptionsMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {pageOptionsMessage}
        </div>
      ) : null}

      <div className="md:hidden">
        <ListsMobileSwitcher
          userEmail={user.email}
          myTunes={myTunes}
          learningQueueTunes={learningQueueTunes}
          unlistedPracticeTunes={unlistedPracticeTunes}
          unlistedKnownTunes={unlistedKnownTunes}
          learningLists={learningLists}
          listOverviews={listOverviews}
          filteredListOverviews={filteredListOverviews}
          availableStyles={availableStyles}
          searchQuery={searchQuery}
          selectedSize={selectedSize}
          selectedStyles={selectedStyles}
          selectedSource={selectedSource}
          selectedVisibility={selectedVisibility}
          hasActiveFilters={hasActiveFilters}
          createListStatus={createListStatus}
          editListStatus={editListStatus}
          showCreateList={showSection("create_list")}
          showSummaryGrid={showSection("summary_grid")}
          showFilters={showSection("filters")}
          showResultsHeader={showSection("results_header")}
          showListResults={showSection("list_results")}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          startLearning={startLearning}
          updateList={updateList}
          removeTuneFromList={removeTuneFromList}
          deleteList={deleteList}
        />
      </div>

      <div className="hidden md:block">
        <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Lists
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">
                Organise your tunes
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Keep repertoire, practice queues, session sets, and imported
                collections in clear working lists.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Logged in as {user.email}
              </p>
            </div>

            <PageOptionsModal
              config={LISTS_PAGE_OPTIONS_CONFIG}
              preferences={pagePreferences}
              redirectTo={redirectTo}
            />
          </div>
        </section>

        {showSection("create_list") ? (
          <div className="mb-8">
            <CreateListModal />
          </div>
        ) : null}

        {showSection("status_messages") ? (
          <ListsStatusMessages
            createListStatus={createListStatus}
            editListStatus={editListStatus}
          />
        ) : null}

        {showSection("summary_grid") ? (
          <ListsSummaryGrid
            myTunes={myTunes}
            learningQueueTunes={learningQueueTunes}
            unlistedPracticeTunes={unlistedPracticeTunes}
            unlistedKnownTunes={unlistedKnownTunes}
            learningLists={learningLists}
            addToLearningList={addToLearningList}
            startLearning={startLearning}
            redirectTo={redirectTo}
          />
        ) : null}

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
                description="Lists are where you organise tunes for learning, repertoire, sessions, or publishing. Use Create List above to start one."
                secondaryActionHref="/library"
                secondaryActionLabel="Browse Tunes"
                className="bg-card p-5"
                titleClassName="font-serif text-2xl font-bold text-foreground"
              />
            ) : filteredListOverviews.length === 0 ? (
              <EmptyState
                title="No lists match this view"
                description="Try clearing the search or filters."
                primaryActionHref="/learning-lists"
                primaryActionLabel="Reset view"
              />
            ) : (
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
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}
