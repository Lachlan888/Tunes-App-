// Run with JSDOM_MODULE=/absolute/path/to/jsdom/lib/api.js node tests/integration/context-action-menu-interaction.mjs
// Exercise the real menu state while a disposable asynchronous action is pending.
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const { JSDOM } = await import(process.env.JSDOM_MODULE)
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "http://localhost/context-preview" })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 })
const nativeRect = HTMLElement.prototype.getBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = function () {
  if (this.getAttribute("aria-label") === "More actions for a tune") return { top: 650, bottom: 690, left: 700, right: 800, width: 100, height: 40 }
  if (this.getAttribute("role") === "menu") return { top: 694, bottom: 994, left: 544, right: 800, width: 256, height: 300 }
  return nativeRect.call(this)
}

const React = require("react")
const { act } = React
const { createRoot } = require("react-dom/client")
const file = readFileSync(fileURLToPath(new URL("../../components/ui/ContextActionMenu.tsx", import.meta.url)), "utf8")
const compiled = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
const loaded = { exports: {} }
new Function("require", "module", "exports", compiled)((id) => {
  if (id === "react") return React
  if (id === "react/jsx-runtime") return require("react/jsx-runtime")
  if (id === "react-dom") return require("react-dom")
  if (id === "next/link") return { __esModule: true, default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) }
  if (id === "next/dist/client/components/redirect-error") return { isRedirectError: () => false }
  throw new Error(`Unexpected import: ${id}`)
}, loaded, loaded.exports)
const ContextActionMenu = loaded.exports.default
const root = createRoot(document.getElementById("root"))

let resolveSave
await act(async () => root.render(React.createElement(ContextActionMenu, {
  label: "More actions for a tune",
  title: "A tune",
  actions: [
    { id: "open", label: "Open tune", href: "/library" },
    { id: "external", label: "Open recording", href: "https://example.com/reference", external: true },
    { id: "save", label: "Save to list", onSelect: () => new Promise((resolve) => { resolveSave = resolve }) },
  ],
})))

await act(async () => document.querySelector('button[aria-label="More actions for a tune"]').click())
const saveButton = [...document.querySelectorAll("button")].find((button) => button.textContent === "Save to list")
saveButton.focus()
act(() => saveButton.click())
const panel = document.querySelector('[role="menu"]')
assert.ok(Number.parseFloat(panel.style.top) <= 350, "the measured tall menu opens above a trigger near the viewport bottom")
assert.equal(panel.getAttribute("aria-busy"), "true", "menu reports a pending action")
assert.match(panel.textContent, /Working…/, "pending action gives a visible cue inside the menu")
assert.equal(saveButton.disabled, false, "pending action remains focusable while activation is blocked")
assert.equal(document.activeElement, saveButton, "pending action keeps keyboard focus on its action")
for (const href of ["/library", "https://example.com/reference"]) {
  const openLink = panel.querySelector(`a[href="${href}"]`)
  assert.equal(openLink.getAttribute("aria-disabled"), "true", "navigation must be unavailable during a pending action")
  assert.equal(openLink.tabIndex, -1, "pending navigation is skipped by keyboard focus")
  const pendingClick = new window.MouseEvent("click", { bubbles: true, cancelable: true })
  openLink.dispatchEvent(pendingClick)
  assert.equal(pendingClick.defaultPrevented, true, "pending navigation cannot leave the action mid-write")
}

await act(async () => { resolveSave(); await Promise.resolve() })
assert.equal(document.querySelector('[role="menu"]'), null, "successful action closes the menu")

