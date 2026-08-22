"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import YouTubeLoopPlayer, {
  type ReferencePracticeView,
} from "@/components/library/YouTubeLoopPlayer"
import MobileViewSwitcher from "@/components/ui/MobileViewSwitcher"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { addPieceMediaLink } from "@/lib/actions/media-links"
import {
  getLoopsForSource,
  getReferenceMediaSources,
  getReferencePracticeHref,
  type TuneMediaBundle,
  type TuneMediaSource,
} from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

type ReferencePracticeWorkspaceProps = {
  piece: Piece
  mediaBundle: TuneMediaBundle
  initialSourceId: string | null
  requestedSourceId?: string | null
}

const mediaTypes = [
  "Recording",
  "Video",
  "Performance",
  "Lesson",
  "Source",
  "Other",
]

const mobileViews = [
  { id: "media", label: "Media" },
  { id: "sections", label: "Sections" },
  { id: "practice", label: "Practice" },
] as const

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function sourceKindLabel(source: TuneMediaSource) {
  if (source.sourceType === "canonical-reference") return "Shared reference"
  if (source.sourceType === "personal-preferred-reference") {
    return "My preferred reference"
  }
  if (source.isYouTube) return "YouTube"

  return source.mediaType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function RecordingSelector({
  pieceId,
  sources,
  selectedSource,
  onSelect,
}: {
  pieceId: number
  sources: TuneMediaSource[]
  selectedSource: TuneMediaSource | null
  onSelect: (source: TuneMediaSource) => void
}) {
  const redirectTo = getReferencePracticeHref(pieceId, selectedSource?.id)

  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Media
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
            {sources.length === 1 ? "Recording" : "Recordings"}
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {sources.length} available
        </span>
      </div>

      {sources.length > 0 ? (
        <div className="mt-4 divide-y divide-border/70 border-y border-border/70">
          {sources.map((source) => {
            const isSelected = source.id === selectedSource?.id
            const content = (
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block break-words font-semibold">
                    {source.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em]">
                    {sourceKindLabel(source)}
                  </span>
                  {source.notes ? (
                    <span className="mt-1 line-clamp-2 block text-sm leading-5">
                      {source.notes}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Selected
                  </span>
                ) : null}
              </span>
            )

            if (sources.length === 1) {
              return (
                <div key={source.id} className="py-3 text-foreground">
                  {content}
                </div>
              )
            }

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => onSelect(source)}
                className={joinClasses(
                  "block w-full py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
                aria-pressed={isSelected}
              >
                {content}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          No reference recordings have been added to this tune yet.
        </p>
      )}

      <details className="mt-4">
        <summary className="list-none">
          <span className={`${buttonStyles.secondary} cursor-pointer`}>
            Add recording
          </span>
        </summary>
        <form action={addPieceMediaLink} className="mt-4 space-y-3">
          <input type="hidden" name="piece_id" value={pieceId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <input
            name="title"
            placeholder="Title, eg Live at the session"
            className={inputClassName}
            required
          />
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className={inputClassName}
            required
          />
          <select name="media_type" defaultValue="Recording" className={inputClassName}>
            {mediaTypes.map((mediaType) => (
              <option key={mediaType} value={mediaType}>
                {mediaType}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            placeholder="Optional performer, source, or practice note"
            rows={2}
            className={inputClassName}
          />
          <button type="submit" className={buttonStyles.primary}>
            Save recording
          </button>
        </form>
      </details>
    </section>
  )
}

function UnavailableWorkspace({
  selectedSource,
  mediaPanel,
}: {
  selectedSource: TuneMediaSource | null
  mediaPanel: React.ReactNode
}) {
  const [mobileView, setMobileView] =
    useState<ReferencePracticeView>("media")

  return (
    <div className="md:grid md:grid-cols-[minmax(0,0.92fr)_minmax(22rem,1.08fr)] md:items-start md:gap-6">
      <section className="flex min-w-0 flex-col md:sticky md:top-24">
        <div
          className={joinClasses(
            "order-3 mt-4 md:order-1 md:mt-0",
            mobileView === "media" ? "block" : "hidden md:block"
          )}
        >
          {mediaPanel}
        </div>
        <div className="order-1 mt-4 rounded-2xl border border-border bg-card p-5 md:order-2">
          <p className="font-semibold text-foreground">
            {selectedSource ? "Recording unavailable" : "Choose a recording"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedSource
              ? "This source cannot play in the in-app practice player. Its information remains available while you choose another recording."
              : "Add a recording to begin passage-centred practice."}
          </p>
          {selectedSource ? (
            <a
              href={selectedSource.url}
              target="_blank"
              rel="noreferrer"
              className={`${buttonStyles.secondary} mt-4`}
            >
              Open source
            </a>
          ) : null}
        </div>
        <MobileViewSwitcher
          value={mobileView}
          options={mobileViews}
          onChange={setMobileView}
          label="View"
          className="order-2 mt-3 md:hidden"
        />
      </section>

      <aside className="mt-5 min-w-0 space-y-5 md:mt-0">
        <section
          className={joinClasses(
            "border-y border-border/70 py-4 md:rounded-3xl md:border md:bg-card md:p-5",
            mobileView === "sections" ? "block" : "hidden md:block"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sections
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Whole recording
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Saved sections are available for playable YouTube recordings.
          </p>
        </section>
        <section
          className={joinClasses(
            "border-y border-border/70 py-4 md:rounded-3xl md:border md:bg-card md:p-5",
            mobileView === "practice" ? "block" : "hidden md:block"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Practice
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Player unavailable
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Choose a playable recording in Media to use loop and speed controls.
          </p>
        </section>
      </aside>
    </div>
  )
}

export default function ReferencePracticeWorkspace({
  piece,
  mediaBundle,
  initialSourceId,
  requestedSourceId,
}: ReferencePracticeWorkspaceProps) {
  const router = useRouter()
  const sources = useMemo(
    () => getReferenceMediaSources(mediaBundle),
    [mediaBundle]
  )
  const [selectedSourceId, setSelectedSourceId] = useState(initialSourceId)
  const selectedSource =
    sources.find((source) => source.id === selectedSourceId) ?? sources[0] ?? null

  useEffect(() => {
    if (!selectedSource || requestedSourceId === selectedSource.id) return

    router.replace(getReferencePracticeHref(piece.id, selectedSource.id), {
      scroll: false,
    })
  }, [piece.id, requestedSourceId, router, selectedSource])

  function selectSource(source: TuneMediaSource) {
    if (source.id === selectedSource?.id) return

    setSelectedSourceId(source.id)
    router.replace(getReferencePracticeHref(piece.id, source.id), {
      scroll: false,
    })
  }

  const mediaPanel = (
    <RecordingSelector
      pieceId={piece.id}
      sources={sources}
      selectedSource={selectedSource}
      onSelect={selectSource}
    />
  )

  if (!selectedSource?.isYouTube || !selectedSource.youtubeVideoId) {
    return (
      <UnavailableWorkspace
        selectedSource={selectedSource}
        mediaPanel={mediaPanel}
      />
    )
  }

  return (
    <YouTubeLoopPlayer
      videoId={selectedSource.youtubeVideoId}
      title={`${piece.title} — ${selectedSource.label}`}
      recordingLabel={selectedSource.label}
      pieceId={piece.id}
      savedLoops={getLoopsForSource(mediaBundle, selectedSource)}
      mediaPanel={mediaPanel}
    />
  )
}
