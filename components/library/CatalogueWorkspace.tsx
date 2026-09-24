"use client"

import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import CataloguePreview from "@/components/library/CataloguePreview"
import BulkAddToListModal from "@/components/library/BulkAddToListModal"
import LibraryList from "@/components/library/LibraryList"
import PieceSearchFilters from "@/components/library/PieceSearchFilters"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { addSelectedTunesToLearningLists } from "@/lib/actions/lists"
import {
  parseStoredCatalogueSelection,
  toggleCatalogueSelection,
} from "@/lib/tune-collections/selection"
import type {
  LearningList,
  LearningListItemMembership,
  Piece,
  PieceFilterOption,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"
import type { TuneMediaBundle } from "@/lib/tune-media"

const CATALOGUE_SELECTION_STORAGE_KEY = "tunes:catalogue-selection:v1"

type CatalogueWorkspaceProps = {
  searchQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  selectedSort: "title_asc" | "newest" | "oldest"
  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  filterOptionPieces: PieceFilterOption[]
  filterFacetLimit: number
  hasActiveFilters: boolean
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
  activeConstraints: string[]
}

export default function CatalogueWorkspace({
  searchQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  selectedSort,
  availableKeys,
  availableStyles,
  availableTimeSignatures,
  filterOptionPieces,
  filterFacetLimit,
  hasActiveFilters,
  pieces,
  totalCount,
  previousHref,
  nextHref,
  userPieces,
  userKnownPieces,
  learningLists,
  learningListItems,
  mediaBundles,
  currentUserRole,
  startLearning,
  addToLearningList,
  removeTuneFromMyApp,
  deleteCanonicalTuneAsModerator,
  redirectTo,
  scrollPieceId,
  activeConstraints,
}: CatalogueWorkspaceProps) {
  const sessionStorage = usePrivateSessionStorage()
  const restoredSelection = useRef(false)
  const [previewPieceId, setPreviewPieceId] = useState<number | null>(null)
  const previewTrigger = useRef<HTMLButtonElement | null>(null)
  const previewPiece = pieces?.find(piece => piece.id === previewPieceId) ?? null
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedPieceIds, setSelectedPieceIds] = useState<number[]>([])
  const [isBulkListOpen, setIsBulkListOpen] = useState(false)

  useEffect(() => {
    const restored = parseStoredCatalogueSelection(
      sessionStorage.getItem(CATALOGUE_SELECTION_STORAGE_KEY)
    )
    if (restored.length === 0) { restoredSelection.current = true; return }

    // Restore private transient selection only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPieceIds(restored)
    setIsSelectionMode(true)
  }, [sessionStorage])

  useEffect(() => {
    if (!restoredSelection.current) { restoredSelection.current = true; return }
    if (selectedPieceIds.length === 0) {
      sessionStorage.removeItem(CATALOGUE_SELECTION_STORAGE_KEY)
      return
    }

    sessionStorage.setItem(
      CATALOGUE_SELECTION_STORAGE_KEY,
      JSON.stringify(selectedPieceIds)
    )
  }, [selectedPieceIds, sessionStorage])

  const clearSelection = useCallback(() => {
    setSelectedPieceIds([])
    setIsSelectionMode(false)
    setIsBulkListOpen(false)
  }, [setSelectedPieceIds, setIsBulkListOpen])

  const selectionDockModel = useMemo<SessionDockModel | null>(() => {
    if (!isSelectionMode) return null
    const count = selectedPieceIds.length

    return {
      id: "catalogue-selection",
      context: "catalogue-selection",
      identity: {
        eyebrow: "Tunes",
        title: `${count} tune${count === 1 ? "" : "s"} selected`,
        detail: count === 0 ? "Choose tunes from the current page" : "Private catalogue selection",
      },
      primaryAction: {
        id: "add",
        label: "Add to List",
        onInvoke: () => setIsBulkListOpen(true),
        tone: "primary",
        disabled: count === 0,
      },
      secondaryActions: [
        {
          id: "clear",
          label: "Clear",
          onInvoke: clearSelection,
          tone: "secondary",
        },
      ],
      status: { label: `${count} selected`, tone: "neutral" },
      collapsedContent: { actionIds: ["add", "clear"] },
      expandedContent: {
        title: "Selected tune tools",
        description: "Add the selection to one or more Lists, or clear it.",
        actionIds: ["add", "clear"],
      },
      persistence: {
        shareable: "none",
        transient: "session",
        key: CATALOGUE_SELECTION_STORAGE_KEY,
      },
      announcement: `${count} tune${count === 1 ? "" : "s"} selected`,
    }
  }, [clearSelection, isSelectionMode, selectedPieceIds.length, setIsBulkListOpen])

  useSessionDock("catalogue-selection", selectionDockModel)

  return (
    <>
      <PieceSearchFilters
        basePath="/library"
        searchLabel="Search by title"
        searchPlaceholder="Search tunes"
        searchValue={searchQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
        selectedSort={selectedSort}
        availableKeys={availableKeys}
        availableStyles={availableStyles}
        availableTimeSignatures={availableTimeSignatures}
        hasActiveFilters={hasActiveFilters}
        totalCount={totalCount}
        countItems={filterOptionPieces}
        prospectiveCountExact={filterOptionPieces.length < filterFacetLimit}
        sticky
        toolbarActions={
          <button
            type="button"
            className={buttonStyles.secondaryStrong}
            aria-pressed={isSelectionMode}
            onClick={() => {
              if (isSelectionMode) clearSelection()
              else setIsSelectionMode(true)
            }}
          >
            {isSelectionMode ? "Cancel selection" : "Select"}
          </button>
        }
      />

      <div className={previewPiece ? "catalogue-workbench workbench-split" : ""}>
      {previewPiece ? <CataloguePreview key={previewPiece.id} piece={previewPiece} mediaBundle={mediaBundles.get(previewPiece.id)} onClose={() => {
        setPreviewPieceId(null)
        if (previewTrigger.current?.isConnected) previewTrigger.current.focus()
      }} /> : null}
      <div className="catalogue-results min-w-0">
      <LibraryList
        pieces={pieces}
        totalCount={totalCount}
        previousHref={previousHref}
        nextHref={nextHref}
        userPieces={userPieces}
        userKnownPieces={userKnownPieces}
        learningLists={learningLists}
        learningListItems={learningListItems}
        mediaBundles={mediaBundles}
        currentUserRole={currentUserRole}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
        removeTuneFromMyApp={removeTuneFromMyApp}
        deleteCanonicalTuneAsModerator={deleteCanonicalTuneAsModerator}
        redirectTo={redirectTo}
        scrollPieceId={scrollPieceId}
        hasActiveFilters={hasActiveFilters}
        activeConstraints={activeConstraints}
        selectionMode={isSelectionMode}
        selectedPieceIds={selectedPieceIds}
        previewPieceId={previewPiece?.id}
        onPreview={(piece, trigger) => {
          previewTrigger.current = trigger
          setPreviewPieceId(piece.id)
        }}
        onToggleSelection={(piece) => {
          setSelectedPieceIds((current) =>
            toggleCatalogueSelection(current, piece.id)
          )
        }}
      />

      </div>
      </div>

      {isBulkListOpen && selectedPieceIds.length > 0 ? (
        <BulkAddToListModal
          selectedPieceIds={selectedPieceIds}
          learningLists={learningLists}
          redirectTo={redirectTo}
          addSelectedTunesToLearningLists={addSelectedTunesToLearningLists}
          onClose={() => setIsBulkListOpen(false)}
        />
      ) : null}
    </>
  )
}
