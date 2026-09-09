import type { IconName } from "@/components/ui/Icon"

export type PrimaryDestination = "home" | "practice" | "tunes" | "lists" | "social" | "compare"

export type NavItem = {
  href: string
  label: string
  icon?: IconName
  badgeCount?: number
}

export type PrimaryNavItem = NavItem & {
  destination: PrimaryDestination
  icon: IconName
}

export type ShellKind = "consumer" | "internal" | "signed-out"

export const primaryNavItems: PrimaryNavItem[] = [
  { destination: "home", href: "/", label: "Home", icon: "home" },
  { destination: "practice", href: "/review", label: "Practice", icon: "practice" },
  { destination: "tunes", href: "/library", label: "Tunes", icon: "book" },
  { destination: "lists", href: "/learning-lists", label: "Lists", icon: "list" },
  { destination: "social", href: "/friends", label: "Social", icon: "social" },
  { destination: "compare", href: "/compare", label: "Compare", icon: "compare" },
]

export const coreNavItems = primaryNavItems.slice(0, 3)

export const listNavItems: NavItem[] = [
  { href: "/learning-lists", label: "My Lists", icon: "list" },
  { href: "/public-lists", label: "Public Lists", icon: "book" },
]

export const socialNavItems: NavItem[] = [
  { href: "/friends", label: "Friends", icon: "social" },
  { href: "/setlists", label: "Setlists", icon: "setlist" },
  { href: "/badges", label: "Badges", icon: "badge" },
  { href: "/trends", label: "Trends", icon: "trend" },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
]

const practicePrefixes = ["/review", "/practice-diary", "/practice-foci"]
const tunePrefixes = ["/library", "/repertoire"]
const listPrefixes = ["/learning-lists", "/public-lists"]
const socialPrefixes = [
  "/friends",
  "/setlists",
  "/badges",
  "/trends",
  "/inbox",
  "/users",
]

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function navItemIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === href

  return matchesPrefix(pathname, href)
}

export function getPrimaryDestination(pathname: string): PrimaryDestination | null {
  if (pathname === "/") return "home"
  if (practicePrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return "practice"
  if (tunePrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return "tunes"
  if (listPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return "lists"
  if (matchesPrefix(pathname, "/compare")) return "compare"
  if (socialPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return "social"

  return null
}

export function getShellKind(pathname: string, isSignedIn: boolean): ShellKind {
  if (!isSignedIn || pathname === "/login" || pathname === "/update-password") {
    return "signed-out"
  }
  if (matchesPrefix(pathname, "/dev") || matchesPrefix(pathname, "/moderator")) {
    return "internal"
  }

  return "consumer"
}

export function getPageTitle(pathname: string) {
  if (pathname === "/") return "Home"
  if (matchesPrefix(pathname, "/review/diary")) return "Practice diary"
  if (matchesPrefix(pathname, "/review/foci")) return "Practice focus"
  if (matchesPrefix(pathname, "/review")) return "Practice"
  if (matchesPrefix(pathname, "/practice-diary")) return "Practice diary"
  if (matchesPrefix(pathname, "/practice-foci")) return "Practice focus"
  if (matchesPrefix(pathname, "/library")) return pathname === "/library" ? "Tunes" : "Tune"
  if (matchesPrefix(pathname, "/repertoire")) return "Repertoire"
  if (matchesPrefix(pathname, "/learning-lists")) return pathname === "/learning-lists" ? "Lists" : "List"
  if (matchesPrefix(pathname, "/public-lists")) return pathname === "/public-lists" ? "Public lists" : "List"
  if (matchesPrefix(pathname, "/friends")) return "Friends"
  if (matchesPrefix(pathname, "/users")) return "Profile"
  if (matchesPrefix(pathname, "/compare")) return "Compare"
  if (matchesPrefix(pathname, "/setlists")) return "Setlists"
  if (matchesPrefix(pathname, "/badges")) return "Badges"
  if (matchesPrefix(pathname, "/trends")) return "Trends"
  if (matchesPrefix(pathname, "/inbox")) return "Inbox"
  if (matchesPrefix(pathname, "/dashboard")) return "Account & settings"
  if (matchesPrefix(pathname, "/moderator")) return "Moderator"
  if (matchesPrefix(pathname, "/dev")) return "Developer tools"
  if (matchesPrefix(pathname, "/login")) return "Sign in"
  if (matchesPrefix(pathname, "/update-password")) return "Update password"

  return "Tunes"
}
