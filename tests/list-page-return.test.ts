import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as pagination from '../lib/list-view-state.ts'
import * as filters from '../lib/search-filters.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const compiled = ts.transpileModule(readFileSync(new URL('../app/learning-lists/page.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText

type Element = { type: string; props: Record<string, unknown> }
async function render(query: Record<string, string | string[]>) {
  const rows = Array.from({ length: 45 }, (_, index) => ({
    id: index + 1, name: `Reel ${index + 1}`, stylesPresent: ['Irish'],
    source: 'manual', visibility: 'private', tuneCount: 12,
    piece: { id: index + 1, title: `Reel ${index + 1}` }, piece_id: index + 1,
    pieces: { id: index + 1, title: `Reel ${index + 1}` },
    listNames: ['Reel list'], listIds: [7], ownerLabel: 'Owner',
  }))
  const loaded = { exports: {} as { default: (props: unknown) => Promise<Element> } }
  new Function('require', 'module', 'exports', compiled)((id: string) => {
    if (id === 'react/jsx-runtime') return require(id)
    if (id === '@/lib/list-view-state') return pagination
    if (id === '@/lib/search-filters') return filters
    if (id === '@/lib/loaders/lists') return { loadListsData: async () => ({
      learningLists: rows, listOverviews: rows, learningQueueTunes: rows,
      unlistedPracticeTunes: rows, unlistedKnownTunes: [], bookmarkedSharedLists: rows, directSharedLists: [],
    }) }
    if (id.startsWith('@/lib/actions/')) return new Proxy({}, { get: () => () => { throw Error('Unexpected mutation') } })
    if (id === '@/components/ui/buttonStyles') return { buttonStyles: {} }
    if (id === '@/components/lists/ListsPageViews') return {
      LearningQueueView: 'LearningQueueView', UnsortedView: 'UnsortedView', SavedSharedView: 'SavedSharedView',
    }
    if (id.startsWith('@/components/')) return { default: id.split('/').at(-1) }
    throw Error(`Unexpected dependency: ${id}`)
  }, loaded, loaded.exports)
  const tree = await loaded.exports.default({ searchParams: Promise.resolve(query) })
  const elements: Element[] = []
  function walk(node: unknown) {
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (!node || typeof node !== 'object' || !('props' in node)) return
    const element = node as Element
    elements.push(element)
    walk(element.props.children)
  }
  walk(tree)
  return elements
}

for (const [view, component, group] of [
  ['my-lists', 'ListOverviewCard', ''],
  ['learning-queue', 'LearningQueueView', '7'],
  ['unsorted', 'UnsortedView', 'practice'],
  ['saved-shared', 'SavedSharedView', 'saved'],
]) {
  test(`${view} action targets retain filters and the displayed page`, async () => {
    for (const [requested, expected] of [['2', '2'], ['99', '3'], ['0', null]] as const) {
      const elements = await render({ view, q: 'Reel', group, page: requested,
        ...(view === 'my-lists' ? { style: ['Irish', 'Scottish'], size: '11-25', source: 'manual', visibility: 'private' } : {}),
      })
      const targets = elements.filter(element => element.type === component)
      assert.ok(targets.length > 0)
      for (const target of targets) {
        const url = new URL(String(target.props.redirectTo), 'https://fixture.invalid')
        assert.equal(url.pathname, '/learning-lists')
        assert.equal(url.searchParams.get('page'), expected)
        assert.equal(url.searchParams.get('q'), 'Reel')
        assert.equal(url.searchParams.get('view'), view === 'my-lists' ? null : view)
        assert.equal(url.searchParams.get('group'), group || null)
        if (view === 'my-lists') {
          assert.deepEqual(url.searchParams.getAll('style'), ['Irish', 'Scottish'])
          assert.equal(url.searchParams.get('size'), '11-25')
          assert.equal(url.searchParams.get('source'), 'manual')
          assert.equal(url.searchParams.get('visibility'), 'private')
        }
      }
      const pager = elements.find(element => element.type === 'ListPager')!
      assert.equal(pager.props.page, Number(expected ?? 1))
      assert.equal(pager.props.totalPages, 3)
      const visible = view === 'my-lists' ? targets : targets[0].props[
        view === 'learning-queue' ? 'learningQueueTunes' : view === 'unsorted' ? 'unlistedPracticeTunes' : 'bookmarkedSharedLists'
      ] as unknown[]
      assert.equal(visible.length, expected === '3' ? 5 : 20)
    }
  })
}
