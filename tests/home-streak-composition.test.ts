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
  "@/lib/review": {
    formatPracticeDate: (value: string | null | undefined) => value?.slice(0, 10) ?? null,
    getReviewIntervalDays: () => 1,
  },
}).default

for (const [scenario, current, best] of [["populated", 4, 9], ["new user", 0, 0], ["broken streak", 0, 9]] as const) {
  test(`Home places one authoritative streak summary in Repertoire: ${scenario}`, () => {
    const html = renderToStaticMarkup(React.createElement(Home, {
      summary: { dueTodayPreview: [], inPracticePreview: [], learningQueuePreview: [], dueTodayCount: 0, needsAttentionCount: 0, knownCount: 0, practiceCount: 0, learningQueueCount: 0, listCount: 0, badgeSummary: { receivedCount: 0 } },
      streakSummary: { current_revision_streak: current, longest_revision_streak: best, current_practice_streak: current, longest_practice_streak: best },
      recentFriendActivity: [], activityNextCursor: null, density: "standard",
    }))
    assert.equal((html.match(/>Streaks</g) ?? []).length, current || best ? 1 : 0)
    if (current || best) {
      assert.ok(html.indexOf('data-panel="repertoire"') < html.indexOf('>Streaks<'))
      assert.ok(html.indexOf('>Streaks<') < html.indexOf('data-panel="social"'))
    }
    assert.doesNotMatch(html, /Practice schedule &amp; recognition|next scheduled tunes/)
    if (current || best) {
      assert.equal((html.match(new RegExp(`>Best ${best}<`, "g")) ?? []).length, 2)
      assert.equal((html.slice(html.indexOf(">Streaks<")).match(new RegExp(`>${current}</p>`, "g")) ?? []).length, 2)
    }
    assert.match(html, /href="\/library"[^>]*>Find a tune/)
    assert.match(html, /href="\/learning-lists\?view=learning-queue"/)
    assert.match(html, /href="\/library\/practice"/)
    assert.match(html, /href="\/library\/known"/)
  })
}

const emptySummary = {
  dueTodayPreview: [], inPracticePreview: [], learningQueuePreview: [],
  dueTodayCount: 0, needsAttentionCount: 0, knownCount: 0,
  practiceCount: 0, learningQueueCount: 0, listCount: 0,
  badgeSummary: { receivedCount: 0 },
}

function todayMarkup(summary: Record<string, unknown>) {
  const html = renderToStaticMarkup(React.createElement(Home, {
    summary: { ...emptySummary, ...summary },
    streakSummary: { current_revision_streak: 0, longest_revision_streak: 0, current_practice_streak: 0, longest_practice_streak: 0 },
    recentFriendActivity: [], activityNextCursor: null, density: "standard",
  }))
  return html.slice(html.indexOf('data-panel="today"'), html.indexOf('data-panel="repertoire"'))
}

test("Home sends a new player to find a tune, not an empty practice room", () => {
  const html = todayMarkup({})
  assert.match(html, /Find a tune/)
  assert.match(html, /href="\/library"/)
  assert.doesNotMatch(html, /Start Practice|No more tunes are due today/)
})

test("Home gives an empty repertoire one diagnosis while retaining destination links", () => {
  const html = renderToStaticMarkup(React.createElement(Home, {
    summary: emptySummary,
    streakSummary: { current_revision_streak: 0, longest_revision_streak: 0, current_practice_streak: 0, longest_practice_streak: 0 },
    recentFriendActivity: [], activityNextCursor: null, density: "standard",
  }))
  const repertoire = html.slice(html.indexOf('data-panel="repertoire"'), html.indexOf('data-panel="social"'))
  assert.match(repertoire, /href="\/library\/known"/)
  assert.match(repertoire, /href="\/library\/practice"/)
  assert.match(repertoire, /href="\/learning-lists\?view=learning-queue"/)
  assert.match(repertoire, /href="\/badges"/)
  assert.match(repertoire, /href="\/library"/)
  assert.doesNotMatch(repertoire, /No tunes are currently|0 tunes marked Known|No recent/)
})

test("Home makes due and overdue work one clear Practice action", () => {
  const due = todayMarkup({ dueTodayCount: 2, needsAttentionCount: 3, practiceCount: 5,
    dueTodayPreview: [{ piece_id: 1, user_piece_id: 1, title: "The Silver Spear", stage: 3, nextReviewDue: "2026-10-05" }] })
  assert.match(due, /5 tunes ready/)
  assert.match(due, /href="\/review"[^>]*>Continue Practice/)
  assert.doesNotMatch(due, /No more tunes are due today/)

  const overdue = todayMarkup({ needsAttentionCount: 3, practiceCount: 3,
    inPracticePreview: [{ piece_id: 2, user_piece_id: 2, title: "The Banshee", stage: 4, nextReviewDue: "2026-10-01" }] })
  assert.match(overdue, /3 overdue tunes/)
  assert.match(overdue, /href="\/review"[^>]*>Catch up on Practice/)
  assert.doesNotMatch(overdue, /No more tunes are due today/)
  assert.doesNotMatch(overdue, />Due today<\/p><p[^>]*>0<\/p>/)
})

