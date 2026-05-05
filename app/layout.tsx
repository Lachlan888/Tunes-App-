import "./globals.css"
import LogoutButton from "@/components/LogoutButton"
import PendingNavLink from "@/components/PendingNavLink"
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
                  <PendingNavLink href="/review" label="Practice" />
                  <PendingNavLink href="/library" label="Tunes" />
                  <PendingNavLink href="/learning-lists" label="Lists" />
                  <PendingNavLink href="/friends" label="Friends" />
                  <PendingNavLink href="/compare" label="Compare" />
                  <PendingNavLink href="/trends" label="Trends" />
                  <PendingNavLink href="/public-lists" label="Shared" />
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