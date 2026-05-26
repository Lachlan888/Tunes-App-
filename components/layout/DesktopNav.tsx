import LogoutButton from "@/components/LogoutButton"
import NavDropdown from "@/components/NavDropdown"
import PendingNavLink from "@/components/PendingNavLink"
import {
  coreNavItems,
  listNavItems,
  socialNavItems,
} from "@/components/layout/navItems"

type DesktopNavProps = {
  isSignedIn: boolean
  overduePracticeCount: number
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
}

export default function DesktopNav({
  isSignedIn,
  overduePracticeCount,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
}: DesktopNavProps) {
  return (
    <nav className="hidden flex-wrap items-center gap-2 text-sm md:flex">
      {isSignedIn ? (
        <>
          {coreNavItems.map((item) => (
            <PendingNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              badgeCount={
                item.href === "/review" ? overduePracticeCount : undefined
              }
            />
          ))}

          <NavDropdown label="Lists" items={listNavItems} />

          <NavDropdown
            label="Social"
            badgeCount={unreadTotalCount}
            items={socialNavItems.map((item) =>
              item.href === "/inbox"
                ? { ...item, badgeCount: unreadTotalCount }
                : item
            )}
          />

          {canModerate ? (
            <PendingNavLink
              href="/moderator"
              label="Moderator"
              badgeCount={pendingModerationCount}
            />
          ) : null}

          {canAccessDev ? <PendingNavLink href="/dev" label="Dev" /> : null}

          <PendingNavLink href="/dashboard" label="Profile" />
          <LogoutButton />
        </>
      ) : (
        <PendingNavLink href="/login" label="Login" />
      )}
    </nav>
  )
}
