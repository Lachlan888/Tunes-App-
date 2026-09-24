import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const tokens = new Map([...css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(match => [match[1], match[2]]))
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
}
function contrast(a: string, b: string) {const values = [luminance(tokens.get(a)!), luminance(tokens.get(b)!)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05)}
test('semantic foregrounds and opaque hover states meet normal-text contrast', () => {
  for (const state of ['action-primary','state-known','state-practice','state-due','state-overdue','state-social','action-destructive']) {
    for (const fill of [state, `${state}-hover`].filter(key=>tokens.has(key))) {
      const ratio = contrast(fill, `${state}-foreground`)
      assert.ok(ratio >= 4.5, `${fill}: ${ratio.toFixed(2)}:1`)
    }
  }
  for (const ink of ['text-primary','text-muted']) for (const surface of ['surface-canvas','surface-paper','surface-note']) assert.ok(contrast(ink,surface)>=4.5, `${ink} on ${surface}`)
})
test('control boundaries and keyboard focus meet non-text contrast on all app surfaces', () => {
  for (const surface of ['surface-canvas','surface-paper','surface-note']) {
    assert.ok(contrast('control-border',surface)>=3, `control boundary on ${surface}`)
    assert.ok(contrast('focus-ring-strong',surface)>=3, `keyboard focus on ${surface}`)
  }
})
