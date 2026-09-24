import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

function load(path: string, dependencies: Record<string, unknown>, suffix = "") {
  const code = ts.transpileModule(readFileSync(path, "utf8") + suffix, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} as Record<string, (...args: unknown[]) => unknown> }
  new Function("require", "module", "exports", code)((id: string) => {
    if (id in dependencies) return dependencies[id]
    if (id === "react" || id === "react/jsx-runtime") return require(id)
    throw new Error(`Unexpected dependency: ${id}`)
  }, loadedModule, loadedModule.exports)
  return loadedModule.exports
}

const streakComponent = load("components/practice/StreakSummarySection.tsx", {}).default
const Home = load("components/home/HomeMobileSummarySwitcher.tsx", {
  "@/lib/browser-storage": { preferenceStorage: {} },
  "next/link": { default: ({ children, ...props }: { children: unknown; href?: string }) => React.createElement("a", props, children), __esModule: true },
  "@/components/activity/SocialActivityFeed": { default: () => null, __esModule: true },
  "@/components/practice/StreakSummarySection": { default: streakComponent, __esModule: true },
  "@/components/layout/ResponsivePanels": { default: ({ panels }: { panels: { id: string; content: unknown }[] }) => React.createElement("div", null, panels.map((panel) => React.createElement("section", { key: panel.id, "data-panel": panel.id }, panel.content))), __esModule: true },
  "@/components/ui/buttonStyles": { buttonStyles: { primary: "", text: "" } },
}).default

for (const [scenario, current, best] of [["populated", 4, 9], ["new user", 0, 0], ["broken streak", 0, 9]] as const) {
  test(`Home places one authoritative streak summary in Repertoire: ${scenario}`, () => {
    const html = renderToStaticMarkup(React.createElement(Home, {
      summary: { dueTodayPreview: [], inPracticePreview: [], learningQueuePreview: [], dueTodayCount: 0, needsAttentionCount: 0, knownCount: 0, practiceCount: 0, listCount: 0, badgeSummary: { receivedCount: 0 } },
      streakSummary: { current_revision_streak: current, longest_revision_streak: best, current_practice_streak: current, longest_practice_streak: best },
      recentFriendActivity: [], activityNextCursor: null, density: "standard",
    }))
    assert.equal((html.match(/>Streaks</g) ?? []).length, 1)
    assert.ok(html.indexOf('data-panel="repertoire"') < html.indexOf('>Streaks<'))
    assert.ok(html.indexOf('>Streaks<') < html.indexOf('data-panel="social"'))
    assert.doesNotMatch(html, /Practice schedule &amp; recognition|next scheduled tunes/)
    assert.equal((html.match(new RegExp(`>Best ${best}<`, "g")) ?? []).length, 2)
    assert.equal((html.slice(html.indexOf(">Streaks<")).match(new RegExp(`>${current}</p>`, "g")) ?? []).length, 2)
    assert.match(html, /href="\/review"/)
  })
}

const loader = load("lib/loaders/homepage.ts", {
  "@/lib/loaders/friends": {}, "@/lib/review": {}, "@/lib/streaks": {},
  "@/lib/auth/session": {}, "@/lib/server-timing": {}, "@/lib/supabase/server": {},
}, "\nexport { loadHomeBadgeSummary };\n").loadHomeBadgeSummary

test("Home badge reads retain user filters and exact counts without preview reads", async () => {
  const reads: Record<string, unknown>[] = []
  const db = { from(table: string) {
    const read: Record<string, unknown> = { table }; reads.push(read)
    return { select(columns: string, options: unknown) {
      Object.assign(read, { columns, options })
      return { eq(column: string, userId: string) {
        Object.assign(read, { column, userId })
        return Promise.resolve({ count: table === "badges" ? 2 : 3, error: null })
      } }
    } }
  } }
  const summary = await loader({ supabase: db, userId: "fixture-owner" })
  assert.deepEqual(summary, { receivedCount: 3, createdCount: 2, recentReceivedBadges: [], recentCreatedBadges: [] })
  assert.deepEqual(reads, [
    { table: "badge_awards", columns: "id", options: { count: "exact", head: true }, column: "recipient_user_id", userId: "fixture-owner" },
    { table: "badges", columns: "id", options: { count: "exact", head: true }, column: "owner_user_id", userId: "fixture-owner" },
  ])
})

test("Home badge count failures remain visible", async () => {
  const db = { from() { return { select() { return { eq() { return Promise.resolve({ count: null, error: { message: "fixture read failure" } }) } } } } } }
  await assert.rejects(async () => { await loader({ supabase: db, userId: "fixture-owner" }) }, /fixture read failure/)
})
