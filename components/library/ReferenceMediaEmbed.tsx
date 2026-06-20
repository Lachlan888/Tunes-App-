"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import ReferenceMediaModal from "@/components/library/ReferenceMediaModal"
import {
  getPlayerTime,
  loadYouTubeIframeApi,
  safeNumber,
  type YouTubePlaybackSnapshot,
  type YouTubePlayer,
} from "@/components/library/YouTubeLoopPlayer"
import { buttonStyles } from "@/components/ui/buttonStyles"
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

type InlinePreviewHandle = {
  getSnapshot: () => YouTubePlaybackSnapshot
  pause: () => void
}

type InlineYouTubePreviewProps = {
  videoId: string
  title: string
  isActive: boolean
  playbackState: YouTubePlaybackSnapshot
  onPlaybackSnapshotChange: (snapshot: YouTubePlaybackSnapshot) => void
}

const EMPTY_LOOP_STATE = {
  loopStart: null,
  loopEnd: null,
  loopEnabled: false,
}

const InlineYouTubePreview = forwardRef<
  InlinePreviewHandle,
  InlineYouTubePreviewProps
>(function InlineYouTubePreview(
  { videoId, title, isActive, playbackState, onPlaybackSnapshotChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const latestSnapshotRef = useRef<YouTubePlaybackSnapshot>(playbackState)
  const [isReady, setIsReady] = useState(false)
  const appliedPlaybackStateRef =
    useRef<YouTubePlaybackSnapshot>(playbackState)

  const readSnapshot = useCallback((): YouTubePlaybackSnapshot => {
    const player = playerRef.current
    let playbackRate = latestSnapshotRef.current.playbackRate

    try {
      playbackRate = player?.getPlaybackRate?.() ?? playbackRate
    } catch {
      // Keep the last known rate if YouTube rejects the read.
    }

    return {
      currentTime: getPlayerTime(player),
      playbackRate,
      isPlaying: latestSnapshotRef.current.isPlaying,
      ...EMPTY_LOOP_STATE,
    }
  }, [])

  const publishSnapshot = useCallback(
    (snapshot = readSnapshot()) => {
      latestSnapshotRef.current = snapshot
      onPlaybackSnapshotChange(snapshot)
    },
    [onPlaybackSnapshotChange, readSnapshot]
  )

  useImperativeHandle(
    ref,
    () => ({
      getSnapshot: () => readSnapshot(),
      pause: () => {
        const snapshot = readSnapshot()
        publishSnapshot({ ...snapshot, isPlaying: false })
        playerRef.current?.pauseVideo?.()
      },
    }),
    [publishSnapshot, readSnapshot]
  )

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !container || !window.YT?.Player) return

      const player = new window.YT.Player(container, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          start: Math.floor(playbackState.currentTime),
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            playerRef.current = event.target
            setIsReady(true)

            if (playbackState.currentTime > 0) {
              event.target.seekTo(playbackState.currentTime, true)
            }

            try {
              event.target.setPlaybackRate(playbackState.playbackRate)
            } catch {
              // The requested rate may not be available for every video.
            }

            if (isActive && playbackState.isPlaying) {
              event.target.playVideo()
            } else {
              event.target.pauseVideo?.()
            }
          },
          onStateChange: (event) => {
            const playingState = window.YT?.PlayerState?.PLAYING
            const nextSnapshot = {
              ...readSnapshot(),
              isPlaying:
                playingState !== undefined && event.data === playingState,
            }

            publishSnapshot(nextSnapshot)
          },
        },
      })

      playerRef.current = player
    })

    return () => {
      cancelled = true

      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignore player cleanup failures.
        }
      }

      playerRef.current = null
    }
  }, [isActive, playbackState, publishSnapshot, readSnapshot, videoId])

  useEffect(() => {
    if (!isReady) return

    if (!isActive) {
      const snapshot = readSnapshot()
      publishSnapshot({ ...snapshot, isPlaying: false })
      playerRef.current?.pauseVideo?.()
      return
    }

    if (appliedPlaybackStateRef.current === playbackState) return

    const player = playerRef.current

    if (!player) return

    player.seekTo(playbackState.currentTime, true)

    try {
      player.setPlaybackRate(playbackState.playbackRate)
    } catch {
      // Leave the player at YouTube's accepted rate.
    }

    if (playbackState.isPlaying) {
      player.playVideo()
    } else {
      player.pauseVideo?.()
    }

    appliedPlaybackStateRef.current = playbackState
    publishSnapshot(playbackState)
  }, [isActive, isReady, playbackState, publishSnapshot, readSnapshot])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!isActive) return

      const player = playerRef.current
      let playbackRate = latestSnapshotRef.current.playbackRate

      try {
        playbackRate = player?.getPlaybackRate?.() ?? playbackRate
      } catch {
        // Keep the last known rate.
      }

      publishSnapshot({
        currentTime: safeNumber(getPlayerTime(player)),
        playbackRate,
        isPlaying: latestSnapshotRef.current.isPlaying,
        ...EMPTY_LOOP_STATE,
      })
    }, 200)

    return () => window.clearInterval(intervalId)
  }, [isActive, publishSnapshot])

  return (
    <div className="aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-border bg-foreground/10 shadow-sm">
      <div ref={containerRef} title={title} className="h-full w-full" />
    </div>
  )
})

