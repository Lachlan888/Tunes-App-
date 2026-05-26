"use client"

import { useEffect, useRef, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { createMediaLoop, deleteMediaLoop } from "@/lib/actions/media-loops"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/types"

type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getAvailablePlaybackRates?: () => number[]
  getPlaybackRate?: () => number
  setPlaybackRate: (rate: number) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo?: () => void
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
  pieceId?: number
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
}

const DEFAULT_SPEEDS = [0.5, 0.75, 1]
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

function compactButton(className: string) {
  return joinClasses(className, "px-3 py-2 text-xs sm:px-4 sm:text-sm")
}

function numericInputValue(value: number | null) {
  return value === null ? "" : value.toFixed(2)
}

export default function YouTubeLoopPlayer({
  videoId,
  title,
  className,
  pieceId,
  redirectTo,
  savedLoops = [],
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

  const canSaveLoops = Boolean(pieceId && redirectTo)

  const hasValidLoop =
    loopStart !== null && loopEnd !== null && loopEnd > loopStart + 0.2

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

  function handleLoadSavedLoop(loop: UserPieceMediaLoop) {
    const start = Number(loop.start_seconds)
    const end = Number(loop.end_seconds)
    const rate = Number(loop.playback_rate)

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return
    }

    setLoopStart(start)
    setLoopEnd(end)
    setLoopEnabled(true)
    setShowLoopControls(true)

    if (Number.isFinite(rate) && rate > 0) {
      handlePlaybackRate(rate)
    }

    const player = playerRef.current

    if (player) {
      player.seekTo(start, true)
      player.playVideo()
    }
  }

  return (
    <div
      className={joinClasses(
        "min-w-0 max-w-full space-y-3 sm:space-y-4",
        className
      )}
    >
      <div className="aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-border bg-foreground/10">
        <div ref={containerRef} title={title} className="h-full w-full" />
      </div>

      <div className="min-w-0 bg-transparent p-0 sm:rounded-2xl sm:border sm:border-border sm:bg-background/70 sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Reference controls
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Current time: {formatTime(currentTime, true)}
              {duration > 0 ? ` / ${formatTime(duration, true)}` : ""}
            </p>
          </div>

          <div className="px-0.5 pb-0.5 sm:px-0 sm:pb-0">
            <button
              type="button"
              className={joinClasses(
                compactButton(
                  showLoopControls
                    ? buttonStyles.primary
                    : buttonStyles.secondary
                ),
                "shrink-0 whitespace-nowrap"
              )}
              onClick={() => setShowLoopControls((current) => !current)}
              disabled={!isReady}
              aria-expanded={showLoopControls}
            >
              {showLoopControls ? "Hide loops" : "Show loops"}
            </button>
          </div>
        </div>

        {savedLoops.length > 0 ? (
          <div className="mt-4 min-w-0 rounded-2xl border border-border bg-card/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Saved loops
            </p>

            <ul className="mt-3 space-y-2">
              {savedLoops.map((loop) => (
                <li
                  key={loop.id}
                  className="min-w-0 rounded-xl border border-border bg-background/70 p-3"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="min-w-0 break-words text-sm font-semibold text-foreground">
                        {loop.label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatTime(Number(loop.start_seconds), true)}–
                        {formatTime(Number(loop.end_seconds), true)} ·{" "}
                        {Number(loop.playback_rate)}x
                      </p>
                      {loop.notes ? (
                        <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">
                          {loop.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        className={compactButton(buttonStyles.secondaryStrong)}
                        onClick={() => handleLoadSavedLoop(loop)}
                        disabled={!isReady}
                      >
                        Play loop
                      </button>

                      {pieceId && redirectTo ? (
                        <form
                          action={deleteMediaLoop}
                          onSubmit={(event) => {
                            const confirmed = window.confirm(
                              `Delete saved loop "${loop.label}"?`
                            )

                            if (!confirmed) {
                              event.preventDefault()
                            }
                          }}
                        >
                          <input type="hidden" name="loop_id" value={loop.id} />
                          <input
                            type="hidden"
                            name="piece_id"
                            value={pieceId}
                          />
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={redirectTo}
                          />
                          <SubmitButton
                            label="Delete"
                            pendingLabel="Deleting..."
                            className={compactButton(
                              buttonStyles.destructiveSecondary
                            )}
                          />
                        </form>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showLoopControls ? (
          <div className="mt-4 min-w-0 space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                className={compactButton(buttonStyles.secondaryStrong)}
                onClick={handleTapIn}
                disabled={!isReady}
              >
                Tap in
              </button>

              <button
                type="button"
                className={compactButton(buttonStyles.secondaryStrong)}
                onClick={handleTapOut}
                disabled={!isReady || loopStart === null}
              >
                Tap out
              </button>

              <button
                type="button"
                className={compactButton(
                  hasValidLoop ? buttonStyles.primary : buttonStyles.secondary
                )}
                onClick={() => setLoopEnabled((current) => !current)}
                disabled={!hasValidLoop}
              >
                {loopEnabled ? "Loop on" : "Loop off"}
              </button>

              <button
                type="button"
                className={compactButton(buttonStyles.text)}
                onClick={handleClearLoop}
                disabled={loopStart === null && loopEnd === null}
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-background/60 text-xs text-muted-foreground sm:text-sm">
              <div className="min-w-0 border-r border-border px-2 py-2 text-center">
                <span className="font-semibold text-foreground">In</span>
                <span className="mx-1 text-muted-foreground">·</span>
                <span className="whitespace-nowrap">
                  {formatTime(loopStart, true)}
                </span>
              </div>

              <div className="min-w-0 px-2 py-2 text-center">
                <span className="font-semibold text-foreground">Out</span>
                <span className="mx-1 text-muted-foreground">·</span>
                <span className="whitespace-nowrap">
                  {formatTime(loopEnd, true)}
                </span>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-border bg-background/40 p-3 sm:p-4">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Adjust loop
                </p>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                  {NUDGE_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={compactButton(
                        nudgeAmount === amount
                          ? buttonStyles.primary
                          : buttonStyles.secondary
                      )}
                      onClick={() => setNudgeAmount(amount)}
                    >
                      {amount}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="grid min-w-0 grid-cols-[3.5rem_1fr_1fr] items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    In
                  </p>

                  <button
                    type="button"
                    className={compactButton(buttonStyles.secondary)}
                    onClick={() => handleNudgeLoopStart(-nudgeAmount)}
                    disabled={loopStart === null}
                  >
                    -{nudgeAmount}s
                  </button>

                  <button
                    type="button"
                    className={compactButton(buttonStyles.secondary)}
                    onClick={() => handleNudgeLoopStart(nudgeAmount)}
                    disabled={loopStart === null}
                  >
                    +{nudgeAmount}s
                  </button>
                </div>

                <div className="grid min-w-0 grid-cols-[3.5rem_1fr_1fr] items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Out
                  </p>

                  <button
                    type="button"
                    className={compactButton(buttonStyles.secondary)}
                    onClick={() => handleNudgeLoopEnd(-nudgeAmount)}
                    disabled={!hasValidLoop}
                  >
                    -{nudgeAmount}s
                  </button>

                  <button
                    type="button"
                    className={compactButton(buttonStyles.secondary)}
                    onClick={() => handleNudgeLoopEnd(nudgeAmount)}
                    disabled={loopEnd === null}
                  >
                    +{nudgeAmount}s
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  className={compactButton(buttonStyles.secondary)}
                  onClick={handleHalveLoopLength}
                  disabled={!hasValidLoop}
                >
                  Halve loop
                </button>

                <button
                  type="button"
                  className={compactButton(buttonStyles.secondary)}
                  onClick={handleDoubleLoopLength}
                  disabled={!hasValidLoop}
                >
                  Double loop
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Speed
              </p>

              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                {DEFAULT_SPEEDS.map((rate) => {
                  const isAvailable =
                    availableRates.includes(rate) || availableRates.length === 0
                  const isSelected = playbackRate === rate

                  return (
                    <button
                      key={rate}
                      type="button"
                      className={compactButton(
                        isSelected
                          ? buttonStyles.primary
                          : buttonStyles.secondary
                      )}
                      onClick={() => handlePlaybackRate(rate)}
                      disabled={!isReady || !isAvailable}
                    >
                      {rate}x
                    </button>
                  )
                })}
              </div>
            </div>

            {canSaveLoops && pieceId && redirectTo ? (
              <form
                action={createMediaLoop}
                className="min-w-0 space-y-3 rounded-2xl border border-border bg-card/50 p-3"
              >
                <input type="hidden" name="piece_id" value={pieceId} />
                <input type="hidden" name="redirect_to" value={redirectTo} />
                <input type="hidden" name="youtube_video_id" value={videoId} />
                <input
                  type="hidden"
                  name="start_seconds"
                  value={numericInputValue(loopStart)}
                />
                <input
                  type="hidden"
                  name="end_seconds"
                  value={numericInputValue(loopEnd)}
                />
                <input
                  type="hidden"
                  name="playback_rate"
                  value={playbackRate}
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Save loop
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save the current loop points with a label so they appear on
                    this tune next time.
                  </p>
                </div>

                <input
                  name="label"
                  placeholder="Label, eg B part"
                  className="w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                  required
                  disabled={!hasValidLoop}
                />

                <textarea
                  name="notes"
                  placeholder="Optional note"
                  rows={3}
                  className="w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                  disabled={!hasValidLoop}
                />

                <SubmitButton
                  label="Save loop"
                  pendingLabel="Saving..."
                  className={buttonStyles.primary}
                />
              </form>
            ) : null}

            {!isReady ? (
              <LoadingSpinner label="Loading YouTube controls..." showLabel />
            ) : !hasValidLoop ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Press Tap in at the start of the phrase, then Tap out at the
                end.
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Use a smaller nudge for fine trimming, or a larger nudge for
                rough movement.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
