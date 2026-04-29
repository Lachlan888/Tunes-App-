import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import {
  importPublicList,
  importSelectedPublicListItems,
} from "@/lib/actions/lists"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import {
  loadPublicListDetailData,
  type PublicListOwnerProfile,
} from "@/lib/loaders/public-list-detail"

type PublicListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    import_public?: string
    added_count?: string
    duplicate_count?: string
    imported_list_id?: string
  }>
}

function renderOwnerLabel(owner: PublicListOwnerProfile | null) {
  if (!owner) {
    return <span>Unknown user</span>
  }

  if (owner.username) {
    return (
      <Link
        href={`/users/${owner.username}`}
        className="underline hover:no-underline"
      >
        {owner.display_name || owner.username}
        {owner.display_name ? ` (@${owner.username})` : ""}
      </Link>
    )
  }

  if (owner.display_name) {
    return <span>{owner.display_name}</span>
  }

  return <span>Unknown user</span>
}

export default async function PublicListDetailPage({
  params,
  searchParams,
}: PublicListDetailPageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const importStatus = resolvedSearchParams?.import_public ?? ""
  const addedCount = Number(resolvedSearchParams?.added_count ?? "0")
  const duplicateCount = Number(resolvedSearchParams?.duplicate_count ?? "0")
  const importedListId = Number(resolvedSearchParams?.imported_list_id ?? "0")

  const {
    user,
    typedList,
    owner,
    typedItems,
    ownedLists,
    activePieceIds,
    knownPieceIds,
    redirectTo,
    isViewingOwnPublicList,
  } = await loadPublicListDetailData(id)

  const importedList =
    importedListId > 0
      ? ownedLists.find((ownedList) => ownedList.id === importedListId) ?? null
      : null

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link href="/public-lists" className="text-sm underline">
          Back to Shared
        </Link>
      </div>

      <header className="rounded-lg border bg-white p-5 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">{typedList.name}</h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          <span>By {renderOwnerLabel(owner)}</span>
          <span>
            {typedItems.length} tune{typedItems.length === 1 ? "" : "s"}
          </span>
          {isViewingOwnPublicList && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              Your public list
            </span>
          )}
        </div>

        {typedList.description ? (
          <p className="mt-4 text-sm text-gray-800">{typedList.description}</p>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No description yet.</p>
        )}

        <p className="mt-4 max-w-2xl text-sm text-gray-600">
          Public lists are for discovery and import. Importing adds tunes into
          your own private lists first. Starting practice still stays deliberate.
        </p>
      </header>

      {importStatus === "imported_all" && (
        <div className="mt-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Imported the full list into
          {importedList ? (
            <>
              {" "}
              <Link
                href={`/learning-lists/${importedList.id}`}
                className="underline"
              >
                {importedList.name}
              </Link>
              .
            </>
          ) : (
            " a new private list."
          )}
        </div>
      )}

      {importStatus === "imported_selected" && (
        <div className="mt-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          {addedCount > 0 ? (
            <>
              Imported {addedCount} selected tune{addedCount === 1 ? "" : "s"}
              {importedList ? (
                <>
                  {" "}
                  into{" "}
                  <Link
                    href={`/learning-lists/${importedList.id}`}
                    className="underline"
                  >
                    {importedList.name}
                  </Link>
                  .
                </>
              ) : (
                "."
              )}
            </>
          ) : (
            <>All selected tunes were already in that list.</>
          )}{" "}
          {duplicateCount > 0 && (
            <span>
              Skipped {duplicateCount} duplicate
              {duplicateCount === 1 ? "" : "s"}.
            </span>
          )}
        </div>
      )}

      {importStatus === "no_selection" && (
        <div className="mt-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Select at least one tune to import.
        </div>
      )}

      {importStatus === "missing_target_list" && (
        <div className="mt-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Choose one of your lists before importing selected tunes.
        </div>
      )}

      {importStatus === "source_not_found" && (
        <div className="mt-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          That public list could not be found.
        </div>
      )}

      {importStatus === "error" && (
        <div className="mt-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not complete that import.
        </div>
      )}

      {!user ? (
        <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Import and practice</h2>
          <p className="mt-2 text-sm text-gray-600">
            Log in to import this list into your own account, start practice, or
            mark tunes as known.
          </p>
        </section>
      ) : isViewingOwnPublicList ? (
        <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Manage your list</h2>
          <p className="mt-2 text-sm text-gray-600">
            This is your public list. To edit it or manage its tunes, go to your
            owned list page.
          </p>
          <div className="mt-4">
            <Link
              href={`/learning-lists/${typedList.id}`}
              className="inline-block rounded border px-3 py-2 text-sm font-medium"
            >
              Open editable list
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Import this list</h2>
          <p className="mt-2 text-sm text-gray-600">
            Import the whole list as a new private list, or select specific tunes
            below and add them to one of your existing lists.
          </p>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row">
            <form action={importPublicList} className="rounded border p-4 lg:w-80">
              <input type="hidden" name="source_list_id" value={typedList.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <h3 className="text-sm font-semibold">Import all</h3>
              <p className="mt-2 text-sm text-gray-600">
                Create a new private imported copy of this public list.
              </p>

              <div className="mt-4">
                <SubmitButton
                  label="Import whole list"
                  pendingLabel="Importing..."
                  className="rounded border px-4 py-2 text-sm font-medium"
                />
              </div>
            </form>

            <div className="min-w-0 flex-1 rounded border p-4">
              <form id="selected-import-form" action={importSelectedPublicListItems}>
                <input type="hidden" name="source_list_id" value={typedList.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <h3 className="text-sm font-semibold">Import selected tunes</h3>

                {ownedLists.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    You do not have any lists yet. Create one on the Lists page,
                    then come back here to import selected tunes.
                  </p>
                ) : (
                  <>
                    <label
                      htmlFor="target_learning_list_id"
                      className="mt-3 block text-sm font-medium"
                    >
                      Add selected tunes to
                    </label>

                    <select
                      id="target_learning_list_id"
                      name="target_learning_list_id"
                      defaultValue=""
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      <option value="" disabled>
                        Choose one of your lists
                      </option>
                      {ownedLists.map((ownedList) => (
                        <option key={ownedList.id} value={ownedList.id}>
                          {ownedList.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4">
                      <SubmitButton
                        label="Import selected tunes"
                        pendingLabel="Importing..."
                        className="rounded border px-4 py-2 text-sm font-medium"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Tunes</h2>

        {typedItems.length === 0 ? (
          <p>This list has no tunes yet.</p>
        ) : (
          <div className="space-y-3">
            {typedItems.map((item) => {
              const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces

              if (!piece) return null

              const isAlreadyInPractice = user ? activePieceIds.has(piece.id) : false
              const isKnown = user ? knownPieceIds.has(piece.id) : false
              const canSelectForImport =
                Boolean(user) && !isViewingOwnPublicList && ownedLists.length > 0

              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-white p-3 shadow-sm"
                >
                  {canSelectForImport && (
                    <label
                      htmlFor={`select-piece-${piece.id}`}
                      className="mb-3 flex items-center gap-2 text-sm font-medium"
                    >
                      <input
                        id={`select-piece-${piece.id}`}
                        type="checkbox"
                        name="piece_ids"
                        value={piece.id}
                        form="selected-import-form"
                        className="h-4 w-4"
                      />
                      Select for import
                    </label>
                  )}

                  <TuneCard
                    id={piece.id}
                    title={piece.title}
                    keyValue={piece.key}
                    style={piece.style}
                    timeSignature={piece.time_signature}
                    referenceUrl={piece.reference_url}
                    listNames={[]}
                  >
                    {!user ? (
                      <p className="text-sm text-gray-600">
                        Log in to start practice or mark known.
                      </p>
                    ) : (
                      <>
                        {isAlreadyInPractice ? (
                          <p className="text-sm text-gray-600">
                            Already in practice
                          </p>
                        ) : (
                          <form action={startLearning}>
                            <input type="hidden" name="piece_id" value={piece.id} />
                            <input
                              type="hidden"
                              name="redirect_to"
                              value={redirectTo}
                            />
                            <SubmitButton
                              label="Start Practice"
                              pendingLabel="Starting..."
                              className="bg-black px-3 py-1 text-sm text-white"
                            />
                          </form>
                        )}

                        {!isAlreadyInPractice &&
                          (isKnown ? (
                            <p className="text-sm text-gray-600">Known</p>
                          ) : (
                            <form action={markAsKnown}>
                              <input
                                type="hidden"
                                name="piece_id"
                                value={piece.id}
                              />
                              <input
                                type="hidden"
                                name="redirect_to"
                                value={redirectTo}
                              />
                              <SubmitButton
                                label="Mark as known"
                                pendingLabel="Saving..."
                                className="border px-3 py-1 text-sm"
                              />
                            </form>
                          ))}
                      </>
                    )}
                  </TuneCard>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}