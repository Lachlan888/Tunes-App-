"use client"

import type { ReactNode } from "react"
import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type ResponsiveModalMode = "sheet" | "full-screen"
type ResponsiveModalTone = "default" | "destructive"

type ResponsiveModalProps = {
  isOpen: boolean
  onClose: () => void
  closeDisabled?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  mobileMode?: ResponsiveModalMode
  tone?: ResponsiveModalTone
  desktopMaxWidth?: string
  bodyClassName?: string
  panelClassName?: string
  headerClassName?: string
  footerClassName?: string
  closeLabel?: string
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  closeDisabled = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  eyebrow,
  title,
  description,
  children,
  footer,
  mobileMode = "sheet",
  tone = "default",
  desktopMaxWidth = "md:max-w-xl",
  bodyClassName = "min-h-0 flex-1 overflow-y-auto p-5 md:p-6",
  panelClassName = "",
  headerClassName = "",
  footerClassName = "",
  closeLabel = "Close",
}: ResponsiveModalProps) {
  const modalId = useId()
  const titleId = `${modalId}-title`
  const descriptionId = description ? `${modalId}-description` : undefined
  const [isMounted, setIsMounted] = useState(false)

  function requestClose() {
    if (closeDisabled) return
    onClose()
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen || closeDisabled || !closeOnEscape) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeDisabled, closeOnEscape, onClose])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isMounted || !isOpen) return null

  const mobilePanelClass =
    mobileMode === "full-screen"
      ? "h-[100dvh] w-full rounded-none"
      : "max-h-[calc(100dvh-1rem)] w-full rounded-t-3xl"

  const toneClasses =
    tone === "destructive" ? "border-destructive/50" : "border-border"

  const eyebrowClasses =
    tone === "destructive" ? "text-destructive" : "text-muted-foreground"

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-foreground/35 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={() => {
        if (closeOnOverlayClick) {
          requestClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={joinClasses(
          "flex min-h-0 flex-col overflow-hidden border bg-card shadow-xl md:max-h-[90vh] md:w-full md:rounded-3xl",
          desktopMaxWidth,
          mobilePanelClass,
          toneClasses,
          panelClassName
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={joinClasses(
            "shrink-0 border-b border-border bg-card px-5 py-4 md:px-6 md:py-5",
            headerClassName
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? (
                <p
                  className={joinClasses(
                    "text-xs font-semibold uppercase tracking-[0.16em] md:text-sm",
                    eyebrowClasses
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}

              <h2
                id={titleId}
                className="mt-1 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:mt-2 md:text-3xl"
              >
                {title}
              </h2>

              {description ? (
                <p
                  id={descriptionId}
                  className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"
                >
                  {description}
                </p>
              ) : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                onClick={requestClose}
                disabled={closeDisabled}
                className={buttonStyles.modalClose}
              >
                {closeLabel}
              </button>
            ) : null}
          </div>
        </header>

        <div className={bodyClassName}>{children}</div>

        {footer ? (
          <footer
            className={joinClasses(
              "shrink-0 border-t border-border bg-card px-5 py-4 md:px-6",
              footerClassName
            )}
          >
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )

  return createPortal(modalContent, document.body)
}