let removeCalls = 0
let allowRemove = false
window.confirm = () => allowRemove
await act(async () => root.render(React.createElement(ContextActionMenu, {
  label: "More actions for a tune",
  title: "A tune",
  actions: [
    { id: "remove", label: "Remove tune", destructive: true, confirmMessage: "Remove this tune?", onSelect: () => { removeCalls += 1 } },
    { id: "fail", label: "Save changes", onSelect: async () => { throw new Error("fixture failure") } },
  ],
})))
const trigger = document.querySelector('button[aria-label="More actions for a tune"]')
await act(async () => trigger.click())
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((button) => button.textContent === "Remove tune").click())
assert.equal(removeCalls, 0, "cancelled destructive action does not run")
assert.ok(document.querySelector('[role="menu"]'), "cancelled destructive action retains the menu")
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((button) => button.textContent === "Save changes").click())
assert.match(document.querySelector('[role="status"]').textContent, /could not be completed\. Try again\./, "failed action gives recovery feedback")
assert.ok(document.querySelector('[role="menu"]'), "failed action leaves actions available for retry")
assert.match(document.querySelector('[role="menu"]').textContent, /could not be completed\. Try again\./, "failed action shows recovery feedback inside the menu")
allowRemove = true
await act(async () => [...document.querySelectorAll('[role="menu"] button')].find((button) => button.textContent === "Remove tune").click())
assert.equal(removeCalls, 1, "confirmed destructive action runs once")
assert.equal(document.querySelector('[role="menu"]'), null, "confirmed destructive action closes the menu")
await act(async () => trigger.click())
await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })))
assert.equal(document.querySelector('[role="menu"]'), null, "Escape dismisses the menu")
assert.equal(document.activeElement, trigger, "dismissal restores trigger focus")
await act(async () => root.unmount())
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
const phoneMount = document.createElement("div")
document.body.append(phoneMount)
const phoneRoot = createRoot(phoneMount)
await act(async () => phoneRoot.render(React.createElement(ContextActionMenu, {
  label: "More actions on phone",
  title: "Phone actions",
  actions: [
    { id: "open", label: "Open tune", href: "/library" },
    { id: "external", label: "Open recording", href: "https://example.com/reference", external: true },
  ],
})))
await act(async () => document.querySelector('button[aria-label="More actions on phone"]').click())
const phonePanel = document.querySelector('[role="dialog"]')
for (const link of phonePanel.querySelectorAll("a")) {
  link.setAttribute("aria-disabled", "true")
  link.tabIndex = -1
}
const closeButton = [...phonePanel.querySelectorAll("button")].find((button) => button.textContent === "Close")
closeButton.focus()
document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }))
assert.equal(document.activeElement, closeButton, "phone focus trap skips links disabled by a pending write")
await act(async () => phoneRoot.unmount())

const replySource = readFileSync(fileURLToPath(new URL("../../components/activity/ActivityReplyActions.tsx", import.meta.url)), "utf8")
const replyCompiled = ts.transpileModule(replySource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
const replyLoaded = { exports: {} }
new Function("require", "module", "exports", replyCompiled)((id) => {
  if (id === "react") return React
  if (id === "react/jsx-runtime") return require("react/jsx-runtime")
  if (id === "@/components/ui/ContextActionMenu") return { __esModule: true, default: ContextActionMenu }
  if (id === "@/components/SubmitButton") return { __esModule: true, default: () => React.createElement("button", { type: "submit" }, "Save edit") }
  if (id === "@/components/ui/buttonStyles") return { buttonStyles: { primary: "", secondary: "" } }
  if (id === "@/lib/actions/activity-interactions") return { deleteActivityReply: async () => {}, updateActivityReply: async () => {} }
  throw new Error(`Unexpected import: ${id}`)
}, replyLoaded, replyLoaded.exports)
const replyMount = document.createElement("div")
document.body.append(replyMount)
const replyRoot = createRoot(replyMount)
await act(async () => replyRoot.render(React.createElement(replyLoaded.exports.default, { id: 7, body: "A useful reply", redirectTo: "/friends" })))
await act(async () => replyMount.querySelector('button[aria-label="More actions for your reply"]').click())
await act(async () => [...document.querySelectorAll('[role="dialog"] button')].find(button => button.textContent === "Edit reply").click())
assert.equal(document.activeElement === replyMount.querySelector('textarea[name="body"]'), true, "opening reply editing focuses the newly revealed field")
await act(async () => replyRoot.unmount())
console.log("PASS: contextual menu pending navigation, completion, cancellation, failure recovery, confirmation and Escape focus")