export default function ReferenceMediaEmbed({
  referenceUrl,
  ...props
}: ReferenceMediaEmbedProps) {
  const videoId = getYouTubeVideoId(referenceUrl)

  if (!videoId) {
    return null
  }

  return <ReferenceMediaEmbedContent videoId={videoId} {...props} />
}

function ReferenceMediaEmbedContent({
  videoId,
  title,
  heading = "Reference video and loops",
  showHeading = true,
  pieceId,
  redirectTo,
  savedLoops = [],
  triggerLabel,
  triggerClassName,
  inlinePreview = false,
}: Omit<ReferenceMediaEmbedProps, "referenceUrl"> & { videoId: string }) {
  const loopsForVideo = savedLoops.filter(
    (loop) => loop.youtube_video_id === videoId
  )

  const modalTriggerLabel =
    triggerLabel ??
    (loopsForVideo.length > 0 ? "Open saved loops" : "Open loop controls")

  const modalTriggerClassName = triggerClassName ?? buttonStyles.secondary
  const previewRef = useRef<InlinePreviewHandle | null>(null)
  const latestPreviewSnapshotRef = useRef<YouTubePlaybackSnapshot>({
    currentTime: 0,
    playbackRate: 1,
    isPlaying: false,
    ...EMPTY_LOOP_STATE,
  })
  const latestModalSnapshotRef = useRef<YouTubePlaybackSnapshot | null>(null)
  const [modalInitialState, setModalInitialState] =
    useState<YouTubePlaybackSnapshot | null>(null)
  const [previewPlaybackState, setPreviewPlaybackState] =
    useState<YouTubePlaybackSnapshot>({
      currentTime: 0,
      playbackRate: 1,
      isPlaying: false,
      ...EMPTY_LOOP_STATE,
    })
  const [isPreviewActive, setIsPreviewActive] = useState(true)

  function handleOpenModal() {
    const snapshot =
      previewRef.current?.getSnapshot() ?? latestPreviewSnapshotRef.current

    latestPreviewSnapshotRef.current = snapshot
    latestModalSnapshotRef.current = snapshot
    setModalInitialState(snapshot)
    previewRef.current?.pause()
    setIsPreviewActive(false)
  }

  function handleCloseModal(snapshot?: YouTubePlaybackSnapshot) {
    const nextSnapshot =
      snapshot ??
      latestModalSnapshotRef.current ??
      latestPreviewSnapshotRef.current

    latestPreviewSnapshotRef.current = nextSnapshot
    setPreviewPlaybackState(nextSnapshot)
    setIsPreviewActive(true)
  }

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
      onOpen={handleOpenModal}
      onClose={handleCloseModal}
      initialPlaybackState={modalInitialState}
      onPlaybackSnapshotChange={(snapshot) => {
        latestModalSnapshotRef.current = snapshot
      }}
    />
  )

  if (!inlinePreview) {
    return modal
  }

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

      <InlineYouTubePreview
        ref={previewRef}
        videoId={videoId}
        title={`${title} reference video`}
        isActive={isPreviewActive}
        playbackState={previewPlaybackState}
        onPlaybackSnapshotChange={(snapshot) => {
          latestPreviewSnapshotRef.current = snapshot
        }}
      />

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
