import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function loadPublicListsWithClient(createClient: () => Promise<unknown>) {
  const source = readFileSync(new URL('../lib/loaders/public-lists.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const loaded = { exports: {} as { loadPublicListsData: () => Promise<{ status: string; message?: string }> } }
  new Function('require', 'module', 'exports', compiled)((id: string) => {
    if (id === '@/lib/supabase/server') return { createClient }
    throw Error(`Unexpected dependency: ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports.loadPublicListsData
}

test('public lists show recovery when the database client cannot connect', async () => {
  const load = loadPublicListsWithClient(async () => { throw Error('private connection detail') })
  const result = await load()
  assert.equal(result.status, 'error')
  assert.ok(result.message)
  assert.doesNotMatch(result.message, /private connection detail/)
})

test('public lists show recovery when the authentication request fails', async () => {
  const load = loadPublicListsWithClient(async () => ({
    auth: { getUser: async () => { throw Error('private auth detail') } },
  }))
  const result = await load()
  assert.equal(result.status, 'error')
  assert.ok(result.message)
  assert.doesNotMatch(result.message, /private auth detail/)
})
