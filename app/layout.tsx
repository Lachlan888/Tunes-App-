import "./globals.css"
import LogoutButton from "@/components/LogoutButton"
import NavDropdown from "@/components/NavDropdown"
import PendingNavLink from "@/components/PendingNavLink"
import { loadNavCounts } from "@/lib/loaders/nav"
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

  const navCounts = user
    ? await loadNavCounts(supabase, user.id)
    : {
        unreadNotificationCount: 0,
        unreadMessageCount: 0,
        unreadTotalCount: 0,
        overduePracticeCount: 0,
      }

  return (
    <html lang="en">
      <body>
        <header className="border-b border-border bg-card/90 backdrop-blur">
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
                    badgeCount={navCounts.overduePracticeCount}
                  />

                  <PendingNavLink href="/library" label="Tunes" />
                  <PendingNavLink href="/learning-lists" label="Lists" />

                  <NavDropdown
                    label="Social"
                    badgeCount={navCounts.unreadTotalCount}
                    items={[
                      {
                        href: "/friends",
                        label: "Friends",
                      },
                      {
                        href: "/inbox",
                        label: "Inbox",
                        badgeCount: navCounts.unreadTotalCount,
                      },
                      {
                        href: "/compare",
                        label: "Compare",
                      },
                      {
                        href: "/public-lists",
                        label: "Shared",
                      },
                    ]}
                  />

                  <PendingNavLink href="/trends" label="Trends" />
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