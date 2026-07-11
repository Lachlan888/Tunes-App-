"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import EmptyState from "@/components/EmptyState"
import TuneCard, { type TuneCardListLink } from "@/components/TuneCard"
import LibraryTuneCardActions from "@/components/library/LibraryTuneCardActions"
import CardPager from "@/components/ui/CardPager"
import useScrollToPiece from "@/hooks/useScrollToPiece"
import type { TuneMediaBundle } from "@/lib/tune-media"
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
  mediaBundles: Map<number, TuneMediaBundle>
  currentUserRole: UserRole
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
  deleteCanonicalTuneAsModerator: (formData: FormData) => Promise<void>
  redirectTo: string
  scrollPieceId: string
  hasActiveFilters: boolean
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
  mediaBundles,
  startLearning,
  addToLearningList,
  redirectTo,
  scrollPieceId,
  hasActiveFilters,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const desktopPieces = pieces ?? []
  const mobilePagerPieces = mobilePieces ?? desktopPieces

  useScrollToPiece(scrollPieceId)

  function renderTuneCard(piece: Piece) {
    const pieceRedirectTo = buildPieceRedirectTo(redirectTo, piece.id)
    const activeUserPiece = getActiveUserPiece(piece.id, userPieces)
    const isAlreadyInPractice = Boolean(activeUserPiece)
    const isKnown = getIsKnown(piece.id, userKnownPieces)
    const listLinks = getListLinksForPiece(piece.id, learningListItems)
    const mediaBundle = mediaBundles.get(piece.id) ?? null

    return (
      <TuneCard
        id={piece.id}
        title={piece.title}
        keyValue={piece.key}
        style={piece.style}
        timeSignature={piece.time_signature}
        referenceUrl={piece.reference_url}
        mediaBundle={mediaBundle}
        pieceStyles={piece.piece_styles}
        listLinks={listLinks}
        redirectTo={pieceRedirectTo}
      >
        <LibraryTuneCardActions
          piece={piece}
          activeUserPiece={activeUserPiece}
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          redirectTo={pieceRedirectTo}
          onOpenAddToList={() => {
            setSelectedPiece(piece)
            setSelectedListId("")
          }}
          startLearning={startLearning}
        />
      </TuneCard>
    )
  }

  if (desktopPieces.length === 0 && mobilePagerPieces.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No tunes match this search"
        primaryActionHref="/library"
        primaryActionLabel="Reset filters"
      />
    ) : (
      <EmptyState
        title="No tunes in the library yet"
      />
    )
  }

  return (
    <>
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
              primaryActionHref="/library"
              primaryActionLabel="Reset filters"
            />
          }
          renderItem={(piece) => (
            <div
              id={`piece-${piece.id}`}
              className="relative z-0 scroll-mt-28"
            >
              {renderTuneCard(piece)}
            </div>
          )}
        />
      </div>

      <ul className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2">
        {desktopPieces.map((piece) => {
          return (
            <li
              key={piece.id}
              id={`piece-${piece.id}`}
              className="relative z-0 scroll-mt-28"
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

    </>
  )
}
