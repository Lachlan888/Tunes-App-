"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/loaders/tune-detail"
import { getYouTubeVideoId } from "@/lib/youtube"

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
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

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
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {referenceUrl ? (
        <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <ReferenceMediaEmbed
            referenceUrl={referenceUrl}
            title={referenceTitle}
            heading="Reference video and loops"
            pieceId={pieceId}
            redirectTo={redirectTo}
            savedLoops={savedLoops}
          />
        </section>
      ) : null}

      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Other media
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
            No other media links yet.
          </p>
        )}
      </section>
    </div>
  )
}