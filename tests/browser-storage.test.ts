import assert from 'node:assert/strict'
import test from 'node:test'
import { optionalStorage, privateSessionStorage, purgeTunesSessionStorage } from '../lib/browser-storage.ts'

function fixture() {
  const entries = new Map<string, string>()
  let blocked = false
  const storage = {
    getItem(key: string) { if (blocked) throw Error('blocked'); return entries.get(key) ?? null },
    setItem(key: string, value: string) { if (blocked) throw Error('quota'); entries.set(key, value) },
    removeItem(key: string) { if (blocked) throw Error('blocked'); entries.delete(key) },
    get length() { return entries.size }, key(index: number) { return [...entries.keys()][index] ?? null },
  }
  return {entries, storage, block(value: boolean) { blocked = value }}
}
test('optional storage retains the latest value and deletion through quota and access failures', () => {
  const f = fixture(), storage = optionalStorage(() => f.storage)
  storage.setItem('position', '1'); f.block(true); storage.setItem('position', '2')
  assert.equal(storage.getItem('position'), '2')
  f.block(false); assert.equal(storage.getItem('position'), '2')
  storage.setItem('position', '3'); assert.equal(f.entries.get('position'), '3')
  f.block(true); storage.removeItem('position'); f.block(false)
  assert.equal(storage.getItem('position'), null, 'failed deletion must not resurrect stale state')
})
test('account namespaces isolate selections and logout purges only Tunes session data', () => {
  const f = fixture()
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {value: {sessionStorage: f.storage}, configurable: true})
  try {
    const a = privateSessionStorage('account-a'), b = privateSessionStorage('account-b')
    a.setItem('selection', '[123]'); b.setItem('selection', '[456]')
    assert.equal(a.getItem('selection'), '[123]'); assert.equal(b.getItem('selection'), '[456]')
    assert.equal(privateSessionStorage(null).getItem('selection'), null)
    f.storage.setItem('unrelated', 'retain'); f.storage.setItem('tunes.legacy', 'purge')
    purgeTunesSessionStorage()
    assert.equal(a.getItem('selection'), null); assert.equal(b.getItem('selection'), null)
    assert.deepEqual([...f.entries], [['unrelated', 'retain']])
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
