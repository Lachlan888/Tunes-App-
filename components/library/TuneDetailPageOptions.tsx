"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function TuneDetailPageOptions({
  children,
  triggerId,
}: {
  children: ReactNode
  triggerId?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        id={triggerId}
        type="button"
        className={`${buttonStyles.secondary} whitespace-nowrap`}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        Manage
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        eyebrow="Tune"
        title="Manage tune"
        description="Organisation, contributions, corrections and permission-gated tune actions."
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-lg"
      >
        {children}
      </ResponsiveModal>
    </>
  )
}
