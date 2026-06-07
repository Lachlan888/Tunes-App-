"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import YouTubeLoopPlayer from "@/components/library/YouTubeLoopPlayer"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/types"

type ReferenceMediaModalProps = {
  videoId: string
  title: string
  heading?: string
  showHeading?: boolean
  pieceId?: number
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
  triggerLabel?: string
  triggerClassName?: string
}

export default function ReferenceMediaModal({
  videoId,
  title,
  heading = "Reference video and loops",
  showHeading = true,
  pieceId,
  redirectTo,
  savedLoops = [],
  triggerLabel = "Open reference media",
  triggerClassName,
}: ReferenceMediaModalProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [loadedLoops, setLoadedLoops] =
    useState<UserPieceMediaLoop[]>(savedLoops)
  const [isLoadingLoops, setIsLoadingLoops] = useState(false)
  const [loopLoadError, setLoopLoadError] = useState<string | null>(null)
  const search = searchParams.toString()
  const effectiveRedirectTo =
    redirectTo || (search ? `${pathname}?${search}` : pathname)

  useEffect(() => {
    if (!isOpen || !pieceId) {
      return
    }

    const controller = new AbortController()

    async function loadLoops() {
      setIsLoadingLoops(true)
      setLoopLoadError(null)

      const params = new URLSearchParams({
        piece_id: String(pieceId),
        youtube_video_id: videoId,
      })

      try {
        const response = await fetch(`/api/media-loops?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Couldn’t load saved loops.")
        }

        const data = (await response.json()) as {
          loops?: UserPieceMediaLoop[]
        }

        setLoadedLoops(data.loops ?? [])
      } catch {
        if (!controller.signal.aborted) {
          setLoopLoadError("Couldn’t refresh saved loops.")
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingLoops(false)
        }
      }
    }

    loadLoops()

    return () => controller.abort()
  }, [isOpen, pieceId, videoId])

  const trigger = (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className={triggerClassName ?? buttonStyles.secondary}
    >
      {triggerLabel}
    </button>
  )

  return (
    <>
      {showHeading ? (
        <section className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="min-w-0 break-words text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {heading}
            </h2>

            <div className="shrink-0">{trigger}</div>
          </div>
        </section>
      ) : (
        trigger
      )}

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-5xl"
        eyebrow="Reference media"
        title={title}
        bodyClassName={joinClasses(
          "min-h-0 min-w-0 flex-1 overflow-y-auto p-3",
          "sm:p-4 md:p-6"
        )}
        panelClassName="max-w-full"
      >
        {isLoadingLoops ? (
          <LoadingSpinner
            label="Loading saved loops..."
            showLabel
            className="mb-3"
          />
        ) : null}

        {loopLoadError ? (
          <p className="mb-3 rounded-2xl border border-border bg-background/70 p-3 text-sm text-muted-foreground">
            {loopLoadError}
          </p>
        ) : null}

        <YouTubeLoopPlayer
          videoId={videoId}
          title={`${title} video`}
          pieceId={pieceId}
          redirectTo={effectiveRedirectTo}
          savedLoops={loadedLoops}
        />
      </ResponsiveModal>
    </>
  )
}
