"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { getEffectiveReference } from "@/lib/effective-reference"
import type { UserPieceMetadata } from "@/lib/loaders/tune-detail"
import type { Piece, UserPieceMediaLoop } from "@/lib/types"

type PieceMediaLinksSectionProps = {
  piece: Piece
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  savedLoops: UserPieceMediaLoop[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PieceMediaLinksSection({
  piece,
  redirectTo,
  userPieceMetadata,
  savedLoops,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addReferenceUrlToPiece,
}: PieceMediaLinksSectionProps) {
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

  const referenceHeading = isUsingPreferredReference
    ? "Your preferred reference"
    : "Primary reference"

  const referenceStatus = isUsingPreferredReference
    ? "Using your preferred reference for this tune."
    : piece.reference_url
      ? "Using the default tune reference."
      : "No primary reference recording has been saved for this tune yet."

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {referenceHeading}
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {referenceStatus}
          </p>

          {effectiveReferenceLabel ? (
            <p className="mt-2 min-w-0 break-words text-sm font-medium text-foreground">
              {effectiveReferenceLabel}
            </p>
          ) : null}

          {effectiveReferenceUrl ? (
            <div className="mt-5">
              <ReferenceMediaEmbed
                referenceUrl={effectiveReferenceUrl}
                title={effectiveReferenceLabel || piece.title}
                showHeading={false}
                pieceId={piece.id}
                redirectTo={redirectTo}
                savedLoops={savedLoops}
                inlinePreview
                triggerLabel="Open loop controls"
                triggerClassName={buttonStyles.secondary}
              />
            </div>
          ) : null}

          {!piece.reference_url ? (
            <button
              type="button"
              onClick={() => setIsFindReferenceOpen(true)}
              className={`${buttonStyles.primary} mt-5 w-full sm:w-auto`}
            >
              Find reference
            </button>
          ) : null}

          {isUsingPreferredReference && piece.reference_url ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Default reference is still available.{" "}
              <a
                href={piece.reference_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                Open default reference
              </a>
            </p>
          ) : null}

          <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {isUsingPreferredReference
                ? "Update preferred reference"
                : "Set preferred reference"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This only changes the reference you see. The default tune
              reference stays unchanged for other users.
            </p>

            <form
              action={upsertPreferredReferenceUrl}
              className="mt-4 space-y-3"
            >
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

              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <SubmitButton
                  label="Save preferred reference"
                  pendingLabel="Saving..."
                  className={buttonStyles.primary}
                />
              </div>
            </form>

            {isUsingPreferredReference ? (
              <form
                action={removePreferredReferenceUrl}
                className="mt-3 sm:flex"
              >
                <input type="hidden" name="piece_id" value={piece.id} />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <SubmitButton
                  label="Remove preferred reference"
                  pendingLabel="Removing..."
                  className={buttonStyles.destructiveSecondary}
                />
              </form>
            ) : null}
          </div>
        </div>
      </section>

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