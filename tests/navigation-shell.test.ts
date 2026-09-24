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
  assert.match(home, /tunes\.home\.mobile-view/)
  assert.match(home, /useSyncExternalStore/)
})
