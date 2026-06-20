"use client"

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import SubmitButton from "@/components/SubmitButton"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import {
  createMediaLoopInPlace,
  deleteMediaLoop,
} from "@/lib/actions/media-loops"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { UserPieceMediaLoop } from "@/lib/types"

export type YouTubePlayer = {
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

type YouTubePlayerStateEvent = YouTubePlayerEvent & {
  data: number
}

type YouTubePlayerOptions = {
  videoId: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void
    onStateChange?: (event: YouTubePlayerStateEvent) => void
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
  initialPlaybackState?: YouTubePlaybackSnapshot | null
  isActive?: boolean
  defaultShowLoopControls?: boolean
  onPlaybackSnapshotChange?: (snapshot: YouTubePlaybackSnapshot) => void
  onLoopSaved?: (loop: UserPieceMediaLoop) => void
}

export type YouTubePlaybackSnapshot = {
  currentTime: number
  playbackRate: number
  isPlaying: boolean
  loopStart: number | null
  loopEnd: number | null
  loopEnabled: boolean
}

const DEFAULT_SPEEDS = [0.5, 0.75, 1]
const NUDGE_AMOUNTS = [0.1, 0.5, 1] as const

type NudgeAmount = (typeof NUDGE_AMOUNTS)[number]

let youtubeApiPromise: Promise<void> | null = null

export function loadYouTubeIframeApi() {
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

export function safeNumber(value: number) {
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

export function getPlayerTime(player: YouTubePlayer | null) {
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

function getLoopLength(loopStart: number | null, loopEnd: number | null) {
  if (loopStart === null || loopEnd === null) {
    return null
  }

  const loopLength = loopEnd - loopStart

  return loopLength > 0 ? loopLength : null
}

export default function YouTubeLoopPlayer({
  videoId,
  title,
  className,
  pieceId,
  redirectTo,
  savedLoops = [],
  initialPlaybackState,
  isActive = true,
  defaultShowLoopControls = false,
  onPlaybackSnapshotChange,
  onLoopSaved,
}: YouTubeLoopPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const saveInFlightRef = useRef(false)
  const latestSnapshotRef = useRef<YouTubePlaybackSnapshot>({
    currentTime: initialPlaybackState?.currentTime ?? 0,
    playbackRate: initialPlaybackState?.playbackRate ?? 1,
    isPlaying: initialPlaybackState?.isPlaying ?? false,
    loopStart: initialPlaybackState?.loopStart ?? null,
    loopEnd: initialPlaybackState?.loopEnd ?? null,
    loopEnabled: initialPlaybackState?.loopEnabled ?? false,
  })

  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(
    initialPlaybackState?.currentTime ?? 0
  )
  const [duration, setDuration] = useState(0)
  const [loopStart, setLoopStart] = useState<number | null>(
    initialPlaybackState?.loopStart ?? null
  )
  const [loopEnd, setLoopEnd] = useState<number | null>(
    initialPlaybackState?.loopEnd ?? null
  )
  const [loopEnabled, setLoopEnabled] = useState(
    initialPlaybackState?.loopEnabled ?? false
  )
  const [playbackRate, setPlaybackRateState] = useState(
    initialPlaybackState?.playbackRate ?? 1
  )
  const [isPlaying, setIsPlaying] = useState(
    initialPlaybackState?.isPlaying ?? false
  )
  const [availableRates, setAvailableRates] = useState<number[]>(DEFAULT_SPEEDS)
  const [nudgeAmount, setNudgeAmount] = useState<NudgeAmount>(0.5)
  const [showLoopControls, setShowLoopControls] = useState(
    defaultShowLoopControls
  )
  const [saveLabel, setSaveLabel] = useState("")
  const [saveNotes, setSaveNotes] = useState("")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSavingLoop, startSavingLoop] = useTransition()

  const canSaveLoops = Boolean(pieceId && redirectTo)

  const hasValidLoop =
    loopStart !== null && loopEnd !== null && loopEnd > loopStart + 0.2
  const loopLength = hasValidLoop ? getLoopLength(loopStart, loopEnd) : null
  const canMoveToPreviousSection =
    loopLength !== null && loopStart !== null && loopStart - loopLength >= 0
  const canMoveToNextSection =
    loopLength !== null && loopEnd !== null && duration > 0
      ? loopEnd + loopLength <= duration
      : false

  const buildSnapshot = useCallback(
    (
      player: YouTubePlayer | null = playerRef.current
    ): YouTubePlaybackSnapshot => {
      return {
        currentTime: getPlayerTime(player),
        playbackRate,
        isPlaying,
        loopStart,
        loopEnd,
        loopEnabled,
      }
    },
    [isPlaying, loopEnabled, loopEnd, loopStart, playbackRate]
  )

  const publishSnapshot = useCallback(
    (snapshot = buildSnapshot()) => {
      latestSnapshotRef.current = snapshot
      onPlaybackSnapshotChange?.(snapshot)
    },
    [buildSnapshot, onPlaybackSnapshotChange]
  )

  useEffect(() => {
    publishSnapshot({
      currentTime,
      playbackRate,
      isPlaying,
      loopStart,
      loopEnd,
      loopEnabled,
    })
  }, [
    currentTime,
    isPlaying,
    loopEnabled,
    loopEnd,
    loopStart,
    playbackRate,
    publishSnapshot,
  ])

  useEffect(() => {
    if (isActive) return

    const player = playerRef.current
    publishSnapshot(buildSnapshot(player))
    player?.pauseVideo?.()
    setIsPlaying(false)
  }, [buildSnapshot, isActive, publishSnapshot])

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return

    setIsReady(false)
    const initialState = initialPlaybackState
    const initialTime = initialState?.currentTime ?? 0
    const initialRate = initialState?.playbackRate ?? 1

    setCurrentTime(initialTime)
    setDuration(0)
    setLoopStart(initialState?.loopStart ?? null)
    setLoopEnd(initialState?.loopEnd ?? null)
    setLoopEnabled(initialState?.loopEnabled ?? false)
    setPlaybackRateState(initialRate)
    setIsPlaying(initialState?.isPlaying ?? false)
    setAvailableRates(DEFAULT_SPEEDS)
    setNudgeAmount(0.5)
    setShowLoopControls(defaultShowLoopControls)
    setSaveMessage(null)
    setSaveError(null)

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !container || !window.YT?.Player) return

      const player = new window.YT.Player(container, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          start: Math.floor(initialTime),
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            playerRef.current = event.target
            setIsReady(true)
            setDuration(getPlayerDuration(event.target))
            setAvailableRates(getAvailableRates(event.target))

            try {
              event.target.setPlaybackRate(initialRate)
              setPlaybackRateState(event.target.getPlaybackRate?.() ?? initialRate)
            } catch {
              setPlaybackRateState(initialRate)
            }

            if (initialTime > 0) {
              event.target.seekTo(initialTime, true)
            }

            if (initialState?.isPlaying && isActive) {
              event.target.playVideo()
            } else {
              event.target.pauseVideo?.()
            }
          },
          onStateChange: (event) => {
            const playingState = window.YT?.PlayerState?.PLAYING
            setIsPlaying(playingState !== undefined && event.data === playingState)
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
  }, [defaultShowLoopControls, initialPlaybackState, isActive, videoId])

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

  function advanceLoop(direction: 1 | -1) {
    if (
      !hasValidLoop ||
      loopStart === null ||
      loopEnd === null ||
      loopLength === null
    ) {
      return
    }

    if (direction === -1 && !canMoveToPreviousSection) return
    if (direction === 1 && !canMoveToNextSection) return

    const nextStart = loopStart + loopLength * direction
    const nextEnd = loopEnd + loopLength * direction

    setLoopStart(nextStart)
    setLoopEnd(nextEnd)
    setLoopEnabled(true)

    const player = playerRef.current

    if (player) {
      player.seekTo(nextStart, true)
      player.playVideo()
    }
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

  function handleSaveLoop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !canSaveLoops ||
      !pieceId ||
      isSavingLoop ||
      saveInFlightRef.current ||
      !hasValidLoop
    ) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set("piece_id", String(pieceId))
    formData.set("youtube_video_id", videoId)
    formData.set("start_seconds", numericInputValue(loopStart))
    formData.set("end_seconds", numericInputValue(loopEnd))
    formData.set("playback_rate", String(playbackRate))

    setSaveMessage(null)
    setSaveError(null)
    saveInFlightRef.current = true

    startSavingLoop(async () => {
      try {
        const result = await createMediaLoopInPlace(formData)

        if (!result.ok) {
          setSaveError(result.error)
          return
        }

        onLoopSaved?.(result.loop)
        setSaveLabel("")
        setSaveNotes("")
        setSaveMessage("Loop saved")
      } catch {
        setSaveError("Couldn’t save this loop. Try again.")
      } finally {
        saveInFlightRef.current = false
      }
    })
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
                  onClick={() => advanceLoop(-1)}
                  disabled={!canMoveToPreviousSection}
                >
                  ← Previous section
                </button>

                <button
                  type="button"
                  className={compactButton(buttonStyles.secondary)}
                  onClick={() => advanceLoop(1)}
                  disabled={!canMoveToNextSection}
                >
                  Next section →
                </button>

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
                onSubmit={handleSaveLoop}
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
                  value={saveLabel}
                  onChange={(event) => setSaveLabel(event.target.value)}
                  className="w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                  required
                  disabled={!hasValidLoop || isSavingLoop}
                />

                <textarea
                  name="notes"
                  placeholder="Optional note"
                  rows={3}
                  value={saveNotes}
                  onChange={(event) => setSaveNotes(event.target.value)}
                  className="w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                  disabled={!hasValidLoop || isSavingLoop}
                />

                {saveMessage ? (
                  <p className="rounded-2xl border border-border bg-background/70 p-3 text-sm font-medium text-foreground">
                    {saveMessage}
                  </p>
                ) : null}

                {saveError ? (
                  <p className="rounded-2xl border border-destructive/40 bg-background/70 p-3 text-sm font-medium text-destructive">
                    {saveError}
                  </p>
                ) : null}

                <SubmitButton
                  label="Save loop"
                  pendingLabel="Saving..."
                  className={buttonStyles.primary}
                  forcePending={isSavingLoop}
                  disabled={!hasValidLoop || isSavingLoop}
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
