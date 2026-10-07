"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, useTransition } from "react"
import { createPortal } from "react-dom"

export type ContextAction = {
  id: string
  label: string
  href?: string
  external?: boolean
  onSelect?: (trigger: HTMLButtonElement) => Promise<void> | void
  destructive?: boolean
  confirmMessage?: string
  completionMessage?: string | null
}

type Props = {
  label: string
  title: string
  actions: ContextAction[]
  triggerClassName?: string
  triggerContent?: ReactNode
}

const subscribeToMount = () => () => undefined
const subscribeToPhone = (callback: () => void) => {
  const query = window.matchMedia("(max-width: 767px)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}

export default function ContextActionMenu({ label, title, actions, triggerClassName, triggerContent }: Props) {
  const id = useId()
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false)
  const isPhone = useSyncExternalStore(subscribeToPhone, () => window.matchMedia("(max-width: 767px)").matches, () => false)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const shouldRestoreFocus = useRef(false)

  const close = useCallback(() => {
    shouldRestoreFocus.current = true
    setOpen(false)
  }, [])

  function show() {
    setMessage("")
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const estimatedHeight = Math.min(actions.length * 44 + 8, window.innerHeight - 32)
      setPosition({
        top: rect.bottom + estimatedHeight + 8 < window.innerHeight ? rect.bottom + 4 : Math.max(16, rect.top - estimatedHeight - 4),
        left: Math.max(16, Math.min(rect.right - 256, window.innerWidth - 272)),
      })
    }
    setOpen(true)
  }

  useLayoutEffect(() => {
    if (!open || isPhone || !panelRef.current || !triggerRef.current) return
    const trigger = triggerRef.current.getBoundingClientRect()
    const panel = panelRef.current.getBoundingClientRect()
    const below = trigger.bottom + 4 + panel.height <= window.innerHeight - 16
    const proposedTop = below ? trigger.bottom + 4 : trigger.top - panel.height - 4
    const top = Math.max(16, Math.min(proposedTop, window.innerHeight - panel.height - 16))
    const left = Math.max(16, Math.min(trigger.right - panel.width, window.innerWidth - panel.width - 16))
    setPosition(current => current.top === top && current.left === left ? current : { top, left })
  }, [open, isPhone, actions.length])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    if (isPhone) document.body.style.overflow = "hidden"
    const first = panelRef.current?.querySelector<HTMLElement>('[data-context-action]')
    requestAnimationFrame(() => first?.focus({ preventScroll: true }))

    function onPointerDown(event: PointerEvent) {
      if (panelRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) return
      close()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        close()
        return
      }
      if (event.key === "Tab" && isPhone) {
        const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([aria-disabled="true"]), a[href]:not([aria-disabled="true"])') ?? [])
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        return
      }
      if (event.key === "Tab") { close(); return }
      if (isPhone) return
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])
      if (!items.length) return
      event.preventDefault()
      const current = items.indexOf(document.activeElement as HTMLElement)
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (current + 1) % items.length : (current - 1 + items.length) % items.length
      items[next]?.focus()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    function onScroll(event: Event) {
      if (panelRef.current?.contains(event.target as Node)) return
      close()
    }
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", close)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", close)
    }
  }, [open, isPhone, close])

  useEffect(() => {
    if (!open && shouldRestoreFocus.current) {
      shouldRestoreFocus.current = false
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  function invoke(action: ContextAction) {
    if (!action.onSelect || pending) return
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) return
    startTransition(async () => {
      try {
        if (!triggerRef.current) return
        await action.onSelect?.(triggerRef.current)
        if (action.completionMessage !== null) {
          setMessage(action.completionMessage ?? `${action.label} complete`)
        }
        close()
      } catch (error) {
        if (isRedirectError(error)) {
          close()
          return
        }
        setMessage(`${action.label} could not be completed. Try again.`)
      }
    })
  }

  const actionItems = actions.map((action) => {
    const className = [
      "context-action-menu-item flex min-h-11 w-full items-center rounded-control px-3 py-2 text-left",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
      action.destructive
        ? "border-t border-hairline text-action-destructive"
        : "text-text-primary hover:bg-surface-note",
    ].join(" ")
    const role = isPhone ? undefined : "menuitem"

    if (action.href && action.external) {
      return <a key={action.id} href={action.href} target="_blank" rel="noopener noreferrer" role={role} data-context-action className={className} aria-disabled={pending} tabIndex={pending ? -1 : undefined} onClick={event => { if (pending) { event.preventDefault(); return } close() }}>{action.label}</a>
    }
    if (action.href) {
      return <Link key={action.id} href={action.href} role={role} data-context-action className={className} aria-disabled={pending} tabIndex={pending ? -1 : undefined} onClick={event => { if (pending) { event.preventDefault(); return } close() }}>{action.label}</Link>
    }
    return <button key={action.id} type="button" role={role} data-context-action className={className} aria-disabled={pending} tabIndex={pending ? -1 : undefined} onClick={() => invoke(action)}>{action.label}</button>
  })

  return <>
    <button
      ref={triggerRef}
      type="button"
      className={triggerClassName ?? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-hairline px-3 text-sm font-semibold text-text-primary hover:bg-surface-note focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"}
      aria-label={label}
      aria-haspopup={isPhone ? "dialog" : "menu"}
      aria-expanded={open}
      aria-controls={open ? id : undefined}
      onClick={() => open ? close() : show()}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          show()
        }
      }}
    >{triggerContent ?? <>More <span aria-hidden="true" className="ml-1 text-lg leading-none">⋯</span></>}</button>
    <span role="status" aria-live="polite" className="sr-only">{message}</span>
    {mounted && open ? createPortal(<>
      {isPhone ? <div className="fixed inset-0 z-[1000] bg-black/50" onClick={close} aria-hidden="true" /> : null}
      <div
        id={id}
        ref={panelRef}
        role={isPhone ? "dialog" : "menu"}
        aria-modal={isPhone ? true : undefined}
        aria-busy={pending}
        aria-label={title}
        className={isPhone
          ? "fixed inset-x-0 bottom-0 z-[1001] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-t-sheet border border-hairline bg-surface-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-material-floating"
          : "fixed z-[1001] w-64 max-h-[min(70vh,32rem)] overflow-y-auto rounded-object border border-hairline bg-surface-paper p-1 shadow-material-floating"}
        style={isPhone ? undefined : position}
      >
        {isPhone ? <div className="mb-2 flex items-center justify-between gap-3 border-b border-hairline pb-3"><span className="font-semibold text-text-primary">{title}</span><button type="button" className="min-h-11 px-2 text-sm" onClick={close}>Close</button></div> : null}
        {actionItems}
        {pending ? <p className="px-3 py-2 text-sm text-text-muted">Working…</p> : null}
        {!pending && message ? <p className="px-3 py-2 text-sm text-action-destructive">{message}</p> : null}
      </div>
    </>, document.body) : null}
  </>
}
