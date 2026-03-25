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
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/library">Library</Link>
          <Link href="/repertoire">Manage Library</Link>
          <Link href="/learning-lists">Learning Lists</Link>
          <Link href="/public-lists">Public Lists</Link>
          <Link href="/review">Review</Link>
          <Link href="/login">Login</Link>
        </nav>

        {children}
      </body>
    </html>
  )
}