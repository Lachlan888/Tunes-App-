"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function FloatingTool({ title, status, onClose, children, compactControl }: { title: string; status: string; onClose: () => void; children: ReactNode; compactControl: ReactNode }) {
  const panel = useRef<HTMLElement>(null)
  const handle = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [position, setPosition] = useState({ left: 16, top: 80 })
  const [collapsed, setCollapsed] = useState(false)
  const move = useCallback((left: number, top: number) => {
    const bounds = panel.current?.getBoundingClientRect()
    setPosition({ left: Math.max(8, Math.min(left, window.innerWidth - (bounds?.width ?? 340) - 8)), top: Math.max(8, Math.min(top, window.innerHeight - (bounds?.height ?? 48) - 100)) })
  }, [])
  useEffect(() => {
    const previousFocus = document.activeElement
    handle.current?.focus()
    return () => { if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus() }
  }, [])
  useEffect(() => {
    const constrain = () => { const bounds = panel.current?.getBoundingClientRect(); if (bounds) move(bounds.left, bounds.top) }
    const observer = new ResizeObserver(constrain)
    if (panel.current) observer.observe(panel.current)
    window.addEventListener("resize", constrain)
    return () => { observer.disconnect(); window.removeEventListener("resize", constrain) }
  }, [move])
  return createPortal(<aside ref={panel} aria-label={title} style={position} className="fixed z-[450] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-object border border-hairline bg-surface-paper text-text-primary shadow-material-floating">
    <div className="flex items-center gap-1 border-b border-hairline p-2">
      <button ref={handle} type="button" aria-label={`Move ${title}: drag or use arrow keys`} className="min-h-11 min-w-0 flex-1 touch-none cursor-move rounded-control px-2 text-left text-sm focus-visible:outline-2" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, ...position } }} onPointerMove={event => { if (drag.current) move(drag.current.left + event.clientX - drag.current.x, drag.current.top + event.clientY - drag.current.y) }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} onKeyDown={event => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }
        if (delta[event.key]) { event.preventDefault(); const [x, y] = delta[event.key]; move(position.left + x, position.top + y) }
      }}><strong>⠿ {title}</strong><span className="block text-xs text-text-muted">{status}</span></button>
      <button type="button" className={`${buttonStyles.secondary} !w-auto !px-2`} aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? "Expand" : "Collapse"}</button>
      <button type="button" className={`${buttonStyles.secondary} !w-auto !px-2`} aria-label={`Close and stop ${title}`} onClick={onClose}>×</button>
    </div>
    <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-3">{collapsed ? compactControl : children}</div>
  </aside>, document.body)
}
