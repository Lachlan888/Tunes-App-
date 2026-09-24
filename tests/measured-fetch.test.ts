import assert from 'node:assert/strict'
import test from 'node:test'
import { measuredFetch } from '../lib/supabase/measured-fetch.ts'

test('query measurements preserve request/response and omit sensitive request fields', async () => {
  const samples: unknown[] = []
  const response = new Response('private result')
  const init = { headers: { Authorization: 'private token' } }
  const url = 'https://example.test/rest/v1/private_table?user_id=private-id'
  const wrapped = measuredFetch(async (input, options) => {
    assert.equal(input, url)
    assert.equal(options, init)
    return response
  }, sample => samples.push(sample))
  assert.equal(await wrapped(url, init), response)
  assert.equal(await response.text(), 'private result')
  assert.equal(samples.length, 1)
  assert.deepEqual(Object.keys(samples[0] as object).sort(), ['durationMs', 'kind', 'status'])
  assert.equal((samples[0] as {kind: string}).kind, 'data')
  assert.doesNotMatch(JSON.stringify(samples), /private/)
})

test('failed network measurements preserve the rejection and auth classification', async () => {
  const failure = new Error('network unavailable')
  const samples: {kind: string; status: number | null}[] = []
  const wrapped = measuredFetch(async () => { throw failure }, sample => samples.push(sample))
  await assert.rejects(wrapped(new Request('https://example.test/auth/v1/user')), error => error === failure)
  assert.deepEqual(samples.map(({kind, status}) => ({kind, status})), [{kind: 'auth', status: null}])
})
