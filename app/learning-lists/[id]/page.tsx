import Link from "next/link"
import type { ReactNode } from "react"
import EditListModal from "@/components/lists/EditListModal"
import ListPager from "@/components/lists/ListPager"
import ListTuneRows from "@/components/lists/ListTuneRows"
import {
  addToLearningList,
  deleteList,
  removeTuneFromList,
  revokeLearningListPrivateShare,
  searchLearningListShareRecipients,
  shareLearningListPrivately,
  updateList,
} from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLearningListDetailData } from "@/lib/loaders/list-detail"
import { LIST_PAGE_SIZE, paginateListItems, parseListPage, withListPage } from "@/lib/list-view-state"
import { learningListHref, safeListReturn } from "@/lib/list-return"
import type { Piece } from "@/lib/types"

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
    edit_list?: string
    share_list?: string
    list_add?: string
    return_to?: string | string[]
    page?: string | string[]
    scroll_piece?: string
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
      className={`mt-6 border-y py-3 text-sm ${getStatusClasses(
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
  const listAddStatus = resolvedSearchParams?.list_add ?? ""
  const requestedPage = parseListPage(resolvedSearchParams?.page)

  const {
    typedList,
    typedItems,
    tunes,
    activePieceStates,
    knownPieceIds,
    mediaBundles,
    ownedLists,
    existingListIdsByPiece,
    ownerProfile,
    shareRecipients,
    accessMode,
    redirectTo,
  } = await loadLearningListDetailData(id)
  const isOwner = accessMode === "owner"

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
  const backHref = safeListReturn(resolvedSearchParams?.return_to)
  const viewHref = withListPage(learningListHref(typedList.id, backHref), pagination.page)
  const pageHref = viewHref

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href={backHref}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Lists
        </Link>
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

      {editListStatus === "reordered" && (
        <StatusMessage tone="success">Playing order updated.</StatusMessage>
      )}

      {["reorder_error", "invalid_reorder"].includes(editListStatus) && (
        <StatusMessage tone="error">Couldn’t change the playing order.</StatusMessage>
      )}

      {listAddStatus === "success" && (
        <StatusMessage tone="success">Tune added to the selected list.</StatusMessage>
      )}
      {listAddStatus === "partial" && (
        <StatusMessage tone="success">Tune added where it wasn’t already listed.</StatusMessage>
      )}
      {listAddStatus === "duplicate" && (
        <StatusMessage tone="warning">That tune is already in the selected list.</StatusMessage>
      )}
      {["missing_piece", "missing_list", "error"].includes(listAddStatus) && (
        <StatusMessage tone="error">Couldn’t add that tune to a list.</StatusMessage>
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

      <header className="border-b border-hairline pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="break-words font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {typedList.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>By {ownerProfile.label}</span>

              <span aria-hidden="true">•</span>

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
                  <span className="text-xs font-semibold text-muted-foreground">
                    Your editable copy
                  </span>
                </>
              )}

              {accessMode === "shared_viewer" ? <span className="sr-only">Shared list</span> : null}
            </div>

            {typedList.description ? (
              <p className="mt-5 max-w-3xl break-words text-base leading-7 text-foreground">
                {typedList.description}
              </p>
            ) : null}
          </div>

          {isOwner ? (
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
              showTunes={false}
              triggerLabel="Edit List"
            />
          ) : null}
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!isOwner ? (
          <p className="text-sm text-muted-foreground">Read-only shared list</p>
        ) : null}

        {activeTuneCount > 0 ? (
          <Link href={`/review?session=list&list_id=${typedList.id}`} className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">
            Start Practice · {activeTuneCount}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Start a tune in Practice to use this list as a session.</span>
        )}
      </div>

      <section className="mt-7 md:mt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Tunes in playing order
        </h2>

        {pagination.items.length === 0 ? (
          <p className="mt-4 border-y border-hairline py-4 text-sm text-muted-foreground">
            This list has no tunes yet.
          </p>
        ) : (
          <ListTuneRows
            items={pagination.items.map(({ item, piece }) => {
              const activeState = activePieceStates.get(piece.id)
              return {
                id: item.id,
                piece,
                activeUserPieceId: activeState?.id,
                stage: activeState?.stage ?? null,
                isKnown: knownPieceIds.has(piece.id),
                existingListIds: existingListIdsByPiece.get(piece.id) ?? [],
                mediaBundle: mediaBundles.get(piece.id) ?? null,
              }
            })}
            positionOffset={(pagination.page - 1) * LIST_PAGE_SIZE}
            totalItems={visibleItems.length}
            redirectTo={pageHref}
            learningLists={ownedLists}
            isSignedIn
            scrollPieceId={resolvedSearchParams?.scroll_piece}
            ownerListId={isOwner ? typedList.id : undefined}
            startLearning={startLearning}
            addToLearningList={addToLearningList}
          />
        )}
        <ListPager href={pageHref} page={pagination.page} totalPages={pagination.totalPages} label={`${typedList.name} tunes`} />
      </section>
    </main>
  )
}
