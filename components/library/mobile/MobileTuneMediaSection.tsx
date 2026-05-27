"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { getEffectiveReference } from "@/lib/effective-reference"
import type {
  PieceMediaLink,
  PieceSheetMusicLink,
  UserPieceMediaLoop,
  UserPieceMetadata,
} from "@/lib/loaders/tune-detail"
import type { Piece } from "@/lib/types"
import { getYouTubeVideoId } from "@/lib/youtube"

type MobileTuneMediaSectionProps = {
  piece: Piece
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  mediaLinks: PieceMediaLink[]
  savedLoops: UserPieceMediaLoop[]
  sheetMusicLinks: PieceSheetMusicLink[]
  showMediaLinks: boolean
  showSheetMusic: boolean
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
  addPieceMediaLink: (formData: FormData) => Promise<void>
  addPieceSheetMusicLink: (formData: FormData) => Promise<void>
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const mobileButtonClass = "w-full sm:w-auto"

function MobileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  )
}

export default function MobileTuneMediaSection({
  piece,
  redirectTo,
  userPieceMetadata,
  mediaLinks,
  savedLoops,
  sheetMusicLinks,
  showMediaLinks,
  showSheetMusic,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addPieceMediaLink,
  addPieceSheetMusicLink,
  addReferenceUrlToPiece,
}: MobileTuneMediaSectionProps) {
  const [openMediaId, setOpenMediaId] = useState<number | null>(null)
  const [isFindReferenceOpen, setIsFindReferenceOpen] = useState(false)
  const {
    effectiveReferenceUrl,
    effectiveReferenceLabel,
    isUsingPreferredReference,
  } = getEffectiveReference({
    defaultReferenceUrl: piece.reference_url,
    metadata: userPieceMetadata,
  })
  const preferredReferenceUrl =
    userPieceMetadata?.preferred_reference_url || ""
  const preferredReferenceLabel =
    userPieceMetadata?.preferred_reference_label || ""

  if (!showMediaLinks && !showSheetMusic) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Media and sheet music sections are hidden in Tune Page Options.
      </p>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {showMediaLinks ? (
        <>
          <MobileSection title="Primary reference">
            <p className="text-sm leading-6 text-muted-foreground">
              {isUsingPreferredReference
                ? "Using your preferred reference."
                : piece.reference_url
                  ? "Using default tune reference."
                  : "No primary reference saved yet."}
            </p>

            {effectiveReferenceLabel ? (
              <p className="mt-2 min-w-0 break-words text-sm font-medium text-foreground">
                {effectiveReferenceLabel}
              </p>
            ) : null}

            {effectiveReferenceUrl ? (
              <>
                <a
                  href={effectiveReferenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={joinClasses(
                    buttonStyles.primary,
                    "mt-4",
                    mobileButtonClass
                  )}
                >
                  Open reference media
                </a>

                <div className="mt-4 min-w-0 overflow-hidden">
                  <ReferenceMediaEmbed
                    referenceUrl={effectiveReferenceUrl}
                    title={effectiveReferenceLabel || piece.title}
                    showHeading={false}
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                    savedLoops={savedLoops}
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsFindReferenceOpen(true)}
                className={joinClasses(buttonStyles.primary, "mt-4", mobileButtonClass)}
              >
                Find reference
              </button>
            )}

            {isUsingPreferredReference && piece.reference_url ? (
              <a
                href={piece.reference_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Open default reference
              </a>
            ) : null}
          </MobileSection>

          <MobileSection title="Preferred reference">
            {!isUsingPreferredReference ? (
              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                Set the reference you want to see for this tune.
              </p>
            ) : null}

            <form action={upsertPreferredReferenceUrl} className="space-y-3">
              <input type="hidden" name="piece_id" value={piece.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <input
                name="preferred_reference_label"
                placeholder="Label, eg Clare lesson"
                defaultValue={preferredReferenceLabel}
                className={inputClassName}
              />

              <input
                name="preferred_reference_url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                defaultValue={preferredReferenceUrl}
                className={inputClassName}
                required
              />

              <SubmitButton
                label="Save preferred reference"
                pendingLabel="Saving..."
                className={joinClasses(buttonStyles.primary, mobileButtonClass)}
              />
            </form>

            {isUsingPreferredReference ? (
              <form action={removePreferredReferenceUrl} className="mt-3">
                <input type="hidden" name="piece_id" value={piece.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <SubmitButton
                  label="Remove preferred reference"
                  pendingLabel="Removing..."
                  className={joinClasses(
                    buttonStyles.destructiveSecondary,
                    mobileButtonClass
                  )}
                />
              </form>
            ) : null}
          </MobileSection>

          <MobileSection title="Other media">
            <details className="group">
              <summary className="list-none">
                <span
                  className={joinClasses(
                    buttonStyles.secondary,
                    "cursor-pointer",
                    mobileButtonClass
                  )}
                >
                  Add media link
                </span>
              </summary>

              <form action={addPieceMediaLink} className="mt-4 space-y-3">
                <input type="hidden" name="piece_id" value={piece.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <input
                  name="label"
                  placeholder="Label, eg Session video"
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
                  label="Save media link"
                  pendingLabel="Adding..."
                  className={joinClasses(buttonStyles.primary, mobileButtonClass)}
                />
              </form>
            </details>

            {mediaLinks.length > 0 ? (
              <ul className="mt-5 divide-y divide-border">
                {mediaLinks.map((link) => {
                  const videoId = getYouTubeVideoId(link.url)
                  const isOpen = openMediaId === link.id
                  const label = link.label || "Untitled media link"

                  return (
                    <li key={link.id} className="min-w-0 py-4 first:pt-0 last:pb-0">
                      <p className="min-w-0 break-words text-sm font-medium text-foreground">
                        {label}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        {videoId ? (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMediaId((current) =>
                                current === link.id ? null : link.id
                              )
                            }
                            className={buttonStyles.text}
                          >
                            {isOpen ? "Hide inline media" : "Watch inline"}
                          </button>
                        ) : null}

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                        >
                          Open in new tab
                        </a>
                      </div>

                      {videoId && isOpen ? (
                        <div className="mt-3 min-w-0 overflow-hidden">
                          <ReferenceMediaEmbed
                            referenceUrl={link.url}
                            title={label}
                            showHeading={false}
                            pieceId={piece.id}
                            redirectTo={redirectTo}
                            savedLoops={savedLoops}
                          />
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No other media links yet.
              </p>
            )}
          </MobileSection>
        </>
      ) : null}

      {showSheetMusic ? (
        <MobileSection title="Sheet music / tab">
          <details>
            <summary className="list-none">
              <span
                className={joinClasses(
                  buttonStyles.secondary,
                  "cursor-pointer",
                  mobileButtonClass
                )}
              >
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
                className={joinClasses(buttonStyles.primary, mobileButtonClass)}
              />
            </form>
          </details>

          {sheetMusicLinks.length > 0 ? (
            <ul className="mt-5 divide-y divide-border">
              {sheetMusicLinks.map((link) => (
                <li key={link.id} className="min-w-0 py-4 first:pt-0 last:pb-0">
                  <p className="min-w-0 break-words text-sm font-medium text-foreground">
                    {link.label}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block min-w-0 break-all text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No sheet music links yet.
            </p>
          )}
        </MobileSection>
      ) : null}

      {isFindReferenceOpen ? (
        <FindReferenceModal
          piece={piece}
          redirectTo={redirectTo}
          addReferenceUrlToPiece={addReferenceUrlToPiece}
          onClose={() => setIsFindReferenceOpen(false)}
        />
      ) : null}
    </div>
  )
}
