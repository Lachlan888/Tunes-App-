"use client"

import Link from "next/link"
import AccountMenu from "@/components/layout/AccountMenu"
import {
  getPrimaryDestination,
  primaryNavItems,
  type ShellKind,
} from "@/components/layout/navItems"
import Icon from "@/components/ui/Icon"
import { joinClasses } from "@/components/ui/buttonStyles"

type DesktopNavProps = {
  pathname: string
  shellKind: ShellKind
  accountLabel?: string | null
  overduePracticeCount: number
  socialAttentionCount: number
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
}

function RailBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-pill bg-state-overdue px-1 text-[0.6rem] font-bold leading-4 text-state-overdue-foreground lg:static lg:ml-auto">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export default function DesktopNav({
  pathname,
  shellKind,
  accountLabel,
  overduePracticeCount,
  socialAttentionCount,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
}: DesktopNavProps) {
  if (shellKind === "signed-out") return null

  const selectedDestination = getPrimaryDestination(pathname)

  return (
    <aside className="fixed inset-y-0 left-0 z-[300] hidden w-[4.75rem] border-r border-hairline bg-surface-paper md:flex md:flex-col lg:w-60">
      <Link
        href="/"
        aria-label="Tunes home"
        className="flex min-h-16 items-center justify-center border-b border-hairline px-3 font-serif text-xl font-bold text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] lg:justify-start lg:px-5"
      >
        <span aria-hidden="true" className="lg:hidden">T</span>
        <span className="hidden lg:inline">Tunes</span>
      </Link>

      <nav aria-label={shellKind === "internal" ? "Internal navigation" : "Primary navigation"} className="grid gap-1 p-2">
        {shellKind === "consumer"
          ? primaryNavItems.map((item) => {
              const isSelected = selectedDestination === item.destination
              const badgeCount = item.destination === "practice" ? overduePracticeCount : item.destination === "social" ? socialAttentionCount : 0

              return (
                <Link
                  key={item.destination}
                  href={item.href}
                  aria-current={isSelected ? "page" : undefined}
                  title={item.label}
                  className={joinClasses(
                    "relative flex min-h-12 items-center justify-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:justify-start",
                    isSelected
                      ? "bg-action-primary text-action-primary-foreground shadow-material-rest"
                      : "text-text-muted hover:bg-surface-note hover:text-text-primary"
                  )}
                >
                  <Icon name={item.icon} size={21} />
                  <span className="hidden lg:inline">{item.label}</span>
                  <RailBadge count={badgeCount} />
                </Link>
              )
            })
          : (
            <>
              <Link href="/" className="flex min-h-12 items-center justify-center gap-3 rounded-control px-3 text-sm font-semibold text-text-muted hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:justify-start">
                <Icon name="arrow-left" size={21} />
                <span className="hidden lg:inline">Back to Tunes</span>
              </Link>
              {canModerate ? (
                <Link href="/moderator" aria-current={pathname.startsWith("/moderator") ? "page" : undefined} className={joinClasses("relative flex min-h-12 items-center justify-center gap-3 rounded-control px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:justify-start", pathname.startsWith("/moderator") ? "bg-action-primary text-action-primary-foreground" : "text-text-muted hover:bg-surface-note hover:text-text-primary")}>
                  <Icon name="shield" size={21} />
                  <span className="hidden lg:inline">Moderator</span>
                  <RailBadge count={pendingModerationCount} />
                </Link>
              ) : null}
              {canAccessDev ? (
                <Link href="/dev" aria-current={pathname.startsWith("/dev") ? "page" : undefined} className={joinClasses("flex min-h-12 items-center justify-center gap-3 rounded-control px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:justify-start", pathname.startsWith("/dev") ? "bg-action-primary text-action-primary-foreground" : "text-text-muted hover:bg-surface-note hover:text-text-primary")}>
                  <Icon name="code" size={21} />
                  <span className="hidden lg:inline">Developer</span>
                </Link>
              ) : null}
            </>
          )}
      </nav>

      <div className="mt-auto border-t border-hairline p-2">
        <AccountMenu
          compact
          placement="above-right"
          accountLabel={accountLabel}
          unreadTotalCount={unreadTotalCount}
          pendingModerationCount={pendingModerationCount}
          canModerate={canModerate}
          canAccessDev={canAccessDev}
        />
        <p className="mt-1 hidden truncate px-1 text-xs text-text-muted lg:block">{accountLabel || "Account"}</p>
      </div>
    </aside>
  )
}
