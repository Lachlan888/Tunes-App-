// Real React, disposable DOM/audio doubles; no browser or production writes.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/metronome-lifecycle.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
const require = createRequire(import.meta.url)
const rendererRequire = createRequire(`${process.env.RENDERER_ROOT}/package.json`)
const React = rendererRequire('react')
const { create, act } = rendererRequire('react-test-renderer')
const ts = require('typescript')
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const listeners = new Map(), timers = new Map()
let timerId = 0, observer, tree, focused = 0, contexts = 0, audio, resolveResume
let deferResume = false, rejectResume = false, resumes = 0, width = 374, height = 400
globalThis.HTMLElement = class { isConnected = true; focus() { focused++ } }
globalThis.document = { body: {}, activeElement: new HTMLElement() }
globalThis.ResizeObserver = class {
  constructor(callback) { observer = callback }
  observe() {}
  disconnect() {}
}
class AudioContext {
  state = 'suspended'; currentTime = 0; destination = {}
  constructor() {
    contexts++
    // Expose the disposable instance for lifecycle assertions.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    audio = this
  }
  async resume() {
    resumes++
    if (rejectResume) throw new Error('Disposable denied audio resume')
    if (deferResume) await new Promise(resolve => { resolveResume = resolve })
    this.state = 'running'
  }
  async suspend() { this.state = 'suspended' }
  async close() { this.state = 'closed' }
  createOscillator() { return { frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {} } }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} } }
}
globalThis.window = {
  innerWidth: 390, innerHeight: 844, AudioContext,
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name) },
  setTimeout: callback => { timers.set(++timerId, callback); return timerId },
  clearTimeout: id => timers.delete(id),
}
const mocks = {
  react: React, 'react/jsx-runtime': rendererRequire('react/jsx-runtime'),
  'react-dom': { createPortal: children => children },
  '@/lib/browser-storage': { preferenceStorage: { getItem: () => null, setItem() {} } },
}
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const loaded = { exports: {} }
  const customRequire = id => {
    if (mocks[id]) return { ...mocks[id], __esModule: true }
    if (!id.startsWith('@/') && !id.startsWith('.')) return require(id)
    const path = id.startsWith('@/') ? resolve(id.slice(2)) : resolve(dirname(file), id)
    const target = [path, `${path}.ts`, `${path}.tsx`].find(existsSync)
    assert.ok(target, `Unresolved ${id}`)
    return load(target)
  }
  new Function('require', 'module', 'exports', compiled)(customRequire, loaded, loaded.exports)
  cache.set(file, loaded.exports)
  return loaded.exports
}
const Metronome = load(resolve('components/practice/PracticeMetronome.tsx')).default
const { OPEN_METRONOME_EVENT } = load(resolve('lib/ui-events.ts'))
const panel = () => tree.root.findByType('aside')
const labelled = label => tree.root.findByProps({ 'aria-label': label })
const button = text => tree.root.findAllByType('button').find(node => node.props.children === text)
const click = async text => act(async () => button(text).props.onClick())
const handle = () => labelled('Move Metronome: drag or use arrow keys')
const position = () => panel().props.style
const open = async () => act(async () => listeners.get(OPEN_METRONOME_EVENT)())
const close = async () => act(async () => labelled('Close and stop Metronome').props.onClick())
const route = path => React.createElement(React.Fragment, null, React.createElement('main', null, path), React.createElement(Metronome, { variant: 'hidden' }))
const mount = async () => act(async () => {
  tree = create(route('/practice'), { createNodeMock: element => element.type === 'aside' ? {
    getBoundingClientRect: () => ({ ...position(), width, height }),
  } : new HTMLElement() })
})
try {
  await mount()
  assert.equal(tree.root.findAllByType('aside').length, 0, 'opens only on deliberate request')
  assert.equal(contexts, 0)
  await open()
  assert.ok(focused > 0, 'reachable move handle receives focus')
  for (const [viewportWidth, viewportHeight, panelWidth] of [[390,844,374],[768,1024,384],[1440,900,384]]) {
    window.innerWidth = viewportWidth; window.innerHeight = viewportHeight; width = panelWidth
    await act(async () => listeners.get('resize')())
    let prevented = false
    const left = position().left
    await act(async () => handle().props.onKeyDown({ key: 'ArrowRight', preventDefault() { prevented = true } }))
    assert.equal(prevented, true)
    assert.equal(position().left, Math.max(8, Math.min(left + 20, viewportWidth - width - 8)))
    await act(async () => handle().props.onPointerDown({ currentTarget: { setPointerCapture() {} }, pointerId: 1, clientX: 10, clientY: 10 }))
    await act(async () => handle().props.onPointerMove({ clientX: 10000, clientY: 10000 }))
    assert.equal(position().left, viewportWidth - width - 8)
    assert.equal(position().top, viewportHeight - height - 100)
    await act(async () => handle().props.onPointerCancel())
    const before = position()
    await act(async () => handle().props.onPointerMove({ clientX: -1000, clientY: -1000 }))
    assert.deepEqual(position(), before)
  }
  await click('Collapse'); assert.equal(button('Expand').props['aria-expanded'], false)
  height = 120; await act(async () => observer())
  await click('Start'); assert.equal(contexts, 1); assert.equal(audio.state, 'running')
  assert.ok(button('Stop'))
  await act(async () => tree.update(route('/reference')))
  assert.ok(button('Stop')); assert.equal(contexts, 1, 'route content changes preserve the engine')
  await open(); assert.equal(contexts, 1)
  await click('Expand'); assert.ok(labelled('Stop metronome'))
  assert.equal(panel().props['aria-modal'], undefined, 'tool is non-modal')
  await close(); assert.equal(audio.state, 'suspended'); assert.equal(timers.size, 0)
  await open(); await click('Start'); assert.equal(contexts, 1, 'reopen reuses one context')
  await close()
  rejectResume = true
  await open(); await click('Start')
  assert.ok(button('Start')); assert.equal(timers.size, 0, 'failed audio resume remains stopped and retryable')
  rejectResume = false
  await close()
  // Closing during the browser's asynchronous audio permission/resume step must win.
  deferResume = true
  await open()
  let pending
  await act(async () => { pending = button('Start').props.onClick() })
  const resumeCount = resumes
  await click('Start')
  assert.equal(resumes, resumeCount, 'repeated Start cannot create parallel resume requests')
  await close()
  await act(async () => { resolveResume(); await pending })
  assert.equal(audio.state, 'suspended', 'close cancels a pending start')
  assert.equal(timers.size, 0, 'closed tool never starts a scheduler')
  await open()
  await act(async () => { pending = button('Start').props.onClick() })
  await act(async () => tree.unmount())
  await act(async () => { resolveResume(); await pending })
  assert.equal(timers.size, 0, 'unmount cancels a pending start')
  assert.equal(listeners.has(OPEN_METRONOME_EVENT), false)
  console.log('PASS: phone/tablet/desktop drag, keyboard/bounds, resize, collapse, navigation persistence, one engine, close/reopen and async close/unmount cancellation')
} finally { if (tree) await act(async () => tree.unmount()) }
