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

test("the consumer sidebar exposes an owner/dev festival preview without changing primary destinations", () => {
  assert.match(desktopNav, /canAccessDev \? \([\s\S]*?href="\/dev\/festivals"/)
  assert.match(desktopNav, /Festival hub preview/)
  assert.match(desktopNav, /Icon name="stage"/)
  assert.match(internalShell, /href: "\/dev\/festivals", label: "Festival hub"/)
})

test("the festival sidebar target is a private dynamic foundation preview", () => {
  assert.match(preview, /export const dynamic = "force-dynamic"/)
  assert.match(preview, /loadFestivalOwnerFoundation\(\)/)
  assert.match(preview, /Festival mode/)
  assert.match(preview, /Owner-only editing and private preview/)
  assert.match(preview, /New hubs remain Draft until explicitly published/)
  assert.match(preview, /<FestivalManager[\s\S]*?settings={settings}[\s\S]*?festivals={festivals}/)
  assert.doesNotMatch(preview, /createFestivalHub|updateFestivalSettings/)
})
