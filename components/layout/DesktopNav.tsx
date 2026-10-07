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
    <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-control bg-surface-note px-1 text-[0.6rem] font-semibold leading-4 text-text-primary xl:static xl:ml-auto">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return <span className="pointer-events-none absolute left-full z-[310] ml-2 hidden whitespace-nowrap rounded-control border border-hairline bg-surface-paper px-2 py-1 text-xs font-semibold text-text-primary shadow-sm group-hover/rail-item:block group-focus-visible/rail-item:block xl:static xl:ml-0 xl:block xl:border-0 xl:bg-transparent xl:p-0 xl:text-sm xl:shadow-none">{children}</span>
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
  const isFestivalPreviewSelected = pathname === "/dev/festivals"

  return (
    <aside data-desktop-nav className="fixed inset-y-0 left-0 z-[300] hidden w-[4.75rem] border-r border-hairline bg-surface-canvas md:flex md:flex-col xl:w-48">
      <Link
        href="/"
        aria-label="Tunes home"
        className="flex min-h-16 items-center justify-center border-b border-hairline px-3 font-serif text-xl font-bold text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] xl:justify-start xl:px-5"
      >
        <span aria-hidden="true" className="xl:hidden">T</span>
        <span className="hidden xl:inline">Tunes</span>
      </Link>

      <nav aria-label={shellKind === "internal" ? "Internal navigation" : "Primary navigation"} className="grid gap-0 p-2">
        {shellKind === "consumer"
          ? <>
            {primaryNavItems.map((item) => {
              const isSelected = selectedDestination === item.destination
              const badgeCount = item.destination === "practice" ? overduePracticeCount : item.destination === "social" ? socialAttentionCount : 0

              return (
                <Link
                  key={item.destination}
                  href={item.href}
                  aria-current={isSelected ? "page" : undefined}
                  aria-label={item.label}
                  className={joinClasses(
                    "group/rail-item relative flex min-h-12 items-center justify-center gap-3 border-l-2 border-transparent px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] xl:justify-start",
                    isSelected
                      ? "border-action-primary text-text-primary"
                      : "text-text-muted hover:bg-surface-note/50 hover:text-text-primary"
                  )}
                >
                  <Icon name={item.icon} size={21} />
                  <RailLabel>{item.label}</RailLabel>
                  <RailBadge count={badgeCount} />
                </Link>
              )
            })}
            {canAccessDev ? (
              <div className="mt-2 border-t border-hairline pt-2">
                <Link
                  href="/dev/festivals"
                  aria-label="Festival hub preview"
                  aria-current={isFestivalPreviewSelected ? "page" : undefined}
                  className={joinClasses(
                    "group/rail-item relative flex min-h-12 items-center justify-center gap-3 border-l-2 px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] xl:justify-start",
                    isFestivalPreviewSelected
                      ? "border-action-primary text-text-primary"
                      : "border-transparent text-text-muted hover:bg-surface-note/50 hover:text-text-primary"
                  )}
                >
                  <Icon name="stage" size={21} />
                  <RailLabel>Festival hub</RailLabel>
                </Link>
              </div>
            ) : null}
          </>
          : (
            <>
              <Link href="/" aria-label="Back to Tunes" className="group/rail-item relative flex min-h-12 items-center justify-center gap-3 border-l-2 border-transparent px-3 text-sm font-semibold text-text-muted hover:bg-surface-note/50 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] xl:justify-start">
                <Icon name="arrow-left" size={21} />
                <RailLabel>Back to Tunes</RailLabel>
              </Link>
              {canModerate ? (
                <Link href="/moderator" aria-label="Moderator" aria-current={pathname.startsWith("/moderator") ? "page" : undefined} className={joinClasses("group/rail-item relative flex min-h-12 items-center justify-center gap-3 border-l-2 border-transparent px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] xl:justify-start", pathname.startsWith("/moderator") ? "border-action-primary text-text-primary" : "text-text-muted hover:bg-surface-note/50 hover:text-text-primary")}>
                  <Icon name="shield" size={21} />
                  <RailLabel>Moderator</RailLabel>
                  <RailBadge count={pendingModerationCount} />
                </Link>
              ) : null}
              {canAccessDev ? (
                <Link href="/dev" aria-label="Developer" aria-current={pathname.startsWith("/dev") ? "page" : undefined} className={joinClasses("group/rail-item relative flex min-h-12 items-center justify-center gap-3 border-l-2 border-transparent px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] xl:justify-start", pathname.startsWith("/dev") ? "border-action-primary text-text-primary" : "text-text-muted hover:bg-surface-note/50 hover:text-text-primary")}>
                  <Icon name="code" size={21} />
                  <RailLabel>Developer</RailLabel>
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
        <p className="mt-1 hidden truncate px-1 text-xs text-text-muted xl:block">{accountLabel || "Account"}</p>
      </div>
    </aside>
  )
}
