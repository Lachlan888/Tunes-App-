import "./globals.css"
import PendingNavLink from "@/components/PendingNavLink"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="flex gap-4 border-b p-4">
          <PendingNavLink href="/" label="Home" />
          <PendingNavLink href="/review" label="Practice" />
          <PendingNavLink href="/library" label="Tunes" />
          <PendingNavLink href="/learning-lists" label="Lists" />
          <PendingNavLink href="/friends" label="Friends" />
          <PendingNavLink href="/compare" label="Compare" />
          <PendingNavLink href="/trends" label="Trends" />
          <PendingNavLink href="/public-lists" label="Shared" />
          <PendingNavLink href="/dashboard" label="Profile" />
          <PendingNavLink href="/login" label="Login" />
        </nav>

        {children}
      </body>
    </html>
  )
}