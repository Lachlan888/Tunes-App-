"use client"

import { usePathname } from "next/navigation"
import AppHeader from "@/components/layout/AppHeader"
import DesktopNav from "@/components/layout/DesktopNav"
import MobileNav from "@/components/layout/MobileNav"
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton"
import PracticeMetronome from "@/components/practice/PracticeMetronome"
import SessionDockProvider, {
  SessionDockNavigation,
} from "@/components/session-dock/SessionDockProvider"
import { getPageTitle, getShellKind } from "@/components/layout/navItems"

type AppShellProps = {
  children: React.ReactNode
  isSignedIn: boolean
  accountLabel?: string | null
  overduePracticeCount: number
  unreadTotalCount: number
  socialAttentionCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
}

export default function AppShell({
  children,
  isSignedIn,
  accountLabel,
  overduePracticeCount,
  unreadTotalCount,
  socialAttentionCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
}: AppShellProps) {
  const pathname = usePathname()
  const shellKind = getShellKind(pathname, isSignedIn)
  const pageTitle = getPageTitle(pathname)

  return (
    <SessionDockProvider
      enabled={
        shellKind === "consumer" || pathname === "/dev/design-system"
      }
    >
      <a href="#main-content" className="fixed left-3 top-3 z-[1000] -translate-y-24 rounded-control bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-foreground shadow-material-floating focus:translate-y-0">
        Skip to content
      </a>
      <AppHeader
        pathname={pathname}
        pageTitle={pageTitle}
        shellKind={shellKind}
        accountLabel={accountLabel}
        unreadTotalCount={unreadTotalCount}
        pendingModerationCount={pendingModerationCount}
        canModerate={canModerate}
        canAccessDev={canAccessDev}
      />
      <DesktopNav
        pathname={pathname}
        shellKind={shellKind}
        accountLabel={accountLabel}
        overduePracticeCount={overduePracticeCount}
        socialAttentionCount={socialAttentionCount}
        unreadTotalCount={unreadTotalCount}
        pendingModerationCount={pendingModerationCount}
        canModerate={canModerate}
        canAccessDev={canAccessDev}
      />
      <div
        id="main-content"
        tabIndex={-1}
        className={shellKind === "signed-out" ? "min-h-[calc(100vh-4rem)]" : "app-shell-content min-h-screen md:pl-[4.75rem] lg:pl-60"}
      >
        {children}
      </div>
      {shellKind === "consumer" ? (
        <SessionDockNavigation>
          <MobileNav
            pathname={pathname}
            overduePracticeCount={overduePracticeCount}
            socialAttentionCount={socialAttentionCount}
          />
        </SessionDockNavigation>
      ) : null}
      {isSignedIn ? <PracticeMetronome variant="hidden" /> : null}
      {isSignedIn ? <FloatingFeedbackButton variant="hidden" /> : null}
    </SessionDockProvider>
  )
}
