"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import PreferredReferenceControl from "@/components/reference-media/PreferredReferenceControl"
import FindReferenceModal from "@/components/reference-media/FindReferenceModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { UserPieceMetadata } from "@/lib/loaders/tune-detail"
import type { UserPieceMediaLoop } from "@/lib/types"
import type { Piece } from "@/lib/types"
import { getYouTubeVideoId } from "@/lib/youtube"

type PieceMediaLink = {
  id: number
  url: string
  label: string | null
}

type PieceMediaLinksSectionProps = {
  piece: Piece
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  mediaLinks: PieceMediaLink[]
  savedLoops: UserPieceMediaLoop[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
  addPieceMediaLink: (formData: FormData) => Promise<void>
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PieceMediaLinksSection({
  piece,
  redirectTo,
  userPieceMetadata,
  mediaLinks,
  savedLoops,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addPieceMediaLink,
  addReferenceUrlToPiece,
}: PieceMediaLinksSectionProps) {
  const [openMediaId, setOpenMediaId] = useState<number | null>(null)
  const [isFindReferenceOpen, setIsFindReferenceOpen] = useState(false)
  const hasAnyReference = Boolean(piece.reference_url) || mediaLinks.length > 0

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Reference
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Open your preferred reference, or choose from this tune&apos;s saved
            media.
          </p>

          {hasAnyReference ? (
            <PreferredReferenceControl
              pieceId={piece.id}
              title={piece.title}
              defaultReferenceUrl={piece.reference_url}
              mediaLinks={mediaLinks}
              metadata={userPieceMetadata}
              redirectTo={redirectTo}
              savedLoops={savedLoops}
              upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
              removePreferredReferenceUrl={removePreferredReferenceUrl}
              addPieceMediaLink={addPieceMediaLink}
              allowAddMediaLink
              className="mt-5"
            />
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
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Other media
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add extra recordings, videos, lessons, or source links. These do not
          replace the primary reference above.
        </p>

        <form action={addPieceMediaLink} className="mt-5 space-y-3">
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
            label="Add media link"
            pendingLabel="Adding..."
            className={buttonStyles.primary}
          />
        </form>

        {mediaLinks.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {mediaLinks.map((link) => {
              const videoId = getYouTubeVideoId(link.url)
              const isOpen = openMediaId === link.id
              const label = link.label || "Untitled media link"

              return (
                <li
                  key={link.id}
                  className="min-w-0 rounded-2xl border border-border bg-background/70 p-4"
                >
                  <div className="min-w-0 space-y-3">
                    <p className="min-w-0 break-words text-sm font-medium text-foreground">
                      {label}
                    </p>

                    <div className="grid gap-2 text-sm sm:flex sm:flex-wrap sm:gap-3">
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
                      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/60 p-3">
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
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No other media links yet.
          </p>
        )}
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
