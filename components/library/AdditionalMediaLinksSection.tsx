"use client"

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { PieceMediaLink } from "@/lib/loaders/tune-detail"

type AdditionalMediaLinksSectionProps = {
  pieceId: number
  currentUserId: string
  redirectTo: string
  mediaLinks: PieceMediaLink[]
  addPieceMediaLink: (formData: FormData) => Promise<void>
  removePieceMediaLink: (formData: FormData) => Promise<void>
}

const mediaTypeOptions = [
  "Recording",
  "Video",
  "Lesson",
  "Sheet music",
  "Source",
  "Performance",
  "Other",
]

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function AdditionalMediaLinksSection({
  pieceId,
  currentUserId,
  redirectTo,
  mediaLinks,
  addPieceMediaLink,
  removePieceMediaLink,
}: AdditionalMediaLinksSectionProps) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Additional media links
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Other useful recordings, lessons, performances, or source material.
        </p>

        {mediaLinks.length > 0 ? (
          <ul className="mt-5 divide-y divide-border">
            {mediaLinks.map((link) => (
              <li key={link.id} className="min-w-0 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="min-w-0 break-words text-sm font-semibold text-foreground">
                      {link.label || "Untitled media link"}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {link.media_type || "Other"}
                    </p>
                    {link.notes ? (
                      <p className="mt-2 min-w-0 break-words text-sm leading-6 text-muted-foreground">
                        {link.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles.secondary}
                    >
                      Open link
                    </a>

                    {link.created_by === currentUserId ? (
                      <form action={removePieceMediaLink}>
                        <input type="hidden" name="piece_id" value={pieceId} />
                        <input
                          type="hidden"
                          name="media_link_id"
                          value={link.id}
                        />
                        <input
                          type="hidden"
                          name="redirect_to"
                          value={redirectTo}
                        />
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
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            No additional media links yet.
          </p>
        )}

        <details className="mt-5">
          <summary className="list-none">
            <span className={`${buttonStyles.secondary} cursor-pointer`}>
              Add media link
            </span>
          </summary>

          <form action={addPieceMediaLink} className="mt-4 space-y-3">
            <input type="hidden" name="piece_id" value={pieceId} />
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
      </div>
    </section>
  )
}
