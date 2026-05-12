"use client"

import { useEffect, useRef, useState } from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getAvailablePlaybackRates?: () => number[]
  getPlaybackRate?: () => number
  setPlaybackRate: (rate: number) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  getPlayerState?: () => number
}

type YouTubePlayerEvent = {
  target: YouTubePlayer
}

type YouTubePlayerOptions = {
  videoId: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void
  }
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: YouTubePlayerOptions
      ) => YouTubePlayer
      PlayerState?: {
        PLAYING: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

type YouTubeLoopPlayerProps = {
  videoId: string
  title: string
  className?: string
}

const DEFAULT_SPEEDS = [0.5, 0.75, 0.85, 1]
const NUDGE_AMOUNTS = [0.1, 0.5, 1] as const
type NudgeAmount = (typeof NUDGE_AMOUNTS)[number]

let youtubeApiPromise: Promise<void> | null = null

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.YT?.Player) {
    return Promise.resolve()
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReadyHandler = window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady = () => {
        previousReadyHandler?.()
        resolve()
      }

      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )

      if (!existingScript) {
        const script = document.createElement("script")
        script.src = "https://www.youtube.com/iframe_api"
        script.async = true
        document.body.appendChild(script)
      }
    })
  }

  return youtubeApiPromise
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

function formatTime(seconds: number | null, showTenths = false) {
  if (seconds === null) return "not set"

  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds - minutes * 60

  if (showTenths) {
    return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, "0")}`
  }

  return `${minutes}:${Math.floor(remainingSeconds)
    .toString()
    .padStart(2, "0")}`
}

function getPlayerTime(player: YouTubePlayer | null) {
  if (!player) return 0

  try {
    return safeNumber(player.getCurrentTime())
  } catch {
    return 0
  }
}

function getPlayerDuration(player: YouTubePlayer | null) {
  if (!player) return 0

  try {
    return safeNumber(player.getDuration())
  } catch {
    return 0
  }
}

function getAvailableRates(player: YouTubePlayer | null) {
  if (!player?.getAvailablePlaybackRates) {
    return DEFAULT_SPEEDS
  }

  try {
    const availableRates = player.getAvailablePlaybackRates()

    return availableRates.length > 0 ? availableRates : DEFAULT_SPEEDS
  } catch {
    return DEFAULT_SPEEDS
  }
}

function clampLoopEnd(start: number, desiredEnd: number, duration: number) {
  if (duration > 0) {
    return Math.min(desiredEnd, duration)
  }

  return desiredEnd
}

function clampTime(value: number, duration: number) {
  if (duration > 0) {
    return Math.min(Math.max(value, 0), duration)
  }

  return Math.max(value, 0)
}

export default function YouTubeLoopPlayer({
  videoId,
  title,
  className,
}: YouTubeLoopPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loopStart, setLoopStart] = useState<number | null>(null)
  const [loopEnd, setLoopEnd] = useState<number | null>(null)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [availableRates, setAvailableRates] = useState<number[]>(DEFAULT_SPEEDS)
  const [nudgeAmount, setNudgeAmount] = useState<NudgeAmount>(0.5)
  const [showLoopControls, setShowLoopControls] = useState(false)

  const hasValidLoop =
    loopStart !== null && loopEnd !== null && loopEnd > loopStart + 0.2

  const loopLength =
    hasValidLoop && loopStart !== null && loopEnd !== null
      ? loopEnd - loopStart
      : null

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return

    setIsReady(false)
    setCurrentTime(0)
    setDuration(0)
    setLoopStart(null)
    setLoopEnd(null)
    setLoopEnabled(false)
    setPlaybackRateState(1)
    setAvailableRates(DEFAULT_SPEEDS)
    setNudgeAmount(0.5)
    setShowLoopControls(false)

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !container || !window.YT?.Player) return

      const player = new window.YT.Player(container, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            playerRef.current = event.target
            setIsReady(true)
            setDuration(getPlayerDuration(event.target))
            setAvailableRates(getAvailableRates(event.target))

            try {
              setPlaybackRateState(event.target.getPlaybackRate?.() ?? 1)
            } catch {
              setPlaybackRateState(1)
            }
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
  }, [videoId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const player = playerRef.current
      const nextCurrentTime = getPlayerTime(player)

      setCurrentTime(nextCurrentTime)

      if (!player || !loopEnabled || !hasValidLoop) return

      const playingState = window.YT?.PlayerState?.PLAYING
      const playerState = player.getPlayerState?.()

      if (playingState !== undefined && playerState !== playingState) {
        return
      }

      if (loopEnd !== null && loopStart !== null && nextCurrentTime >= loopEnd) {
        player.seekTo(loopStart, true)
        player.playVideo()
      }
    }, 200)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [hasValidLoop, loopEnabled, loopEnd, loopStart])

  function handleTapIn() {
    const time = getPlayerTime(playerRef.current)

    setLoopStart(time)

    if (loopEnd !== null && loopEnd <= time + 0.2) {
      setLoopEnd(null)
      setLoopEnabled(false)
    }
  }

  function handleTapOut() {
    if (loopStart === null) return

    const time = getPlayerTime(playerRef.current)

    if (time <= loopStart + 0.2) return

    setLoopEnd(time)
    setLoopEnabled(true)
  }

  function handleClearLoop() {
    setLoopStart(null)
    setLoopEnd(null)
    setLoopEnabled(false)
  }

  function handleHalveLoopLength() {
    if (!hasValidLoop || loopStart === null || loopEnd === null) return

    const currentLength = loopEnd - loopStart
    const nextEnd = loopStart + currentLength / 2

    setLoopEnd(nextEnd)
    setLoopEnabled(true)

    const player = playerRef.current
    if (player) {
      const current = getPlayerTime(player)

      if (current >= nextEnd || current < loopStart) {
        player.seekTo(loopStart, true)
        player.playVideo()
      }
    }
  }

  function handleDoubleLoopLength() {
    if (!hasValidLoop || loopStart === null || loopEnd === null) return

    const currentLength = loopEnd - loopStart
    const nextEnd = clampLoopEnd(
      loopStart,
      loopStart + currentLength * 2,
      duration
    )

    if (nextEnd <= loopStart + 0.2) return

    setLoopEnd(nextEnd)
    setLoopEnabled(true)
  }

  function handleNudgeLoopStart(amount: number) {
    if (loopStart === null) return

    const maxStart = loopEnd !== null ? loopEnd - 0.2 : duration || Infinity
    const nextStart = Math.min(
      clampTime(loopStart + amount, duration),
      maxStart
    )

    setLoopStart(nextStart)

    const player = playerRef.current
    if (player) {
      const current = getPlayerTime(player)

      if (current < nextStart || (loopEnd !== null && current >= loopEnd)) {
        player.seekTo(nextStart, true)
        player.playVideo()
      }
    }
  }

  function handleNudgeLoopEnd(amount: number) {
    if (loopEnd === null || loopStart === null) return

    const minEnd = loopStart + 0.2
    const nextEnd = Math.max(clampTime(loopEnd + amount, duration), minEnd)

    setLoopEnd(nextEnd)

    const player = playerRef.current
    if (player) {
      const current = getPlayerTime(player)

      if (current >= nextEnd) {
        player.seekTo(loopStart, true)
        player.playVideo()
      }
    }
  }

  function handlePlaybackRate(rate: number) {
    const player = playerRef.current

    if (!player) return

    try {
      player.setPlaybackRate(rate)
      setPlaybackRateState(rate)
    } catch {
      // If YouTube rejects the rate for this video, leave the UI stable.
    }
  }

  return (
    <div className={joinClasses("space-y-4", className)}>
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-foreground/10">
        <div ref={containerRef} title={title} className="h-full w-full" />
      </div>

      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Reference controls
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Current time: {formatTime(currentTime, true)}
              {duration > 0 ? ` / ${formatTime(duration, true)}` : ""}
            </p>
          </div>

          <button
            type="button"
            className={showLoopControls ? buttonStyles.primary : buttonStyles.secondary}
            onClick={() => setShowLoopControls((current) => !current)}
            disabled={!isReady}
            aria-expanded={showLoopControls}
          >
            {showLoopControls ? "Hide loop controls" : "Show loop controls"}
          </button>
        </div>

        {showLoopControls ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonStyles.secondaryStrong}
                onClick={handleTapIn}
                disabled={!isReady}
              >
                Tap in
              </button>

              <button
                type="button"
                className={buttonStyles.secondaryStrong}
                onClick={handleTapOut}
                disabled={!isReady || loopStart === null}
              >
                Tap out
              </button>

              <button
                type="button"
                className={hasValidLoop ? buttonStyles.primary : buttonStyles.secondary}
                onClick={() => setLoopEnabled((current) => !current)}
                disabled={!hasValidLoop}
              >
                {loopEnabled ? "Loop on" : "Loop off"}
              </button>

              <button
                type="button"
                className={buttonStyles.text}
                onClick={handleClearLoop}
                disabled={loopStart === null && loopEnd === null}
              >
                Clear
              </button>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="font-medium text-foreground">In:</span>{" "}
                {formatTime(loopStart, true)}
              </div>

              <div className="rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="font-medium text-foreground">Out:</span>{" "}
                {formatTime(loopEnd, true)}
              </div>

              <div className="rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="font-medium text-foreground">Length:</span>{" "}
                {formatTime(loopLength, true)}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-card/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Adjust loop
                </p>

                <div className="flex flex-wrap gap-2">
                  {NUDGE_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={
                        nudgeAmount === amount
                          ? buttonStyles.primary
                          : buttonStyles.secondary
                      }
                      onClick={() => setNudgeAmount(amount)}
                    >
                      {amount}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    In point
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={buttonStyles.secondary}
                      onClick={() => handleNudgeLoopStart(-nudgeAmount)}
                      disabled={loopStart === null}
                    >
                      -{nudgeAmount}s
                    </button>

                    <button
                      type="button"
                      className={buttonStyles.secondary}
                      onClick={() => handleNudgeLoopStart(nudgeAmount)}
                      disabled={loopStart === null}
                    >
                      +{nudgeAmount}s
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Out point
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={buttonStyles.secondary}
                      onClick={() => handleNudgeLoopEnd(-nudgeAmount)}
                      disabled={!hasValidLoop}
                    >
                      -{nudgeAmount}s
                    </button>

                    <button
                      type="button"
                      className={buttonStyles.secondary}
                      onClick={() => handleNudgeLoopEnd(nudgeAmount)}
                      disabled={loopEnd === null}
                    >
                      +{nudgeAmount}s
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonStyles.secondary}
                  onClick={handleHalveLoopLength}
                  disabled={!hasValidLoop}
                >
                  Halve loop
                </button>

                <button
                  type="button"
                  className={buttonStyles.secondary}
                  onClick={handleDoubleLoopLength}
                  disabled={!hasValidLoop}
                >
                  Double loop
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Speed
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {DEFAULT_SPEEDS.map((rate) => {
                  const isAvailable =
                    availableRates.includes(rate) || availableRates.length === 0
                  const isSelected = playbackRate === rate

                  return (
                    <button
                      key={rate}
                      type="button"
                      className={
                        isSelected ? buttonStyles.primary : buttonStyles.secondary
                      }
                      onClick={() => handlePlaybackRate(rate)}
                      disabled={!isReady || !isAvailable}
                    >
                      {rate}x
                    </button>
                  )
                })}
              </div>
            </div>

            {!isReady ? (
              <p className="text-sm text-muted-foreground">
                Loading YouTube controls...
              </p>
            ) : !hasValidLoop ? (
              <p className="text-sm text-muted-foreground">
                Press Tap in at the start of the phrase, then Tap out at the
                end. Use the adjust controls to trim the loop once it is close.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nudge size defaults to 0.5s. Use 0.1s for fine trimming, or 1s
                for rough movement. Loop points reset when this player closes.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Open loop controls to set a temporary Tap in / Tap out loop, change
            speed, or trim the loop points.
          </p>
        )}
      </div>
    </div>
  )
}