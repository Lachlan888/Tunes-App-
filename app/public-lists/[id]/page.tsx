import Link from "next/link"
import type { ReactNode } from "react"
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

  const ownerLabel = owner.display_name || owner.username || "Unknown user"

  if (owner.username) {
    return (
      <Link
        href={`/users/${owner.username}`}
        className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
      >
        {ownerLabel}
      </Link>
    )
  }

  return <span>{ownerLabel}</span>
}

function getStatusClasses(tone: "success" | "warning" | "error") {
  if (tone === "success") {
    return "border-success text-success"
  }

  if (tone === "warning") {
    return "border-warning-strong text-warning-foreground"
  }

  return "border-destructive text-destructive"
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error"
  children: ReactNode
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border bg-background/70 p-4 text-sm shadow-sm ${getStatusClasses(
        tone
      )}`}
    >
      {children}
    </div>
  )
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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href="/public-lists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Public Lists
        </Link>
      </div>

      <header className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {typedList.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>By {renderOwnerLabel(owner)}</span>
              <span aria-hidden="true">•</span>
              <span>
                {typedItems.length} tune{typedItems.length === 1 ? "" : "s"}
              </span>

              {isViewingOwnPublicList && (
                <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Your public list
                </span>
              )}
            </div>

            {typedList.description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-foreground">
                {typedList.description}
              </p>
            ) : (
              <p className="mt-5 text-base text-muted-foreground">
                No description yet.
              </p>
            )}
          </div>

          {isViewingOwnPublicList && (
            <Link
              href={`/learning-lists/${typedList.id}`}
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Open editable list
            </Link>
          )}
        </div>

        <p className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
          Public lists are for discovery and import. Importing adds tunes into
          your own private lists first. Starting practice still stays
          deliberate.
        </p>
      </header>

      {importStatus === "imported_all" && (
        <StatusMessage tone="success">
          Imported the full list into
          {importedList ? (
            <>
              {" "}
              <Link
                href={`/learning-lists/${importedList.id}`}
                className="font-medium underline underline-offset-4"
              >
                {importedList.name}
              </Link>
              .
            </>
          ) : (
            " a new private list."
          )}
        </StatusMessage>
      )}

      {importStatus === "imported_selected" && (
        <StatusMessage tone="success">
          {addedCount > 0 ? (
            <>
              Imported {addedCount} selected tune{addedCount === 1 ? "" : "s"}
              {importedList ? (
                <>
                  {" "}
                  into{" "}
                  <Link
                    href={`/learning-lists/${importedList.id}`}
                    className="font-medium underline underline-offset-4"
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
        </StatusMessage>
      )}

      {importStatus === "no_selection" && (
        <StatusMessage tone="warning">
          Select at least one tune to import.
        </StatusMessage>
      )}

      {importStatus === "missing_target_list" && (
        <StatusMessage tone="warning">
          Choose one of your lists before importing selected tunes.
        </StatusMessage>
      )}

      {importStatus === "source_not_found" && (
        <StatusMessage tone="error">
          That public list could not be found.
        </StatusMessage>
      )}

      {importStatus === "error" && (
        <StatusMessage tone="error">
          Could not complete that import.
        </StatusMessage>
      )}

      {!user ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Import and practice
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Log in to import this list into your own account, start practice, or
            mark tunes as known.
          </p>
        </section>
      ) : isViewingOwnPublicList ? null : (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Import this list
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Import the whole list as a new private list, or select specific
            tunes below and add them to one of your existing lists.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <form
              action={importPublicList}
              className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm"
            >
              <input type="hidden" name="source_list_id" value={typedList.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <h3 className="font-semibold text-foreground">Import all</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create a new private imported copy of this public list.
              </p>

              <div className="mt-4">
                <SubmitButton
                  label="Import whole list"
                  pendingLabel="Importing..."
                  className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </div>
            </form>

            <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-5 shadow-sm">
              <form
                id="selected-import-form"
                action={importSelectedPublicListItems}
              >
                <input type="hidden" name="source_list_id" value={typedList.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <h3 className="font-semibold text-foreground">
                  Import selected tunes
                </h3>

                {ownedLists.length === 0 ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    You do not have any lists yet. Create one on the Lists page,
                    then come back here to import selected tunes.
                  </p>
                ) : (
                  <>
                    <label
                      htmlFor="target_learning_list_id"
                      className="mt-3 block text-sm font-medium text-foreground"
                    >
                      Add selected tunes to
                    </label>

                    <select
                      id="target_learning_list_id"
                      name="target_learning_list_id"
                      defaultValue=""
                      className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
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
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes
        </h2>

        {typedItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            This list has no tunes yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {typedItems.map((item) => {
              const piece = Array.isArray(item.pieces)
                ? item.pieces[0]
                : item.pieces

              if (!piece) return null

              const isAlreadyInPractice = user
                ? activePieceIds.has(piece.id)
                : false
              const isKnown = user ? knownPieceIds.has(piece.id) : false
              const canSelectForImport =
                Boolean(user) &&
                !isViewingOwnPublicList &&
                ownedLists.length > 0

              return (
                <div key={item.id} className="relative">
                  {canSelectForImport && (
                    <label
                      htmlFor={`select-piece-${piece.id}`}
                      className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                    >
                      <span>Select for import</span>
                      <input
                        id={`select-piece-${piece.id}`}
                        type="checkbox"
                        name="piece_ids"
                        value={piece.id}
                        form="selected-import-form"
                        className="h-4 w-4 accent-primary"
                      />
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
                      <p className="text-sm text-muted-foreground">
                        Log in to start practice or mark known.
                      </p>
                    ) : (
                      <>
                        {isAlreadyInPractice ? (
                          <span className="rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm">
                            Already in practice
                          </span>
                        ) : (
                          <form action={startLearning}>
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
                              label="Start Practice"
                              pendingLabel="Starting..."
                              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                            />
                          </form>
                        )}

                        {!isAlreadyInPractice &&
                          (isKnown ? (
                            <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                              Known
                            </span>
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
                                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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