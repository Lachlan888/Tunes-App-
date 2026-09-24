"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function InternalShell({ children, canModerate, canAccessDev, environment }: {
  children: React.ReactNode
  canModerate: boolean
  canAccessDev: boolean
  environment: string
}) {
  const pathname = usePathname()
  const links = [
    { href: "/badges/new", label: "Create badge" },
    ...(canModerate ? [{ href: "/moderator", label: "Moderation" }] : []),
    ...(canAccessDev ? [{ href: "/dev", label: "Operations" }, { href: "/dev/design-system", label: "Design system" }] : []),
  ]
  return <div className="internal-workspace min-h-screen bg-surface-paper text-foreground">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-3">Skip to workspace</a>
    <header className="border-b border-border bg-surface-note px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2">
        <div><p className="font-semibold">Tunes · Internal workspace</p><p className="text-xs text-muted-foreground">{environment} · Badge creator{canModerate ? " · Moderator" : ""}{canAccessDev ? " · App admin" : ""}</p></div>
        <Link href="/badges" className="inline-flex min-h-11 items-center text-sm underline">Back to Tunes</Link>
      </div>
      <nav aria-label="Internal navigation" className="mx-auto mt-2 flex max-w-[1500px] flex-wrap gap-1">
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium ${pathname === link.href ? "bg-state-social text-state-social-foreground" : "hover:bg-muted"}`}>{link.label}</Link>)}
      </nav>
    </header>
    <div id="main-content" tabIndex={-1}>{children}</div>
  </div>
}
