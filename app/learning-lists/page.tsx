import CreateListModal from "@/components/CreateListModal"
import EmptyState from "@/components/EmptyState"
import ListSearchFilters from "@/components/ListSearchFilters"
import ListOverviewCard from "@/components/lists/ListOverviewCard"
import ListsResultsHeader from "@/components/lists/ListsResultsHeader"
import ListsStatusMessages from "@/components/lists/ListsStatusMessages"
import ListsSummaryGrid from "@/components/lists/ListsSummaryGrid"
import {
  addToLearningList,
  deleteList,
  removeTuneFromList,
  updateList,
} from "@/lib/actions/lists"
import { loadListsData } from "@/lib/loaders/lists"
import {
  getListFilterOptions,
  listMatchesFilters,
} from "@/lib/search-filters"

type LearningListsPageProps = {
  searchParams?: Promise<{
    create_list?: string
    edit_list?: string
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

  return params.toString() ? `/learning-lists?${params.toString()}` : "/learning-lists"
}

export default async function LearningListsPage({
  searchParams,
}: LearningListsPageProps) {
  const resolvedSearchParams = await searchParams

  const createListStatus = resolvedSearchParams?.create_list ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""

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
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Lists</h1>
      <p className="mb-4 text-gray-600">Logged in as {user.email}</p>

      <CreateListModal />

      <ListsStatusMessages
        createListStatus={createListStatus}
        editListStatus={editListStatus}
      />

      <ListsSummaryGrid
        myTunes={myTunes}
        unlistedPracticeTunes={unlistedPracticeTunes}
        unlistedKnownTunes={unlistedKnownTunes}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
      />

      {listOverviews.length > 0 && (
        <>
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

          <ListsResultsHeader
            filteredCount={filteredListOverviews.length}
            totalCount={listOverviews.length}
            hasActiveFilters={hasActiveFilters}
          />
        </>
      )}

      {listOverviews.length === 0 ? (
        <EmptyState
          title="No lists yet"
          description="Lists are where you organise tunes for learning, repertoire, sessions, or publishing. Use Create List above to start one."
          secondaryActionHref="/library"
          secondaryActionLabel="Browse Tunes"
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
    </main>
  )
}