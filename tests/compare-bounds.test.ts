import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { readBoundedRows } from '../lib/loaders/bounded-read.ts'
import { deriveCompareOutcomeGroups } from '../lib/compare-outcomes.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
function compile(file: string, imports: Record<string, unknown>) {
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText
  const loaded = {exports: {} as Record<string, (...args: unknown[]) => Promise<Record<string, unknown>>>}
  new Function('require', 'module', 'exports', code)((id: string) => {
    if (id in imports) return imports[id]
    throw Error(`Unexpected import ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports
}

function fixture({tunes = 3, blocked = false, apiLimit = 500}: {tunes?: number; blocked?: boolean; apiLimit?: number} = {}) {
  const reads: {table: string; from: number; to: number; columns: string}[] = []
  const db = {auth: {getUser: async () => ({data: {user: {id: 'viewer'}}})}, from(table: string) {
    let from = 0, to = Infinity, columns = '', ids: unknown[] = []
    const chain = new Proxy({}, {get(_target, method: string) {
      if (method === 'then') return (resolve: (value: unknown) => unknown) => {
        reads.push({table, from, to, columns})
        const all = table === 'user_known_pieces'
          ? ['viewer','friend'].flatMap(user_id => Array.from({length: tunes}, (_, i) => ({user_id, piece_id: i + 1})))
          : table === 'user_pieces' ? [{user_id: 'viewer', piece_id: tunes + 1, stage: 2}, {user_id: 'friend', piece_id: tunes + 1, stage: 5}]
          : table === 'pieces' ? ids.map(id => ({id, title: `Tune ${String(id).padStart(5, '0')}`})) : []
        return Promise.resolve({data: all.slice(from, Math.min(to + 1, from + apiLimit)), count: all.length, error: null}).then(resolve)
      }
      return (...args: unknown[]) => {
        if (method === 'select') {columns = String(args[0]); assert.deepEqual(args[1], {count: 'exact'})}
        if (method === 'range') {from = Number(args[0]); to = Number(args[1])}
        if (method === 'in') ids = args[1] as unknown[]
        return chain
      }
    }})
    return chain
  }}
  const imports = {'@/lib/loaders/bounded-read': {readBoundedRows}, '@/lib/auth/login-redirect': {redirectToLogin: async () => {throw Error('redirect')}}}
  const repertoire = compile('../lib/loaders/compare/repertoire.ts', imports)
  const compare = compile('../lib/loaders/compare.ts', {
    ...imports,
    '@/lib/loaders/compare/repertoire': repertoire,
    '@/lib/compare-outcomes': {deriveCompareOutcomeGroups},
    '@/lib/supabase/server': {createClient: async () => db},
    '@/lib/loaders/compare/suggestions': {loadCompareSuggestions: async () => []},
    '@/lib/loaders/compare/profile-resolution': {resolveSelectedProfile: async () => ({error: null, matchedProfile: {id: 'friend', username: 'friend'}})},
    '@/lib/loaders/compare/friendship': {checkCompareFriendshipAccess: async () => ({blockedProfile: blocked ? {id: 'friend',username:'friend'} : null, allAccepted: true})},
    'next/navigation': {redirect: () => {throw Error('redirect')}},
  })
  return {reads, run: (includePractice = true, users = ['friend']) => compare.loadCompareData(users, {includePractice})}
}

test('Compare reuses Known/Practice reads and preserves known-only versus practice overlap', async () => {
  for (const includePractice of [true, false]) {
    const f = fixture(), result = await f.run(includePractice)
    assert.equal((result.mutualPieces as unknown[]).length, includePractice ? 4 : 3)
    assert.equal(f.reads.filter(r => ['user_known_pieces','user_pieces'].includes(r.table)).length, 2)
    assert.ok(f.reads.every(r => r.to - r.from <= 499))
  }
})

test('Compare retains repertoire beyond API row caps and batches tune details', async () => {
  const f = fixture({tunes: 1201, apiLimit: 125}), result = await f.run()
  assert.equal((result.mutualPieces as unknown[]).length, 1202)
  const pieces = result.outcomePieces as {id: number}[]
  assert.equal(new Set(pieces.map(p => p.id)).size, 1202)
  assert.ok(f.reads.filter(r => r.table === 'pieces').length < 20, 'never one request per tune')
})

test('blocked comparison and oversized groups read no repertoire', async () => {
  const blocked = fixture({blocked: true})
  assert.equal((await blocked.run()).canCompare, false)
  assert.equal(blocked.reads.length, 0)
  const oversized = fixture()
  assert.equal((await oversized.run(true, Array.from({length: 8}, (_, i) => `user-${i}`))).error, 'group_too_large')
  assert.equal(oversized.reads.length, 0)
})
