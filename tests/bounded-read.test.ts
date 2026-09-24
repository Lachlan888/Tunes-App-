import assert from 'node:assert/strict'
import test from 'node:test'
import { readBoundedRows, READ_ROW_BUDGET } from '../lib/loaders/bounded-read.ts'

test('bounded reads recover all rows when the project caps responses below the requested page', async () => {
  const calls: [number, number][] = []
  const rows = await readBoundedRows(async (from, to) => {
    calls.push([from, to])
    return {data: Array.from({length: Math.min(125, 1201 - from)}, (_, i) => from + i), count: 1201, error: null}
  })
  assert.deepEqual(rows, Array.from({length: 1201}, (_, i) => i))
  assert.equal(calls.length, 10)
  assert.ok(calls.every(([from, to]) => to - from === 499))
})

test('oversized, changed and incomplete collections cannot return partial totals', async () => {
  await assert.rejects(readBoundedRows(async () => ({data: [], count: READ_ROW_BUDGET + 1, error: null})), /too large/)
  await assert.rejects(readBoundedRows(async from => ({data: [from], count: from ? 3 : 2, error: null})), /changed/)
  await assert.rejects(readBoundedRows(async () => ({data: [], count: 1, error: null})), /completely/)
  await assert.rejects(readBoundedRows(async () => ({data: [], count: null, error: null})), /completely/)
})

test('empty reads and database failures preserve their actual outcomes', async () => {
  assert.deepEqual(await readBoundedRows(async () => ({data: [], count: 0, error: null})), [])
  await assert.rejects(readBoundedRows(async () => ({data: null, count: null, error: {message: 'permission denied'}})), /permission denied/)
})

test('request budget bounds unexpectedly tiny API pages', async () => {
  let calls = 0
  await assert.rejects(readBoundedRows(async () => {calls++; return {data: [1], count: 100, error: null}}), /completely/)
  assert.equal(calls, 40)
})
