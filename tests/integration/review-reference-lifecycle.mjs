// Real React component lifecycle, mocked browser/provider and server-action edges.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/review-reference-lifecycle.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
const require = createRequire(import.meta.url)
const rendererRequire = createRequire(`${process.env.RENDERER_ROOT}/package.json`)
const React = rendererRequire('react')
const { create, act } = rendererRequire('react-test-renderer')
const ts = require('typescript')
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const listeners = new Map()
const timers = new Map()
const storage = new Map()
const sessionStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
let timerId = 0
let dock
let writes = 0
class ElementDouble {
  constructor(interactive=false) { this.interactive=interactive }
  closest() { return this.interactive ? this : null }
}
globalThis.HTMLElement = ElementDouble
globalThis.Element = ElementDouble
globalThis.window = {
  addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name)=>listeners.delete(name),
  requestAnimationFrame:fn=>fn(),setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),
  confirm:()=>{throw Error('Unexpected navigation prompt')},
}
globalThis.document = {addEventListener:()=>{},removeEventListener:()=>{}}
const host = tag => function Host(props) { return React.createElement(tag,props,props.children) }
const mocks = {
  react:React,'react/jsx-runtime':rendererRequire('react/jsx-runtime'),
  'next/link':{default:host('a')},'next/navigation':{usePathname:()=>'/review',useSearchParams:()=>new URLSearchParams('session=catch-up')},
  '@/components/resilience/PrivateSessionProvider':{usePrivateSessionStorage:()=>sessionStorage},
  '@/hooks/useOnlineStatus':{useOnlineStatus:()=>true},
  '@/components/session-dock/SessionDockProvider':{useSessionDock:(_id,model)=>{dock=model},useSessionDockPosition:()=>React.useState(0)},
  '@/components/practice/FocusModeShell':{default:host('focus-shell')},
  '@/components/practice/PracticeProgress':{default:host('progress')},
  '@/components/ui/Icon':{default:host('icon')},
  '@/lib/actions/reviews':{completeFormalReviewInPlace:async()=>{writes++;return {ok:true,movedToKnown:false}}},
}
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const loaded={exports:{}}
  const customRequire=id=>{
    if (mocks[id]) return {...mocks[id],__esModule:true}
    if (!id.startsWith('@/')&&!id.startsWith('.')) return require(id)
    const path=id.startsWith('@/')?resolve(id.slice(2)):resolve(dirname(file),id)
    const target=[path,`${path}.ts`,`${path}.tsx`].find(existsSync)
    assert.ok(target,`Unresolved ${id}`)
    return load(target)
  }
  new Function('require','module','exports',compiled)(customRequire,loaded,loaded.exports)
  cache.set(file,loaded.exports)
  return loaded.exports
}
const Session=load(resolve('components/practice/FocusedPracticeSession.tsx')).default
const Inline=load(resolve('components/reference-media/InlineReferencePlayer.tsx')).default
const source={id:'canonical-10',label:'Recording',youtubeVideoId:'dQw4w9WgXcQ',url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
const item=id=>({id,piece_id:id,stage:3,overdue_days:2,piece:{id,title:`Tune ${id}`},media_bundle:{effectiveReference:source},active_practice_foci:[],practice_focus_options:[]})
const props={lane:'catch-up',initialQueue:[item(10),item(20)],queueTotal:2,sessionDate:'2026-09-23',noteCategories:[]}
let tree
const mount=async()=>act(async()=>{tree=create(React.createElement(Session,props),{createNodeMock:()=>({focus(){},scrollIntoView(){}})})})
const button=label=>tree.root.findAllByType('button').find(node=>node.props.children===label)
const click=async label=>act(async()=>{assert.ok(button(label),label);button(label).props.onClick()})
const frames=()=>tree.root.findAllByType('iframe')
try {
  await mount()
  assert.equal(frames().length,0)
  await act(async()=>tree.root.findByType('textarea').props.onChange({target:{value:'Keep this draft'}}))
  await click('Reveal reference')
  assert.equal(frames().length,0,'reveal requires deliberate play')
  await click('▶ Play reference')
  assert.equal(frames().length,1)
  await act(async()=>dock.secondaryActions.find(a=>a.id==='reference').onInvoke())
  assert.equal(frames().length,1,'dock reuses same player')
  assert.equal(tree.root.findByType('textarea').props.value,'Keep this draft')
  assert.equal(writes,0)
  for (const key of ['1','2','3']) await act(async()=>listeners.get('keydown')({target:new ElementDouble(true),key}))
  assert.equal(timers.size,0,'interactive targets never schedule rating')
  await click('Hide reference')
  assert.equal(frames().length,0,'collapse removes provider')
  await click('Reveal reference')
  assert.equal(frames().length,0,'reveal does not resume autoplay')
  await click('▶ Play reference')
  const href=tree.root.findAllByType('a').find(node=>node.props['data-preserve-review']).props.href
  const url=new URL(href,'https://tunes.invalid')
  assert.equal(url.searchParams.get('return_to'),'/review?session=catch-up')
  assert.equal(url.searchParams.get('media'),source.id)
  await act(async()=>tree.unmount())
  assert.equal(listeners.has('keydown'),false)
  await mount()
  assert.equal(tree.root.findByType('textarea').props.value,'Keep this draft','full workspace round trip restores draft')
  assert.equal(dock.identity.title,'Tune 10')
  assert.equal(writes,0)
  await click('Reveal reference');await click('▶ Play reference')
  await act(async()=>listeners.get('keydown')({target:new ElementDouble(),key:'3'}))
  assert.equal(timers.size,1)
  await act(async()=>{for(const [id,fn] of timers){timers.delete(id);fn()} await new Promise(resolve=>setImmediate(resolve))})
  assert.equal(writes,1)
  assert.equal(dock.identity.title,'Tune 20')
  assert.equal(frames().length,0,'advance removes old provider')
  await click('Reveal reference');await click('▶ Play reference')
  await act(async()=>dock.primaryAction.onInvoke())
  assert.equal(frames().length,0,'session end removes provider')
  console.log('PASS: deliberate play, single inline/dock player, collapse/advance/exit teardown, shortcut isolation, draft/queue round trip, exactly one explicit rating')
  await act(async()=>tree.unmount())
  for (const value of [null,{...source,youtubeVideoId:null},{...source,youtubeVideoId:'invalid'}]) {
    await act(async()=>{tree=create(React.createElement(Inline,{source:value,fullHref:'/library/10/reference-media'}))})
    assert.equal(frames().length,0)
    const links=tree.root.findAllByType('a')
    assert.ok(links.some(link=>link.props.href==='/library/10/reference-media'))
    if(value) assert.ok(links.some(link=>link.props.children==='Open source externally'))
    await act(async()=>tree.unmount())
  }
  console.log('PASS: missing, unsupported and invalid provider recovery; full-workspace link remains available')
} finally {if(tree) await act(async()=>tree.unmount())}
