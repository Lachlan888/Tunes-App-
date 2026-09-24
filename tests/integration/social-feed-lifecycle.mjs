// Real React feed lifecycle with disposable fetch/observer fixtures; no remote writes.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/social-feed-lifecycle.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const rendererRequire = createRequire(`${process.env.RENDERER_ROOT}/package.json`)
const React = rendererRequire('react')
const { create, act } = rendererRequire('react-test-renderer')
const ts = require('typescript')
globalThis.IS_REACT_ACT_ENVIRONMENT = true
let tree, observer, observerOptions, pending, scrolls = 0
const calls = []
globalThis.IntersectionObserver = class {
  constructor(callback, options) { observer = callback; observerOptions = options }
  observe() {}
  disconnect() {}
}
globalThis.fetch = (url, options) => {
  calls.push({ url, options })
  return new Promise(resolve => { pending = resolve })
}
function load(path, mocks = {}) {
  const loaded = { exports: {} }
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  new Function('require', 'module', 'exports', code)(id => {
    assert.ok(mocks[id], `Unexpected dependency ${id}`)
    return { ...mocks[id], __esModule: true }
  }, loaded, loaded.exports)
  return loaded.exports
}
const Reaction = ({ reactions }) => React.createElement('button', null, `Good craic (${reactions.length})`)
const Modal = ({ children, onClose }) => React.createElement('section', { 'aria-label': 'Discussion' }, children, React.createElement('button', { onClick: onClose }, 'Close discussion'))
const Feed = load('components/activity/SocialActivityFeed.tsx', {
  react: React, 'react/jsx-runtime': rendererRequire('react/jsx-runtime'),
  '@/lib/activity-pagination': load('lib/activity-pagination.ts'),
  '@/components/ui/buttonStyles': { buttonStyles: {} },
  '@/components/activity/ActivityReactionBar': { default: Reaction },
  '@/components/activity/ActivityReplyForm': { default: () => null },
  '@/components/ui/ResponsiveModal': { default: Modal },
  '@/lib/friend-activity': { renderFriendActivityText: item => `Fixture ${item.id}`, formatFriendActivityRelativeTime: () => 'Fixture date' },
}).default
const row = id => ({ id, activity_key: `event:${id}`, created_at: '2026-09-23T00:00:00Z', event_type: 'tune_reviewed', replies: [], reactions: [] })
const page = (start, length = 20) => Array.from({ length }, (_, i) => row(start - i))
const button = text => tree.root.findAllByType('button').find(node => node.props.children === text)
const rows = () => tree.root.findByType('ol').findAllByType('li')
const click = async text => act(async () => { assert.ok(button(text), text); button(text).props.onClick() })
const respond = async (items, nextCursor, status = 200) => act(async () => pending({ ok: status === 200, status, json: async () => ({ items, nextCursor }) }))
const longComment = `Long comment ${'detail '.repeat(80)}`
const initial = page(200)
initial[0] = { ...initial[0], replies: [{ id: 1, body: longComment, created_at: initial[0].created_at, author: { display_name: 'Fixture friend' } }] }
try {
  let regionNode
  await act(async () => { tree = create(React.createElement(Feed, { items: initial, initialNextCursor: 'first', redirectTo: '/', scrollRegionLabel: 'Friend activity feed' }), { createNodeMock: node => {
    if (node.type === 'ol') return { get children() { return rows().map(() => ({ getBoundingClientRect: () => ({ height: 50 }) })) } }
    if (node.props['aria-label'] === 'Friend activity feed') return regionNode = { scrollTo() { scrolls++ } }
    return {}
  } }) })
  const region = tree.root.findByProps({ role: 'region', 'aria-label': 'Friend activity feed' })
  assert.equal(region.props.tabIndex, 0, 'scroll region is keyboard reachable')
  assert.match(region.props.className, /overflow-y-auto/)
  assert.match(region.props.className, /overscroll-contain/)
  assert.equal(observerOptions.root, regionNode, 'pagination observes the feed scroller instead of the window')
  assert.equal(rows().length, 20)
  assert.equal(tree.root.findAllByType(Reaction).length, 20, 'direct reaction control on each row')
  await click('Load more activity')
  assert.equal(button('Loading activity…').props.disabled, true)
  await act(async () => observer([{ isIntersecting: true }]))
  assert.equal(calls.length, 1, 'concurrent scroll/click deduplicated')
  assert.match(calls[0].url, /cursor=first/)
  assert.equal(calls[0].options.cache, 'no-store')
  await respond([], null, 503)
  assert.match(tree.root.findByProps({ role: 'alert' }).props.children, /Try again/)
  await click('Retry loading activity')
  assert.equal(calls[1].url, calls[0].url, 'retry retains cursor')
  await respond([], 'after-hidden')
  assert.ok(button('Load more activity'), 'privacy-filtered empty page retains continuation')
  await click('Load more activity')
  assert.match(calls.at(-1).url, /after-hidden/)
  await respond(page(182), 'second')
  assert.equal(rows().length, 38, 'overlapping page rows deduplicate')
  assert.equal(tree.root.findAllByType(Reaction).length, 38, 'overlap does not duplicate reaction controls')
  const comment = rows()[0].findAllByType('button')[0]
  assert.equal(comment.props.children[0], 'Comment (')
  await act(async () => comment.props.onClick())
  assert.equal(tree.root.findAllByType(Modal).length, 1)
  assert.equal(tree.root.findAllByType('p').some(node => node.props.children === longComment), true, 'long comments remain available in discussion')
  const beforeDiscussion = calls.length
  await click('Load more activity')
  assert.equal(calls.length, beforeDiscussion, 'discussion freezes paging')
  await click('Close discussion')
  for (const start of [162, 142, 122]) {
    await act(async () => observer([{ isIntersecting: true }]))
    await respond(page(start), `after-${start}`)
  }
  assert.equal(rows().length, 80, 'rendered window remains bounded')
  assert.ok(button('Back to newest activity'))
  assert.equal(tree.root.findByProps({ 'aria-hidden': 'true' }).props.style.height, 900, 'removed rows reserve measured height')
  await click('Load more activity'); await respond([], null)
  assert.equal(button('Load more activity'), undefined)
  assert.match(tree.root.findByProps({ role: 'status' }).props.children, /up to date/)
  await click('Back to newest activity')
  assert.equal(rows().length, 20); assert.equal(scrolls, 1)
  await click('Load more activity'); assert.match(calls.at(-1).url, /cursor=first/)
  await respond([], null, 401)
  assert.match(tree.root.findByProps({ role: 'alert' }).props.children, /Sign in again/)
  await click('Retry loading activity')
  const signal = calls.at(-1).options.signal
  await act(async () => tree.unmount())
  assert.equal(signal.aborted, true, 'unmount aborts private activity request')
  await respond([], null)
  console.log('PASS: direct controls, bounded/deduplicated feed, hidden-page continuation, loading/retry/end, keyboard button fallback, discussion paging guard, newest reset, unauthorized recovery and abort')
} finally { if (tree) await act(async () => tree.unmount()) }
