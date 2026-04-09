import PendingLinkButton from "@/components/PendingLinkButton"
import CreateListModal from "@/components/CreateListModal"
import EditListModal from "@/components/EditListModal"
import ListSearchFilters from "@/components/ListSearchFilters"
import MyTunesModal from "@/components/MyTunesModal"
import UnlistedKnownTunesModal from "@/components/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/UnlistedPracticeTunesModal"
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

      {createListStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List created.
        </div>
      )}

      {createListStatus === "missing_name" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a list name.
        </div>
      )}

      {createListStatus === "invalid_visibility" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Invalid list visibility.
        </div>
      )}

      {createListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not create list.
        </div>
      )}

      {editListStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List updated.
        </div>
      )}

      {editListStatus === "removed_tune" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from this list.
        </div>
      )}

      {editListStatus === "deleted" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List deleted.
        </div>
      )}

      {editListStatus === "missing_list" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which list to edit.
        </div>
      )}

      {editListStatus === "missing_name" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a list name.
        </div>
      )}

      {editListStatus === "missing_item" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove from the list.
        </div>
      )}

      {editListStatus === "invalid_visibility" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Invalid list visibility.
        </div>
      )}

      {editListStatus === "not_found" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          List not found or you do not own it.
        </div>
      )}

      {editListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not update list.
        </div>
      )}

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded border p-4">
          <div>
            <h2 className="text-xl font-semibold">My Tunes</h2>
            <p className="mt-2 text-gray-600">Known and active learning tunes</p>

            <div className="mt-3">
              <span className="text-sm text-gray-500">
                {myTunes.length} tune{myTunes.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {myTunes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No tunes yet.</p>
          ) : (
            <div className="mt-4">
              <MyTunesModal myTunes={myTunes} />
            </div>
          )}
        </section>

        <UnlistedPracticeTunesModal
          unlistedPracticeTunes={unlistedPracticeTunes}
          learningLists={learningLists}
          addToLearningList={addToLearningList}
          redirectTo={redirectTo}
          summaryClassName="rounded border p-4 h-full"
        />

        <UnlistedKnownTunesModal
          unlistedKnownTunes={unlistedKnownTunes}
          learningLists={learningLists}
          addToLearningList={addToLearningList}
          redirectTo={redirectTo}
          summaryClassName="rounded border p-4 h-full"
        />
      </div>

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

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing {filteredListOverviews.length} of {listOverviews.length} list
              {listOverviews.length === 1 ? "" : "s"}
            </p>

            {hasActiveFilters && (
              <a href="/learning-lists" className="text-sm underline">
                Reset view
              </a>
            )}
          </div>
        </>
      )}

      {listOverviews.length === 0 ? (
        <p className="text-gray-600">No lists yet.</p>
      ) : filteredListOverviews.length === 0 ? (
        <p className="text-gray-600">No lists match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredListOverviews.map((list) => (
            <section key={list.id} className="rounded border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold">{list.name}</h2>

                  {list.description && (
                    <p className="mt-2 text-gray-600">{list.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <PendingLinkButton
                      href={`/learning-lists/${list.id}`}
                      label="View List"
                      pendingLabel="Loading..."
                      className="text-sm underline"
                    />

                    <EditListModal
                      listId={list.id}
                      name={list.name}
                      description={list.description}
                      visibility={list.visibility}
                      redirectTo={redirectTo}
                      tunes={list.tunes}
                      updateList={updateList}
                      removeTuneFromList={removeTuneFromList}
                      deleteList={deleteList}
                      triggerLabel="Manage List"
                    />
                  </div>

                  {list.stylesPresent.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {list.stylesPresent.map((style) => (
                        <span
                          key={style}
                          className="rounded-full border px-2 py-1 text-xs text-gray-700"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm text-gray-500">
                    {list.visibility === "public" ? "Public" : "Private"}
                  </div>

                  {list.is_imported && (
                    <div className="mt-1 text-sm text-gray-500">Imported</div>
                  )}

                  <div className="mt-1 text-sm text-gray-500">
                    {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}