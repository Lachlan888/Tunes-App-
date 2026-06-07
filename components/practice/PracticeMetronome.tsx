"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type BeatAccent = "primary" | "secondary" | "silent"

type StoredMetronomeSettings = {
  bpm: number
  numerator: number
  denominator: number
  pattern: BeatAccent[]
}

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

const STORAGE_KEY = "tunes-app.practice-metronome"
const MIN_BPM = 30
const MAX_BPM = 260
const MIN_NUMERATOR = 1
const MAX_NUMERATOR = 32
const DENOMINATORS = [2, 4, 8, 16] as const
const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SECONDS = 0.1
const DEFAULT_SETTINGS: StoredMetronomeSettings = {
  bpm: 90,
  numerator: 4,
  denominator: 4,
  pattern: ["primary", "secondary", "secondary", "secondary"],
}

const accentLabels: Record<BeatAccent, string> = {
  primary: "Primary",
  secondary: "Secondary",
  silent: "Silent",
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min

  return Math.min(max, Math.max(min, Math.round(value)))
}

function resizePattern(pattern: BeatAccent[], numerator: number) {
  const nextPattern = Array.from({ length: numerator }, (_, index) => {
    return pattern[index] ?? (index === 0 ? "primary" : "secondary")
  })

  if (!pattern[0]) {
    nextPattern[0] = "primary"
  }

  return nextPattern
}

function isBeatAccent(value: unknown): value is BeatAccent {
  return value === "primary" || value === "secondary" || value === "silent"
}

function parseStoredSettings(value: string | null): StoredMetronomeSettings {
  if (!value) return DEFAULT_SETTINGS

  try {
    const parsed = JSON.parse(value) as Partial<StoredMetronomeSettings>
    const numerator = clampNumber(
      Number(parsed.numerator),
      MIN_NUMERATOR,
      MAX_NUMERATOR
    )
    const parsedDenominator = Number(parsed.denominator)
    const denominator = DENOMINATORS.includes(
      parsedDenominator as (typeof DENOMINATORS)[number]
    )
      ? parsedDenominator
      : DEFAULT_SETTINGS.denominator
    const storedPattern = Array.isArray(parsed.pattern)
      ? parsed.pattern.filter(isBeatAccent)
      : []

    return {
      bpm: clampNumber(Number(parsed.bpm), MIN_BPM, MAX_BPM),
      numerator,
      denominator,
      pattern: resizePattern(storedPattern, numerator),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function getNextAccent(accent: BeatAccent) {
  if (accent === "primary") return "secondary"
  if (accent === "secondary") return "silent"

  return "primary"
}

function getBeatClassName(accent: BeatAccent, isCurrent: boolean) {
  const accentClassName =
    accent === "primary"
      ? "border-primary bg-primary text-primary-foreground"
      : accent === "secondary"
        ? "border-border bg-background/80 text-foreground"
        : "border-border bg-transparent text-muted-foreground"

  return joinClasses(
    "grid min-h-11 min-w-11 place-items-center rounded-xl border px-2 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-12 sm:min-w-12",
    accentClassName,
    isCurrent && "ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-card"
  )
}

function MetronomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M9 20h6" />
      <path d="M6 20 11 4h2l5 16" />
      <path d="m12 4 4 8" />
      <path d="M10 14h4" />
    </svg>
  )
}

type NumericStepperProps = {
  label: string
  value: number
  draftValue: string
  min: number
  max: number
  onDraftChange: (value: string) => void
  onCommit: () => void
  onStepDown: () => void
  onStepUp: () => void
  inputAriaLabel: string
  decreaseAriaLabel: string
  increaseAriaLabel: string
}

function NumericStepper({
  label,
  value,
  draftValue,
  min,
  max,
  onDraftChange,
  onCommit,
  onStepDown,
  onStepUp,
  inputAriaLabel,
  decreaseAriaLabel,
  increaseAriaLabel,
}: NumericStepperProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return

    event.currentTarget.blur()
    onCommit()
  }

  const isInvalidDraft = draftValue.trim()
    ? Number(draftValue) < min || Number(draftValue) > max
    : true

  return (
    <label className="grid min-w-0 gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="grid min-h-11 grid-cols-[2.75rem_minmax(4.5rem,1fr)_2.75rem] overflow-hidden rounded-xl border border-border bg-background/80 shadow-sm md:min-h-10 md:grid-cols-[2.5rem_minmax(4rem,1fr)_2.5rem]">
        <button
          type="button"
          className="grid place-items-center border-r border-border text-lg font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onStepDown}
          disabled={value <= min}
          aria-label={decreaseAriaLabel}
        >
          -
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draftValue}
          onChange={(event) =>
            onDraftChange(event.target.value.replace(/[^\d]/g, ""))
          }
          onBlur={onCommit}
          onKeyDown={handleKeyDown}
          className="min-w-0 bg-transparent px-2 py-2 text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)]"
          aria-label={inputAriaLabel}
          aria-invalid={isInvalidDraft}
        />
        <button
          type="button"
          className="grid place-items-center border-l border-border text-lg font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onStepUp}
          disabled={value >= max}
          aria-label={increaseAriaLabel}
        >
          +
        </button>
      </span>
    </label>
  )
}

