import LogoutButton from "@/components/LogoutButton"
import NavDropdown from "@/components/NavDropdown"
import PendingNavLink from "@/components/PendingNavLink"

type DesktopNavProps = {
  isSignedIn: boolean
  overduePracticeCount: number
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
}

export default function DesktopNav({
  isSignedIn,
  overduePracticeCount,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
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
          <PendingNavLink href="/learning-lists" label="Lists" />

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
                href: "/public-lists",
                label: "Shared",
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

          <PendingNavLink href="/dashboard" label="Profile" />
          <LogoutButton />
        </>
      ) : (
        <PendingNavLink href="/login" label="Login" />
      )}
    </nav>
  )
}