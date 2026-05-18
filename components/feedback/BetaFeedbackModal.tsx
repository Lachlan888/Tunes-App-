"use client"

import { useActionState, useEffect, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import {
  submitBetaFeedback,
  type BetaFeedbackFormState,
} from "@/lib/actions/beta-feedback"

type BetaFeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
}

const initialState: BetaFeedbackFormState = {
  status: "idle",
  message: null,
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"

const textareaClassName =
  "min-h-32 w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function BetaFeedbackModal({
  isOpen,
  onClose,
}: BetaFeedbackModalProps) {
  const [state, formAction] = useActionState(submitBetaFeedback, initialState)
  const [pagePath, setPagePath] = useState("/")
  const [pageUrl, setPageUrl] = useState("")
  const [browser, setBrowser] = useState("")
  const [viewportWidth, setViewportWidth] = useState("")
  const [viewportHeight, setViewportHeight] = useState("")

  useEffect(() => {
    if (!isOpen) return

    setPagePath(window.location.pathname)
    setPageUrl(window.location.href)
    setBrowser(window.navigator.userAgent)
    setViewportWidth(String(window.innerWidth))
    setViewportHeight(String(window.innerHeight))
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-foreground/25 px-3 py-4 md:items-center md:px-6">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Beta feedback
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold">
              Send feedback
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will include the page you are on so the issue has context.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Close
          </button>
        </div>

        <form action={formAction} className="space-y-4 px-5 py-5">
          <input type="hidden" name="page_path" value={pagePath} />
          <input type="hidden" name="page_url" value={pageUrl} />
          <input type="hidden" name="browser" value={browser} />
          <input type="hidden" name="viewport_width" value={viewportWidth} />
          <input type="hidden" name="viewport_height" value={viewportHeight} />

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              What kind of feedback is this?
            </span>
            <select
              name="category"
              defaultValue="confusing"
              className={`${inputClassName} mt-2`}
            >
              <option value="broken">Broken thing</option>
              <option value="confusing">Function confusion</option>
              <option value="design">Design feedback</option>
              <option value="feature_request">Feature request</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              How serious is it?
            </span>
            <select
              name="severity"
              defaultValue="medium"
              className={`${inputClassName} mt-2`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              What happened?
            </span>
            <textarea
              name="message"
              required
              className={`${textareaClassName} mt-2`}
              placeholder="What was broken, confusing, awkward, or missing?"
            />
          </label>

          {state.message ? (
            <div
              className={`rounded-2xl border p-3 text-sm font-medium ${
                state.status === "success"
                  ? "border-success bg-success/10 text-foreground"
                  : "border-destructive bg-destructive/10 text-foreground"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Cancel
            </button>

            <SubmitButton
              label="Send feedback"
              pendingLabel="Sending…"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
        </form>
      </div>
    </div>
  )
}