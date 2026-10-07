// Run with JSDOM_MODULE=/absolute/path/to/jsdom/lib/api.js node tests/integration/catalogue-actions-interaction.mjs
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const { JSDOM } = await import(process.env.JSDOM_MODULE)
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "http://localhost/library" })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.FormData = dom.window.FormData
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
window.confirm = () => true

const React = require("react")
const { act } = React
const { createRoot } = require("react-dom/client")
const jsx = require("react/jsx-runtime")
const realMenuSource = readFileSync(fileURLToPath(new URL("../../components/ui/ContextActionMenu.tsx", import.meta.url)), "utf8")
const actionsSource = readFileSync(fileURLToPath(new URL("../../components/library/LibraryTuneCardActions.tsx", import.meta.url)), "utf8")
function load(source, mocks) {
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const loaded = { exports: {} }
  new Function("require", "module", "exports", compiled)((id) => {
    if (id === "react") return React
    if (id === "react/jsx-runtime") return jsx
    if (id === "react-dom") return require("react-dom")
    if (id === "next/link") return { __esModule: true, default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) }
    if (id === "next/dist/client/components/redirect-error") return { isRedirectError: () => false }
    if (id in mocks) return mocks[id]
    throw new Error(`Unexpected import: ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports.default
}
const ContextActionMenu = load(realMenuSource, {})
let knownData
const LibraryTuneCardActions = load(actionsSource, {
  "@/components/ui/ContextActionMenu": { __esModule: true, default: ContextActionMenu },
  "@/lib/actions/known-pieces": { markAsKnown: async (data) => { knownData = data } },
  "@/lib/actions/user-pieces": { removeFromPractice: async () => {} },
})
const root = createRoot(document.getElementById("root"))
let practiceData
let listOpens = 0
const base = {
  piece: { id: 42, title: "The Reel" },
  redirectTo: "/library?search=reel",
  onOpenAddToList: () => { listOpens += 1 },
  startLearning: async (data) => { practiceData = data },
}
async function render(state) {
  await act(async () => root.render(React.createElement(LibraryTuneCardActions, { ...base, ...state })))
  await act(async () => document.querySelector('button[aria-label="More actions for The Reel"]').click())
  return [...document.querySelectorAll('[role="menu"] a, [role="menu"] button')].map((item) => item.textContent)
}
const newActions = await render({ isAlreadyInPractice: false, isKnown: false })
assert.deepEqual(newActions, ["Open tune", "Add to List", "Add to Practice", "Mark Known"])
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((item) => item.textContent === "Add to Practice").click())
assert.equal(practiceData.get("piece_id"), "42")
assert.equal(practiceData.get("redirect_to"), "/library?search=reel")
assert.equal(document.querySelector('[role="menu"]'), null, "successful classification closes the menu")

const practiceActions = await render({ isAlreadyInPractice: true, activeUserPieceId: 73, isKnown: false })
assert.deepEqual(practiceActions, ["Open tune", "Add to List", "Move to Known", "Stop Practice"])
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((item) => item.textContent === "Move to Known").click())
assert.equal(knownData.get("piece_id"), "42")
assert.equal(knownData.get("redirect_to"), "/library?search=reel")

const knownActions = await render({ isAlreadyInPractice: false, isKnown: true })
assert.deepEqual(knownActions, ["Open tune", "Add to List", "Move to Practice"])
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((item) => item.textContent === "Add to List").click())
assert.equal(listOpens, 1)
await act(async () => root.unmount())
console.log("PASS: actual catalogue menu preserves new, Practice and Known classification paths and return URL")
