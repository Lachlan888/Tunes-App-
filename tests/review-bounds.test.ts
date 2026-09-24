import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const code = ts.transpileModule(readFileSync(new URL('../lib/loaders/review/queue.ts', import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText
const loaded = {exports: {} as {loadReviewPieceRows: (db: unknown, user: string, options: unknown) => Promise<{rows: unknown[]; total: number}>}}
new Function('require', 'exports', 'module', code)(() => ({}), loaded.exports, loaded)
function fixture(error: unknown = null) {
  const calls: [string, ...unknown[]][] = []
  const chain = new Proxy({}, {get(_target, method: string) {
    if (method === 'then') return (resolve: (result: unknown) => void) => Promise.resolve({data: [{id: 42}], count: 1500, error}).then(resolve)
    return (...args: unknown[]) => { calls.push([method, ...args]); return chain }
  }})
  return {calls, db: {from(table: string) { calls.push(['from', table]); return chain }}}
}
test('review page and session queries bound payloads while preserving full counts and stable order', async () => {
  for (const [lane, limit] of [[null, 20], ['due-today', 50], ['catch-up', 50]] as const) {
    const f = fixture(), result = await loaded.exports.loadReviewPieceRows(f.db, 'owner', {today: '2026-09-13', lane, limit})
    assert.equal(result.total, 1500)
    assert.ok(f.calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'owner'))
    assert.ok(f.calls.some(c => c[0] === 'limit' && c[1] === limit))
    assert.deepEqual(f.calls.filter(c => c[0] === 'order').map(c => c[1]), ['next_review_due', 'stage', 'id'])
    if (lane) assert.ok(f.calls.some(c => c[0] === (lane === 'catch-up' ? 'lt' : 'eq') && c[1] === 'next_review_due' && c[2] === '2026-09-13'))
  }
})
test('scoped practice filters membership before limiting, including lists larger than one API page', async () => {
  for (const kind of ['list', 'focus']) {
    const f = fixture()
    await loaded.exports.loadReviewPieceRows(f.db, 'owner', {today: '2026-09-13', lane: kind, limit: 50, scope: {kind, id: 7}})
    const select = String(f.calls.find(c => c[0] === 'select')?.[1])
    assert.match(select, /pieces!inner/)
    assert.ok(select.includes(kind === 'list' ? 'learning_list_items!inner' : 'practice_focus_tunes!inner'))
    assert.ok(!f.calls.some(c => c[0] === 'in'), 'must not truncate membership into a capped ID array')
    assert.ok(f.calls.some(c => c[0] === 'eq' && String(c[1]).startsWith('pieces.') && c[2] === 7))
  }
})
test('unavailable contexts do not load a general queue and query errors remain retryable', async () => {
  const f = fixture()
  assert.deepEqual(await loaded.exports.loadReviewPieceRows(f.db, 'owner', {scope: null}), {rows: [], total: 0})
  assert.equal(f.calls.length, 0)
  await assert.rejects(loaded.exports.loadReviewPieceRows(fixture({message: 'connection failed'}).db, 'owner', {limit: 20}), /connection failed/)
})
