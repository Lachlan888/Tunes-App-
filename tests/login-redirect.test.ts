import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { getAuthReturnPath } from '../lib/auth/redirects.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const code = ts.transpileModule(readFileSync(new URL('../lib/auth/login-redirect.ts', import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText

test('protected route login preserves session/filter context and rejects unsafe return paths', async () => {
  for (const [path, expected] of [
    ['/review?session=catch-up', '/review?session=catch-up'],
    ['/learning-lists/66?mode=manage&page=2', '/learning-lists/66?mode=manage&page=2'],
    ['//external.test', '/'],
    ['/login?next=/login', '/'],
    [null, '/'],
  ]) {
    const loaded = {exports: {} as {redirectToLogin: () => Promise<never>}}
    new Function('require', 'module', 'exports', code)((id: string) => {
      if (id === 'next/headers') return {headers: async () => ({get: () => path})}
      if (id === './redirects') return {getAuthReturnPath}
      if (id === 'next/navigation') return {redirect: (url: string) => {throw new Error(url)}}
      throw Error(id)
    }, loaded, loaded.exports)
    await assert.rejects(loaded.exports.redirectToLogin(), error => error instanceof Error && error.message === `/login?next=${encodeURIComponent(expected!)}`)
  }
})
