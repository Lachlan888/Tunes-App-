import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  getPageTitle,
  getPrimaryDestination,
  getShellKind,
  primaryNavItems,
} from "../components/layout/navItems.ts"

test("phone and desktop consumer navigation expose six first-class destinations", () => {
  assert.deepEqual(
    primaryNavItems.map(({ label, href }) => ({ label, href })),
    [
      { label: "Home", href: "/" },
      { label: "Practice", href: "/review" },
      { label: "Tunes", href: "/library" },
      { label: "Lists", href: "/learning-lists" },
      { label: "Social", href: "/friends" },
      { label: "Compare", href: "/compare" },
    ]
  )
})

test("nested routes select their primary destination", () => {
  const routes = {
    "/": "home",
    "/review/session": "practice",
    "/review/diary/index": "practice",
    "/library/tune-id": "tunes",
    "/library/tune-id/reference-media": "tunes",
    "/learning-lists/list-id": "lists",
    "/public-lists/list-id": "lists",
    "/friends/person-id": "social",
    "/users/person-id": "social",
    "/compare/person-id": "compare",
    "/inbox/thread-id": "social",
  } as const

  for (const [pathname, destination] of Object.entries(routes)) {
    assert.equal(getPrimaryDestination(pathname), destination, pathname)
  }

  assert.equal(getPrimaryDestination("/dashboard"), null)
  assert.equal(getPrimaryDestination("/dev"), null)
})

test("signed-out and internal pages do not inherit consumer navigation", () => {
  assert.equal(getShellKind("/", false), "signed-out")
  assert.equal(getShellKind("/login", true), "signed-out")
  assert.equal(getShellKind("/update-password", true), "signed-out")
  assert.equal(getShellKind("/dev/design-system", true), "internal")
  assert.equal(getShellKind("/moderator/queue", true), "internal")
  assert.equal(getShellKind("/library", true), "consumer")
})

test("nested pages receive concise phone top-bar titles", () => {
  assert.equal(getPageTitle("/library/tune-id/reference-media"), "Tune")
  assert.equal(getPageTitle("/learning-lists/list-id"), "List")
  assert.equal(getPageTitle("/review/diary/index"), "Practice diary")
  assert.equal(getPageTitle("/dashboard"), "Account & settings")
})

test("Lists section promotes Public lists beside My lists without changing view routes", () => {
  const sectionNav = readFileSync(new URL("../components/lists/ListsSectionNav.tsx", import.meta.url), "utf8")
  const listsPage = readFileSync(new URL("../app/learning-lists/page.tsx", import.meta.url), "utf8")

  const expectedViews = [
    '["my-lists", "My lists", "/learning-lists?view=my-lists"]',
    '["discover", "Public lists", "/public-lists"]',
    '["saved-shared", "Saved & shared", "/learning-lists?view=saved-shared"]',
    '["learning-queue", "Learning Queue", "/learning-lists?view=learning-queue"]',
    '["unsorted", "Unsorted tunes", "/learning-lists?view=unsorted"]',
  ]

  const positions = expectedViews.map((view) => sectionNav.indexOf(view))
  assert.ok(positions.every((position) => position >= 0))
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
  assert.match(sectionNav, /aria-current=\{activeView === id \? "page" : undefined\}/)
  assert.match(sectionNav, /counts\[id\] !== undefined/)
  assert.doesNotMatch(sectionNav, /"Discover"/)
  assert.match(listsPage, /id: "unsorted",\s+label: "Unsorted tunes"/)
})

test("fixed shell layers reserve safe space and keep 44px navigation targets", () => {
  const dock = readFileSync(new URL("../components/layout/NavigationDock.tsx", import.meta.url), "utf8")
  const rail = readFileSync(new URL("../components/layout/DesktopNav.tsx", import.meta.url), "utf8")
  const shell = readFileSync(new URL("../components/layout/AppShell.tsx", import.meta.url), "utf8")
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

  assert.match(dock, /grid-cols-6/)
  assert.match(dock, /min-h-11 min-w-11/)
  assert.match(dock, /env\(safe-area-inset-bottom\)/)
  assert.match(dock, /md:hidden/)
  assert.match(rail, /md:flex md:flex-col xl:w-48/)
  assert.match(shell, /md:pl-\[var\(--app-rail-width\)\]/)
  assert.match(shell, /SessionDockProvider/)
  assert.match(shell, /SessionDockNavigation/)
  assert.match(css, /--navigation-dock-space:/)
  assert.match(css, /--session-dock-space:/)
})

