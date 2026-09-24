import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { readBoundedResult } from '../lib/loaders/bounded-read.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const compiled = ts.transpileModule(readFileSync(new URL('../lib/loaders/lists.ts', import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText

function fixture({size = 1201, missingBookmarks = false} = {}) {
  const reads: {table: string; calls: [string, ...unknown[]][]}[] = []
  const db = {auth: {getUser: async () => ({data: {user: {id: 'owner'}}})}, from(table: string) {
    const calls: [string, ...unknown[]][] = []
    reads.push({table, calls})
    const chain = new Proxy({}, {get(_target, method: string) {
      if (method === 'then') return (resolve: (result: unknown) => unknown) => {
        const from = Number(calls.find(c => c[0] === 'range')?.[1] ?? 0)
        const all = table === 'learning_lists' ? [{id: 7, name: 'Owned list', visibility: 'private'}]
          : table === 'learning_list_items' ? Array.from({length: size}, (_, i) => ({id: i + 1, learning_list_id: 7, piece_id: i + 1, created_at: '2026-09-13', pieces: {id: i + 1, title: `Tune ${i + 1}`}, learning_lists: {id: 7, name: 'Owned list', user_id: 'owner'}})) : []
        return Promise.resolve({data: all.slice(from, from + 125), count: all.length, error: missingBookmarks && table === 'learning_list_bookmarks' ? {code: 'PGRST205', message: 'missing table'} : null}).then(resolve)
      }
      return (...args: unknown[]) => {calls.push([method, ...args]); return chain}
    }})
    return chain
  }}
  const loaded = {exports: {} as {loadListsData: () => Promise<{learningQueueTunes: unknown[]; listOverviews: {tuneCount: number}[]; bookmarkedSharedLists: unknown[]}>}}
  new Function('require','module','exports',compiled)((id: string) => {
    if (id === '@/lib/auth/login-redirect') return {redirectToLogin: async () => {throw Error('redirect')}}
    if (id === '@/lib/loaders/bounded-read') return {readBoundedResult}
    if (id === '@/lib/supabase/server') return {createClient: async () => db}
    if (id === '@/lib/search-filters') return {getStyleLabelsFromPiece: () => []}
    if (id === 'next/navigation') return {redirect: () => {throw Error('redirect')}}
    throw Error(id)
  },loaded,loaded.exports)
  return {reads, run: loaded.exports.loadListsData}
}

test('Lists keeps complete queue/counts beyond API caps, with owner scope and bounded stable reads', async () => {
  const f = fixture(), result = await f.run()
  assert.equal(result.learningQueueTunes.length, 1201)
  assert.equal(result.listOverviews[0].tuneCount, 1201)
  for (const read of f.reads) {
    assert.ok(read.calls.some(c => c[0] === 'select' && (c[2] as {count?: string})?.count === 'exact'))
    assert.ok(read.calls.some(c => c[0] === 'range' && Number(c[2]) - Number(c[1]) === 499))
    assert.ok(read.calls.some(c => c[0] === 'order'))
    if (read.table === 'learning_list_items') assert.ok(read.calls.some(c => c[0] === 'eq' && c[1] === 'learning_lists.user_id' && c[2] === 'owner'))
  }
})

test('Lists still tolerates an optional missing bookmarks table without hiding oversized collections', async () => {
  assert.deepEqual((await fixture({missingBookmarks: true}).run()).bookmarkedSharedLists, [])
  await assert.rejects(fixture({size: 10001}).run(), /too large/)
})
