"use client"

import Link from "next/link"
import AccountMenu from "@/components/layout/AccountMenu"
import type { ShellKind } from "@/components/layout/navItems"

type AppHeaderProps = {
  pathname: string
  pageTitle: string
  shellKind: ShellKind
  accountLabel?: string | null
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
}

export default function AppHeader({
  pathname,
  pageTitle,
  shellKind,
  accountLabel,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
}: AppHeaderProps) {
  if (shellKind === "signed-out") {
    return (
      <header className="border-b border-hairline bg-surface-paper">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
            Tunes
          </Link>
          {pathname === "/login" ? null : (
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-action-primary hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
              Sign in
            </Link>
          )}
        </div>
      </header>
    )
  }

  return (
    <header data-app-header className="floating-material sticky top-0 z-[350] border-b border-hairline md:hidden">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4">
        <h1 className="truncate font-serif text-lg font-semibold text-text-primary">{pageTitle}</h1>
        <AccountMenu
          compact
          accountLabel={accountLabel}
          unreadTotalCount={unreadTotalCount}
          pendingModerationCount={pendingModerationCount}
          canModerate={canModerate}
          canAccessDev={canAccessDev}
        />
      </div>
    </header>
  )
}
