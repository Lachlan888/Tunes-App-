// Reference playlist lifecycle using real React and disposable provider/action doubles.
// RENDERER_ROOT=/private/tmp/tunes-review-lifecycle node tests/integration/reference-playlist-lifecycle.mjs
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

const NativeFormData=globalThis.FormData
globalThis.FormData=class extends NativeFormData {constructor(){super()}}
let provider, options, dock
class Provider {
  constructor(_mount,config){options=config;this.time=0;this.rate=1;this.state=2}
  getCurrentTime(){return this.time}
  getDuration(){return 120}
  getAvailablePlaybackRates(){return [0.5,0.75,1]}
  getPlaybackRate(){return this.rate}
  getPlayerState(){return this.state}
  setPlaybackRate(rate){this.rate=rate}
  seekTo(time){this.time=time}
  playVideo(){this.state=1;options.events.onStateChange({target:this,data:1})}
  pauseVideo(){this.state=2;options.events.onStateChange({target:this,data:2})}
  destroy(){}
}
window.YT={Player:function(...args){provider=new Provider(...args);return provider},PlayerState:{PLAYING:1}}
window.setInterval=fn=>{timers.set(++timerId,fn);return timerId}
window.clearInterval=id=>timers.delete(id)
document.createElement=()=>({})
let tree
const props={videoId:'recording-a',title:'Fixture',recordingLabel:'Recording A',pieceId:42,mediaPanel:null}
const labelled=label=>tree.root.findByProps({'aria-label':label})
const nodeText=node=>typeof node==='string'?node:Array.isArray(node)?node.map(nodeText).join(''):node?.props?nodeText(node.props.children):''
const button=text=>tree.root.findAllByType('button').find(n=>nodeText(n)===text)
const change=async(label,value)=>act(async()=>labelled(label).props.onChange({target:{value}}))
const click=async text=>act(async()=>{assert.ok(button(text),text);button(text).props.onClick()})
const fixture=(id,label,start)=>({id,label,piece_id:42,youtube_video_id:'recording-a',start_seconds:start,end_seconds:start+5,playback_rate:0.75,notes:'Fixture notes'})
const saved=[fixture(11,'A',10),fixture(12,'B',20),fixture(13,'C',30)]
const calls=[]
let reject=false
const resultLoop=form=>({...Object.fromEntries(form),id:Number(form.get('loop_id')||99)})
mocks['@/lib/actions/media-loops']={}
mocks['@/lib/actions/media-loops'].createMediaLoopInPlace=async form=>{calls.push(['create',Object.fromEntries(form)]);return reject?{ok:false,error:'Rejected fixture write'}:{ok:true,loop:resultLoop(form)}}
mocks['@/lib/actions/media-loops'].updateMediaLoopInPlace=async form=>{calls.push(['update',Object.fromEntries(form)]);return reject?{ok:false,error:'Rejected fixture write'}:{ok:true,loop:resultLoop(form)}}
mocks['@/lib/actions/media-loops'].deleteMediaLoopInPlace=async form=>{calls.push(['delete',Object.fromEntries(form)]);return reject?{ok:false,error:'Rejected fixture write'}:{ok:true}}
const PlaylistPlayer=load(resolve('components/library/YouTubeLoopPlayer.tsx')).default
const mountPlaylist=async()=>{
 await act(async()=>{tree=create(React.createElement(PlaylistPlayer,{...props,savedLoops:saved}),{createNodeMock:()=>({replaceChildren(){}})})})
 await act(async()=>options.events.onReady({target:provider}))
}
window.confirm=()=>true
const press=async label=>act(async()=>labelled(label).props.onClick())
const bankLabels=()=>tree.root.findAllByType('button').map(node=>node.props['aria-label']).filter(label=>label?.startsWith('Select loop bank'))
const submit=async()=>act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){},currentTarget:{}}))
try {
 await mountPlaylist()
 assert.ok(labelled('Select loop bank A: A'))
 assert.ok(labelled('Select loop bank B: B'))
 assert.ok(labelled('Select loop bank C: C'))
 assert.equal(provider.time,10);assert.equal(provider.state,2,'default bank selection never autoplays')
 await press('Select loop bank C: C')
 assert.equal(provider.time,30);assert.equal(provider.state,2)
 await act(async()=>dock.primaryAction.onInvoke());assert.equal(provider.state,1)
 await act(async()=>dock.secondaryActions.find(action=>action.id==='previous').onInvoke());assert.equal(provider.time,20);assert.equal(provider.state,2)
 await act(async()=>dock.secondaryActions.find(action=>action.id==='save-loop').onInvoke())
 await change('Loop name','B revised')
 reject=true;await submit()
 assert.equal(labelled('Loop name').props.value,'B revised')
 assert.equal(provider.time,20)
 reject=false;await submit()
 assert.ok(bankLabels().includes('Select loop bank B: B revised'),bankLabels().join(' | '))
 assert.equal(calls.at(-1)[1].youtube_video_id,'recording-a')
 await act(async()=>dock.secondaryActions.find(action=>action.id==='save-loop').onInvoke())
 reject=true;await click('Delete saved loop')
 assert.ok(labelled('Select loop bank B: B revised'))
 reject=false;await click('Delete saved loop')
 assert.ok(labelled('Select loop bank B: Empty'))
 reject=true;await click('Undo');assert.ok(labelled('Select loop bank B: Empty'));assert.ok(button('Undo'))
 reject=false;await click('Undo')
 assert.ok(labelled('Select loop bank B: B revised'),'Undo restores the deleted loop to its bank')
 await act(async()=>tree.unmount());await mountPlaylist()
 await act(async()=>tree.update(React.createElement(PlaylistPlayer,{...props,savedLoops:[saved[0],{...saved[1],id:99,label:'B revised'},saved[2]]})))
 assert.ok(labelled('Select loop bank B: B revised'))
 assert.equal(provider.state,2,'remount never auto-auditions')
 console.log('PASS: loop-bank selection/playback, previous/next, rejected update/delete/Undo, restored bank and source payload')
} finally {if(tree)await act(async()=>tree.unmount());globalThis.FormData=NativeFormData}
