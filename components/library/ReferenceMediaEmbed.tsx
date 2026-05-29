import ReferenceMediaModal from "@/components/library/ReferenceMediaModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/types"
import { getYouTubeVideoId } from "@/lib/youtube"

type ReferenceMediaEmbedProps = {
  referenceUrl: string
  title: string
  heading?: string
  showHeading?: boolean
  pieceId?: number
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
  triggerLabel?: string
  triggerClassName?: string
  inlinePreview?: boolean
}

export default function ReferenceMediaEmbed({
  referenceUrl,
  title,
  heading = "Reference video and loops",
  showHeading = true,
  pieceId,
  redirectTo,
  savedLoops = [],
  triggerLabel,
  triggerClassName,
  inlinePreview = false,
}: ReferenceMediaEmbedProps) {
  const videoId = getYouTubeVideoId(referenceUrl)

  if (!videoId) {
    return null
  }

  const loopsForVideo = savedLoops.filter(
    (loop) => loop.youtube_video_id === videoId
  )

  const modalTriggerLabel =
    triggerLabel ??
    (loopsForVideo.length > 0 ? "Open saved loops" : "Open loop controls")

  const modalTriggerClassName = triggerClassName ?? buttonStyles.secondary

  const modal = (
    <ReferenceMediaModal
      videoId={videoId}
      title={title}
      heading={heading}
      showHeading={false}
      pieceId={pieceId}
      redirectTo={redirectTo}
      savedLoops={loopsForVideo}
      triggerLabel={modalTriggerLabel}
      triggerClassName={modalTriggerClassName}
    />
  )

  if (!inlinePreview) {
    return modal
  }

  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`

  return (
    <section className="min-w-0 space-y-3">
      {showHeading ? (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="min-w-0 break-words text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {heading}
          </h2>

          <div className="shrink-0">{modal}</div>
        </div>
      ) : null}

      <div className="aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-border bg-foreground/10 shadow-sm">
        <iframe
          src={embedSrc}
          title={`${title} reference video`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Watch the reference here, or open the full player for loop points,
          saved loops and speed controls.
        </p>

        {!showHeading ? (
          <div className="shrink-0">{modal}</div>
        ) : null}
      </div>
    </section>
  )
}