export default function PracticeMetronome() {
  const [bpm, setBpm] = useState(DEFAULT_SETTINGS.bpm)
  const [bpmDraft, setBpmDraft] = useState(String(DEFAULT_SETTINGS.bpm))
  const [numerator, setNumerator] = useState(DEFAULT_SETTINGS.numerator)
  const [numeratorDraft, setNumeratorDraft] = useState(
    String(DEFAULT_SETTINGS.numerator)
  )
  const [denominator, setDenominator] = useState(DEFAULT_SETTINGS.denominator)
  const [pattern, setPattern] = useState<BeatAccent[]>(
    DEFAULT_SETTINGS.pattern
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const schedulerTimerRef = useRef<number | null>(null)
  const nextNoteTimeRef = useRef(0)
  const nextBeatRef = useRef(0)
  const hydratedRef = useRef(false)
  const isPlayingRef = useRef(false)
  const bpmRef = useRef(bpm)
  const numeratorRef = useRef(numerator)
  const patternRef = useRef(pattern)
  const tapTimesRef = useRef<number[]>([])
  const visualTimersRef = useRef<number[]>([])

  const clearSchedulerTimer = useCallback(() => {
    if (schedulerTimerRef.current) {
      window.clearTimeout(schedulerTimerRef.current)
      schedulerTimerRef.current = null
    }
  }, [])

  const clearVisualTimers = useCallback(() => {
    for (const timer of visualTimersRef.current) {
      window.clearTimeout(timer)
    }

    visualTimersRef.current = []
  }, [])

  const scheduleClick = useCallback(
    (beatIndex: number, time: number, audioContext: AudioContext) => {
      const accent = patternRef.current[beatIndex] ?? "secondary"
      const delayMs = Math.max(0, (time - audioContext.currentTime) * 1000)
      const visualTimer = window.setTimeout(() => {
        setCurrentBeat(beatIndex + 1)
      }, delayMs)

      visualTimersRef.current.push(visualTimer)

      if (accent === "silent") return

      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const isPrimary = accent === "primary"
      const duration = isPrimary ? 0.055 : 0.04

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(isPrimary ? 1320 : 880, time)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(
        isPrimary ? 0.55 : 0.35,
        time + 0.005
      )
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(time)
      oscillator.stop(time + duration + 0.01)
    },
    []
  )

  const runScheduler = useCallback(() => {
    const audioContext = audioContextRef.current

    if (!audioContext || !isPlayingRef.current) return

    while (
      nextNoteTimeRef.current <
      audioContext.currentTime + SCHEDULE_AHEAD_SECONDS
    ) {
      const beatIndex = nextBeatRef.current
      scheduleClick(beatIndex, nextNoteTimeRef.current, audioContext)

      const secondsPerBeat = 60 / bpmRef.current
      nextNoteTimeRef.current += secondsPerBeat
      nextBeatRef.current = (beatIndex + 1) % numeratorRef.current
    }

    schedulerTimerRef.current = window.setTimeout(runScheduler, LOOKAHEAD_MS)
  }, [scheduleClick])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentBeat(0)
    clearSchedulerTimer()
    clearVisualTimers()

    if (audioContextRef.current?.state === "running") {
      void audioContextRef.current.suspend()
    }
  }, [clearSchedulerTimer, clearVisualTimers])

  const start = useCallback(async () => {
    if (isPlayingRef.current) return

    const audioWindow = window as AudioWindow
    const AudioContextConstructor =
      audioWindow.AudioContext || audioWindow.webkitAudioContext

    if (!AudioContextConstructor) return

    const audioContext =
      audioContextRef.current ?? new AudioContextConstructor()
    audioContextRef.current = audioContext

    if (audioContext.state === "suspended") {
      await audioContext.resume()
    }

    clearVisualTimers()
    isPlayingRef.current = true
    setIsPlaying(true)
    setCurrentBeat(0)
    nextBeatRef.current = 0
    nextNoteTimeRef.current = audioContext.currentTime + 0.05
    clearSchedulerTimer()
    runScheduler()
  }, [clearSchedulerTimer, clearVisualTimers, runScheduler])

  useEffect(() => {
    const storedSettings = parseStoredSettings(
      window.localStorage.getItem(STORAGE_KEY)
    )

    setBpm(storedSettings.bpm)
    setBpmDraft(String(storedSettings.bpm))
    setNumerator(storedSettings.numerator)
    setNumeratorDraft(String(storedSettings.numerator))
    setDenominator(storedSettings.denominator)
    setPattern(storedSettings.pattern)
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])

  useEffect(() => {
    numeratorRef.current = numerator
  }, [numerator])

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  useEffect(() => {
    if (!hydratedRef.current) return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ bpm, numerator, denominator, pattern })
    )
  }, [bpm, numerator, denominator, pattern])

  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      clearSchedulerTimer()
      clearVisualTimers()
      void audioContextRef.current?.close()
    }
  }, [clearSchedulerTimer, clearVisualTimers])

  function updateNumerator(value: number) {
    const nextNumerator = clampNumber(value, MIN_NUMERATOR, MAX_NUMERATOR)

    setNumerator(nextNumerator)
    setNumeratorDraft(String(nextNumerator))
    setCurrentBeat(0)
    nextBeatRef.current = 0
    setPattern((currentPattern) => resizePattern(currentPattern, nextNumerator))
  }

  function updateBpm(value: number) {
    const nextBpm = clampNumber(value, MIN_BPM, MAX_BPM)

    setBpm(nextBpm)
    setBpmDraft(String(nextBpm))
  }

  function commitBpmDraft() {
    const trimmedDraft = bpmDraft.trim()

    if (!trimmedDraft) {
      setBpmDraft(String(bpm))
      return
    }

    updateBpm(Number(trimmedDraft))
  }

  function commitNumeratorDraft() {
    const trimmedDraft = numeratorDraft.trim()

    if (!trimmedDraft) {
      setNumeratorDraft(String(numerator))
      return
    }

    updateNumerator(Number(trimmedDraft))
  }

  function toggleBeat(index: number) {
    setPattern((currentPattern) =>
      currentPattern.map((accent, beatIndex) =>
        beatIndex === index ? getNextAccent(accent) : accent
      )
    )
  }

  function tapTempo() {
    const now = window.performance.now()
    const recentTaps = [...tapTimesRef.current, now].filter(
      (tapTime) => now - tapTime < 2500
    )

    tapTimesRef.current = recentTaps.slice(-5)

    if (tapTimesRef.current.length < 2) return

    const intervals = tapTimesRef.current
      .slice(1)
      .map((tapTime, index) => tapTime - tapTimesRef.current[index])
    const averageInterval =
      intervals.reduce((total, interval) => total + interval, 0) /
      intervals.length

    updateBpm(60000 / averageInterval)
  }

  const isInvalidBpm = bpm < MIN_BPM || bpm > MAX_BPM
  const isInvalidNumerator =
    numerator < MIN_NUMERATOR || numerator > MAX_NUMERATOR
  const settingsSummary = `${bpm} BPM · ${numerator}/${denominator}`

  function renderControls() {
    return (
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={
                isPlaying ? buttonStyles.destructive : buttonStyles.primary
              }
              onClick={isPlaying ? stop : start}
              disabled={isInvalidBpm || isInvalidNumerator}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? "Stop metronome" : "Start metronome"}
            >
              {isPlaying ? "Stop" : "Start"}
            </button>

            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={tapTempo}
            >
              Tap tempo
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[minmax(0,11rem)_minmax(0,10rem)_minmax(0,5rem)] md:flex md:flex-wrap md:items-center">
            <NumericStepper
              label="BPM"
              value={bpm}
              draftValue={bpmDraft}
              min={MIN_BPM}
              max={MAX_BPM}
              onDraftChange={setBpmDraft}
              onCommit={commitBpmDraft}
              onStepDown={() => updateBpm(bpm - 3)}
              onStepUp={() => updateBpm(bpm + 3)}
              inputAriaLabel="Metronome BPM"
              decreaseAriaLabel="Decrease BPM"
              increaseAriaLabel="Increase BPM"
            />

            <NumericStepper
              label="Beats"
              value={numerator}
              draftValue={numeratorDraft}
              min={MIN_NUMERATOR}
              max={MAX_NUMERATOR}
              onDraftChange={setNumeratorDraft}
              onCommit={commitNumeratorDraft}
              onStepDown={() => updateNumerator(numerator - 1)}
              onStepUp={() => updateNumerator(numerator + 1)}
              inputAriaLabel="Metronome beats per bar"
              decreaseAriaLabel="Decrease beats"
              increaseAriaLabel="Increase beats"
            />

            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Unit
              </span>
              <select
                value={denominator}
                onChange={(event) => setDenominator(Number(event.target.value))}
                className="min-h-11 w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:min-h-10 md:w-20"
                aria-label="Metronome beat unit"
              >
                {DENOMINATORS.map((value) => (
                  <option key={value} value={value}>
                    /{value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {settingsSummary}
            </p>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Beat {currentBeat || "-"} of {numerator}
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Beat accent pattern"
          >
            {pattern.map((accent, index) => {
              const beatNumber = index + 1
              const isCurrent = currentBeat === beatNumber

              return (
                <button
                  key={`${beatNumber}-${accent}`}
                  type="button"
                  className={getBeatClassName(accent, isCurrent)}
                  onClick={() => toggleBeat(index)}
                  aria-label={`Beat ${beatNumber}, ${accentLabels[accent].toLowerCase()} accent. Change accent.`}
                  title={`Beat ${beatNumber}, ${accentLabels[accent].toLowerCase()} accent`}
                  aria-pressed={accent !== "silent"}
                >
                  {beatNumber}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="mt-4 border-y border-border/70 py-3 md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={joinClasses(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full border shadow-sm",
              isPlaying
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card-strong text-muted-foreground"
            )}
          >
            <MetronomeIcon />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              Metronome
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
              {settingsSummary}
            </p>
          </div>

          <button
            type="button"
            className={joinClasses(
              "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
              isPlaying
                ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
            onClick={isPlaying ? stop : start}
            disabled={isInvalidBpm || isInvalidNumerator}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Stop metronome" : "Start metronome"}
          >
            {isPlaying ? "Stop" : "Start"}
          </button>

          <button
            type="button"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open metronome settings"
          >
            Settings
          </button>
        </div>
      </section>

      <section className="mt-6 hidden border-y border-border/70 py-4 md:block md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Practice metronome
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {settingsSummary}
            </p>
          </div>
        </div>

        {renderControls()}
      </section>

      <ResponsiveModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        eyebrow="Practice tool"
        title="Metronome"
        description={settingsSummary}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-2xl"
        bodyClassName="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-6"
      >
        {renderControls()}
      </ResponsiveModal>
    </>
  )
}
