import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

for (const departure of ['anchor', 'button']) test(`${departure} list navigation restores the original offset once, after router scroll, and ignores other origins`, () => {
  const path = new URL('../components/lists/ListOriginScroll.tsx', import.meta.url)
  const effects: Array<() => (() => void)> = []
  const frames = new Map<number, () => void>()
  let sequence = 0
  let listener: ((event: unknown) => void) | undefined
  const browser = { scrollY: 840, location: { origin: 'http://localhost:3000' },
    scrollTo: ({ top }: { top: number }) => { browser.scrollY = top } }
  const href = 'http://localhost:3000/learning-lists/52?return_to=%2Flearning-lists'
  const buttonModule = { exports: {} as { default: (props: { href: string; label: string }) => { props: Record<string, unknown> } } }
  const buttonCode = ts.transpileModule(readFileSync(new URL('../components/PendingLinkButton.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  new Function('require', 'module', 'exports', buttonCode)((id: string) => {
    if (id === 'react') return { useTransition: () => [false, (action: () => void) => action()] }
    if (id === 'next/navigation') return { useRouter: () => ({ push: () => {} }) }
    if (id === '@/components/ui/LoadingSpinner') return { default: () => null }
    return require(id)
  }, buttonModule, buttonModule.exports)
  const button = buttonModule.exports.default({ href, label: 'Read the list' })
  class Target {
    closest(selector: string) {
      if (departure === 'anchor' && selector.includes('a')) return {
        href, target: '', hasAttribute: () => false, getAttribute: (name: string) => name === 'href' ? href : null,
      }
      if (departure === 'button' && selector.includes('[data-navigation-href]')) return {
        getAttribute: (name: string) => name === 'data-navigation-href' ? button.props[name] : null,
        hasAttribute: () => false,
      }
      return null
    }
  }
  const document = {
    addEventListener: (_: string, callback: typeof listener) => { listener = callback },
    removeEventListener: () => { listener = undefined },
  }
  const loaded = { exports: {} as { default: (props: { originHref: string }) => void } }
  {
    const code = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    new Function('require', 'module', 'exports', 'window', 'document', 'Element', 'requestAnimationFrame', 'cancelAnimationFrame', code)(
      (id: string) => { assert.equal(id, 'react'); return { useEffect: (effect: () => () => void) => effects.push(effect) } },
      loaded, loaded.exports, browser, document, Target,
      (callback: () => void) => { frames.set(++sequence, callback); return sequence },
      (id: number) => frames.delete(id),
    )
  }
  function mount(originHref = '/learning-lists') {
    loaded.exports.default({ originHref })
    return effects.pop()?.() ?? (() => {})
  }
  function paint() { for (const [id, callback] of frames) { frames.delete(id); callback() } }
  const cleanup = mount()
  listener?.({ target: new Target(), button: 0 })
  cleanup()
  browser.scrollY = 0
  const otherCleanup = mount('/learning-lists?q=other')
  paint()
  assert.equal(browser.scrollY, 0, 'another filter must not inherit scroll')
  otherCleanup()
  const strictCleanup = mount()
  strictCleanup() // Strict Mode cleanup must not consume the pending restoration.
  const returnedCleanup = mount()
  browser.scrollY = 0 // Router scroll reset occurs during navigation commit.
  paint()
  assert.equal(browser.scrollY, 840, 'Back must restore the list origin after router reset')
  returnedCleanup()
  browser.scrollY = 0
  mount()
  paint()
  assert.equal(browser.scrollY, 0, 'ordinary later visits must not reuse stale scroll')
})
