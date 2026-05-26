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
  pendingFriendRequestCount: number
  socialAttentionCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
}

export default function DesktopNav({
  isSignedIn,
  overduePracticeCount,
  unreadTotalCount,
  pendingFriendRequestCount,
  socialAttentionCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
}: DesktopNavProps) {
  const socialItems = socialNavItems.map((item) => {
    if (item.href === "/friends") {
      return { ...item, badgeCount: pendingFriendRequestCount }
    }

    if (item.href === "/inbox") {
      return { ...item, badgeCount: unreadTotalCount }
    }

    return item
  })

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
            badgeCount={socialAttentionCount}
            items={socialItems}
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
