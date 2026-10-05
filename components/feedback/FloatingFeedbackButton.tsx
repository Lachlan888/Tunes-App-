"use client"

import { useEffect, useState } from "react"
import BetaFeedbackModal from "@/components/feedback/BetaFeedbackModal"
import Icon from "@/components/ui/Icon"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { OPEN_FEEDBACK_EVENT } from "@/lib/ui-events"

export default function FloatingFeedbackButton({
  variant = "floating",
  onOpen,
}: {
  variant?: "floating" | "menu" | "focus" | "header" | "hidden"
  onOpen?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function openFeedback() {
      setIsOpen(true)
    }

    window.addEventListener(OPEN_FEEDBACK_EVENT, openFeedback)
    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, openFeedback)
  }, [])

  return (
    <>
      {variant === "hidden" ? null : <button
        type="button"
        onClick={() => {
          setIsOpen(true)
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

      {isOpen ? (
        <BetaFeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  )
}
