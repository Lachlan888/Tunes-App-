// Reference transport lifecycle using real React and disposable provider/action doubles.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/reference-transport-lifecycle.mjs
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
const timers = new Map()
const windowListeners = new Map()
const storage = new Map()
const sessionStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
let timerId = 0
let dock
globalThis.window = {}
globalThis.document = {}
window.addEventListener=(type,handler)=>windowListeners.set(type,handler)
window.removeEventListener=(type,handler)=>{if(windowListeners.get(type)===handler)windowListeners.delete(type)}
const Modal=({isOpen,children,footer})=>isOpen?React.createElement('section',null,children,footer):null
const mocks = {
  react:React,'react/jsx-runtime':rendererRequire('react/jsx-runtime'),
  'react-dom':{createPortal:children=>children},
  '@/components/resilience/PrivateSessionProvider':{usePrivateSessionStorage:()=>sessionStorage},
  '@/components/session-dock/SessionDockProvider':{useSessionDock:(_id,model)=>{dock=model}},
  '@/components/ui/ResponsiveModal':{default:Modal},
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

let createCalls=0, updateCalls=0, finishSave
mocks['@/lib/actions/media-loops']={
  createMediaLoopInPlace:form=>{createCalls++;return new Promise(resolve=>{finishSave=()=>resolve({ok:true,loop:{id:1,label:form.get('label'),start_seconds:form.get('start_seconds'),end_seconds:form.get('end_seconds'),playback_rate:form.get('playback_rate'),notes:''}})})},
  updateMediaLoopInPlace:async()=>{updateCalls++;return {ok:false,error:'Rejected fixture write'}},
  deleteMediaLoopInPlace:async()=>{throw Error('Unexpected delete')},
}
const NativeFormData=globalThis.FormData
globalThis.FormData=class extends NativeFormData {constructor(){super()}}
let provider, options, destroyed=0
class Provider {
  constructor(_mount,config){options=config;this.time=0;this.rate=1;this.state=-1}
  getCurrentTime(){return this.time}
  getDuration(){return 120}
  getAvailablePlaybackRates(){return [0.5,0.75,1]}
  getPlaybackRate(){return this.rate}
  getPlayerState(){return this.state}
  setPlaybackRate(rate){this.rate=rate}
  seekTo(time){this.time=time;if(this.state!==2)this.state=1}
  cueVideoById({startSeconds}){this.time=startSeconds;this.rate=1;this.state=5}
  playVideo(){this.state=1;options.events.onStateChange({target:this,data:1})}
  pauseVideo(){this.state=2;options.events.onStateChange({target:this,data:2})}
  destroy(){destroyed++}
}
window.YT={Player:function(...args){provider=new Provider(...args);return provider},PlayerState:{PLAYING:1}}
window.setInterval=fn=>{timers.set(++timerId,fn);return timerId}
window.clearInterval=id=>timers.delete(id)
document.createElement=()=>({})
const Player=load(resolve('components/library/YouTubeLoopPlayer.tsx')).default
const emptyLoops=[]
let tree
const props={videoId:'recording-a',title:'Fixture',recordingLabel:'Recording A',pieceId:42,savedLoops:emptyLoops,mediaPanel:null}
const mount=async p=>{
  await act(async()=>{tree=create(React.createElement(Player,p),{createNodeMock:()=>({replaceChildren(){}})})})
  await act(async()=>options.events.onReady({target:provider}))
}
const labelled=label=>tree.root.findByProps({'aria-label':label})
const change=async(label,value)=>act(async()=>labelled(label).props.onChange({target:{value}}))
const tick=async()=>act(async()=>{for(const fn of timers.values())fn()})
const key=async(code,target={tagName:'DIV'})=>act(async()=>windowListeners.get('keydown')?.({code,target,defaultPrevented:false,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,preventDefault(){this.defaultPrevented=true}}))
try {
  await mount(props)
  await act(async()=>dock.transport.onSeek(22.5))
  assert.equal(provider.time,22.5)
  await act(async()=>dock.transport.speed.onChange(0.75))
  assert.equal(provider.rate,0.75)
  assert.equal(dock.transport.speed.value,0.75)
  await key('ArrowRight')
  assert.equal(provider.time,27.5,'right arrow seeks five seconds')
  await key('ArrowLeft',{tagName:'INPUT'})
  assert.equal(provider.time,27.5,'editing controls keep their arrow keys')
  await key('Space')
  assert.equal(provider.state,1,'space starts provider playback')
  await key('Space')
  assert.equal(provider.state,2,'space pauses provider playback')
  assert.equal(createCalls,0)
  await act(async()=>dock.secondaryActions.find(action=>action.id==='loop-out').onInvoke())
  assert.equal(labelled('Adjust loop in point').props.value,0)
  assert.equal(labelled('Adjust loop out point').props.value,27.5)
  assert.equal(tree.root.findAllByType('form').length,0)
  await act(async()=>dock.secondaryActions.find(action=>action.id==='loop-out').onInvoke())
  assert.equal(tree.root.findAllByType('form').length,0,'recapture keeps one draft without opening save')
  await change('Adjust loop out point','8.5')
  await act(async()=>dock.secondaryActions.find(action=>action.id==='save-loop').onInvoke())
  assert.equal(tree.root.findAllByType('form').length,1)
  await act(async()=>dock.primaryAction.onInvoke())
  assert.equal(provider.time,0,'resume returns inside shortened loop')
  assert.equal(dock.primaryAction.label.includes('Pause'),true)
  await act(async()=>dock.secondaryActions.find(action=>action.id==='stop').onInvoke())
  assert.equal(provider.state,2,'stop pauses provider playback')
  assert.equal(provider.time,0,'stop returns to the active loop start')
  await act(async()=>dock.primaryAction.onInvoke())
  provider.time=8.6;await tick()
  assert.equal(provider.time,0,'forward boundary crossing loops')
  await change('Loop name','Phrase A')
  const submit=tree.root.findByType('form').props.onSubmit
  await act(async()=>{submit({preventDefault(){},currentTarget:{}});submit({preventDefault(){},currentTarget:{}})})
  assert.equal(createCalls,1,'same-turn duplicate submission is guarded')
  await act(async()=>finishSave())
  assert.equal(tree.root.findAllByType('form').length,0,'saved draft closes')
  await act(async()=>dock.secondaryActions.find(action=>action.id==='save-loop').onInvoke())
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){},currentTarget:{}}))
  assert.equal(updateCalls,1,'subsequent save updates existing passage')
  assert.equal(createCalls,1)
  assert.ok(JSON.stringify(tree.toJSON()).includes('Rejected fixture write'))
  await act(async()=>dock.transport.onSeek(6))
  const before=JSON.parse(storage.get('tunes.session.v1.reference.42.recording-a'))
  await act(async()=>tree.unmount())
  await mount(props)
  assert.equal(provider.time,6)
  assert.equal(provider.rate,0.75)
  assert.notEqual(provider.state,1,'restoration never autoplays')
  assert.equal(labelled('Adjust loop out point').props.value,8.5)
  assert.equal(JSON.parse(storage.get('tunes.session.v1.reference.42.recording-a')).mobileView,before.mobileView)
  await act(async()=>tree.update(React.createElement(Player,{...props,videoId:'recording-b'})))
  await act(async()=>options.events.onReady({target:provider}))
  assert.equal(provider.time,0,'new source does not inherit old playhead')
  assert.equal(labelled('Adjust loop out point').props.value,0)
  await act(async()=>options.events.onError({target:provider,data:150}))
  assert.equal(dock.primaryAction.disabled,true)
  assert.ok(tree.root.findAllByType('a').some(a=>a.props.href==='https://www.youtube.com/watch?v=recording-b'))
  await act(async()=>tree.unmount())
  const orderedLoops=[
    {id:10,label:'First',start_seconds:10,end_seconds:20,playback_rate:1,notes:''},
    {id:11,label:'Second',start_seconds:30,end_seconds:40,playback_rate:0.75,notes:''},
  ]
  await mount({...props,videoId:'recording-c',savedLoops:orderedLoops})
  await act(async()=>labelled('Select loop bank A: First').props.onClick())
  assert.equal(provider.time,10)
  assert.notEqual(provider.state,1,'selecting a loop does not autoplay')
  await act(async()=>dock.secondaryActions.find(action=>action.id==='next').onInvoke())
  assert.equal(provider.time,30,'next follows playlist order')
  assert.equal(provider.state,2,'next selection remains paused')
  await act(async()=>dock.secondaryActions.find(action=>action.id==='previous').onInvoke())
  assert.equal(provider.time,10,'previous follows playlist order')
  const sectionButton = text => tree.root.findAllByType('button').find(button => button.props.children === text)
  const click = async text => {
    assert.equal(sectionButton(text).props.disabled, false)
    await act(async()=>sectionButton(text).props.onClick())
  }
  const range = () => [labelled('Adjust loop in point').props.value, labelled('Adjust loop out point').props.value]
  await change('Adjust loop out point', '24')
  await change('Adjust loop in point', '20')
  await act(async()=>dock.transport.speed.onChange(0.75))
  await click('Next section')
  assert.deepEqual(range(), [24,28])
  assert.equal(provider.rate,0.75)
  assert.equal(provider.state,2)
  await click('Previous section')
  await click('Previous section')
  assert.deepEqual(range(), [16,20])
  await click('Halve')
  await click('Next section')
  assert.deepEqual(range(), [18,20])
  await click('Double')
  await click('Next section')
  assert.deepEqual(range(), [22,26])
  await change('Adjust loop in point', '2')
  await change('Adjust loop out point', '6')
  await click('Previous section')
  assert.deepEqual(range(), [0,4])
  assert.equal(sectionButton('Previous section').props.disabled,true)
  await change('Adjust loop out point', '116')
  await change('Adjust loop in point', '112')
  await click('Next section')
  assert.deepEqual(range(), [116,120])
  assert.equal(sectionButton('Next section').props.disabled,true)
  await change('Adjust loop in point', '115')
  await change('Adjust loop out point', '119')
  assert.equal(sectionButton('Next section').props.disabled,true)
  await act(async()=>sectionButton('Clear').props.onClick())
  assert.equal(sectionButton('Previous section').props.disabled,true)
  assert.equal(sectionButton('Next section').props.disabled,true)
  assert.equal(provider.rate,0.75)
  console.log('PASS: section buttons, same-length shifts, speed preservation, start clamp, end limits, resize and clear')
  await act(async()=>tree.unmount())
  let controlsOpen = false
  await mount({...props,videoId:'session-recording',savedLoops:orderedLoops,presentation:'session',onControlsOpenChange:open=>{controlsOpen=open}})
  assert.equal(dock,null,'session owns its rating bar without a competing reference dock')
  const sessionProvider=provider
  const destroyBefore=destroyed
  assert.notEqual(provider.state,1,'entering practice never autoplays')
  assert.equal(tree.root.findAllByType('button').find(button=>button.props.className==='practice-loop-status').props['aria-pressed'],true,'valid saved loop starts enabled')
  provider.time=0 // A cued YouTube player can report zero before first playback.
  await key('ArrowRight')
  assert.equal(provider.time,15,'keyboard seeking starts from the intended cued position')
  await act(async()=>labelled('Play reference').props.onClick())
  provider.time=15
  await tick()
  await act(async()=>tree.root.findByProps({className:'practice-pedal-trigger'}).props.onClick())
  assert.equal(controlsOpen,true)
  await act(async()=>labelled('Decrease Speed').props.onClick())
  assert.equal(provider.rate,0.75)
  await act(async()=>tree.root.findAllByType(Modal).find(modal=>modal.props.title==='Loop pedal').props.onClose())
  assert.equal(controlsOpen,false)
  assert.equal(provider,sessionProvider,'opening and closing pedal never creates another player')
  assert.equal(destroyed,destroyBefore)
  assert.equal(provider.time,15,'playhead stays in place')
  assert.equal(provider.state,1,'playback continues across panel changes')
  assert.equal(provider.rate,0.75,'speed stays in place')
  provider.time=20.1;await tick()
  assert.equal(provider.time,10,'loop still repeats after closing the pedal')
  console.log('PASS: session player persists across pedal open/close, loop defaults on, speed and transport preserved')
  assert.ok(destroyed>=2)
  console.log('PASS: dock seek/speed, keyboard, pause/stop, loop order, zero-start capture, boundary/resume, persistence, source replacement, provider recovery')
} finally {if(tree)await act(async()=>tree.unmount());globalThis.FormData=NativeFormData}