test("secondary navigation overlays and the Home view is persisted", () => {
  const accountMenu = readFileSync(new URL("../components/layout/AccountMenu.tsx", import.meta.url), "utf8")
  const home = readFileSync(new URL("../components/home/HomeMobileSummarySwitcher.tsx", import.meta.url), "utf8")

  assert.match(accountMenu, /floating-material absolute/)
  assert.match(accountMenu, /Account & settings/)
  assert.match(accountMenu, /Social/)
  assert.doesNotMatch(accountMenu, /label: "Friends"/)
  assert.doesNotMatch(accountMenu, /Compare repertoires/)
  assert.match(accountMenu, /canModerate \?/)
  assert.match(accountMenu, /canAccessDev \?/)
  assert.match(accountMenu, /Practice tools/)
  assert.match(accountMenu, /aria-haspopup="menu"/)
  assert.match(accountMenu, /aria-expanded=\{isPracticeToolsOpen\}/)
  assert.match(accountMenu, /event\.key === "ArrowRight"/)
  assert.match(accountMenu, /event\.key === "ArrowLeft"/)
  assert.match(accountMenu, /aria-current=\{activePracticeHref === item\.href \? "page" : undefined\}/)
  for (const href of ["/review/diary", "/review/foci", "/review/diary/index"]) {
    assert.match(accountMenu, new RegExp(`href: "${href}"`))
  }
  assert.doesNotMatch(accountMenu, /href: "\/review", label: "Practice tools"/)
  assert.match(home, /tunes\.home\.mobile-view/)
  assert.match(home, /useSyncExternalStore/)
})

test("editorial shell distinguishes current navigation and exposes secondary route state", () => {
  const rail = readFileSync(new URL("../components/layout/DesktopNav.tsx", import.meta.url), "utf8")
  const dock = readFileSync(new URL("../components/layout/NavigationDock.tsx", import.meta.url), "utf8")
  const header = readFileSync(new URL("../components/layout/AppHeader.tsx", import.meta.url), "utf8")
  const accountMenu = readFileSync(new URL("../components/layout/AccountMenu.tsx", import.meta.url), "utf8")

  assert.doesNotMatch(rail, /title=\{item\.label\}/)
  assert.doesNotMatch(rail, /data-rail-label/)
  assert.match(rail, /aria-label=\{item\.label\}/)
  assert.match(rail, /group\/rail-item/)
  assert.match(rail, /border-action-primary text-text-primary/)
  assert.match(rail, /hover:bg-surface-note\/50/)
  assert.doesNotMatch(rail, /border-action-primary bg-surface-note\/60/)

  assert.doesNotMatch(dock, /floating-material/)
  assert.doesNotMatch(header, /floating-material/)
  assert.match(dock, /bg-surface-canvas/)
  assert.match(header, /bg-surface-canvas/)

  assert.match(accountMenu, /function menuLinkIsActive/)
  assert.match(accountMenu, /aria-current=\{isActive \? "page" : undefined\}/)
  assert.match(accountMenu, /"border-l-2"/)
  assert.match(accountMenu, /border-action-primary bg-surface-note\/50/)
  assert.match(accountMenu, /font-sans text-sm font-bold/)
  assert.doesNotMatch(accountMenu, /uppercase tracking-\[0\.14em\]/)
})

test("mobile destination switchers sit below the shell header and keep page headings visible", () => {
  const switcher = readFileSync(new URL("../components/ui/MobileViewSwitcher.tsx", import.meta.url), "utf8")
  const panels = readFileSync(new URL("../components/layout/ResponsivePanels.tsx", import.meta.url), "utf8")
  const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
  const home = readFileSync(new URL("../components/home/HomeMobileSummarySwitcher.tsx", import.meta.url), "utf8")
  const lists = readFileSync(new URL("../app/learning-lists/page.tsx", import.meta.url), "utf8")
  const listNav = readFileSync(new URL("../components/lists/ListsSectionNav.tsx", import.meta.url), "utf8")
  const friends = readFileSync(new URL("../app/friends/page.tsx", import.meta.url), "utf8")
  const friendsSwitcher = readFileSync(new URL("../components/friends/FriendsMobileSwitcher.tsx", import.meta.url), "utf8")
  const compare = readFileSync(new URL("../components/compare/CompareMobile.tsx", import.meta.url), "utf8")
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

  assert.match(switcher, /sticky top-14 z-\[300\]/)
  assert.match(switcher, /border-b border-hairline/)
  assert.match(switcher, /label && showLabel/)
  assert.match(panels, /scroll-mt-28/)
  assert.match(css, /padding-bottom: calc\(var\(--navigation-dock-space\) \+ var\(--session-dock-space\)\)/)
  assert.match(css, /scroll-margin-block: 4rem calc\(var\(--navigation-dock-space\) \+ var\(--session-dock-space\)\)/)

  for (const page of [homePage, lists, friends]) {
    assert.match(page, /pb-5 pt-0/)
  }
  assert.match(home, /showSwitcherLabel=\{false\}/)
  assert.match(friendsSwitcher, /showSwitcherLabel=\{false\}/)
  assert.match(listNav, /sticky top-14 z-\[300\]/)
  assert.match(lists, /<PageHeader title="Lists"/)
  assert.match(lists, /<div className="hidden md:block">/)
  assert.match(friends, /<PageHeader title="Social"/)
  assert.match(compare, /font-sans text-4xl[^"]*">Compare/)
})
