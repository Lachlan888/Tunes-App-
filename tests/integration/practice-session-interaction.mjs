// Run with JSDOM_MODULE=/absolute/path/to/jsdom/lib/api.js node tests/integration/practice-session-interaction.mjs
// Server actions are replaced at the network boundary; the actual session component and React state run in jsdom.
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const { JSDOM } = await import(process.env.JSDOM_MODULE)
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "http://localhost/review?session=ready&run=test" })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.BeforeUnloadEvent = dom.window.BeforeUnloadEvent
globalThis.IS_REACT_ACT_ENVIRONMENT = true
window.scrollTo = () => {}
window.setTimeout = (callback) => setTimeout(callback, 0)

const React = require("react")
const { act } = React
const { createRoot } = require("react-dom/client")
const practiceSession = await import("../../lib/practice-session.ts")
const review = await import("../../lib/review.ts")
const storageValues = new Map()
const storage = {
  getItem: (key) => storageValues.get(key) ?? null,
  setItem: (key, value) => storageValues.set(key, value),
  removeItem: (key) => storageValues.delete(key),
}
let saveReview = async () => ({ ok: true, applied: true, movedToKnown: false })

const file = readFileSync(fileURLToPath(new URL("../../components/practice/FocusedPracticeSession.tsx", import.meta.url)), "utf8")
const compiled = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
const loaded = { exports: {} }
const replacements = {
  react: React,
  "react/jsx-runtime": require("react/jsx-runtime"),
  "next/navigation": { usePathname: () => "/review", useSearchParams: () => new URLSearchParams("session=ready&run=test") },
  "@/components/resilience/PrivateSessionProvider": { usePrivateSessionStorage: () => storage },
  "@/hooks/useOnlineStatus": { useOnlineStatus: () => true },
  "@/components/practice/FocusModeShell": { default: ({ children }) => React.createElement("main", null, children) },
  "@/components/practice/PracticeSessionSummary": null,
  "@/components/reference-media/PracticeReferencePlayer": { default: () => React.createElement("div", { "data-reference-player": true }, "Reference") },
  "@/components/ui/Icon": { default: () => null },
  "@/lib/actions/reviews": { completeFormalReviewInPlace: (form) => saveReview(form) },
  "@/lib/actions/practice-session": { loadNextPracticeBatch: async () => ({ ok: true, items: [], total: 0 }) },
  "@/lib/practice-session": practiceSession,
  "@/lib/review": review,
}
const summaryFile = readFileSync(fileURLToPath(new URL("../../components/practice/PracticeSessionSummary.tsx", import.meta.url)), "utf8")
const summaryCompiled = ts.transpileModule(summaryFile, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
const summaryLoaded = { exports: {} }
new Function("require", "module", "exports", summaryCompiled)((id) => {
  if (id === "next/link") return { default: ({ href, onClick, children, className }) => React.createElement("a", { href, onClick: (event) => { event.preventDefault(); onClick?.(event) }, className }, children) }
  if (id === "@/components/ui/buttonStyles") return { buttonStyles: { text: "text-link" } }
  if (!(id in replacements) || replacements[id] === null) throw new Error(`Unexpected summary import: ${id}`)
  return replacements[id]
}, summaryLoaded, summaryLoaded.exports)
replacements["@/components/practice/PracticeSessionSummary"] = summaryLoaded.exports
new Function("require", "module", "exports", compiled)((id) => {
  if (!(id in replacements)) throw new Error(`Unexpected import: ${id}`)
  return replacements[id]
}, loaded, loaded.exports)
const FocusedPracticeSession = loaded.exports.default

function item(id, title) {
  return { id, piece_id: id + 100, stage: 3, next_review_due: "2026-10-06", piece: { title, key: "D", style: "Reel", time_signature: "4/4" }, media_bundle: null }
}

async function flush() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 15)) })
}

async function click(label) {
  const button = [...document.querySelectorAll("button, a")].find((element) => element.textContent.includes(label))
  assert.ok(button, `Missing ${label} button`)
  await act(async () => { button.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })) })
  await flush()
}

const root = createRoot(document.getElementById("root"))
const savedKeys = []
saveReview = async (form) => {
  savedKeys.push(form.get("reviewSubmissionKey"))
  return { ok: true, applied: true, movedToKnown: false }
}
await act(async () => root.render(React.createElement(FocusedPracticeSession, {
  lane: "ready", initialQueue: [item(1, "First tune"), item(2, "Second tune")], queueTotal: 2,
  sessionDate: "2026-10-06", practiceDiaryEnabled: true,
})))
assert.match(document.body.textContent, /First tune/)
await click("Solid")
assert.match(document.body.textContent, /Second tune/)
assert.equal(savedKeys.length, 1)
await click("Rough")
assert.match(document.body.textContent, /2 tunes practised/)
assert.match(document.body.textContent, /Add a diary entry/)
assert.equal(savedKeys.length, 2)
assert.ok(storageValues.has("tunes.session.v2.practice.2026-10-06.ready.test.results"))
await click("Not now")
assert.doesNotMatch(document.body.textContent, /Add a diary entry/)
await click("Done")
assert.equal(storageValues.has("tunes.session.v2.practice.2026-10-06.ready.test.results"), false)

