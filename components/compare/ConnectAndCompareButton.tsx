"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { acceptCompareInvite } from "@/lib/actions/compare-invites"
import { buildCompareJoinPath } from "@/lib/compare-invite-paths"

type ConnectAndCompareButtonProps = {
  token: string
  label?: string
}

function errorMessage(reason: string) {
  if (reason === "expired") {
    return "This comparison code has expired. Ask them to create a new one."
  }

  if (reason === "revoked" || reason === "consumed") {
    return "This invitation is no longer available."
  }

  if (reason === "self") return "This is your own comparison code."
  if (reason === "signed_out") return "Please log in before connecting."
  if (reason === "invalid") return "This comparison code isn’t valid."
  return "Couldn’t connect just now. Please try again."
}

export default function ConnectAndCompareButton({
  token,
  label = "Connect and compare",
}: ConnectAndCompareButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [profileRequired, setProfileRequired] = useState(false)
  const [isPending, startTransition] = useTransition()
  const joinPath = buildCompareJoinPath(token)
  const profileHref = `/dashboard?next=${encodeURIComponent(joinPath)}`

  function acceptInvite() {
    setError(null)
    setProfileRequired(false)

    startTransition(async () => {
      const result = await acceptCompareInvite(token)

      if (result.ok) {
        router.push(result.compareHref)
        router.refresh()
        return
      }

      if (result.reason === "profile_required") {
        setProfileRequired(true)
        return
      }

      setError(errorMessage(result.reason))
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={acceptInvite}
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <LoadingSpinner label="Connecting..." size="sm" decorative />
            <span>Connecting...</span>
          </span>
        ) : (
          label
        )}
      </button>

      {profileRequired ? (
        <div className="mt-4 rounded-2xl border border-warning bg-muted p-4 text-sm leading-6 text-foreground">
          <p>
            Add a public username and enable compare discovery before
            connecting.
          </p>
          <Link
            href={profileHref}
            className="mt-3 inline-flex font-medium text-foreground underline underline-offset-4"
          >
            Complete profile
          </Link>
        </div>
      ) : null}

      {error ? (
        <p
          className="mt-4 rounded-2xl border border-destructive bg-muted p-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
