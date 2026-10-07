"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import ConnectionStatus from "@/components/resilience/ConnectionStatus"
import InternalShell from "@/components/layout/InternalShell"
import AppHeader from "@/components/layout/AppHeader"
import DesktopNav from "@/components/layout/DesktopNav"
import MobileNav from "@/components/layout/MobileNav"
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton"
import PracticeMetronome from "@/components/practice/PracticeMetronome"
import SessionDockProvider, {
  SessionDockNavigation,
} from "@/components/session-dock/SessionDockProvider"
import { getPageTitle, getShellKind } from "@/components/layout/navItems"
import { getPracticeEnrolmentStatus } from "@/lib/practice-session"

type AppShellProps = {
  children: React.ReactNode
  isSignedIn: boolean
  accountLabel?: string | null
  overduePracticeCount: number
  unreadTotalCount: number
  socialAttentionCount: number
  pendingModerationCount: number
  canModerate: boolean
  environment: string
  canAccessDev: boolean
  canManageFestivals: boolean
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
  canManageFestivals,
  environment,
}: AppShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shellKind = getShellKind(pathname, isSignedIn)
  const pageTitle = getPageTitle(pathname)
  const enrolmentStatus = getPracticeEnrolmentStatus(searchParams.get("practice_enrolment") ?? "")

  useEffect(() => {
    if (shellKind !== "consumer") return
    const breakpoint = window.matchMedia("(min-width: 768px)")
    let lastFocused: HTMLElement | null = null
    function rememberFocus(event: FocusEvent) {
      lastFocused = event.target instanceof HTMLElement ? event.target : null
    }
    function restoreNavigationFocus() {
      if (!lastFocused?.isConnected || lastFocused.getClientRects().length > 0) return
      if (!lastFocused.closest("[data-desktop-nav], [data-mobile-nav], [data-app-header]")) return
      const href = lastFocused.closest("a")?.getAttribute("href")
      const candidates = document.querySelectorAll<HTMLElement>(href ? "[data-desktop-nav] a, [data-mobile-nav] a" : '[aria-label="Open account menu"]')
      const replacement = Array.from(candidates).find(element => element.getClientRects().length > 0 && (!href || element.getAttribute("href") === href))
      ;(replacement ?? document.getElementById("main-content"))?.focus()
    }
    document.addEventListener("focusin", rememberFocus)
    breakpoint.addEventListener("change", restoreNavigationFocus)
    return () => {
      document.removeEventListener("focusin", rememberFocus)
      breakpoint.removeEventListener("change", restoreNavigationFocus)
    }
  }, [shellKind])

  return (
    <SessionDockProvider
      enabled={
        shellKind === "consumer" || pathname === "/dev/design-system"
      }
    >
      {shellKind === "internal" ? <InternalShell canModerate={canModerate} canAccessDev={canAccessDev} canManageFestivals={canManageFestivals} environment={environment}>{children}</InternalShell> : <>
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
        canManageFestivals={canManageFestivals}
      />
      <div
        id="main-content"
        tabIndex={-1}
        className={shellKind === "signed-out" ? "min-h-[calc(100vh-4rem)]" : "app-shell-content min-h-screen md:pl-[var(--app-rail-width)]"}
      >
        <ConnectionStatus />
        {shellKind === "consumer" && enrolmentStatus ? (
          <div role={enrolmentStatus.tone === "error" ? "alert" : "status"} className={`mx-auto mt-4 max-w-5xl border-l-2 px-5 py-2 text-sm font-medium sm:px-8 ${enrolmentStatus.tone === "error" ? "border-action-destructive text-action-destructive" : enrolmentStatus.tone === "success" ? "border-state-practice text-text-primary" : "border-hairline text-text-muted"}`}>
            {enrolmentStatus.message}
          </div>
        ) : null}
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
      </>}
      {isSignedIn && shellKind === "consumer" ? <PracticeMetronome variant="hidden" /> : null}
      {/* Keep feedback visible throughout the beta period. */}
      <FloatingFeedbackButton variant="floating" isSignedIn={isSignedIn} hideTrigger={!isSignedIn || shellKind !== "consumer"} />
    </SessionDockProvider>
  )
}
