import "./globals.css"
import LogoutButton from "@/components/LogoutButton"
import NavDropdown from "@/components/NavDropdown"
import PendingNavLink from "@/components/PendingNavLink"
import { emptyNavContext, loadNavContext } from "@/lib/loaders/nav"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const navContext = user
    ? await loadNavContext(supabase, user.id)
    : emptyNavContext

  return (
    <html lang="en">
      <body>
        <header className="relative z-[100] border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="font-serif text-xl font-bold tracking-tight text-foreground">
                Tunes App
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Remember, organise, and share tunes.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {user ? (
                <>
                  <PendingNavLink href="/" label="Home" />

                  <PendingNavLink
                    href="/review"
                    label="Practice"
                    badgeCount={navContext.overduePracticeCount}
                  />

                  <PendingNavLink href="/library" label="Tunes" />
                  <PendingNavLink href="/learning-lists" label="Lists" />

                  <NavDropdown
                    label="Social"
                    badgeCount={navContext.unreadTotalCount}
                    items={[
                      {
                        href: "/friends",
                        label: "Friends",
                      },
                      {
                        href: "/inbox",
                        label: "Inbox",
                        badgeCount: navContext.unreadTotalCount,
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

                  {navContext.canModerate ? (
                    <PendingNavLink
                      href="/moderator"
                      label="Moderator"
                      badgeCount={navContext.pendingModerationCount}
                    />
                  ) : null}

                  <PendingNavLink href="/dashboard" label="Profile" />
                  <LogoutButton />
                </>
              ) : (
                <PendingNavLink href="/login" label="Login" />
              )}
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}