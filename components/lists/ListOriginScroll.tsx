"use client"

import { useEffect } from "react"

// Only the latest in-tab list departure is needed; no account data is persisted.
let pendingOrigin: { href: string; top: number } | null = null

export default function ListOriginScroll({ originHref }: { originHref: string }) {
  useEffect(() => {
    const pending = pendingOrigin
    const frame = pending?.href === originHref
      ? requestAnimationFrame(() => {
          window.scrollTo({ top: pending.top, behavior: "instant" })
          if (pendingOrigin === pending) pendingOrigin = null
        })
      : null

    function captureDeparture(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const control = event.target instanceof Element ? event.target.closest("a, button[data-navigation-href]") : null
      if (!control || control.hasAttribute("disabled") || control.hasAttribute("download")) return
      const target = control.getAttribute("target")
      if (target && target !== "_self") return
      const href = control.getAttribute("href") ?? control.getAttribute("data-navigation-href")
      if (!href) return
      const destination = new URL(href, window.location.origin)
      if (destination.origin !== window.location.origin || !/^\/(learning-lists|public-lists)\/\d+$/.test(destination.pathname)) return
      if (destination.searchParams.get("return_to") !== originHref) return
      // Capture before either Link or router.push resets scroll for the detail route.
      pendingOrigin = { href: originHref, top: window.scrollY }
    }

    document.addEventListener("click", captureDeparture, true)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      document.removeEventListener("click", captureDeparture, true)
    }
  }, [originHref])

  return null
}
