import Link from "next/link"
import type { ReactNode } from "react"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import {
  bookmarkPublicList,
  importPublicList,
  importSelectedPublicListItems,
  unbookmarkPublicList,
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
    bookmark_public?: string
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

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
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
  canSelectForCopy,
  redirectTo,
}: {
  piece: Piece
  userIsSignedIn: boolean
  isAlreadyInPractice: boolean
  isKnown: boolean
  canSelectForCopy: boolean
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

        {piece.reference_url || canSelectForCopy ? (
          <div className="mt-2 flex min-h-10 items-center justify-between gap-3">
            {piece.reference_url ? (
              <ReferenceMediaLink
                referenceUrl={piece.reference_url}
                title={piece.title}
                pieceId={piece.id}
                redirectTo={redirectTo}
                className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
              />
            ) : (
              <span aria-hidden="true" />
            )}

            {canSelectForCopy ? (
              <input
                id={checkboxId}
                type="checkbox"
                name="piece_ids"
                value={piece.id}
                form="selected-import-form"
                aria-label={`Select ${piece.title} to copy`}
                className="h-6 w-6 shrink-0 accent-primary"
              />
            ) : null}
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
  const bookmarkStatus = resolvedSearchParams?.bookmark_public ?? ""
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
    isBookmarkedByCurrentUser,
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
            <div className="flex items-start justify-between gap-4">
              <h1 className="min-w-0 font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {typedList.name}
              </h1>

              {user && !isViewingOwnPublicList ? (
                isBookmarkedByCurrentUser ? (
                  <form action={unbookmarkPublicList} className="shrink-0">
                    <input
                      type="hidden"
                      name="learning_list_id"
                      value={typedList.id}
                    />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Remove bookmark"
                      pendingLabel="Removing..."
                      title="Remove bookmark"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-success bg-success px-3 py-2 text-success-foreground shadow-sm transition hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      pendingChildren={
                        <span className="inline-flex animate-pulse items-center justify-center">
                          <BookmarkIcon filled />
                          <span className="sr-only">Removing...</span>
                        </span>
                      }
                    >
                      <BookmarkIcon filled />
                      <span className="sr-only">Remove bookmark</span>
                    </SubmitButton>
                  </form>
                ) : (
                  <form action={bookmarkPublicList} className="shrink-0">
                    <input
                      type="hidden"
                      name="learning_list_id"
                      value={typedList.id}
                    />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Bookmark list"
                      pendingLabel="Bookmarking..."
                      title="Bookmark list"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primary bg-primary px-3 py-2 text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      pendingChildren={
                        <span className="inline-flex animate-pulse items-center justify-center">
                          <BookmarkIcon />
                          <span className="sr-only">Bookmarking...</span>
                        </span>
                      }
                    >
                      <BookmarkIcon />
                      <span className="sr-only">Bookmark list</span>
                    </SubmitButton>
                  </form>
                )
              ) : null}
            </div>

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

        <p className="mt-5 hidden border-t border-border/70 pt-4 text-sm leading-6 text-muted-foreground md:mt-6 md:block md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
          Shared lists are discovery objects. Bookmark useful lists as saved
          references, or copy tunes into your own editable lists when you want
          to organise them privately.
        </p>
      </header>

      {bookmarkStatus === "bookmarked" && (
        <StatusMessage tone="success">
          Bookmarked this shared list as a saved reference.
        </StatusMessage>
      )}

      {bookmarkStatus === "already" && (
        <StatusMessage tone="success">
          This shared list is already bookmarked.
        </StatusMessage>
      )}

      {bookmarkStatus === "removed" && (
        <StatusMessage tone="success">
          Removed this shared list from your bookmarks.
        </StatusMessage>
      )}

      {bookmarkStatus === "own_list" && (
        <StatusMessage tone="warning">
          Your own public lists stay editable from Lists and do not need
          bookmarking.
        </StatusMessage>
      )}

      {bookmarkStatus === "not_found" && (
        <StatusMessage tone="error">
          That shared list could not be found.
        </StatusMessage>
      )}

      {bookmarkStatus === "error" && (
        <StatusMessage tone="error">
          Could not update that bookmark.
        </StatusMessage>
      )}

      {bookmarkStatus === "unavailable" && (
        <StatusMessage tone="error">
          Bookmark table missing. Run the bookmark migration.
        </StatusMessage>
      )}

      {importStatus === "copied_all" && (
        <StatusMessage tone="success">
          Copied the full list into
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

      {importStatus === "copied_selected" && (
        <StatusMessage tone="success">
          {addedCount > 0 ? (
            <>
              Copied {addedCount} selected tune{addedCount === 1 ? "" : "s"}
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
          Select at least one tune to copy.
        </StatusMessage>
      )}

      {importStatus === "missing_target_list" && (
        <StatusMessage tone="warning">
          Choose one of your lists before copying selected tunes.
        </StatusMessage>
      )}

      {importStatus === "source_not_found" && (
        <StatusMessage tone="error">
          That public list could not be found.
        </StatusMessage>
      )}

      {importStatus === "error" && (
        <StatusMessage tone="error">
          Could not complete that copy.
        </StatusMessage>
      )}

      {!user ? (
        <section className="mt-6 border-b border-border/70 pb-5 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Bookmark and copy
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Log in to bookmark this shared list as a reference, copy tunes into
            your own lists, start practice, or mark tunes as known.
          </p>
        </section>
      ) : null}

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
              const canSelectForCopy =
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
                      canSelectForCopy={canSelectForCopy}
                      redirectTo={redirectTo}
                    />
                  </div>

                  <div className="relative hidden md:block">
                    {canSelectForCopy && (
                      <input
                        id={`desktop-select-piece-${piece.id}`}
                        type="checkbox"
                        name="piece_ids"
                        value={piece.id}
                        form="selected-import-form"
                        aria-label={`Select ${piece.title} to copy`}
                        className="absolute right-5 top-5 z-10 h-5 w-5 accent-primary"
                      />
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

      {user && !isViewingOwnPublicList ? (
        <section className="mt-7 border-t border-border/70 pt-5 md:mt-8 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
          <form id="selected-import-form" action={importSelectedPublicListItems}>
            <input type="hidden" name="source_list_id" value={typedList.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Copy selected tunes
            </h2>

            {ownedLists.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Create a list first, then come back to copy selected tunes.
              </p>
            ) : (
              <>
                <label
                  htmlFor="target_learning_list_id"
                  className="mt-4 block text-sm font-medium text-foreground"
                >
                  Add selected tunes to
                </label>

                <select
                  id="target_learning_list_id"
                  name="target_learning_list_id"
                  defaultValue=""
                  className="mt-2 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)] md:max-w-md md:bg-card"
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
                    label="Copy selected tunes"
                    pendingLabel="Copying..."
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:w-auto md:bg-card"
                  />
                </div>
              </>
            )}
          </form>

          <details className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              More actions
            </summary>
            <div className="mt-4">
              <form action={importPublicList} className="max-w-xl">
                <input
                  type="hidden"
                  name="source_list_id"
                  value={typedList.id}
                />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <h3 className="font-semibold text-foreground">
                  Copy list to my lists
                </h3>
                <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
                  Copying creates your own editable version. It will not affect
                  the original shared list, start practice, or mark tunes as
                  known.
                </p>

                <div className="mt-4">
                  <SubmitButton
                    label="Copy list"
                    pendingLabel="Copying..."
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:w-auto"
                  />
                </div>
              </form>
            </div>
          </details>
        </section>
      ) : null}
    </main>
  )
}
