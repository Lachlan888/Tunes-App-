import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

export const widths = [390, 430, 768, 1024, 1440]
const indexRoutes = ["/", "/library", "/library/known", "/library/practice", "/review", "/review?session=due-today", "/review?session=catch-up", "/learning-lists", "/learning-lists?view=learning-queue", "/public-lists", "/setlists", "/compare", "/review/diary", "/review/diary?view=week", "/review/diary?view=month", "/review/foci", "/review/diary/index", "/trends", "/friends", "/inbox", "/inbox?tab=messages", "/badges", "/dashboard"]

/** Run against an already authenticated, local-only Playwright Page. No writes/sign-in/storage export. */
export async function verifyResponsiveWorkbench(page, { baseURL = "http://localhost:3000", outputDir = "/private/tmp/tunes-p17-matrix" } = {}) {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname), "Only a local Tunes server may be tested")
  await mkdir(outputDir, { recursive: true })
  const results = []
  const discovered = new Set(indexRoutes)
  const errors = []
  const recordError = error => errors.push(error.message)
  page.on("pageerror", recordError)
  try {
    for (const route of discovered) {
      await page.goto(new URL(route, baseURL).href)
      await page.locator("main h1, main h2").first().waitFor()
      await page.locator('main [role="status"]').filter({ hasText: /^Loading / }).first().waitFor({ state: "hidden" })
      assert.notEqual(new URL(page.url()).pathname, "/login", "An existing signed-in test session is required")
      // Discover one real record per major detail surface; never invent database identifiers.
      if (indexRoutes.includes(route)) {
        const links = await page.locator("main a[href]").evaluateAll(nodes => nodes.map(node => node.getAttribute("href")))
        for (const prefix of ["/library/", "/learning-lists/", "/public-lists/", "/setlists/", "/users/", "/badges/", "/trends/"]) {
          if (Array.from(discovered).some(value => value.startsWith(prefix) && !indexRoutes.includes(value))) continue
          const detail = links.find(href => href && new RegExp(`^${prefix}(?:\\d+|[a-zA-Z0-9_-]+)$`).test(href) && !indexRoutes.includes(href) && !href.endsWith("/new"))
          if (!detail) continue
          discovered.add(detail)
          if (prefix === "/library/") {
            discovered.add(`${detail}?view=reference`)
            discovered.add(`${detail}?view=about`)
            discovered.add(`${detail}/reference-media`)
          }
          if (prefix === "/learning-lists/" || prefix === "/setlists/") discovered.add(`${detail}?mode=manage`)
          if (prefix === "/setlists/") discovered.add(`${detail}?mode=performance`)
        }
      }
      for (const width of widths) {
        await page.setViewportSize({ width, height: 1000 })
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const state = await page.evaluate(() => {
          const visible = node => Boolean(node.getClientRects().length)
          const navs = Array.from(document.querySelectorAll('nav[aria-label="Primary navigation"]')).filter(visible)
          const ids = Array.from(document.querySelectorAll("[id]")).map(node => node.id)
          const panelIds = Array.from(document.querySelectorAll("[data-workbench-panel]")).map(node => node.dataset.workbenchPanel)
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            navCount: navs.length,
            focusMode: document.documentElement.dataset.focusMode === "practice",
            duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
            duplicatePanels: panelIds.filter((id, index) => panelIds.indexOf(id) !== index),
            panelCount: document.querySelectorAll("[data-workbench-panel]").length,
          }
        })
        assert.equal(state.overflow, false, `${route} overflows at ${width}px`)
        assert.deepEqual(state.duplicateIds, [], `${route} duplicates DOM IDs at ${width}px`)
        assert.deepEqual(state.duplicatePanels, [], `${route} duplicates responsive panels`)
        assert.equal(state.navCount, state.focusMode ? 0 : 1, `${route} exposes duplicate or missing navigation`)
        const screenshot = `${results.length.toString().padStart(3, "0")}-${width}.png`
        await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true })
        results.push({ route, width, screenshot, ...state })
      }
      // Keep completed routes reviewable if a long matrix run is interrupted.
      await writeFile(path.join(outputDir, "matrix.json"), JSON.stringify({ results, errors }, null, 2))
    }

    await page.goto(new URL("/", baseURL).href)
    await page.setViewportSize({ width: 390, height: 844 })
    const homeTabs = page.getByRole("tablist", { name: "Home views" })
    await homeTabs.getByRole("tab", { name: "Today", exact: true }).click()
    await page.keyboard.press("ArrowRight")
    assert.equal(await homeTabs.getByRole("tab", { name: "Repertoire", exact: true }).getAttribute("aria-selected"), "true")
    assert.equal(await page.locator('[data-workbench-panel="today"]').isVisible(), false)
    await page.setViewportSize({ width: 1440, height: 1000 })
    assert.equal(await page.locator('[data-workbench-panel="today"]').isVisible(), true)
    const socialLink = page.locator('[data-workbench-panel="social"] a').first()
    await socialLink.focus()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForFunction(() => document.querySelector('[data-workbench-panel="social"]')?.getAttribute("data-active") === "true")
    assert.equal(await socialLink.evaluate(node => node === document.activeElement), true, "Resize must retain the focused panel")

    await page.goto(new URL("/library", baseURL).href)
    await page.setViewportSize({ width: 1440, height: 1000 })
    const preview = page.getByRole("button", { name: /^Preview / }).first()
    await preview.click()
    await page.locator("#catalogue-preview-title").waitFor()
    assert.equal(await page.locator("#catalogue-preview-title").evaluate(node => node === document.activeElement), true)
    await page.setViewportSize({ width: 430, height: 844 })
    assert.equal(await page.locator(".catalogue-preview").isVisible(), true)
    await page.keyboard.press("Escape")
    assert.equal(await preview.evaluate(node => node === document.activeElement), true, "Closing preview restores its trigger")

    // Account-menu contents disappear when the shell changes; focus must stay visible.
    await page.setViewportSize({ width: 768, height: 1000 })
    await page.getByRole("button", { name: "Open account menu", exact: true }).press("Enter")
    await page.getByRole("menuitem", { name: "Account & settings", exact: true }).focus()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole("menu", { name: "Account and secondary navigation" }).waitFor({ state: "hidden" })
    assert.equal(await page.evaluate(() => document.activeElement !== document.body && Boolean(document.activeElement?.getClientRects().length)), true, "Account-menu resize retains visible keyboard focus")
    // Opening an existing friend's comparison is URL-only navigation. No invitation or write.
    await page.goto(new URL("/compare", baseURL).href)
    await page.getByRole("button", { name: "Add person", exact: true }).waitFor()
    const addPerson = page.getByRole("button", { name: "Add person", exact: true })
    await addPerson.click()
    const addDialog = page.getByRole("dialog", { name: "Add person to compare" })
    const close = addDialog.getByRole("button", { name: "Close", exact: true })
    await close.focus()
    await page.keyboard.press("Shift+Tab")
    assert.equal(await addDialog.evaluate(node => node.contains(document.activeElement)), true, "Compare drawer traps reverse Tab")
    await page.setViewportSize({ width: 768, height: 430 })
    assert.equal(await addDialog.evaluate(node => node.getBoundingClientRect().height <= innerHeight), true, "Compare drawer fits landscape")
    await page.keyboard.press("Escape")
    assert.equal(await addPerson.evaluate(node => node === document.activeElement), true, "Compare drawer restores its trigger")

    // Once loaded, a breakpoint change must not reload the collection or route payload.
    await page.goto(new URL("/library", baseURL).href)
    await page.getByRole("region", { name: "Tune catalogue results", exact: true }).waitFor()
    await page.waitForLoadState("networkidle")
    const resizeRequests = []
    const onResizeRequest = request => {
      if (["fetch", "xhr"].includes(request.resourceType()) && new URL(request.url()).origin === new URL(baseURL).origin) resizeRequests.push(request.url())
    }
    page.on("request", onResizeRequest)
    try {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 1000 })
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      }
      await page.waitForTimeout(250)
      assert.deepEqual(resizeRequests, [], "Resizing must not issue duplicate collection/data requests")
    } finally {
      page.off("request", onResizeRequest)
    }
    assert.deepEqual(errors, [], "Browser runtime errors")
  } finally {
    page.off("pageerror", recordError)
    await writeFile(path.join(outputDir, "matrix.json"), JSON.stringify({ results, errors }, null, 2))
    await writeFile(path.join(outputDir, "index.html"), `<!doctype html><meta charset="utf-8"><title>Tunes responsive matrix</title><style>body{font:16px system-ui;margin:2rem}article{margin:2rem 0}img{max-width:100%;border:1px solid #aaa}</style><h1>Tunes responsive matrix</h1>${results.map(result => `<article><h2>${result.route.replaceAll("&", "&amp;").replaceAll("<", "&lt;")} · ${result.width}px</h2><a href="${result.screenshot}"><img loading="lazy" src="${result.screenshot}" alt="Route screenshot"></a></article>`).join("")}`)
  }
  return results
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.ok(process.env.TUNES_BROWSER_CDP, "Provide an existing local, authenticated test browser via TUNES_BROWSER_CDP; do not export credentials")
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(process.env.TUNES_BROWSER_CDP).hostname), "CDP endpoint must be local")
  const { chromium } = await import(process.env.TUNES_PLAYWRIGHT_MODULE || "playwright")
  const browser = await chromium.connectOverCDP(process.env.TUNES_BROWSER_CDP)
  const context = browser.contexts()[0]
  const page = await context.newPage()
  try {
    const results = await verifyResponsiveWorkbench(page, { baseURL: process.env.TUNES_TEST_URL, outputDir: process.env.TUNES_SCREENSHOT_DIR })
    console.log(`Verified ${results.length} route/viewport combinations`)
  } finally {
    await page.close()
    await browser.close()
  }
}
