"use client"

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { YouTubeSearchResult } from "@/app/api/youtube/search/route"

type YouTubeSearchResultListProps = {
  results: YouTubeSearchResult[]
  pieceId: number
  redirectTo: string
  previewVideoId: string | null
  onPreview: (videoId: string | null) => void
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
}

export default function YouTubeSearchResultList({
  results,
  pieceId,
  redirectTo,
  previewVideoId,
  onPreview,
  addReferenceUrlToPiece,
}: YouTubeSearchResultListProps) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        No results yet. Search for the tune title, player, source, style, or
        recording you want to use.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {results.map((result) => {
        const isPreviewOpen = previewVideoId === result.videoId

        return (
          <li
            key={result.videoId}
            className="overflow-hidden rounded-2xl border border-border bg-background/70"
          >
            <div className="flex min-w-0 gap-3 p-3">
              {result.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.thumbnailUrl}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-xl object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                  {result.title}
                </h3>

                <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {result.channelTitle}
                </p>

                {result.publishedAt ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(result.publishedAt).getFullYear()}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={buttonStyles.secondary}
                    onClick={() =>
                      onPreview(isPreviewOpen ? null : result.videoId)
                    }
                  >
                    {isPreviewOpen ? "Hide preview" : "Preview"}
                  </button>

                  <form action={addReferenceUrlToPiece}>
                    <input type="hidden" name="piece_id" value={pieceId} />
                    <input
                      type="hidden"
                      name="reference_url"
                      value={result.url}
                    />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value={redirectTo}
                    />

                    <SubmitButton
                      label="Use this"
                      pendingLabel="Saving..."
                      className={buttonStyles.primary}
                    />
                  </form>
                </div>
              </div>
            </div>

            {isPreviewOpen ? (
              <div className="border-t border-border bg-card p-3">
                <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-foreground/10">
                  <iframe
                    title={`Preview ${result.title}`}
                    src={`https://www.youtube.com/embed/${result.videoId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}