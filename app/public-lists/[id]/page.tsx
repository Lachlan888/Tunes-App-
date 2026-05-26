import Link from "next/link"
import type { ReactNode } from "react"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
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
import type { Piece } from "@/lib/types"

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

function getTuneMetadata(piece: Piece) {
  return [
    piece.key ? `Key: ${piece.key}` : null,
    piece.style ? `Style: ${piece.style}` : null,
    piece.time_signature ? `Time: ${piece.time_signature}` : null,
  ].filter(Boolean)
}

function PublicListMobileTuneRow({
  piece,
  userIsSignedIn,
  isAlreadyInPractice,
  isKnown,
  canSelectForImport,
  redirectTo,
}: {
  piece: Piece
  userIsSignedIn: boolean
  isAlreadyInPractice: boolean
  isKnown: boolean
  canSelectForImport: boolean
  redirectTo: string
}) {
  const metadataParts = getTuneMetadata(piece)
  const checkboxId = `mobile-select-piece-${piece.id}`

  return (
    <article className="border-b border-border/70 py-4 last:border-b-0">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          <Link
            href={`/library/${piece.id}`}
            className="decoration-primary decoration-2 underline-offset-4 hover:underline"
          >
            {piece.title}
          </Link>
        </h3>

        {metadataParts.length > 0 ? (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {metadataParts.join(" · ")}
          </p>
        ) : null}

        {piece.reference_url ? (
          <div className="mt-2">
            <ReferenceMediaLink
              referenceUrl={piece.reference_url}
              title={piece.title}
              pieceId={piece.id}
              redirectTo={redirectTo}
              className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!userIsSignedIn ? (
          <span className="text-sm text-muted-foreground">
            Log in to start practice or mark known.
          </span>
        ) : (
          <>
            {isAlreadyInPractice ? (
              <span className="rounded-full border border-success bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground">
                Already in practice
              </span>
            ) : (
              <form action={startLearning}>
                <input type="hidden" name="piece_id" value={piece.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />
                <SubmitButton
                  label="Start Practice"
                  pendingLabel="Starting..."
                  className="rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </form>
            )}

            {!isAlreadyInPractice &&
              (isKnown ? (
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  Known
                </span>
              ) : (
                <form action={markAsKnown}>
                  <input type="hidden" name="piece_id" value={piece.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <SubmitButton
                    label="Mark as known"
                    pendingLabel="Saving..."
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              ))}
          </>
        )}
      </div>

      {canSelectForImport ? (
        <label
          htmlFor={checkboxId}
          className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm font-medium text-foreground"
        >
          <span>Select for import</span>
          <input
            id={checkboxId}
            type="checkbox"
            name="piece_ids"
            value={piece.id}
            form="selected-import-form"
            className="h-5 w-5 shrink-0 accent-primary"
          />
        </label>
      ) : null}
    </article>
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
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href="/public-lists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Public Lists
        </Link>
      </div>

      <header className="border-b border-border/70 pb-5 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
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
              <p className="mt-4 max-w-3xl text-sm leading-6 text-foreground md:mt-5 md:text-base md:leading-7">
                {typedList.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground md:mt-5 md:text-base">
                No description yet.
              </p>
            )}
          </div>

          {isViewingOwnPublicList && (
            <Link
              href={`/learning-lists/${typedList.id}`}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:hover:-translate-y-0.5"
            >
              Open editable list
            </Link>
          )}
        </div>

        <p className="mt-5 border-t border-border/70 pt-4 text-sm leading-6 text-muted-foreground md:mt-6 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
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
        <section className="mt-6 border-b border-border/70 pb-5 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Import and practice
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Log in to import this list into your own account, start practice, or
            mark tunes as known.
          </p>
        </section>
      ) : isViewingOwnPublicList ? null : (
        <section className="mt-6 border-b border-border/70 pb-6 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Import this list
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Import the whole list as a new private list, or select specific
            tunes below and add them to one of your existing lists.
          </p>

          <div className="mt-5 grid gap-5 md:gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <form
              action={importPublicList}
              className="border-b border-border/70 pb-5 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-5 md:shadow-sm"
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
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:w-auto md:hover:-translate-y-0.5"
                />
              </div>
            </form>

            <div className="min-w-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-5 md:shadow-sm">
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
                      className="mt-2 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)] md:bg-card"
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
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:w-auto md:bg-card"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </section>
      )}

      <section className="mt-7 md:mt-8 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes
        </h2>

        {typedItems.length === 0 ? (
          <p className="mt-4 border-y border-border/70 py-4 text-sm text-muted-foreground md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
            This list has no tunes yet.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border/70 border-y border-border/70 md:mt-5 md:divide-y-0 md:border-y-0 md:space-y-4">
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
                <div key={item.id}>
                  <div className="md:hidden">
                    <PublicListMobileTuneRow
                      piece={piece}
                      userIsSignedIn={Boolean(user)}
                      isAlreadyInPractice={isAlreadyInPractice}
                      isKnown={isKnown}
                      canSelectForImport={canSelectForImport}
                      redirectTo={redirectTo}
                    />
                  </div>

                  <div className="relative hidden md:block">
                    {canSelectForImport && (
                      <label
                        htmlFor={`desktop-select-piece-${piece.id}`}
                        className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                      >
                        <span>Select for import</span>
                        <input
                          id={`desktop-select-piece-${piece.id}`}
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
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
