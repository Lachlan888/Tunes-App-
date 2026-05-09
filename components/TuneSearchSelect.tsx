"use client"

import { useMemo, useState } from "react"
import type { Piece } from "@/lib/types"

type SelectionMode = "single" | "multiple"

type TuneSearchSelectProps = {
  pieces: Piece[]
  inputName: string
  mode: SelectionMode
  excludedPieceIds?: number[]
  initialSelectedPieces?: Piece[]
  selectedLabel?: string
  emptySelectionLabel?: string
  onSelectionChange?: (selectedPieces: Piece[]) => void
}

type PieceSearchMatch = {
  piece: Piece
  score: number
}

function normaliseSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function pieceMetadata(piece: Piece) {
  return [piece.key, piece.style, piece.time_signature]
    .filter(Boolean)
    .join(" · ")
}

function pieceLabel(piece: Piece) {
  const metadata = pieceMetadata(piece)
  return metadata ? `${piece.title} · ${metadata}` : piece.title
}

function scorePiece(piece: Piece, query: string) {
  const normalisedQuery = normaliseSearchText(query)
  const normalisedTitle = normaliseSearchText(piece.title)
  const normalisedMetadata = normaliseSearchText(pieceMetadata(piece))
  const haystack = `${normalisedTitle} ${normalisedMetadata}`.trim()

  if (!normalisedQuery) return 0

  if (normalisedTitle === normalisedQuery) return 100
  if (normalisedTitle.startsWith(normalisedQuery)) return 85
  if (normalisedTitle.includes(normalisedQuery)) return 70

  const queryWords = normalisedQuery.split(" ").filter(Boolean)

  if (
    queryWords.length > 0 &&
    queryWords.every((word) => haystack.includes(word))
  ) {
    return 55
  }

  if (queryWords.some((word) => normalisedTitle.includes(word))) {
    return 35
  }

  return 0
}

export default function TuneSearchSelect({
  pieces,
  inputName,
  mode,
  excludedPieceIds = [],
  initialSelectedPieces = [],
  selectedLabel = "Selected tunes",
  emptySelectionLabel = "Choose a tune from quick matches or search results.",
  onSelectionChange,
}: TuneSearchSelectProps) {
  const [query, setQuery] = useState("")
  const [selectedPieces, setSelectedPieces] = useState<Piece[]>(
    initialSelectedPieces
  )
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false)

  const availablePieces = useMemo(() => {
    const excludedPieceIdSet = new Set(excludedPieceIds)
    const selectedPieceIdSet = new Set(selectedPieces.map((piece) => piece.id))

    return pieces
      .filter((piece) => !excludedPieceIdSet.has(piece.id))
      .filter((piece) =>
        mode === "single" ? true : !selectedPieceIdSet.has(piece.id)
      )
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [pieces, excludedPieceIds, selectedPieces, mode])

  const scoredMatches = useMemo<PieceSearchMatch[]>(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) return []

    return availablePieces
      .map((piece) => ({
        piece,
        score: scorePiece(piece, trimmedQuery),
      }))
      .filter((match) => match.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.piece.title.localeCompare(b.piece.title)
      })
  }, [availablePieces, query])

  const autocompleteMatches = scoredMatches.slice(0, 8)
  const searchResults = scoredMatches.slice(0, 50)

  function updateSelection(nextPieces: Piece[]) {
    setSelectedPieces(nextPieces)
    onSelectionChange?.(nextPieces)
  }

  function handleChoosePiece(piece: Piece) {
    if (mode === "single") {
      updateSelection([piece])
      setQuery(piece.title)
    } else {
      updateSelection([...selectedPieces, piece])
      setQuery("")
    }

    setHasSubmittedSearch(false)
  }

  function handleRemovePiece(pieceId: number) {
    updateSelection(selectedPieces.filter((piece) => piece.id !== pieceId))
  }

  function handleSearchSubmit() {
    setHasSubmittedSearch(true)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setHasSubmittedSearch(false)

    if (mode === "single") {
      updateSelection([])
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSearchSubmit()
    }
  }

  return (
    <div>
      {selectedPieces.map((piece) => (
        <input key={piece.id} type="hidden" name={inputName} value={piece.id} />
      ))}

      <div>
        <label className="text-sm font-medium text-foreground">
          Search tunes
        </label>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="e.g. Angeline the Baker"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
          />

          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={!query.trim()}
            className="rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>
        </div>
      </div>

      {query.trim() &&
      autocompleteMatches.length > 0 &&
      !hasSubmittedSearch ? (
        <div className="mt-3 rounded-2xl border border-border bg-background/70 p-2 shadow-sm">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quick matches
          </p>

          <div className="space-y-1">
            {autocompleteMatches.map((match) => (
              <button
                key={match.piece.id}
                type="button"
                onClick={() => handleChoosePiece(match.piece)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <span className="font-medium text-foreground">
                  {match.piece.title}
                </span>

                {pieceMetadata(match.piece) ? (
                  <span className="ml-2 text-muted-foreground">
                    {pieceMetadata(match.piece)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {hasSubmittedSearch ? (
        <section className="mt-5 rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Search results
            </h3>

            <p className="text-sm text-muted-foreground">
              {searchResults.length} result
              {searchResults.length === 1 ? "" : "s"}
            </p>
          </div>

          {searchResults.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No available tunes matched that search. Try a shorter title
              fragment if the tune exists under a slightly different name.
            </p>
          ) : (
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {searchResults.map((match) => {
                const isSelected = selectedPieces.some(
                  (piece) => piece.id === match.piece.id
                )

                return (
                  <button
                    key={match.piece.id}
                    type="button"
                    onClick={() => handleChoosePiece(match.piece)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{match.piece.title}</span>

                    {pieceMetadata(match.piece) ? (
                      <span
                        className={`ml-2 ${
                          isSelected
                            ? "text-primary-foreground/85"
                            : "text-muted-foreground"
                        }`}
                      >
                        {pieceMetadata(match.piece)}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-sm font-medium text-foreground">{selectedLabel}</p>

        {selectedPieces.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {selectedPieces.map((piece) => (
              <li
                key={piece.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="min-w-0 text-foreground">
                  {pieceLabel(piece)}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemovePiece(piece.id)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {emptySelectionLabel}
          </p>
        )}
      </div>
    </div>
  )
}