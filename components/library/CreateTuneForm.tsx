"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import KeyPickerField from "@/components/music/KeyPickerField"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { formStyles } from "@/components/ui/formStyles"
import {
  TIME_SIGNATURE_HELPER_TEXT,
  TIME_SIGNATURE_PATTERN,
} from "@/lib/music/time-signatures"
import type { TuneDuplicateSuggestion } from "@/lib/tunes/duplicate-suggestions"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type CreateTuneFormProps = {
  createTune: (formData: FormData) => void | Promise<void>
  styleOptions: StyleOption[]
  redirectTo?: string
  onSubmitStart?: () => void
}

type SuggestionState = "idle" | "checking" | "ready" | "error"

export default function CreateTuneForm({
  createTune,
  styleOptions,
  redirectTo = "/library",
  onSubmitStart,
}: CreateTuneFormProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<"identity" | "details">("identity")
  const [title, setTitle] = useState("")
  const [suggestions, setSuggestions] = useState<TuneDuplicateSuggestion[]>([])
  const [suggestionState, setSuggestionState] = useState<SuggestionState>("idle")
  const [hasReviewedMatches, setHasReviewedMatches] = useState(false)

  useEffect(() => {
    if (title.trim().length < 3) return

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setSuggestionState("checking")

      try {
        const response = await fetch(
          `/api/library/duplicate-suggestions?q=${encodeURIComponent(title.trim())}`,
          { signal: controller.signal, cache: "no-store" }
        )
        if (!response.ok) throw new Error("Suggestion request failed")

        const payload = (await response.json()) as {
          suggestions?: TuneDuplicateSuggestion[]
        }
        setSuggestions(payload.suggestions ?? [])
        setSuggestionState("ready")
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Could not load tune duplicate suggestions", error)
        setSuggestions([])
        setSuggestionState("error")
      }
    }, 250)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [title])

  const requiresDuplicateReview = suggestions.length > 0
  const createDisabled =
    suggestionState === "checking" ||
    (requiresDuplicateReview && !hasReviewedMatches)

  return (
    <form
      action={async (formData: FormData) => {
        onSubmitStart?.()
        await createTune(formData)
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="mx-auto w-full max-w-2xl">
          <ol className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted" aria-label="Create tune steps">
            <li aria-current={step === "identity" ? "step" : undefined}>
              1. Identity
            </li>
            <li aria-hidden="true">→</li>
            <li aria-current={step === "details" ? "step" : undefined}>
              2. Details
            </li>
          </ol>

          <section aria-labelledby="tune-identity-heading" className="space-y-4">
            <div>
              <h3 id="tune-identity-heading" className="font-serif text-xl font-semibold text-text-primary">
                Name the tune
              </h3>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Start with the shared identity. We will check the catalogue before creation.
              </p>
            </div>

            <div>
              <label htmlFor="title" className={formStyles.label}>
                Tune title <span className="text-action-destructive">*</span>
              </label>
              <input
                ref={titleRef}
                id="title"
                name="title"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value
                  setTitle(nextTitle)
                  setSuggestions([])
                  setHasReviewedMatches(false)
                  setSuggestionState("idle")
                }}
                placeholder="e.g. Soldier's Joy"
                className={formStyles.input}
                autoComplete="off"
                minLength={2}
                required
              />
              <p className={formStyles.helpText}>
                Use the common title; leave out keys, instruments and version labels.
              </p>
            </div>

            <div>
              <label htmlFor="type" className={formStyles.label}>
                Type <span className="text-action-destructive">*</span>
              </label>
              <select id="type" name="type" defaultValue="tune" className={formStyles.select} required>
                <option value="tune">Tune</option>
                <option value="song">Song</option>
              </select>
            </div>

            <section aria-live="polite" aria-label="Possible catalogue matches">
              {suggestionState === "checking" ? (
                <p className="rounded-control bg-surface-note p-3 text-sm text-text-muted">
                  Checking the catalogue for likely matches…
                </p>
              ) : null}

              {suggestionState === "error" ? (
                <p className="rounded-control border border-state-due bg-state-due/10 p-3 text-sm text-text-primary">
                  The duplicate preview is temporarily unavailable. Final duplicate validation will still run before creation.
                </p>
              ) : null}

              {suggestionState === "ready" && suggestions.length === 0 ? (
                <p className="rounded-control border border-state-known/40 bg-state-known/10 p-3 text-sm text-text-primary">
                  No likely catalogue match found. Final validation will run again when you create the tune.
                </p>
              ) : null}

              {suggestions.length > 0 ? (
                <div className="rounded-object border border-state-due bg-state-due/10 p-4">
                  <h4 className="font-semibold text-text-primary">
                    Check these existing tunes first
                  </h4>
                  <ul className="mt-3 divide-y divide-hairline" role="list">
                    {suggestions.map((suggestion) => {
                      const metadata = [
                        suggestion.type,
                        suggestion.style,
                        suggestion.key ? `Key ${suggestion.key}` : null,
                        suggestion.time_signature,
                        suggestion.composer,
                      ].filter(Boolean)

                      return (
                        <li key={suggestion.id} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary">{suggestion.title}</p>
                              {metadata.length > 0 ? (
                                <p className="mt-1 text-xs text-text-muted">{metadata.join(" · ")}</p>
                              ) : null}
                              <p className="mt-1 text-sm text-text-muted">{suggestion.reason}</p>
                            </div>
                            <Link
                              href={`/library/${suggestion.id}`}
                              className={buttonStyles.secondary}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-control bg-surface-paper p-3 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={hasReviewedMatches}
                      onChange={(event) => setHasReviewedMatches(event.target.checked)}
                      className="mt-0.5 h-5 w-5 accent-[var(--action-primary)]"
                    />
                    <span>I checked these matches and this is a different tune.</span>
                  </label>
                </div>
              ) : null}
            </section>
          </section>

          {step === "details" ? (
            <section aria-labelledby="tune-details-heading" className="mt-7 space-y-4 border-t border-hairline pt-6">
              <div>
                <h3 id="tune-details-heading" className="font-serif text-xl font-semibold text-text-primary">
                  Add useful details
                </h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  Add what you know. Everything after identity is optional.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <KeyPickerField name="key" label="Tune key" placeholder="Select key" />
                <div>
                  <label htmlFor="style_id" className={formStyles.label}>Style</label>
                  <select id="style_id" name="style_id" defaultValue="" className={formStyles.select}>
                    <option value="">No style</option>
                    {styleOptions.map((style) => (
                      <option key={style.id} value={style.id}>{style.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="composer" className={formStyles.label}>Composer or source</label>
                <input
                  id="composer"
                  name="composer"
                  placeholder="e.g. Bill Monroe, trad., unknown"
                  className={formStyles.input}
                />
              </div>

              <details className="rounded-object border border-hairline bg-surface-note p-4">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                  Advanced metadata
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="time_signature" className={formStyles.label}>Time signature</label>
                    <input
                      id="time_signature"
                      name="time_signature"
                      placeholder="e.g. 4/4 or 6/8"
                      className={formStyles.input}
                      pattern={TIME_SIGNATURE_PATTERN}
                      title={TIME_SIGNATURE_HELPER_TEXT}
                    />
                  </div>
                  <div>
                    <label htmlFor="reference_url" className={formStyles.label}>Initial reference</label>
                    <input
                      id="reference_url"
                      name="reference_url"
                      type="url"
                      placeholder="YouTube, archive or recording link"
                      className={formStyles.input}
                    />
                    <p className={formStyles.helpText}>
                      Add one useful shared reference now; more can be added from Tune Detail.
                    </p>
                  </div>
                </div>
              </details>
            </section>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-hairline bg-surface-paper px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-6 md:pb-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {step === "details" ? (
            <button type="button" className={buttonStyles.secondary} onClick={() => setStep("identity")}>
              Back
            </button>
          ) : (
            <span />
          )}

          {step === "identity" ? (
            <button
              type="button"
              className={buttonStyles.primary}
              disabled={createDisabled}
              onClick={() => {
                if (!titleRef.current?.reportValidity()) return
                setStep("details")
              }}
            >
              Continue
            </button>
          ) : (
            <SubmitButton
              label="Create tune"
              pendingLabel="Creating tune..."
              className={buttonStyles.primary}
              disabled={createDisabled}
            />
          )}
        </div>
      </div>
    </form>
  )
}
