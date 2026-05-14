"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"

type MobileFilterSheetProps = {
  title?: string
  description?: string
  buttonLabel?: string
  activeCount?: number
  children: ReactNode
  footer?: ReactNode
}

export default function MobileFilterSheet({
  title = "Filters",
  description,
  buttonLabel = "Filters",
  activeCount = 0,
  children,
  footer,
}: MobileFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        className={buttonStyles.secondary}
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
        {activeCount > 0 ? (
          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-lg"
        eyebrow="Mobile"
        title={title}
        description={description}
        footer={footer}
      >
        {children}
      </ResponsiveModal>
    </div>
  )
}