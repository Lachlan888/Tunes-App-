import "./globals.css"
import LogoutButton from "@/components/LogoutButton"
import PendingNavLink from "@/components/PendingNavLink"
import { createClient } from "@/lib/supabase/server"

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
        <nav className="flex flex-wrap gap-4 border-b p-4">
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

        {children}
      </body>
    </html>
  )
}