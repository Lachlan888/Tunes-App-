"use client"

import { useMemo, useState } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { statusStyles } from "@/components/ui/statusStyles"
import YouTubeSearchResultList from "@/components/reference-media/YouTubeSearchResultList"
import type { YouTubeSearchResult } from "@/app/api/youtube/search/route"
import type { Piece } from "@/lib/types"

type FindReferenceModalProps = {
  piece: Piece
  redirectTo: string
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
  onClose: () => void
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

function getDefaultQuery(piece: Piece) {
  return [piece.title, piece.style].filter(Boolean).join(" ").trim()
}

export default function FindReferenceModal({
  piece,
  redirectTo,
  addReferenceUrlToPiece,
  onClose,
}: FindReferenceModalProps) {
  const defaultQuery = useMemo(() => getDefaultQuery(piece), [piece])
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<YouTubeSearchResult[]>([])
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearchPending, setIsSearchPending] = useState(false)

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setError("Enter at least two characters to search.")
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearchPending(true)
    setError("")
    setHasSearched(true)
    setPreviewVideoId(null)

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(trimmedQuery)}`
      )

      const payload = (await response.json()) as {
        results?: YouTubeSearchResult[]
        error?: string
      }

      if (!response.ok) {
        setError(payload.error ?? "YouTube search failed.")
        setResults([])
        return
      }

      setResults(payload.results ?? [])
    } catch {
      setError("YouTube search failed. Check your connection and try again.")
      setResults([])
    } finally {
      setIsSearchPending(false)
    }
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      closeDisabled={isSearchPending}
      mobileMode="full-screen"
      desktopMaxWidth="md:max-w-4xl"
      eyebrow="Reference media"
      title="Find reference recording"
      description={piece.title}
      bodyClassName="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
    >
      <div className="space-y-5">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="youtube_query" className="block text-sm font-medium">
            Search YouTube
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="youtube_query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClass}
              placeholder="Search tune title, player, source, or style"
              disabled={isSearchPending}
            />

            <button
              type="submit"
              className={buttonStyles.primary}
              disabled={isSearchPending}
            >
              {isSearchPending ? "Searching..." : "Search"}
            </button>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            Choose a useful public reference recording. This saves the selected
            video to the shared tune record, so other users can use it too.
          </p>
        </form>

        {error ? (
          <p className={`rounded-xl border p-3 text-sm ${statusStyles.error}`}>
            {error}
          </p>
        ) : null}

        {hasSearched && !error && results.length === 0 && !isSearchPending ? (
          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No YouTube results found. Try a broader search.
          </p>
        ) : null}

        {isSearchPending ? (
          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Searching YouTube...
          </p>
        ) : (
          <YouTubeSearchResultList
            results={results}
            pieceId={piece.id}
            redirectTo={redirectTo}
            previewVideoId={previewVideoId}
            onPreview={setPreviewVideoId}
            addReferenceUrlToPiece={addReferenceUrlToPiece}
          />
        )}
      </div>
    </ResponsiveModal>
  )
}