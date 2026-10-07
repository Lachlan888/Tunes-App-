import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const desktopNav = readFileSync(
  new URL("../components/layout/DesktopNav.tsx", import.meta.url),
  "utf8"
)
const internalShell = readFileSync(
  new URL("../components/layout/InternalShell.tsx", import.meta.url),
  "utf8"
)
const preview = readFileSync(
  new URL("../app/dev/festivals/page.tsx", import.meta.url),
  "utf8"
)
const manager = readFileSync(
  new URL("../components/dev/FestivalManager.tsx", import.meta.url),
  "utf8"
)
const mode = readFileSync(
  new URL("../components/dev/FestivalModeControl.tsx", import.meta.url),
  "utf8"
)
const navLoader = readFileSync(
  new URL("../lib/loaders/nav.ts", import.meta.url),
  "utf8"
)

test("the consumer sidebar exposes festival management without changing primary destinations", () => {
  assert.match(desktopNav, /canManageFestivals \? \([\s\S]*?href="\/dev\/festivals"/)
  assert.match(desktopNav, /Festival management/)
  assert.match(desktopNav, /Icon name="stage"/)
  assert.match(internalShell, /canManageFestivals \? \[\{ href: "\/dev\/festivals", label: "Festival management"/)
  assert.match(navLoader, /canManageFestivals: appAdminRole === "owner"/)
})

test("the festival sidebar target is a private dynamic foundation preview", () => {
  assert.match(preview, /export const dynamic = "force-dynamic"/)
  assert.match(preview, /loadFestivalOwnerFoundation\(\)/)
  assert.match(preview, /Festival mode/)
  assert.match(preview, /Owner-only editing and preview/)
  assert.match(manager, /Selecting this festival does not turn Festival mode on/)
  assert.match(mode, /Select a published festival in Manage festivals to turn this on/)
  assert.match(preview, /<FestivalManager[\s\S]*?settings={settings}[\s\S]*?festivals={festivals}/)
  assert.doesNotMatch(preview, /createFestivalHub|updateFestivalSettings/)
})
