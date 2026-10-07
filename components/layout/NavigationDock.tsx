"use client"

import Link from "next/link"
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
  const selectedDestination = getPrimaryDestination(pathname)

  return (
    <nav
      data-mobile-nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-[300] grid grid-cols-6 border-t border-hairline bg-surface-canvas px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
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
              "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 border-t-2 border-transparent px-1 text-[0.68rem] font-semibold leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              isSelected
                ? "border-action-primary text-text-primary"
                : "text-text-muted hover:bg-surface-note hover:text-text-primary"
            )}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
            {badgeCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-control bg-surface-note px-1 text-[0.6rem] font-semibold leading-4 text-text-primary">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
