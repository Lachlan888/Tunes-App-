"use client"

import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import {
  getOrCreateCompareInvite,
  pollCompareInvite,
  cancelCompareInvite,
} from "@/lib/actions/compare-invites"
import { formatCompareInviteCode } from "@/lib/compare-invites"
import { getSiteUrl } from "@/lib/site-url"

const STORED_TOKEN_KEY = "tunes.compare-in-person-token"

type SheetState =
  | "loading"
  | "waiting"
  | "accepted"
  | "expired"
  | "revoked"
  | "profile_required"
  | "rate_limited"
  | "error"

type CompareInPersonSheetProps = {
  isOpen: boolean
  onClose: () => void
}

function QrIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <path d="M15 15h2v2h-2zM19 15h2v6h-2M15 19h2v2h-2" />
    </svg>
  )
}

export { QrIcon }

export default function CompareInPersonSheet({
  isOpen,
  onClose,
}: CompareInPersonSheetProps) {
  const sessionStorage = usePrivateSessionStorage()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [joinPath, setJoinPath] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>("loading")
  const [connectedName, setConnectedName] = useState<string | null>(null)
  const [acceptedHref, setAcceptedHref] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [isReplacing, startReplacing] = useTransition()

  const inviteUrl = useMemo(() => {
    if (!joinPath || typeof window === "undefined") return null
    return new URL(joinPath, getSiteUrl(window.location.origin)).toString()
  }, [joinPath])

  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false
    const existingToken = sessionStorage.getItem(STORED_TOKEN_KEY)

    setSheetState("loading")
    setShareFeedback(null)

    void getOrCreateCompareInvite({ existingToken }).then((result) => {
      if (isCancelled) return

      if (!result.ok) {
        setSheetState(result.reason === "profile_required" ? "profile_required" : result.reason === "rate_limited" ? "rate_limited" : "error")
        return
      }

      if (result.state === "accepted") {
        sessionStorage.removeItem(STORED_TOKEN_KEY)
        setConnectedName(result.connectedName)
        setAcceptedHref(result.compareHref)
        setSheetState("accepted")
        return
      }

      sessionStorage.setItem(STORED_TOKEN_KEY, result.token)
      setToken(result.token)
      setJoinPath(result.joinPath)
      setExpiresAt(result.expiresAt)
      setSheetState("waiting")
    })

    return () => {
      isCancelled = true
    }
  }, [isOpen, sessionStorage])

  useEffect(() => {
    if (!isOpen || !token || sheetState !== "waiting") return

    let isCancelled = false
    let isPolling = false

    async function checkStatus() {
      if (isPolling || isCancelled) return
      isPolling = true

      try {
        const result = await pollCompareInvite(token!)
        if (isCancelled) return

        if (result.state === "accepted") {
          sessionStorage.removeItem(STORED_TOKEN_KEY)
          setConnectedName(result.connectedName)
          setAcceptedHref(result.compareHref)
          setSheetState("accepted")
          return
        }

        if (result.state === "expired" || result.state === "revoked") {
          sessionStorage.removeItem(STORED_TOKEN_KEY)
          setSheetState(result.state)
        } else if (result.state === "invalid" || result.state === "signed_out") {
          setSheetState("error")
        }
      } finally {
        isPolling = false
      }
    }

    void checkStatus()
    const interval = window.setInterval(checkStatus, 2000)

    return () => {
      isCancelled = true
      window.clearInterval(interval)
    }
  }, [isOpen, sheetState, token, sessionStorage])

  useEffect(() => {
    if (!isOpen || sheetState !== "accepted" || !acceptedHref) return

    const navigationTimer = setTimeout(() => {
      router.push(acceptedHref)
      router.refresh()
      onClose()
    }, 1200)

    return () => clearTimeout(navigationTimer)
  }, [acceptedHref, isOpen, onClose, router, sheetState])

  function generateNewCode() {
    startReplacing(async () => {
      setShareFeedback(null)
      const result = await getOrCreateCompareInvite({
        existingToken: token,
        replace: true,
      })

      if (!result.ok) {
        setSheetState(result.reason === "profile_required" ? "profile_required" : result.reason === "rate_limited" ? "rate_limited" : "error")
        return
      }

      if (result.state !== "pending") return

      sessionStorage.setItem(STORED_TOKEN_KEY, result.token)
      setToken(result.token)
      setJoinPath(result.joinPath)
      setExpiresAt(result.expiresAt)
      setConnectedName(null)
      setAcceptedHref(null)
      setSheetState("waiting")
    })
  }

  async function shareLink() {
    if (!inviteUrl) return
    setShareFeedback(null)

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Compare repertoires on Tunes App",
          text: "Connect with me and compare our repertoires.",
          url: inviteUrl,
        })
        setShareFeedback("Link shared.")
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setShareFeedback("Sharing cancelled.")
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setShareFeedback("Link copied.")
    } catch {
      setShareFeedback("Couldn’t share or copy the link.")
    }
  }

  async function cancelSession() {
    if (token) await cancelCompareInvite(token)
    sessionStorage.removeItem(STORED_TOKEN_KEY)
    setToken(null)
    setSheetState("revoked")
  }

  const expiryLabel = expiresAt
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      }).format(new Date(expiresAt))
    : null

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare in person"
      description="Ask another musician to scan this code with their phone camera."
      desktopMaxWidth="md:max-w-lg"
      bodyClassName="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6"
    >
      {sheetState === "loading" ? (
        <div className="flex min-h-72 items-center justify-center">
          <LoadingSpinner label="Creating code..." showLabel />
        </div>
      ) : null}

      {sheetState === "waiting" && inviteUrl ? (
        <div className="text-center">
          <div className="mx-auto flex w-fit max-w-full items-center justify-center rounded-3xl border border-border bg-white p-2 shadow-sm [&>svg]:h-auto [&>svg]:max-w-full">
            <QRCodeSVG
              value={inviteUrl}
              size={280}
              level="M"
              marginSize={4}
              bgColor="#ffffff"
              fgColor="#111827"
              title="Compare invitation QR code"
            />
          </div>

          <p
            className="mt-5 text-sm font-medium text-foreground"
            aria-live="polite"
          >
            Waiting for someone to connect…
          </p>

          {token ? (
            <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Join code</p>
              <p className="mt-2 break-words font-mono text-lg font-bold tracking-wider text-foreground">{formatCompareInviteCode(token)}</p>
            </div>
          ) : null}

          <p className="mt-4 text-left text-sm leading-6 text-muted-foreground">
            Nothing is revealed while waiting. After the other musician signs in and explicitly accepts, both of you can see only repertoire allowed by your Compare settings.
          </p>

          {expiryLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Code expires {expiryLabel}.
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={shareLink}
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Share link
            </button>
            <button
              type="button"
              onClick={generateNewCode}
              disabled={isReplacing}
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-background/70 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReplacing ? "Generating…" : "Generate new code"}
            </button>
          </div>

          <p className="mt-3 min-h-5 text-sm text-muted-foreground" aria-live="polite">
            {shareFeedback}
          </p>
          <button type="button" onClick={cancelSession} className="min-h-11 px-4 text-sm font-semibold text-destructive underline underline-offset-4">Cancel comparison</button>
        </div>
      ) : null}

      {sheetState === "accepted" ? (
        <div className="rounded-2xl border border-success bg-muted p-5 text-center">
          <p className="text-lg font-semibold text-foreground" aria-live="polite">
            Connected with {connectedName || "a musician"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Opening your comparison…
          </p>
        </div>
      ) : null}

      {sheetState === "expired" || sheetState === "revoked" ? (
        <div className="text-center">
          <p className="rounded-2xl border border-warning bg-muted p-4 text-sm text-foreground">
            {sheetState === "expired"
              ? "This comparison code has expired."
              : "This invitation is no longer available."}
          </p>
          <button
            type="button"
            onClick={generateNewCode}
            disabled={isReplacing}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60 sm:w-auto"
          >
            {isReplacing ? "Generating…" : "Generate new code"}
          </button>
        </div>
      ) : null}

      {sheetState === "profile_required" ? (
        <div className="rounded-2xl border border-warning bg-muted p-5 text-sm leading-6 text-foreground">
          <p>
            Add a public username and enable compare discovery before creating
            a comparison code.
          </p>
          <Link
            href="/dashboard?next=%2Fcompare"
            onClick={onClose}
            className="mt-3 inline-flex font-medium underline underline-offset-4"
          >
            Complete profile
          </Link>
        </div>
      ) : null}

      {sheetState === "error" ? (
        <div className="text-center">
          <p className="rounded-2xl border border-destructive bg-muted p-4 text-sm text-destructive">
            Couldn’t prepare this comparison code. Please try again.
          </p>
          <button
            type="button"
            onClick={generateNewCode}
            disabled={isReplacing}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60 sm:w-auto"
          >
            Try again
          </button>
        </div>
      ) : null}

      {sheetState === "rate_limited" ? (
        <div className="text-center">
          <p className="rounded-2xl border border-warning bg-muted p-4 text-sm text-foreground">Too many new codes were created recently. Wait a little, then start a new comparison.</p>
          <button type="button" onClick={onClose} className="inline-flex mt-4 min-h-11 rounded-control border border-border px-4 text-sm font-semibold items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Leave</button>
        </div>
      ) : null}
    </ResponsiveModal>
  )
}
