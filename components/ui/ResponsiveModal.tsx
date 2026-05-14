"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

type ResponsiveModalMode = "sheet" | "full-screen"

type ResponsiveModalProps = {
  isOpen: boolean
  onClose: () => void
  closeDisabled?: boolean
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  mobileMode?: ResponsiveModalMode
  desktopMaxWidth?: string
  bodyClassName?: string
  panelClassName?: string
  closeLabel?: string
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  closeDisabled = false,
  eyebrow,
  title,
  description,
  children,
  footer,
  mobileMode = "sheet",
  desktopMaxWidth = "md:max-w-xl",
  bodyClassName = "min-h-0 flex-1 overflow-y-auto p-5 md:p-6",
  panelClassName = "",
  closeLabel = "Close",
}: ResponsiveModalProps) {
  useEffect(() => {
    if (!isOpen || closeDisabled) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeDisabled, onClose])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const mobilePanelClass =
    mobileMode === "full-screen"
      ? "h-[100dvh] w-full rounded-none"
      : "max-h-[calc(100dvh-1rem)] w-full rounded-t-3xl"

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-foreground/35 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={() => {
        if (!closeDisabled) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="responsive-modal-title"
        className={`flex min-h-0 flex-col overflow-hidden border border-border bg-card shadow-xl md:max-h-[90vh] md:w-full md:rounded-3xl ${desktopMaxWidth} ${mobilePanelClass} ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-border bg-card px-5 py-4 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
                  {eyebrow}
                </p>
              ) : null}

              <h2
                id="responsive-modal-title"
                className="mt-1 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:mt-2 md:text-3xl"
              >
                {title}
              </h2>

              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              className="shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {closeLabel}
            </button>
          </div>
        </header>

        <div className={bodyClassName}>{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-border bg-card px-5 py-4 md:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}