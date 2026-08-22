"use client"

import { useActionState } from "react"
import {
  initialDevTestDigestState,
  sendCurrentUserTestDigest,
} from "@/lib/actions/dev-test-digest"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

export default function TestDigestPanel() {
  const [state, action, isPending] = useActionState(
    sendCurrentUserTestDigest,
    initialDevTestDigestState
  )

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Email digest testing
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Builds your current digest and sends it to your account email using
        Brevo. This does not consume notifications or affect digest scheduling.
      </p>
      <form action={action} className="mt-5">
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles.primary}
        >
          {isPending ? "Sending..." : "Send Test Digest"}
        </button>
      </form>
      {state.message ? (
        <p
          className={joinClasses(
            "mt-4 text-sm font-medium",
            state.status === "success" ? "text-emerald-700" : "text-red-700"
          )}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
