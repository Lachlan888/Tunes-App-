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
  variant?: "floating" | "menu" | "hidden"
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
            : "fixed bottom-[calc(var(--navigation-dock-space)+var(--session-dock-space)+0.75rem)] right-4 z-[250] rounded-pill border border-action-primary bg-action-primary px-4 py-3 text-sm font-semibold text-action-primary-foreground shadow-material-floating transition-colors hover:bg-action-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:bottom-[calc(var(--session-dock-space)+1.5rem)] md:right-6"
        }
        aria-label="Send beta feedback"
      >
        {variant === "menu" ? <Icon name="feedback" /> : null}
        <span>Help & feedback</span>
      </button>}

      {isOpen ? (
        <BetaFeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  )
}
