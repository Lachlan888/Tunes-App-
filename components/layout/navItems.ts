export type NavItem = {
  href: string
  label: string
  badgeCount?: number
}

export const coreNavItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/review",
    label: "Practice",
  },
  {
    href: "/library",
    label: "Tunes",
  },
]

export const listNavItems: NavItem[] = [
  {
    href: "/learning-lists",
    label: "My Lists",
  },
  {
    href: "/public-lists",
    label: "Public Lists",
  },
]

export const socialNavItems: NavItem[] = [
  {
    href: "/friends",
    label: "Friends",
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
  {
    href: "/trends",
    label: "Trends",
  },
  {
    href: "/inbox",
    label: "Inbox",
  },
]

export function navItemIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === href

  return pathname === href || pathname.startsWith(`${href}/`)
}