await act(async () => root.unmount())
storageValues.clear()
const retryRoot = createRoot(document.getElementById("root"))
const retryKeys = []
saveReview = async (form) => {
  retryKeys.push(form.get("reviewSubmissionKey"))
  return retryKeys.length === 1 ? { ok: false, error: "Couldn’t save that rating." } : { ok: true, applied: true, movedToKnown: false }
}
await act(async () => retryRoot.render(React.createElement(FocusedPracticeSession, {
  lane: "ready", initialQueue: [item(3, "Retry tune")], queueTotal: 1,
  sessionDate: "2026-10-06", practiceDiaryEnabled: false,
})))
await click("Shaky")
assert.match(document.body.textContent, /Couldn’t save that rating/)
assert.match(document.body.textContent, /Retry saving/)
await click("Retry saving")
assert.match(document.body.textContent, /1 tune practised/)
assert.doesNotMatch(document.body.textContent, /Add a diary entry/)
assert.equal(retryKeys[0], retryKeys[1], "retry must reuse the same idempotency key")
await act(async () => retryRoot.unmount())

storageValues.clear()
saveReview = async () => ({ ok: true, applied: true, movedToKnown: false })
const interruptedRoot = createRoot(document.getElementById("root"))
await act(async () => interruptedRoot.render(React.createElement(FocusedPracticeSession, {
  lane: "ready", initialQueue: [item(4, "Before pause"), item(5, "After pause")], queueTotal: 2,
  sessionDate: "2026-10-06", practiceDiaryEnabled: false,
})))
await click("Solid")
assert.match(document.body.textContent, /After pause/)
assert.ok(storageValues.has(practiceSession.ACTIVE_PRACTICE_SESSION_KEY))
await act(async () => interruptedRoot.unmount())

const resumedRoot = createRoot(document.getElementById("root"))
await act(async () => resumedRoot.render(React.createElement(FocusedPracticeSession, {
  lane: "ready", initialQueue: [item(5, "After pause")], queueTotal: 1,
  sessionDate: "2026-10-06", practiceDiaryEnabled: false,
})))
assert.match(document.body.textContent, /After pause/)
await click("Shaky")
assert.match(document.body.textContent, /2 tunes practised/)
await act(async () => resumedRoot.unmount())

window.matchMedia = () => ({ addEventListener() {}, removeEventListener() {} })
let queryStatus = "added"
const shellFile = readFileSync(fileURLToPath(new URL("../../components/layout/AppShell.tsx", import.meta.url)), "utf8")
const shellCompiled = ts.transpileModule(shellFile, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
const shellLoaded = { exports: {} }
const Empty = () => null
const PassThrough = ({ children }) => React.createElement(React.Fragment, null, children)
new Function("require", "module", "exports", shellCompiled)((id) => {
  if (id === "next/navigation") return { usePathname: () => "/library", useSearchParams: () => new URLSearchParams(`practice_enrolment=${queryStatus}`) }
  if (id === "@/components/layout/navItems") return { getPageTitle: () => "Tunes", getShellKind: () => "consumer" }
  if (id === "@/lib/practice-session") return practiceSession
  if (id === "@/components/session-dock/SessionDockProvider") return { default: PassThrough, SessionDockNavigation: PassThrough }
  if (id === "@/components/feedback/FloatingFeedbackButton") return { default: () => React.createElement("button", null, "Feedback") }
  if (id === "react") return React
  if (id === "react/jsx-runtime") return require("react/jsx-runtime")
  if (id.startsWith("@/components/")) return { default: Empty }
  throw new Error(`Unexpected shell import: ${id}`)
}, shellLoaded, shellLoaded.exports)
const AppShell = shellLoaded.exports.default
const shellRoot = createRoot(document.getElementById("root"))
const shellProps = { isSignedIn: true, overduePracticeCount: 0, unreadTotalCount: 0, socialAttentionCount: 0, pendingModerationCount: 0, canModerate: false, canAccessDev: false, environment: "test" }
await act(async () => shellRoot.render(React.createElement(AppShell, shellProps, React.createElement("p", null, "Catalogue"))))
assert.match(document.querySelector('[role="status"]').textContent, /Added to Practice/)
assert.match(document.body.textContent, /Feedback/)
queryStatus = "error"
await act(async () => shellRoot.render(React.createElement(AppShell, shellProps, React.createElement("p", null, "Catalogue"))))
assert.match(document.querySelector('[role="alert"]').textContent, /Try again/)
queryStatus = "unknown"
await act(async () => shellRoot.render(React.createElement(AppShell, shellProps, React.createElement("p", null, "Catalogue"))))
assert.equal(document.querySelector('[role="status"], [role="alert"]'), null)
await act(async () => shellRoot.unmount())
dom.window.close()
console.log("PASS: Practice session saves, advances, completes, resumes, keeps Diary optional, retries one key, and announces enrolment outcomes")
