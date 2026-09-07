"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import LibraryTuneCardActions from "@/components/library/LibraryTuneCardActions"
import TuneMediaLauncher from "@/components/reference-media/TuneMediaLauncher"
import PaginatedTuneCollection from "@/components/tunes/PaginatedTuneCollection"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
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
  totalCount: number
  previousHref: string | null
  nextHref: string | null
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
  activeConstraints?: string[]
  selectionMode?: boolean
  selectedPieceIds?: number[]
  onToggleSelection?: (piece: Piece) => void
}

function buildPieceRedirectTo(redirectTo: string, pieceId: number) {
  const separator = redirectTo.includes("?") ? "&" : "?"
  return `${redirectTo}${separator}scroll_piece=${pieceId}`
}

type TuneListLink = {
  id: number
  name: string
  href: string
}

function getListLinksForPiece(
  pieceId: number,
  learningListItems: LearningListItemMembership[] | null
): TuneListLink[] {
  const listItemsForPiece = (learningListItems ?? []).filter(
    (item) => item.piece_id === pieceId
  )

  const uniqueLists = new Map<number, TuneListLink>()

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
  totalCount,
  previousHref,
  nextHref,
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
  activeConstraints = [],
  selectionMode = false,
  selectedPieceIds = [],
  onToggleSelection,
}: LibraryListProps) {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const pagePieces = pieces ?? []
  const selectedIds = useMemo(
    () => new Set(selectedPieceIds),
    [selectedPieceIds]
  )

  useScrollToPiece(scrollPieceId)

  function renderTuneRow(piece: Piece) {
    const pieceRedirectTo = buildPieceRedirectTo(redirectTo, piece.id)
    const activeUserPiece = getActiveUserPiece(piece.id, userPieces)
    const isAlreadyInPractice = Boolean(activeUserPiece)
    const isKnown = getIsKnown(piece.id, userKnownPieces)
    const listLinks = getListLinksForPiece(piece.id, learningListItems)
    const mediaBundle = mediaBundles.get(piece.id) ?? null

    const supportingContent =
      listLinks.length > 0 || mediaBundle?.effectiveReference ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {listLinks.length > 0 ? (
            <span>
              In:{" "}
              {listLinks.slice(0, 3).map((list, index) => (
                <span key={list.id}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={list.href}
                    className="font-medium underline underline-offset-4 hover:text-text-primary"
                  >
                    {list.name}
                  </Link>
                </span>
              ))}
              {listLinks.length > 3 ? ` +${listLinks.length - 3} more` : ""}
            </span>
          ) : null}

          {mediaBundle?.effectiveReference ? (
            <TuneMediaLauncher
              pieceId={piece.id}
              title={piece.title}
              mediaBundle={mediaBundle}
              redirectTo={pieceRedirectTo}
              label="Reference"
              className="font-medium underline underline-offset-4 hover:text-text-primary"
            />
          ) : null}
        </div>
      ) : null

    const row = (
      <TuneRow
        piece={piece}
        supportingContent={supportingContent}
        personalState={
          <TuneStateIndicator
            isAlreadyInPractice={isAlreadyInPractice}
            isKnown={isKnown}
            stage={activeUserPiece?.stage ?? null}
            showNewToMe
          />
        }
        actions={selectionMode ? null : (
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
            showState={false}
          />
        )}
      />
    )

    if (!selectionMode) return row

    const isSelected = selectedIds.has(piece.id)

    return (
      <div
        className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-object px-2 transition-colors ${
          isSelected ? "bg-state-due/12" : ""
        }`}
      >
        <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center self-center rounded-control focus-within:ring-2 focus-within:ring-[var(--focus-ring)]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection?.(piece)}
            className="h-5 w-5 accent-[var(--action-primary)]"
          />
          <span className="sr-only">Select {piece.title}</span>
        </label>
        {row}
      </div>
    )
  }

  return (
    <>
      <PaginatedTuneCollection
        label="Tune catalogue results"
        itemCount={pagePieces.length}
        totalCount={totalCount}
        previousHref={previousHref}
        nextHref={nextHref}
        emptyTitle={
          hasActiveFilters
            ? "No tunes match this search"
            : "No tunes in the library yet"
        }
        emptyDescription={
          hasActiveFilters && activeConstraints.length > 0
            ? `Active constraints: ${activeConstraints.join("; ")}. Clear filters to see the full catalogue.`
            : undefined
        }
        resetHref={hasActiveFilters ? "/library" : undefined}
        resetLabel={hasActiveFilters ? "Reset filters" : undefined}
        className="rounded-object bg-surface-paper px-4 shadow-material-rest md:px-5"
        items={pagePieces.map((piece) => (
          <li
            key={piece.id}
            id={`piece-${piece.id}`}
            className="relative z-0 scroll-mt-28"
          >
            {renderTuneRow(piece)}
          </li>
        ))}
      />

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
