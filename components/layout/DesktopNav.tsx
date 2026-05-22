import LogoutButton from "@/components/LogoutButton"
import NavDropdown from "@/components/NavDropdown"
import PendingNavLink from "@/components/PendingNavLink"

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
          <PendingNavLink href="/" label="Home" />

          <PendingNavLink
            href="/review"
            label="Practice"
            badgeCount={overduePracticeCount}
          />

          <PendingNavLink href="/library" label="Tunes" />

          <NavDropdown
            label="Lists"
            items={[
              {
                href: "/learning-lists",
                label: "My Lists",
              },
              {
                href: "/public-lists",
                label: "Public Lists",
              },
            ]}
          />

          <NavDropdown
            label="Social"
            badgeCount={unreadTotalCount}
            items={[
              {
                href: "/friends",
                label: "Friends",
              },
              {
                href: "/inbox",
                label: "Inbox",
                badgeCount: unreadTotalCount,
              },
              {
                href: "/compare",
                label: "Compare",
              },
              {
                href: "/setlists",
                label: "Setlists",
              },
              {
                href: "/badges",
                label: "Badges",
              },
            ]}
          />

          <PendingNavLink href="/trends" label="Trends" />

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