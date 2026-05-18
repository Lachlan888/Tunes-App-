"use client"

import { useState } from "react"
import YouTubeLoopPlayer from "@/components/library/YouTubeLoopPlayer"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/loaders/tune-detail"

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
  const [isOpen, setIsOpen] = useState(false)

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
        <YouTubeLoopPlayer
          videoId={videoId}
          title={`${title} video`}
          pieceId={pieceId}
          redirectTo={redirectTo}
          savedLoops={savedLoops}
        />
      </ResponsiveModal>
    </>
  )
}