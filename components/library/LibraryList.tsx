"use client"

import { useEffect, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import EmptyState from "@/components/EmptyState"
import TuneCard, { type TuneCardListLink } from "@/components/TuneCard"
import DeleteCanonicalTuneModal from "@/components/library/DeleteCanonicalTuneModal"
import LibraryTuneCardActions from "@/components/library/LibraryTuneCardActions"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import CardPager from "@/components/ui/CardPager"
import { buttonStyles } from "@/components/ui/buttonStyles"
import useScrollToPiece from "@/hooks/useScrollToPiece"
import type {
  LearningList,
  LearningListItemMembership,
  Piece,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"

type LibraryListProps = {
  pieces: Piece[] | null
  mobilePieces?: Piece[] | null
  userPieces: UserPiece[] | null
  userKnownPieces: UserKnownPiece[] | null
  learningLists: LearningList[] | null
  learningListItems: LearningListItemMembership[] | null
  currentUserRole: UserRole
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  deleteCanonicalTuneAsModerator: (formData: FormData) => Promise<void>
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
  redirectTo: string
  scrollPieceId: string
  hasActiveFilters: boolean
}

function canUseModeratorTools(role: UserRole) {
  return role === "moderator" || role === "admin"
}

function buildPieceRedirectTo(redirectTo: string, pieceId: number) {
  const separator = redirectTo.includes("?") ? "&" : "?"
  return `${redirectTo}${separator}scroll_piece=${pieceId}`
}

function getListLinksForPiece(
  pieceId: number,
  learningListItems: LearningListItemMembership[] | null
): TuneCardListLink[] {
  const listItemsForPiece = (learningListItems ?? []).filter(
    (item) => item.piece_id === pieceId
  )

  const uniqueLists = new Map<number, TuneCardListLink>()

  for (const item of listItemsForPiece) {
    const list = item.learning_lists

    if (!list) continue

    uniqueLists.set(list.id, {
      id: list.id,
      name: list.name,
      href: `/learning-lists/${list.id}`,
    })
  }

  return Array.from(uniqueLists.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

function getExistingListIdsForPiece(
  pieceId: number,
  learningListItems: LearningListItemMembership[] | null
) {
  return Array.from(
    new Set(
      (learningListItems ?? [])
        .filter((item) => item.piece_id === pieceId)
        .map((item) => item.learning_list_id)
    )
  )
}

function getActiveUserPiece(pieceId: number, userPieces: UserPiece[] | null) {
  return (
    (userPieces ?? []).find((userPiece) => userPiece.piece_id === pieceId) ??
    null
  )
}

function getIsKnown(
  pieceId: number,
  userKnownPieces: UserKnownPiece[] | null
) {
  return (userKnownPieces ?? []).some(
    (userKnownPiece) => userKnownPiece.piece_id === pieceId
  )
}

export default function LibraryList({
  pieces,
  mobilePieces,
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  currentUserRole,
  startLearning,
  addToLearningList,
  removeTuneFromMyApp,
  deleteCanonicalTuneAsModerator,
  addReferenceUrlToPiece,
  redirectTo,
  scrollPieceId,
  hasActiveFilters,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")
  const [openStatusPieceId, setOpenStatusPieceId] = useState<number | null>(
    null
  )
  const [deletePiece, setDeletePiece] = useState<Piece | null>(null)
  const [referencePiece, setReferencePiece] = useState<Piece | null>(null)

  const desktopPieces = pieces ?? []
  const mobilePagerPieces = mobilePieces ?? desktopPieces
  const isModerator = canUseModeratorTools(currentUserRole)

  useScrollToPiece(scrollPieceId)

  useEffect(() => {
    if (openStatusPieceId === null) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenStatusPieceId(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [openStatusPieceId])

  function renderTuneCard(piece: Piece) {
    const pieceRedirectTo = buildPieceRedirectTo(redirectTo, piece.id)
    const activeUserPiece = getActiveUserPiece(piece.id, userPieces)
    const isAlreadyInPractice = Boolean(activeUserPiece)
    const isKnown = getIsKnown(piece.id, userKnownPieces)
    const listLinks = getListLinksForPiece(piece.id, learningListItems)
    const isInAList = listLinks.length > 0
    const isStatusOpen = openStatusPieceId === piece.id

    return (
      <TuneCard
        id={piece.id}
        title={piece.title}
        keyValue={piece.key}
        style={piece.style}
        timeSignature={piece.time_signature}
        referenceUrl={piece.reference_url}
        pieceStyles={piece.piece_styles}
        listLinks={listLinks}
        topRightAction={
          isModerator ? (
            <button
              type="button"
              className={buttonStyles.iconDestructive}
              title="Moderator only. Review the warning before deleting this shared tune for everyone."
              aria-label={`Delete canonical tune ${piece.title}`}
              onClick={() => setDeletePiece(piece)}
            >
              ×
            </button>
          ) : null
        }
      >
        <LibraryTuneCardActions
          piece={piece}
          activeUserPiece={activeUserPiece}
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          isInAList={isInAList}
          isStatusOpen={isStatusOpen}
          redirectTo={pieceRedirectTo}
          onToggleStatus={() =>
            setOpenStatusPieceId(isStatusOpen ? null : piece.id)
          }
          onCloseStatus={() => setOpenStatusPieceId(null)}
          onOpenAddToList={() => {
            setSelectedPiece(piece)
            setSelectedListId("")
            setOpenStatusPieceId(null)
          }}
          onOpenFindReference={() => {
            setReferencePiece(piece)
            setOpenStatusPieceId(null)
          }}
          startLearning={startLearning}
          removeTuneFromMyApp={removeTuneFromMyApp}
        />
      </TuneCard>
    )
  }

  if (desktopPieces.length === 0 && mobilePagerPieces.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No tunes match this search"
        description="Try removing a filter, changing the title search, or creating the tune if it is genuinely missing."
        primaryActionHref="/library"
        primaryActionLabel="Reset filters"
      />
    ) : (
      <EmptyState
        title="No tunes in the library yet"
        description="Use Create Tune or Bulk Import Known Tunes above to start building the canonical tune library."
      />
    )
  }

  return (
    <>
      {openStatusPieceId !== null ? (
        <button
          type="button"
          aria-label="Close status menu"
          className="fixed inset-0 z-40 hidden cursor-default bg-transparent md:block"
          onClick={() => setOpenStatusPieceId(null)}
          tabIndex={-1}
        />
      ) : null}

      <div className="md:hidden">
        <p className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Catalogue
        </p>

        <CardPager
          items={mobilePagerPieces}
          getKey={(piece) => piece.id}
          label="Tune catalogue results"
          previousLabel="Previous"
          nextLabel="Next"
          unstyledCard
          emptyState={
            <EmptyState
              title="No tunes match this search"
              description="Try removing a filter, changing the title search, or creating the tune if it is genuinely missing."
              primaryActionHref="/library"
              primaryActionLabel="Reset filters"
            />
          }
          renderItem={(piece) => (
            <div
              id={`piece-${piece.id}`}
              className={
                openStatusPieceId === piece.id
                  ? "relative z-50 scroll-mt-28"
                  : "relative z-0 scroll-mt-28"
              }
            >
              {renderTuneCard(piece)}
            </div>
          )}
        />
      </div>

      <ul className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2">
        {desktopPieces.map((piece) => {
          const isStatusOpen = openStatusPieceId === piece.id

          return (
            <li
              key={piece.id}
              id={`piece-${piece.id}`}
              className={
                isStatusOpen
                  ? "relative z-50 scroll-mt-28"
                  : "relative z-0 scroll-mt-28"
              }
            >
              {renderTuneCard(piece)}
            </li>
          )
        })}
      </ul>

      {selectedPiece ? (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={getExistingListIdsForPiece(
            selectedPiece.id,
            learningListItems
          )}
          redirectTo={buildPieceRedirectTo(redirectTo, selectedPiece.id)}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      ) : null}

      {referencePiece ? (
        <FindReferenceModal
          piece={referencePiece}
          redirectTo={buildPieceRedirectTo(redirectTo, referencePiece.id)}
          addReferenceUrlToPiece={addReferenceUrlToPiece}
          onClose={() => setReferencePiece(null)}
        />
      ) : null}

      {deletePiece ? (
        <DeleteCanonicalTuneModal
          piece={deletePiece}
          redirectTo={redirectTo}
          deleteCanonicalTuneAsModerator={deleteCanonicalTuneAsModerator}
          onClose={() => setDeletePiece(null)}
        />
      ) : null}
    </>
  )
}
