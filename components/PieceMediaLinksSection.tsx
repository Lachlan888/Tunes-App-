"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { getYouTubeEmbedUrl } from "@/components/ReferenceMediaEmbed"

type PieceMediaLink = {
  id: number
  url: string
  label: string | null
}

type PieceMediaLinksSectionProps = {
  pieceId: number
  redirectTo: string
  mediaLinks: PieceMediaLink[]
  addPieceMediaLink: (formData: FormData) => Promise<void>
}

export default function PieceMediaLinksSection({
  pieceId,
  redirectTo,
  mediaLinks,
  addPieceMediaLink,
}: PieceMediaLinksSectionProps) {
  const [openMediaId, setOpenMediaId] = useState<number | null>(null)

  return (
    <section className="rounded border p-4">
      <h2 className="mb-2 text-xl font-semibold">Media</h2>

      <form action={addPieceMediaLink} className="mb-6 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <input
          name="label"
          placeholder="Label, eg Session video"
          className="w-full border p-2"
          required
        />

        <input
          name="url"
          type="url"
          placeholder="https://..."
          className="w-full border p-2"
          required
        />

        <SubmitButton
          label="Add media link"
          pendingLabel="Adding..."
          className="border px-4 py-2"
        />
      </form>

      {mediaLinks.length > 0 ? (
        <ul className="space-y-3">
          {mediaLinks.map((link) => {
            const embedUrl = getYouTubeEmbedUrl(link.url)
            const isOpen = openMediaId === link.id

            return (
              <li key={link.id} className="border p-3">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {link.label || "Untitled media link"}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm">
                    {embedUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMediaId((current) =>
                            current === link.id ? null : link.id
                          )
                        }
                        className="underline"
                      >
                        {isOpen ? "Hide inline media" : "Watch inline"}
                      </button>
                    ) : null}

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Open in new tab
                    </a>
                  </div>

                  {embedUrl && isOpen ? (
                    <div className="aspect-video w-full overflow-hidden rounded border">
                      <iframe
                        src={embedUrl}
                        title={`${link.label || "Media"} player`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-gray-700">No media links yet.</p>
      )}
    </section>
  )
}