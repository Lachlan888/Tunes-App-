"use client"

import { useState } from "react"
import BetaFeedbackModal from "@/components/feedback/BetaFeedbackModal"

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[250] rounded-full border border-border bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:bottom-6 md:right-6"
        aria-label="Send beta feedback"
      >
        Feedback
      </button>

      <BetaFeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}