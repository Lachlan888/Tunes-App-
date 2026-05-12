"use client"

import { useState } from "react"
import ReferenceMediaEmbed, {
  getYouTubeVideoId,
} from "@/components/library/ReferenceMediaEmbed"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/loaders/tune-detail"

type PieceMediaLink = {
  id: number
  url: string
  label: string | null
}

type PieceMediaLinksSectionProps = {
  pieceId: number
  redirectTo: string
  mediaLinks: PieceMediaLink[]
  referenceUrl?: string | null
  referenceTitle?: string
  savedLoops: UserPieceMediaLoop[]
  addPieceMediaLink: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PieceMediaLinksSection({
  pieceId,
  redirectTo,
  mediaLinks,
  referenceUrl,
  referenceTitle = "Tune",
  savedLoops,
  addPieceMediaLink,
}: PieceMediaLinksSectionProps) {
  const [openMediaId, setOpenMediaId] = useState<number | null>(null)

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      {referenceUrl ? (
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-background/70 p-4">
          <ReferenceMediaEmbed
            referenceUrl={referenceUrl}
            title={referenceTitle}
            heading="Reference video"
            pieceId={pieceId}
            redirectTo={redirectTo}
            savedLoops={savedLoops}
          />
        </div>
      ) : null}

      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Media
      </h2>

      <form action={addPieceMediaLink} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
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
                className="rounded-2xl border border-border bg-background/70 p-4"
              >
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {label}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm">
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
                    <div className="rounded-2xl border border-border bg-card/60 p-3">
                      <ReferenceMediaEmbed
                        referenceUrl={link.url}
                        title={label}
                        showHeading={false}
                        pieceId={pieceId}
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
          No media links yet.
        </p>
      )}
    </section>
  )
}