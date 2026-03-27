import "./globals.css"
import Link from "next/link"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="flex gap-4 border-b p-4">
          <Link href="/">Home</Link>
          <Link href="/review">Practice</Link>
          <Link href="/library">Tunes</Link>
          <Link href="/learning-lists">Lists</Link>
          <Link href="/public-lists">Shared</Link>
          <Link href="/dashboard">Profile</Link>
          <Link href="/login">Login</Link>
        </nav>

        {children}
      </body>
    </html>
  )
}