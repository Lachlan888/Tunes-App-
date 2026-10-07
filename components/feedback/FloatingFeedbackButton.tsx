"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import BetaFeedbackModal from "@/components/feedback/BetaFeedbackModal"
import Icon from "@/components/ui/Icon"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { getAuthReturnPath } from "@/lib/auth/redirects"
import { OPEN_FEEDBACK_EVENT } from "@/lib/ui-events"

export default function FloatingFeedbackButton({
  variant = "floating",
  onOpen,
  isSignedIn = true,
  hideTrigger = false,
}: {
  variant?: "floating" | "menu" | "focus" | "header" | "hidden"
  onOpen?: () => void
  isSignedIn?: boolean
  hideTrigger?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [returnPath, setReturnPath] = useState("/")
  const triggerRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (variant !== "floating") return

    function openFeedback() {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      const path = `${window.location.pathname}${window.location.search}`
      const next = window.location.pathname === "/login"
        ? new URLSearchParams(window.location.search).get("next")
        : path
      setReturnPath(getAuthReturnPath(next, "/"))
      setIsOpen(true)
    }

    window.addEventListener(OPEN_FEEDBACK_EVENT, openFeedback)
    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, openFeedback)
  }, [variant])

  function closeFeedback() {
    setIsOpen(false)
    requestAnimationFrame(() => {
      const target = returnFocusRef.current
      if (target?.isConnected && target.getClientRects().length > 0) {
        target.focus({ preventScroll: true })
      } else {
        const visibleFeedback = Array.from(
          document.querySelectorAll<HTMLElement>('[aria-label="Send beta feedback"]')
        ).find((element) => element.getClientRects().length > 0)
        ;(visibleFeedback ?? triggerRef.current)?.focus({ preventScroll: true })
      }
    })
  }

  return (
    <>
      {variant === "hidden" || hideTrigger ? null : <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          if (variant === "floating") {
            returnFocusRef.current = event.currentTarget
            setIsOpen(true)
          } else {
            window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))
          }
          onOpen?.()
        }}
        className={
          variant === "menu"
            ? buttonStyles.menuItem
            : variant === "focus"
              ? `${buttonStyles.text} !min-h-11 !w-auto shrink-0`
              : variant === "header"
                ? "inline-flex min-h-11 shrink-0 items-center rounded-control border border-action-primary bg-action-primary px-3 text-xs font-semibold text-action-primary-foreground transition-colors hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            : "fixed bottom-[calc(var(--navigation-dock-space)+var(--session-dock-space)+0.5rem)] right-2 z-[250] hidden rounded-control border border-action-primary bg-action-primary px-3 py-3 text-sm font-semibold text-action-primary-foreground shadow-material-floating transition-colors hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:inline-flex md:bottom-auto md:top-6 md:right-6 md:px-4"
        }
        aria-label="Send beta feedback"
        data-floating-feedback={variant === "floating" || undefined}
      >
        {variant === "menu" ? <Icon name="feedback" /> : null}
        {variant === "floating" ? (
          <>
            <span className="lg:hidden">Feedback</span>
            <span className="hidden lg:inline">Help & feedback</span>
          </>
        ) : (
          <span>{variant === "focus" || variant === "header" ? "Feedback" : "Help & feedback"}</span>
        )}
      </button>}

      {variant === "floating" && isOpen ? (
        isSignedIn ? (
          <BetaFeedbackModal isOpen={isOpen} onClose={closeFeedback} />
        ) : (
          <ResponsiveModal isOpen={isOpen} onClose={closeFeedback} title="Help & feedback" mobileMode="sheet">
            <div className="space-y-4">
              <p className="text-sm leading-6 text-text-muted">
                {window.location.pathname === "/login"
                  ? "Sign in, then use Help & feedback on the page you return to."
                  : "Sign in to send feedback about this page. You will return here after signing in."}
              </p>
              {window.location.pathname === "/login" ? (
                <button type="button" onClick={closeFeedback} className={buttonStyles.primary}>
                  Continue signing in
                </button>
              ) : (
                <Link href={`/login?next=${encodeURIComponent(returnPath)}`} className={buttonStyles.primary}>
                  Sign in to send feedback
                </Link>
              )}
            </div>
          </ResponsiveModal>
        )
      ) : null}
    </>
  )
}
