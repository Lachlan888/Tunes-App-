"use client"

import type { ReactNode } from "react"
import { useRef, useState } from "react"
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
  const [anchorPosition, setAnchorPosition] = useState<{ top?: number; bottom?: number; left: number }>({ top: 0, left: 0 })
  const [desktopPlacement, setDesktopPlacement] = useState<"anchor" | "center">("anchor")
  const triggerRef = useRef<HTMLButtonElement>(null)

  function openOptions() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const width = Math.min(512, window.innerWidth - 32)
      const height = Math.min(640, window.innerHeight * 0.9)
      const left = Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16))
      if (rect.bottom + height + 8 <= window.innerHeight - 16) {
        setAnchorPosition({ top: rect.bottom + 8, left })
        setDesktopPlacement("anchor")
      } else if (rect.top - height - 8 >= 16) {
        // CSS bottom anchors the rendered panel next to the trigger regardless of its height.
        setAnchorPosition({ bottom: window.innerHeight - rect.top + 8, left })
        setDesktopPlacement("anchor")
      } else {
        setDesktopPlacement("center")
      }
    }
    setIsOpen(true)
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`${buttonStyles.secondary} whitespace-nowrap`}
        onClick={openOptions}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        Manage
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Manage tune"
        mobileMode="sheet"
        desktopPlacement={desktopPlacement}
        desktopAnchorPosition={anchorPosition}
        desktopMaxWidth="md:max-w-lg"
      >
        {children}
      </ResponsiveModal>
    </>
  )
}