test("Home sends caught-up players to repertoire without implying review work", () => {
  const html = todayMarkup({ knownCount: 2, practiceCount: 1,
    inPracticePreview: [{ piece_id: 3, user_piece_id: 3, title: "Cooley’s", stage: 2, nextReviewDue: "2026-10-08" }] })
  assert.match(html, /You’re caught up/)
  assert.match(html, /href="\/library\/practice"/)
  assert.doesNotMatch(html, /Start Practice|No more tunes are due today/)
})

test("Home repertoire gives adjacent sections one boundary instead of a stat-grid closing rule", () => {
  const html = renderToStaticMarkup(React.createElement(Home, {
    summary: { ...emptySummary, knownCount: 2, practiceCount: 1, learningQueueCount: 1 },
    streakSummary: { current_revision_streak: 0, longest_revision_streak: 0, current_practice_streak: 0, longest_practice_streak: 0 },
    recentFriendActivity: [], activityNextCursor: null, density: "standard",
  }))
  const repertoire = html.slice(html.indexOf('data-panel="repertoire"'), html.indexOf('data-panel="social"'))
  const gridClasses = repertoire.match(/<div class="([^"]*)"><a href="\/library\/known"/)?.[1]
  assert.ok(gridClasses, "the repertoire count grid should render")
  assert.doesNotMatch(gridClasses, /\bborder-[by]\b/, "the count grid should not close an adjacent section")
  const beforeQueue = repertoire.slice(0, repertoire.indexOf("Learning queue"))
  const queueSectionClasses = [...beforeQueue.matchAll(/<section class="([^"]*)"/g)].at(-1)?.[1]
  assert.match(queueSectionClasses ?? "", /\bborder-t\b/, "the next section should own the single boundary")
})

test("Getting Started keeps task links without a competing next-action panel", () => {
  const GettingStarted = load("components/home/GettingStartedSection.tsx", {
    "@/components/PendingLinkButton": { default: ({ href, label }: { href: string; label: string }) => React.createElement("a", { href }, label), __esModule: true },
  }).default
  const task = { id: "add_tunes", group: "Repertoire setup", label: "Import or add tunes", description: "Add a tune", href: "/library", actionLabel: "Find tunes", pendingLabel: "Opening", isComplete: false }
  const html = renderToStaticMarkup(React.createElement(GettingStarted, {
    state: { shouldShow: true, completedCount: 0, totalCount: 1, nextTask: task, tasks: [task] },
  }))
  assert.match(html, /href="\/library"/)
  assert.equal((html.match(/Find tunes/g) ?? []).length, 1)
  assert.doesNotMatch(html, /Next step|Progress:/)
})

const loader = load("lib/loaders/homepage.ts", {
  "@/lib/loaders/friends": {}, "@/lib/review": {}, "@/lib/streaks": {},
  "@/lib/auth/session": {}, "@/lib/server-timing": {}, "@/lib/supabase/server": {},
}, "\nexport { loadHomeBadgeSummary };\n").loadHomeBadgeSummary

const buildGettingStartedState = load("lib/loaders/homepage.ts", {
  "@/lib/loaders/friends": {}, "@/lib/review": {}, "@/lib/streaks": {},
  "@/lib/auth/session": {}, "@/lib/server-timing": {}, "@/lib/supabase/server": {},
}, "\nexport { buildGettingStartedState };\n").buildGettingStartedState as (options: {
  profile: { username: string; display_name: string }
  instrumentCount: number
  practiceCount: number
  knownCount: number
  listCount: number
  dueTodayCount: number
  needsAttentionCount: number
  reviewEventCount: number
}) => { tasks: { id: string; isComplete: boolean }[] }

test("Getting Started keeps practice pending while overdue tunes remain", () => {
  const state = buildGettingStartedState({
    profile: { username: "player", display_name: "Player" },
    instrumentCount: 1,
    practiceCount: 2,
    knownCount: 1,
    listCount: 1,
    dueTodayCount: 0,
    needsAttentionCount: 2,
    reviewEventCount: 1,
  })
  const finishToday = state.tasks.find((task: { id: string }) => task.id === "finish_today")
  assert.equal(finishToday?.isComplete, false)
})

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
