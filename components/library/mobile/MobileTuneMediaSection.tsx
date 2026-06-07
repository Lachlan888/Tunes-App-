"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import AdditionalMediaLinksSection from "@/components/library/AdditionalMediaLinksSection"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { getEffectiveReference } from "@/lib/effective-reference"
import type {
  PieceSheetMusicLink,
  PieceMediaLink,
  UserPieceMediaLoop,
  UserPieceMetadata,
} from "@/lib/loaders/tune-detail"
import type { Piece } from "@/lib/types"

type MobileTuneMediaSectionProps = {
  piece: Piece
  currentUserId: string
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  savedLoops: UserPieceMediaLoop[]
  mediaLinks: PieceMediaLink[]
  sheetMusicLinks: PieceSheetMusicLink[]
  showMediaLinks: boolean
  showSheetMusic: boolean
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
  addPieceMediaLink: (formData: FormData) => Promise<void>
  removePieceMediaLink: (formData: FormData) => Promise<void>
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
  currentUserId,
  redirectTo,
  userPieceMetadata,
  savedLoops,
  mediaLinks,
  sheetMusicLinks,
  showMediaLinks,
  showSheetMusic,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addPieceMediaLink,
  removePieceMediaLink,
  addPieceSheetMusicLink,
  addReferenceUrlToPiece,
}: MobileTuneMediaSectionProps) {
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
        Media and sheet music sections are hidden in Display options.
      </p>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {showMediaLinks ? (
        <>
          <MobileSection title="Reference media">
            <p className="mb-2 text-sm leading-6 text-muted-foreground">
              The main reference version for this tune.
            </p>

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
            ) : (
              <button
                type="button"
                onClick={() => setIsFindReferenceOpen(true)}
                className={joinClasses(
                  buttonStyles.primary,
                  "mt-4",
                  mobileButtonClass
                )}
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

          <AdditionalMediaLinksSection
            pieceId={piece.id}
            currentUserId={currentUserId}
            redirectTo={redirectTo}
            mediaLinks={mediaLinks}
            addPieceMediaLink={addPieceMediaLink}
            removePieceMediaLink={removePieceMediaLink}
          />
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
                <li
                  key={link.id}
                  className="min-w-0 py-4 first:pt-0 last:pb-0"
                >
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
