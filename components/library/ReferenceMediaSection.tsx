"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { TuneMediaBundle, TuneMediaSource } from "@/lib/tune-media"
import { getLoopsForSource } from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

type ReferenceMediaSectionProps = {
  piece: Piece
  currentUserId: string
  redirectTo: string
  mediaBundle: TuneMediaBundle
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
  addPieceMediaLink: (formData: FormData) => Promise<void>
  removePieceMediaLink: (formData: FormData) => Promise<void>
  addPieceSheetMusicLink: (formData: FormData) => Promise<void>
  className?: string
}

const mediaTypeOptions = [
  "Recording",
  "Video",
  "Lesson",
  "Source",
  "Performance",
  "Other",
]

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function sourceKindLabel(source: TuneMediaSource) {
  if (source.sourceType === "canonical-reference") return "Shared"
  if (source.sourceType === "personal-preferred-reference") return "Personal"
  if (source.sourceType === "sheet-music") return "Sheet music"
  return source.mediaType === "youtube" ? "YouTube" : source.mediaType
}

function SourceOpenControl({
  source,
  piece,
  redirectTo,
  mediaBundle,
  label = "Open",
  className,
}: {
  source: TuneMediaSource
  piece: Piece
  redirectTo: string
  mediaBundle: TuneMediaBundle
  label?: string
  className?: string
}) {
  const loops = getLoopsForSource(mediaBundle, source)

  if (source.isYouTube) {
    return (
      <ReferenceMediaEmbed
        referenceUrl={source.url}
        title={source.label || piece.title}
        showHeading={false}
        triggerLabel={label}
        triggerClassName={className ?? buttonStyles.secondary}
        pieceId={piece.id}
        redirectTo={redirectTo}
        savedLoops={loops}
      />
    )
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className={className ?? buttonStyles.secondary}
    >
      {label}
    </a>
  )
}

function SavedLoopsForSource({
  source,
  mediaBundle,
}: {
  source: TuneMediaSource
  mediaBundle: TuneMediaBundle
}) {
  const loops = getLoopsForSource(mediaBundle, source)

  if (!source.isYouTube || loops.length === 0) {
    return null
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-background/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Saved loops for this video
      </p>
      <ul className="mt-2 space-y-1">
        {loops.map((loop) => (
          <li
            key={loop.id}
            className="text-sm leading-6 text-muted-foreground"
          >
            <span className="font-medium text-foreground">{loop.label}</span>{" "}
            {Math.round(loop.start_seconds)}s-{Math.round(loop.end_seconds)}s
          </li>
        ))}
      </ul>
    </div>
  )
}

