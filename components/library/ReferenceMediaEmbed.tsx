import ReferenceMediaModal from "@/components/library/ReferenceMediaModal"
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
}: ReferenceMediaEmbedProps) {
  const videoId = getYouTubeVideoId(referenceUrl)

  if (!videoId) {
    return null
  }

  const loopsForVideo = savedLoops.filter(
    (loop) => loop.youtube_video_id === videoId
  )

  return (
    <ReferenceMediaModal
      videoId={videoId}
      title={title}
      heading={heading}
      showHeading={showHeading}
      pieceId={pieceId}
      redirectTo={redirectTo}
      savedLoops={loopsForVideo}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
    />
  )
}