import Link from "next/link"
import type { ReactNode } from "react"
import EditListModal from "@/components/lists/EditListModal"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import TuneRow from "@/components/tunes/TuneRow"
import ListPager from "@/components/lists/ListPager"
import ListOrderManager from "@/components/lists/ListOrderManager"
import {
  deleteList,
  reorderListItems,
  removeTuneFromList,
  revokeLearningListPrivateShare,
  searchLearningListShareRecipients,
  shareLearningListPrivately,
  updateList,
} from "@/lib/actions/lists"
import { loadLearningListDetailData } from "@/lib/loaders/list-detail"
import { LIST_PAGE_SIZE, paginateListItems, parseListPage } from "@/lib/list-view-state"
import type { Piece } from "@/lib/types"

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
    edit_list?: string
    share_list?: string
    mode?: string
    page?: string | string[]
  }>
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
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

export default async function LearningListDetailPage({
  params,
  searchParams,
}: LearningListDetailPageProps) {
  const { id } = await params

  const resolvedSearchParams = await searchParams
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""
  const shareListStatus = resolvedSearchParams?.share_list ?? ""
  const requestedMode = resolvedSearchParams?.mode === "manage" ? "manage" : "reader"
  const requestedPage = parseListPage(resolvedSearchParams?.page)

  const {
    typedList,
    typedItems,
    tunes,
    activePieceStates,
    knownPieceIds,
    ownerProfile,
    shareRecipients,
    accessMode,
    redirectTo,
  } = await loadLearningListDetailData(id)
  const isOwner = accessMode === "owner"
  const mode = isOwner ? requestedMode : "reader"

  const visibleItems = typedItems
    .map((item) => ({
      item,
      piece: extractPiece(item.pieces),
    }))
    .filter(
      (entry): entry is { item: typeof entry.item; piece: Piece } =>
        entry.piece !== null
    )
  const pagination = paginateListItems(visibleItems, requestedPage)
  const activeTuneCount = visibleItems.filter(({ piece }) =>
    activePieceStates.has(piece.id)
  ).length
  const viewHref = `/learning-lists/${typedList.id}`
  const pageHref = mode === "manage" ? `${viewHref}?mode=manage` : viewHref

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href="/learning-lists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Lists
        </Link>
      </div>

      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {typedList.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>
                {typedList.visibility === "public" ? "Public" : "Private"}
              </span>

              <span aria-hidden="true">•</span>

              <span>
                {typedItems.length} tune{typedItems.length === 1 ? "" : "s"}
              </span>

              {typedList.is_imported && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Your editable copy
                  </span>
                </>
              )}

              {accessMode === "shared_viewer" ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>Shared by {ownerProfile.label}</span>
                </>
              ) : null}
            </div>

            {typedList.description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-foreground">
                {typedList.description}
              </p>
            ) : null}
          </div>

          {isOwner && mode === "manage" ? (
            <EditListModal
              listId={typedList.id}
              name={typedList.name}
              description={typedList.description}
              visibility={typedList.visibility}
              redirectTo={redirectTo}
              tunes={tunes}
              updateList={updateList}
              removeTuneFromList={removeTuneFromList}
              deleteList={deleteList}
              shareLearningListPrivately={shareLearningListPrivately}
              searchLearningListShareRecipients={searchLearningListShareRecipients}
              revokeLearningListPrivateShare={revokeLearningListPrivateShare}
              shareRecipients={shareRecipients}
              triggerLabel="Manage List"
            />
          ) : null}
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        {isOwner ? (
          <nav aria-label="List detail mode" className="inline-flex rounded-full border border-border bg-card p-1">
            <Link href={viewHref} aria-current={mode === "reader" ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "reader" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Reader
            </Link>
            <Link href={`${viewHref}?mode=manage`} aria-current={mode === "manage" ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "manage" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Manage
            </Link>
          </nav>
        ) : (
          <p className="text-sm text-muted-foreground">Read-only shared list</p>
        )}

        {activeTuneCount > 0 ? (
          <Link href={`/review?session=list&list_id=${typedList.id}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">
            Start Practice · {activeTuneCount}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Start a tune in Practice to use this list as a session.</span>
        )}
      </div>

      {removeTuneStatus === "success" && (
        <StatusMessage tone="success">Tune removed from your app.</StatusMessage>
      )}

      {removeTuneStatus === "missing_piece" && (
        <StatusMessage tone="warning">
          Couldn’t tell which tune to remove.
        </StatusMessage>
      )}

      {removeTuneStatus === "error" && (
        <StatusMessage tone="error">Couldn’t remove tune.</StatusMessage>
      )}

      {editListStatus === "success" && (
        <StatusMessage tone="success">List updated.</StatusMessage>
      )}

      {editListStatus === "removed_tune" && (
        <StatusMessage tone="success">
          Tune removed from this list.
        </StatusMessage>
      )}

      {editListStatus === "deleted" && (
        <StatusMessage tone="success">List deleted.</StatusMessage>
      )}

      {editListStatus === "missing_list" && (
        <StatusMessage tone="warning">
          Couldn’t tell which list to edit.
        </StatusMessage>
      )}

      {editListStatus === "missing_name" && (
        <StatusMessage tone="warning">Please enter a list name.</StatusMessage>
      )}

      {editListStatus === "missing_item" && (
        <StatusMessage tone="warning">
          Couldn’t tell which tune to remove from the list.
        </StatusMessage>
      )}

      {editListStatus === "invalid_visibility" && (
        <StatusMessage tone="warning">Invalid list visibility.</StatusMessage>
      )}

      {editListStatus === "not_found" && (
        <StatusMessage tone="error">
          List not found or you do not own it.
        </StatusMessage>
      )}

      {editListStatus === "error" && (
        <StatusMessage tone="error">Couldn’t update list.</StatusMessage>
      )}

      {shareListStatus === "success" && (
        <StatusMessage tone="success">Private access shared.</StatusMessage>
      )}

      {shareListStatus === "removed" && (
        <StatusMessage tone="success">Private access removed.</StatusMessage>
      )}

      {(shareListStatus === "duplicate" ||
        shareListStatus === "already_shared") && (
        <StatusMessage tone="warning">
          That person already has access.
        </StatusMessage>
      )}

      {(shareListStatus === "self" || shareListStatus === "self_share") && (
        <StatusMessage tone="warning">
          You already own this list, so you cannot share it with yourself.
        </StatusMessage>
      )}

      {(shareListStatus === "unknown_user" ||
        shareListStatus === "invalid_recipient" ||
        shareListStatus === "recipient_not_available") && (
        <StatusMessage tone="warning">
          No matching user could be shared with.
        </StatusMessage>
      )}

      {shareListStatus === "not_owner" && (
        <StatusMessage tone="error">
          You can only share lists you own.
        </StatusMessage>
      )}

      {["missing_list", "missing_recipient", "missing_share"].includes(
        shareListStatus
      ) && (
        <StatusMessage tone="warning">
          Check the sharing details and try again.
        </StatusMessage>
      )}

      {(shareListStatus === "error" || shareListStatus === "insert_error") && (
        <StatusMessage tone="error">Couldn’t update private access.</StatusMessage>
      )}

      <section className="mt-8 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {mode === "manage" ? "Manage order and membership" : "Tunes in playing order"}
        </h2>

        {pagination.items.length === 0 ? (
          <p className="mt-4 border-y border-border/70 py-4 text-sm text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-4">
            This list has no tunes yet.
          </p>
        ) : mode === "manage" ? (
          <ListOrderManager
            listId={typedList.id}
            initialItems={pagination.items.map(({ item, piece }) => {
              const activePieceState = activePieceStates.get(piece.id) ?? null
              return {
                id: item.id,
                piece,
                isAlreadyInPractice: Boolean(activePieceState),
                isKnown: knownPieceIds.has(piece.id),
                stage: activePieceState?.stage ?? null,
              }
            })}
            positionOffset={(pagination.page - 1) * LIST_PAGE_SIZE}
            redirectTo={pageHref}
            reorderListItems={reorderListItems}
          />
        ) : (
          <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
            {pagination.items.map(({ item, piece }, itemIndex) => {
              const activePieceState = activePieceStates.get(piece.id) ?? null
              const isAlreadyInPractice = Boolean(activePieceState)
              const isKnown = knownPieceIds.has(piece.id)
              const absoluteIndex = (pagination.page - 1) * LIST_PAGE_SIZE + itemIndex
              return (
                <li key={item.id}>
                  <TuneRow
                    piece={piece}
                    supportingContent={<span>Position {absoluteIndex + 1}</span>}
                    personalState={<TuneStateIndicator isAlreadyInPractice={isAlreadyInPractice} isKnown={isKnown} stage={activePieceState?.stage ?? null} />}
                  />
                </li>
              )
            })}
          </ul>
        )}
        <ListPager href={pageHref} page={pagination.page} totalPages={pagination.totalPages} label={`${typedList.name} tunes`} />
      </section>
    </main>
  )
}