function MediaSourceRow({
  source,
  piece,
  redirectTo,
  mediaBundle,
  currentUserId,
  removePieceMediaLink,
  canSetPreferred = false,
  upsertPreferredReferenceUrl,
}: {
  source: TuneMediaSource
  piece: Piece
  redirectTo: string
  mediaBundle: TuneMediaBundle
  currentUserId: string
  removePieceMediaLink: (formData: FormData) => Promise<void>
  canSetPreferred?: boolean
  upsertPreferredReferenceUrl?: (formData: FormData) => Promise<void>
}) {
  const isOwnAdditionalMedia =
    source.sourceType === "additional-media" && source.createdBy === currentUserId

  return (
    <li className="min-w-0 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="min-w-0 break-words text-sm font-semibold text-foreground">
            {source.label}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {sourceKindLabel(source)}
          </p>
          {source.notes ? (
            <p className="mt-2 min-w-0 break-words text-sm leading-6 text-muted-foreground">
              {source.notes}
            </p>
          ) : null}
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {source.url}
          </a>
          <SavedLoopsForSource source={source} mediaBundle={mediaBundle} />
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <SourceOpenControl
            source={source}
            piece={piece}
            redirectTo={redirectTo}
            mediaBundle={mediaBundle}
            label={source.isYouTube ? "Open player" : "Open link"}
          />

          {canSetPreferred &&
          source.canBePreferredReference &&
          upsertPreferredReferenceUrl ? (
            <form action={upsertPreferredReferenceUrl}>
              <input type="hidden" name="piece_id" value={piece.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input
                type="hidden"
                name="preferred_reference_label"
                value={source.label}
              />
              <input
                type="hidden"
                name="preferred_reference_url"
                value={source.url}
              />
              <SubmitButton
                label="Use for Practice"
                pendingLabel="Saving..."
                className={buttonStyles.secondary}
              />
            </form>
          ) : null}

          {isOwnAdditionalMedia ? (
            <form action={removePieceMediaLink}>
              <input type="hidden" name="piece_id" value={piece.id} />
              <input
                type="hidden"
                name="media_link_id"
                value={source.id.replace("media-", "")}
              />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <SubmitButton
                label="Remove"
                pendingLabel="Removing..."
                className={buttonStyles.destructiveSecondary}
              />
            </form>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export default function ReferenceMediaSection({
  piece,
  currentUserId,
  redirectTo,
  mediaBundle,
  addReferenceUrlToPiece,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addPieceMediaLink,
  removePieceMediaLink,
  addPieceSheetMusicLink,
  className,
}: ReferenceMediaSectionProps) {
  const [isFindReferenceOpen, setIsFindReferenceOpen] = useState(false)
  const effectiveReference = mediaBundle.effectiveReference
  const preferredReference = mediaBundle.personalPreferredReference
  const preferredCandidateSources = [
    mediaBundle.canonicalReference,
    ...mediaBundle.additionalMedia,
  ].filter(
    (source): source is TuneMediaSource =>
      Boolean(source?.canBePreferredReference) &&
      source?.url !== preferredReference?.url
  )

  return (
    <section
      id="reference-media"
      className={joinClasses(
        "w-full max-w-full scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6",
        className
      )}
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Reference Media
      </h2>

      <div className="mt-5 space-y-6">
        <section className="min-w-0 border-b border-border pb-6">
          <h3 className="text-base font-semibold text-foreground">
            Primary reference
          </h3>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Shared reference
              </p>
              {mediaBundle.canonicalReference ? (
                <div className="mt-2">
                  <p className="break-words text-sm font-semibold text-foreground">
                    {mediaBundle.canonicalReference.label}
                  </p>
                  <div className="mt-3">
                    <SourceOpenControl
                      source={mediaBundle.canonicalReference}
                      piece={piece}
                      redirectTo={redirectTo}
                      mediaBundle={mediaBundle}
                      label="Open shared reference"
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFindReferenceOpen(true)}
                  className={`${buttonStyles.primary} mt-3 w-full sm:w-auto`}
                >
                  Find shared reference
                </button>
              )}
            </div>

            <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                My preferred reference
              </p>
              {preferredReference ? (
                <div className="mt-2">
                  <p className="break-words text-sm font-semibold text-foreground">
                    {preferredReference.label}
                  </p>
                  <form action={removePreferredReferenceUrl} className="mt-3">
                    <input type="hidden" name="piece_id" value={piece.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Clear preferred reference"
                      pendingLabel="Clearing..."
                      className={buttonStyles.destructiveSecondary}
                    />
                  </form>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No personal preferred reference selected.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Currently used for Practice
            </p>
            {effectiveReference ? (
              <div className="mt-2">
                <p className="break-words text-sm font-semibold text-foreground">
                  {effectiveReference.label} · {sourceKindLabel(effectiveReference)}
                </p>
                <div className="mt-3">
                  <SourceOpenControl
                    source={effectiveReference}
                    piece={piece}
                    redirectTo={redirectTo}
                    mediaBundle={mediaBundle}
                    label="Open Reference Media"
                    className={buttonStyles.primary}
                  />
                </div>
                <SavedLoopsForSource
                  source={effectiveReference}
                  mediaBundle={mediaBundle}
                />
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                No playable reference is selected yet.
              </p>
            )}
          </div>

          {preferredCandidateSources.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Choose a YouTube source for Practice
              </p>
              <ul className="mt-2 divide-y divide-border">
                {preferredCandidateSources.map((source) => (
                  <MediaSourceRow
                    key={source.id}
                    source={source}
                    piece={piece}
                    redirectTo={redirectTo}
                    mediaBundle={mediaBundle}
                    currentUserId={currentUserId}
                    removePieceMediaLink={removePieceMediaLink}
                    canSetPreferred
                    upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="min-w-0 border-b border-border pb-6">
          <h3 className="text-base font-semibold text-foreground">
            Recordings and resources
          </h3>
          {mediaBundle.additionalMedia.length > 0 ? (
            <ul className="mt-3 divide-y divide-border">
              {mediaBundle.additionalMedia.map((source) => (
                <MediaSourceRow
                  key={source.id}
                  source={source}
                  piece={piece}
                  redirectTo={redirectTo}
                  mediaBundle={mediaBundle}
                  currentUserId={currentUserId}
                  removePieceMediaLink={removePieceMediaLink}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No additional recordings or resources yet.
            </p>
          )}

          <details className="mt-5">
            <summary className="list-none">
              <span className={`${buttonStyles.secondary} cursor-pointer`}>
                Add media link
              </span>
            </summary>

            <form action={addPieceMediaLink} className="mt-4 space-y-3">
              <input type="hidden" name="piece_id" value={piece.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input
                name="title"
                placeholder="Title, eg Live performance"
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
              <select
                name="media_type"
                defaultValue="Other"
                className={inputClassName}
              >
                {mediaTypeOptions.map((mediaType) => (
                  <option key={mediaType} value={mediaType}>
                    {mediaType}
                  </option>
                ))}
              </select>
              <textarea
                name="notes"
                placeholder="Notes, source details, or why this version is useful"
                rows={3}
                className={inputClassName}
              />
              <SubmitButton
                label="Save media link"
                pendingLabel="Saving..."
                className={buttonStyles.primary}
              />
            </form>
          </details>
        </section>

        <section className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">
            Sheet music
          </h3>
          {mediaBundle.sheetMusic.length > 0 ? (
            <ul className="mt-3 divide-y divide-border">
              {mediaBundle.sheetMusic.map((source) => (
                <li
                  key={source.id}
                  className="min-w-0 py-4 first:pt-0 last:pb-0"
                >
                  <p className="break-words text-sm font-semibold text-foreground">
                    {source.label}
                  </p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {source.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No sheet music links yet.
            </p>
          )}

          <details className="mt-5">
            <summary className="list-none">
              <span className={`${buttonStyles.secondary} cursor-pointer`}>
                Add sheet music link
              </span>
            </summary>

            <form action={addPieceSheetMusicLink} className="mt-4 space-y-3">
              <input type="hidden" name="piece_id" value={piece.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input
                name="label"
                placeholder="Label, eg Mandolin tab"
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
              <SubmitButton
                label="Save sheet music link"
                pendingLabel="Adding..."
                className={buttonStyles.primary}
              />
            </form>
          </details>
        </section>
      </div>

      {isFindReferenceOpen ? (
        <FindReferenceModal
          piece={piece}
          redirectTo={redirectTo}
          addReferenceUrlToPiece={addReferenceUrlToPiece}
          onClose={() => setIsFindReferenceOpen(false)}
        />
      ) : null}
    </section>
  )
}
