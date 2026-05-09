"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import type { Piece } from "@/lib/types"

type AddTuneToSetlistModalProps = {
  setlistId: number
  pieces: Piece[]
  existingPieceIds: number[]
  redirectTo: string
  addTuneToSetlist: (formData: FormData) => Promise<void>
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

export default function AddTuneToSetlistModal({
  setlistId,
  pieces,
  existingPieceIds,
  redirectTo,
  addTuneToSetlist,
}: AddTuneToSetlistModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false)

  const availablePieces = useMemo(() => {
    const existingPieceIdSet = new Set(existingPieceIds)

    return pieces
      .filter((piece) => !existingPieceIdSet.has(piece.id))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [pieces, existingPieceIds])

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

  const selectedPieceLabel = selectedPiece ? pieceLabel(selectedPiece) : ""

  function handleChoosePiece(piece: Piece) {
    setSelectedPiece(piece)
    setQuery(piece.title)
    setHasSubmittedSearch(false)
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSelectedPiece(null)
    setHasSubmittedSearch(true)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setSelectedPiece(null)
    setHasSubmittedSearch(false)
  }

  function handleClose() {
    setIsOpen(false)
    setQuery("")
    setSelectedPiece(null)
    setHasSubmittedSearch(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Add tune
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Add tune
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
                  Add a tune to this setlist
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Start typing to pick from quick matches, or run a broader
                  normalised search if the tune does not appear immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-6">
              <label className="text-sm font-medium text-foreground">
                Search tunes
              </label>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Type a tune title"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                />

                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Search
                </button>
              </div>
            </form>

            {query.trim() &&
            autocompleteMatches.length > 0 &&
            !selectedPiece &&
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
                    No available tunes matched that search. This search ignores
                    case and punctuation, so try a shorter title fragment if the
                    tune exists under a slightly different name.
                  </p>
                ) : (
                  <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                    {searchResults.map((match) => {
                      const isSelected = selectedPiece?.id === match.piece.id

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
                          <span className="font-medium">
                            {match.piece.title}
                          </span>

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

            <form action={addTuneToSetlist} className="mt-6 space-y-4">
              <input type="hidden" name="setlist_id" value={setlistId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input
                type="hidden"
                name="piece_id"
                value={selectedPiece?.id ?? ""}
              />

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">
                  Selected tune
                </p>

                {selectedPiece ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedPieceLabel}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a tune from quick matches or search results before
                    adding it to the setlist.
                  </p>
                )}
              </div>

              {selectedPiece ? (
                <SubmitButton
                  label="Add to setlist"
                  pendingLabel="Adding..."
                  className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-border bg-muted px-4 py-3 text-sm font-medium text-muted-foreground opacity-75"
                >
                  Select a tune first
                </button>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}