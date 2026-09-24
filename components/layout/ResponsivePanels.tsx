"use client"

import { useEffect, useId, useRef } from "react"
import type { ReactNode } from "react"
import MobileViewSwitcher from "@/components/ui/MobileViewSwitcher"

/** A single content tree: phone disclosure becomes simultaneous workspace panels. */
export default function ResponsivePanels<T extends string>({ panels, active, onChange, label, className = "" }: {
  panels: { id: T; label: string; content: ReactNode }[]
  active: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const idPrefix = useId()
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)")
    function keepFocusedPanel(event: MediaQueryListEvent) {
      if (!event.matches) return
      const focused = document.activeElement
      if (!(focused instanceof HTMLElement) || !root.current?.contains(focused)) return
      const panel = focused.closest<HTMLElement>("[data-workbench-panel]")
      const id = panels.find(item => item.id === panel?.dataset.workbenchPanel)?.id
      if (id) onChange(id)
    }
    phone.addEventListener("change", keepFocusedPanel)
    return () => phone.removeEventListener("change", keepFocusedPanel)
  }, [onChange, panels])

  return <div ref={root} className={className}>
    <MobileViewSwitcher value={active} options={panels.map(panel => ({ id: panel.id, label: panel.label, controls: `${idPrefix}-${panel.id}` }))} onChange={onChange} label={label} />
    <div className="responsive-panels">
      {panels.map(panel => <section key={panel.id} id={`${idPrefix}-${panel.id}`} data-workbench-panel={panel.id} data-active={active === panel.id} aria-label={panel.label} className="min-w-0">
        {panel.content}
      </section>)}
    </div>
  </div>
}
