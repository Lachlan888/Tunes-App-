import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
type Call = [string, ...unknown[]]
type Row = Record<string, unknown>

// This double tests application boundaries, not PostgreSQL RLS. Denied rows are
// deliberately supplied by the fixture; real database acceptance is separate.
function fixture(userId: string | null, list: Row | null, denied = false) {
  const reads: { table: string; calls: Call[] }[] = []
  const effects: string[] = []
  const forbidden = (name: string) => { effects.push(name); throw Error(`Unexpected effect: ${name}`) }
  const db = {
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
    from(table: string) {
      const calls: Call[] = []
      reads.push({ table, calls })
      const chain = new Proxy({}, { get(_target, method: string) {
        if (method === 'then') return (resolve: (value: unknown) => unknown) => {
          let rows = table === 'learning_lists' && list && !denied ? [list] : []
          for (const [operation, key, value] of calls) {
            if (operation === 'eq') rows = rows.filter(row => row[String(key)] === value)
          }
          const single = calls.some(([operation]) => ['single', 'maybeSingle'].includes(operation))
          return Promise.resolve({ data: single ? rows[0] ?? null : rows, error: null }).then(resolve)
        }
        if (['insert', 'update', 'delete', 'upsert', 'rpc'].includes(method)) return () => forbidden(`${table}.${method}`)
        assert.ok(['select', 'eq', 'in', 'order', 'limit', 'single', 'maybeSingle'].includes(method), method)
        return (...args: unknown[]) => { calls.push([method, ...args]); return chain }
      } })
      return chain
    },
  }
  function load(path: string): Record<string, (...args: unknown[]) => Promise<Record<string, unknown>>> {
    const compiled = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    const loaded = { exports: {} }
    new Function('require', 'module', 'exports', compiled)((id: string) => {
      if (id === '@/lib/supabase/server') return { createClient: async () => db }
      if (id === 'next/navigation') return {
        notFound: () => { throw Error('NOT_FOUND') },
        redirect: (url: string) => { throw Error(`REDIRECT:${url}`) },
      }
      if (id === '@/lib/auth/login-redirect') return { redirectToLogin: () => { throw Error('LOGIN') } }
      if (id === '@/lib/tune-media') return { loadTuneMediaBundles: async () => new Map() }
      if (id === 'next/cache') return { revalidatePath: () => forbidden('revalidate') }
      if (id === '@/lib/actions/user-pieces') return { startPracticeForUser: () => forbidden('practice') }
      if (id === '@/lib/services/activity-events') return {
        recordPublicListCreatedEvent: () => forbidden('publish'),
        recordPublicListUpdatedEvent: () => forbidden('activity'),
      }
      throw Error(`Unexpected dependency: ${id}`)
    }, loaded, loaded.exports)
    return loaded.exports
  }
  return { reads, effects, load }
}

const privateList = { id: 7, user_id: 'owner', name: 'Private secret', visibility: 'private' }
const publicList = { ...privateList, visibility: 'public' }

for (const [user, list, expected] of [
  ['owner', privateList, 'owner'], ['recipient', privateList, 'shared_viewer'], ['viewer', publicList, 'public_viewer'],
] as const) {
  test(`detail loader returns ${expected} without effects or recipient enumeration`, async () => {
    const f = fixture(user, list)
    const result = await f.load('lib/loaders/list-detail.ts').loadLearningListDetailData('7')
    assert.equal(result.accessMode, expected)
    assert.equal(f.reads.some(read => read.table === 'learning_list_shares'), expected === 'owner')
    assert.deepEqual(f.effects, [])
  })
}

for (const scenario of ['private', 'revoked', 'missing']) {
  test(`${scenario} inaccessible detail has the same not-found boundary and no dependent reads`, async () => {
    const f = fixture('outsider', scenario === 'missing' ? null : privateList, true)
    await assert.rejects(f.load('lib/loaders/list-detail.ts').loadLearningListDetailData('7'), /^Error: NOT_FOUND$/)
    assert.deepEqual(f.reads.map(read => read.table), ['learning_lists'])
    assert.deepEqual(f.effects, [])
  })
}

test('signed-out private detail redirects before querying list existence', async () => {
  const f = fixture(null, privateList)
  await assert.rejects(f.load('lib/loaders/list-detail.ts').loadLearningListDetailData('7'), /^Error: LOGIN$/)
  assert.deepEqual(f.reads, [])
})

for (const user of [null, 'owner', 'viewer']) {
  test(`public loader accepts public link for ${user ?? 'signed out'} without effects`, async () => {
    const f = fixture(user, publicList)
    const result = await f.load('lib/loaders/public-list-detail.ts').loadPublicListDetailData('7')
    assert.equal((result.typedList as Row).id, 7)
    assert.equal(result.canBookmark, user === 'viewer')
    assert.deepEqual(f.effects, [])
  })
  test(`public route conceals private list even from ${user ?? 'signed out'}`, async () => {
    const f = fixture(user, privateList)
    await assert.rejects(f.load('lib/loaders/public-list-detail.ts').loadPublicListDetailData('7'), /^Error: NOT_FOUND$/)
    assert.deepEqual(f.reads.map(read => read.table), ['learning_lists'])
  })
}

for (const user of [null, 'recipient', 'viewer']) {
  for (const action of ['updateList', 'removeTuneFromList', 'deleteList', 'revokeLearningListPrivateShare', 'toggleLearningListVisibility', 'reorderListItems']) {
    test(`${user ?? 'signed out'} cannot invoke ${action} on another user's list`, async () => {
      // A visible private share/public list is returned unless the action applies
      // its owner filter. Thus removing that guard causes an attempted write.
      const f = fixture(user, user === 'recipient' ? privateList : publicList)
      const form = new FormData()
      for (const [key, value] of Object.entries({ learning_list_id: '7', list_id: '7', piece_id: '1', share_id: '1', name: 'Changed', visibility: 'public', next_visibility: 'public' })) form.set(key, value)
      const run = f.load('lib/actions/lists.ts')[action]
      if (action === 'reorderListItems') {
        assert.equal((await run({ listId: 7, orderedItemIds: [1, 2] })).status, 'error')
      } else {
        await assert.rejects(run(form), user === null ? /REDIRECT:\/login/ : /not_found|List not found/)
      }
      assert.deepEqual(f.effects, [])
      if (user === null) assert.deepEqual(f.reads, [])
      else {
        assert.deepEqual(f.reads.map(read => read.table), ['learning_lists'])
        assert.ok(f.reads[0].calls.some(([method, key, value]) => method === 'eq' && key === 'user_id' && value === user))
      }
    })
  }
}
