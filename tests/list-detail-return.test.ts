import assert from 'node:assert/strict'
import test from 'node:test'
import * as searchFilters from '../lib/search-filters.ts'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
type Element = { type: string; props: Record<string, unknown> }
function load(path: string): Record<string, (props: unknown) => Element | Promise<Element>> {
  const compiled = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', compiled)((id: string) => {
    if (id === 'react') return require(id)
    if (id === '@/lib/loaders/public-list-detail') return { loadPublicListDetailData: async () => ({
      user: null, typedList: { id: 67, name: 'Public fixture', description: 'A public fixture description', visibility: 'public' }, owner: null,
      typedItems: [{ id: 1, pieces: { id: 1, title: 'Public tune' } }], mediaBundles: new Map(), ownedLists: [], activePieceIds: new Set(), knownPieceIds: new Set(),
      redirectTo: '/public-lists/67', isViewingOwnPublicList: false, isBookmarkedByCurrentUser: false,
    }) }
    if (id === 'react/jsx-runtime') return require(id)
    if (id === 'next/link') return { default: 'Link' }
    if (id === '@/lib/search-filters') return searchFilters
    if (id === '@/lib/loaders/public-lists') return { loadPublicListsData: async () => ({ status: 'success', sharedLists: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Adam ${i + 1}`, ownerLabel: 'Owner', stylesPresent: ['Irish'], tuneCount: 12 })) }) }
    if (id === '@/lib/list-view-state' || id === '@/lib/list-return') return load(`${id.slice(2)}.ts`)
    if (id === '@/lib/loaders/list-detail') return { loadLearningListDetailData: async () => ({
      typedList: { id: 67, name: 'Earth Tones - Adam Hurt', description: 'A personal fixture description', visibility: 'private' },
      typedItems: Array.from({ length: 25 }, (_, i) => ({ id: i + 1, pieces: { id: i + 1, title: `Tune ${i + 1}` } })),
      tunes: [], activePieceStates: new Map(), knownPieceIds: new Set(), ownerProfile: { label: 'Owner' },
      shareRecipients: [], accessMode: 'owner', redirectTo: '/learning-lists/67',
    }) }
    if (id.startsWith('@/lib/actions/')) return new Proxy({}, { get: () => () => { throw Error('Unexpected mutation') } })
    if (id === '@/components/ui/buttonStyles') return { buttonStyles: {} }
    if (id.startsWith('@/components/')) return { default: id.split('/').at(-1) }
    throw Error(`Unexpected dependency: ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports
}
function elements(tree: unknown): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(elements)
  if (!tree || typeof tree !== 'object' || !('props' in tree)) return []
  const element = tree as Element
  return [element, ...elements(element.props.children)]
}
const origin = '/learning-lists?q=Adam&style=Old-time&style=Irish&size=11-25&source=manual&visibility=private&page=2#list-67'

test('owned card title and Read link carry the filtered overview origin', async () => {
  const tree = await load('components/lists/ListOverviewCard.tsx').default({
    list: { id: 67, name: 'Earth Tones - Adam Hurt', visibility: 'private', tuneCount: 25, stylesPresent: [] }, redirectTo: origin,
  })
  const links = elements(tree).filter(e => e.type === 'EditorialListCard' || e.type === 'PendingLinkButton')
  assert.equal(links.length, 2)
  for (const link of links) {
    const url = new URL(String(link.props.href), 'https://fixture.invalid')
    assert.equal(url.pathname, '/learning-lists/67')
    assert.equal(url.searchParams.get('return_to'), origin)
  }
})

test('detail Back, modes, and pager retain the overview origin', async () => {
  for (const mode of ['reader', 'manage']) {
    const tree = await load('app/learning-lists/[id]/page.tsx').default({ params: Promise.resolve({ id: '67' }), searchParams: Promise.resolve({ return_to: origin, mode, page: '2' }) })
    const all = elements(tree)
    assert.equal(all.find(e => e.props.children === 'Back to Lists')?.props.href, origin)
    for (const label of ['Reader', 'Manage']) {
      const url = new URL(String(all.find(e => e.props.children === label)?.props.href), 'https://fixture.invalid')
      assert.equal(url.searchParams.get('return_to'), origin)
      assert.equal(url.searchParams.get('page'), '2')
      assert.equal(url.searchParams.get('mode'), label === 'Manage' ? 'manage' : null)
    }
    const pager = all.find(e => e.type === 'ListPager')!
    assert.equal(new URL(String(pager.props.href), 'https://fixture.invalid').searchParams.get('return_to'), origin)
    if (mode === 'reader') {
      assert.ok(all.some(e => e.type === 'ol'))
      assert.ok(all.filter(e => e.type === 'TuneRow').every(e => e.props.supportingContent === undefined))
    } else {
      assert.equal(all.find(e => e.type === 'ListOrderManager')?.props.positionOffset, 20)
    }
  }
})

test('detail rejects external, unrelated and malformed return destinations', async () => {
  for (const return_to of ['https://evil.invalid/learning-lists', '//evil.invalid/learning-lists', '/library', '/learning-lists/67', '/\\evil.invalid/learning-lists', '/learning-lists\n', ['/learning-lists?q=Adam', '/library'], undefined]) {
    const tree = await load('app/learning-lists/[id]/page.tsx').default({ params: Promise.resolve({ id: '67' }), searchParams: Promise.resolve({ return_to }) })
    assert.equal(elements(tree).find(e => e.props.children === 'Back to Lists')?.props.href, '/learning-lists')
  }
})


test('saved and directly shared card links retain overview filters and page', async () => {
  const tree = await load('components/lists/ListsPageViews.tsx').SavedSharedView({
    bookmarkedSharedLists: [{ id: 67, name: 'Saved', tuneCount: 25 }],
    directSharedLists: [{ id: 68, name: 'Shared', tuneCount: 25 }],
    redirectTo: origin, unbookmarkPublicList: () => { throw Error('Unexpected mutation') },
  })
  const links = elements(tree).filter(e => e.type === 'EditorialListCard' || e.type === 'PendingLinkButton')
  assert.equal(links.length, 4)
  for (const [index, link] of links.entries()) {
    const url = new URL(String(link.props.href), 'https://fixture.invalid')
    assert.equal(url.pathname, index < 2 ? '/public-lists/67' : '/learning-lists/68')
    assert.equal(url.searchParams.get('return_to'), origin)
  }
})

test('public detail Back and pager retain a safe Lists origin', async () => {
  const tree = await load('app/public-lists/[id]/page.tsx').default({ params: Promise.resolve({ id: '67' }), searchParams: Promise.resolve({ return_to: origin }) })
  const all = elements(tree)
  assert.equal(all.find(e => e.props.children === 'Back to Lists')?.props.href, origin)
  const pager = all.find(e => e.type === 'ListPager')!
  assert.equal(new URL(String(pager.props.href), 'https://fixture.invalid').searchParams.get('return_to'), origin)
  assert.ok(all.some(e => e.type === 'ol'))
  assert.ok(all.some(e => e.type === 'li'))
})

test('public detail keeps its default and rejects unsafe return destinations', async () => {
  for (const return_to of [undefined, 'https://evil.invalid/learning-lists', '//evil.invalid/learning-lists', '/library', ['/learning-lists', '/library']]) {
    const tree = await load('app/public-lists/[id]/page.tsx').default({ params: Promise.resolve({ id: '67' }), searchParams: Promise.resolve({ return_to }) })
    const all = elements(tree)
    const back = all.find(e => e.type === 'Link' && String(e.props.children).startsWith('Back to'))!
    assert.equal(back.props.href, return_to === undefined ? '/public-lists' : '/learning-lists')
  }
})

const discoveryOrigin = '/public-lists?q=Adam&style=Irish&style=Old-time&sort=alpha&page=2'

test('discovery desktop and mobile entry links carry their filtered origin', async () => {
  const list = { id: 67, name: 'Discovery', ownerLabel: 'Owner', tuneCount: 25 }
  for (const [path, props] of [
    ['components/shared/SharedListCard.tsx', { list, redirectTo: discoveryOrigin }],
    ['components/shared/SharedListsMobileList.tsx', { lists: [list], redirectTo: discoveryOrigin }],
  ] as const) {
    const all = elements(await load(path).default(props))
    const links = all.filter(e => e.type === 'EditorialListCard' || e.type === 'PendingLinkButton' || (e.type === 'Link' && e.props.children === 'Discovery'))
    assert.equal(links.length, 2)
    for (const link of links) assert.equal(new URL(String(link.props.href), 'https://fixture.invalid').searchParams.get('return_to'), discoveryOrigin)
  }
})

test('discovery page supplies filters and the clamped page to both entry layouts', async () => {
  for (const [requested, expected] of [['2', '2'], ['99', '3'], ['0', null]] as const) {
    const all = elements(await load('app/public-lists/page.tsx').default({ searchParams: Promise.resolve({ q: 'Adam', style: ['Irish', 'Old-time'], sort: 'alpha', page: requested }) }))
    const entries = all.filter(e => ['SharedListCard', 'SharedListsMobileList'].includes(e.type))
    assert.ok(entries.length > 1)
    for (const entry of entries) {
      const url = new URL(String(entry.props.redirectTo), 'https://fixture.invalid')
      assert.equal(url.pathname, '/public-lists')
      assert.equal(url.searchParams.get('q'), 'Adam')
      assert.deepEqual(url.searchParams.getAll('style'), ['Irish', 'Old-time'])
      assert.equal(url.searchParams.get('sort'), 'alpha')
      assert.equal(url.searchParams.get('page'), expected)
    }
  }
})

test('public detail returns to discovery and retains origin in its pager', async () => {
  const all = elements(await load('app/public-lists/[id]/page.tsx').default({ params: Promise.resolve({ id: '67' }), searchParams: Promise.resolve({ return_to: discoveryOrigin }) }))
  assert.equal(all.find(e => e.props.children === 'Back to Public Lists')?.props.href, discoveryOrigin)
  assert.equal(new URL(String(all.find(e => e.type === 'ListPager')?.props.href), 'https://fixture.invalid').searchParams.get('return_to'), discoveryOrigin)
})
