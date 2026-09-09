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

test("fixed shell layers reserve safe space and keep 44px navigation targets", () => {
  const dock = readFileSync(new URL("../components/layout/NavigationDock.tsx", import.meta.url), "utf8")
  const rail = readFileSync(new URL("../components/layout/DesktopNav.tsx", import.meta.url), "utf8")
  const shell = readFileSync(new URL("../components/layout/AppShell.tsx", import.meta.url), "utf8")
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

  assert.match(dock, /grid-cols-6/)
  assert.match(dock, /min-h-11 min-w-11/)
  assert.match(dock, /env\(safe-area-inset-bottom\)/)
  assert.match(dock, /md:hidden/)
  assert.match(rail, /md:flex md:flex-col lg:w-60/)
  assert.match(shell, /md:pl-\[4\.75rem\] lg:pl-60/)
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
  assert.match(accountMenu, /Friends/)
  assert.doesNotMatch(accountMenu, /Compare repertoires/)
  assert.match(accountMenu, /canModerate \?/)
  assert.match(accountMenu, /canAccessDev \?/)
  assert.match(home, /tunes\.home\.mobile-view/)
  assert.match(home, /useSyncExternalStore/)
})
