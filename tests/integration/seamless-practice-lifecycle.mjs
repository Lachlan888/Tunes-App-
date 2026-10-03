// Run with RENDERER_ROOT=/private/tmp/tunes-practice-checks node tests/integration/seamless-practice-lifecycle.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
const require = createRequire(import.meta.url)
const renderer = createRequire(`${process.env.RENDERER_ROOT}/package.json`)
const React = renderer('react'), {create, act} = renderer('react-test-renderer'), ts = require('typescript')
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const storage = new Map(), timers = new Map(), listeners = new Map()
const sessionStorage = {getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}
let timerId=0, writes=[], failWrite=false, batchCalls=0, batchContexts=[], dialogOpen=false
class ElementDouble { closest(){return null} }
globalThis.HTMLElement=ElementDouble
windowSetup()
function windowSetup(){ globalThis.window={scrollTo:()=>{},addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n),setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id)} }
globalThis.document={querySelector:()=>dialogOpen?{}:null}
const Host=tag=>function Host(props){return React.createElement(tag,props,props.children)}
const mocks={
  react:React,'react/jsx-runtime':renderer('react/jsx-runtime'),
  'next/link':{default:Host('a')},'next/navigation':{usePathname:()=>'/review',useSearchParams:()=>new URLSearchParams('session=ready&run=test')},
  '@/components/resilience/PrivateSessionProvider':{usePrivateSessionStorage:()=>sessionStorage},
  '@/hooks/useOnlineStatus':{useOnlineStatus:()=>true},
  '@/components/session-dock/SessionDockProvider':{useSessionDock:()=>{},useSessionDockPosition:()=>React.useState(0)},
  '@/components/practice/FocusModeShell':{default:Host('focus-shell')},
  '@/components/practice/PracticeProgress':{default:Host('progress')},
  '@/components/ui/Icon':{default:Host('icon')},
  '@/components/reference-media/PracticeReferencePlayer':{default:Host('practice-reference')},
  '@/lib/actions/reviews':{completeFormalReviewInPlace:async form=>{writes.push(Object.fromEntries(form));return failWrite?{ok:false,error:'Could not save'}:{ok:true,movedToKnown:false}}},
  '@/lib/actions/practice-session':{loadNextPracticeBatch:async context=>{batchCalls++;batchContexts.push(context);return {ok:true,items:[item(30)],total:1}}},
}
const cache=new Map()
function load(file){
 if(cache.has(file))return cache.get(file)
 const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 const m={exports:{}}
 new Function('require','module','exports',compiled)(id=>{
  if(mocks[id])return {...mocks[id],__esModule:true}
  if(!id.startsWith('@/')&&!id.startsWith('.'))return require(id)
  const base=id.startsWith('@/')?resolve(id.slice(2)):resolve(dirname(file),id)
  const target=[base,`${base}.ts`,`${base}.tsx`].find(existsSync);assert.ok(target,id);return load(target)
 },m,m.exports)
 cache.set(file,m.exports);return m.exports
}
const Session=load(resolve('components/practice/FocusedPracticeSession.tsx')).default
function item(id){return {id,piece_id:id,stage:3,overdue_days:2,piece:{id,title:`Tune ${id}`},media_bundle:{effectiveReference:null},active_practice_foci:[],practice_focus_options:[]}}
let tree
const mount=async(extra={})=>act(async()=>{tree=create(React.createElement(Session,{lane:'ready',initialQueue:[item(10),item(20)],queueTotal:3,sessionDate:'2026-10-03',practiceDiaryEnabled:true,noteCategories:[],catchUpCount:0,...extra}))})
const flush=async()=>act(async()=>{for(const [id,fn] of [...timers]){timers.delete(id);await fn()} await new Promise(r=>setImmediate(r))})
const text=()=>JSON.stringify(tree.toJSON())
const rating=outcome=>tree.root.findAllByType('button').find(n=>n.props['data-outcome']===outcome)
const click=async label=>act(async()=>{const n=tree.root.findAllByType('button').find(n=>n.props.children===label||n.props['aria-label']===label);assert.ok(n,label);n.props.onClick()})
try{
 await mount()
 assert.equal(tree.root.findAllByType('practice-reference').length,1,'reference is available immediately')
 assert.equal(tree.root.findAllByType('textarea').length,0,'no diary administration during practice')
 assert.doesNotMatch(text(),/Reveal reference|Add an optional review note/)
 await act(async()=>rating('solid').props.onClick())
 assert.equal(writes.length,0,'undo interval comes before saving')
 assert.equal(tree.root.findByType('practice-reference').props.navigationDisabled,true,'internal reference navigation cannot discard a pending rating')
 await click('Undo')
 await flush();assert.equal(writes.length,0)
 dialogOpen=true
 await act(async()=>listeners.get('keydown')({target:new ElementDouble(),key:'3'}))
 assert.equal(timers.size,0,'rating shortcuts do not fire inside an open loop dialog')
 dialogOpen=false
 failWrite=true
 await act(async()=>rating('solid').props.onClick());await flush()
 assert.equal(writes.length,1)
 assert.match(text(),/Tune 10/,'failure keeps current tune')
 failWrite=false
 await click('Retry saving')
 assert.equal(writes.length,2)
 assert.equal(writes[0].reviewSubmissionKey,writes[1].reviewSubmissionKey,'retry is idempotent')
 assert.match(text(),/Tune 20/,'successful save advances automatically')
 await act(async()=>rating('shaky').props.onClick());await flush()
 assert.equal(batchCalls,1,'next bounded batch loads automatically')
 assert.match(text(),/Tune 30/)
 await act(async()=>rating('failed').props.onClick());await flush()
 assert.match(text(),/3 tunes practised/)
 assert.match(text(),/Add a diary entry/)
 assert.equal(tree.root.findAllByType('practice-reference').length,0,'completion tears down playback')
 assert.equal(storage.has('tunes.session.v1.practice.active'),false)
 await click('Not now');assert.doesNotMatch(text(),/Add a diary entry/)
 await act(async()=>tree.unmount());storage.clear()
 await mount({initialQueue:[],queueTotal:0})
 assert.match(text(),/All caught up/)
 assert.doesNotMatch(text(),/Add a diary entry|0 tunes practised/)
 await act(async()=>tree.unmount());storage.clear()
 await mount({initialQueue:[item(10)],queueTotal:1,practiceDiaryEnabled:false})
 await act(async()=>rating('solid').props.onClick());await flush()
 assert.doesNotMatch(text(),/Add a diary entry/)
 await act(async()=>tree.unmount());storage.clear();writes=[];batchContexts=[]
 await mount({lane:'list',scopeId:7,sessionKey:'list-7'})
 await act(async()=>rating('solid').props.onClick());await flush()
 await act(async()=>rating('solid').props.onClick());await flush()
 assert.deepEqual(batchContexts.at(-1),{lane:'list',scopeId:7,afterId:20},'scoped batches preserve their context and use a stable cursor')
 assert.match(text(),/Tune 30/)
 // A resumed scoped session whose first server batch was already rated refills itself.
 await act(async()=>tree.unmount())
 batchContexts=[]
 await mount({lane:'list',scopeId:7,sessionKey:'list-7'})
 assert.deepEqual(batchContexts.at(-1),{lane:'list',scopeId:7,afterId:20})
 assert.match(text(),/Tune 30/)
 console.log('PASS: immediate reference, automatic advancement/refill, undo, idempotent retry, modal shortcut isolation, optional post-session diary and empty state')
}finally{if(tree)await act(async()=>tree.unmount())}
