"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getPrimaryDestination, primaryNavItems } from "@/components/layout/navItems"
import Icon from "@/components/ui/Icon"
import { joinClasses } from "@/components/ui/buttonStyles"

export default function NavigationDock({
  pathname,
  overduePracticeCount,
  socialAttentionCount,
}: {
  pathname: string
  overduePracticeCount: number
  socialAttentionCount: number
}) {
  const [isCompact, setIsCompact] = useState(false)
  const lastScrollYRef = useRef(0)
  const selectedDestination = getPrimaryDestination(pathname)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    function handleScroll() {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollYRef.current

      if (currentScrollY < 48 || delta < -8) setIsCompact(false)
      if (currentScrollY > 140 && delta > 8) setIsCompact(true)
      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      aria-label="Primary navigation"
      onFocusCapture={() => setIsCompact(false)}
      className={joinClasses(
        "floating-material fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-[300] grid grid-cols-5 border border-hairline shadow-material-floating transition-[padding,border-radius] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] md:hidden",
        isCompact ? "rounded-object p-1" : "rounded-sheet p-1.5"
      )}
    >
      {primaryNavItems.map((item) => {
        const isSelected = selectedDestination === item.destination
        const badgeCount =
          item.destination === "practice"
            ? overduePracticeCount
            : item.destination === "social"
              ? socialAttentionCount
              : 0

        return (
          <Link
            key={item.destination}
            href={item.href}
            aria-current={isSelected ? "page" : undefined}
            className={joinClasses(
              "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-control px-1 text-[0.68rem] font-semibold leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              isSelected
                ? "bg-action-primary text-action-primary-foreground shadow-material-rest"
                : "text-text-muted hover:bg-surface-note hover:text-text-primary"
            )}
          >
            <Icon name={item.icon} size={20} />
            <span className={joinClasses(isCompact && !isSelected && "sr-only")}>{item.label}</span>
            {badgeCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-pill bg-state-overdue px-1 text-[0.6rem] font-bold leading-4 text-state-overdue-foreground ring-2 ring-surface-paper">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
