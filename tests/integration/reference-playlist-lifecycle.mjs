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
const storage = new Map()
const sessionStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
let timerId = 0
globalThis.window = {}
globalThis.document = {}
const mocks = {
  react:React,'react/jsx-runtime':rendererRequire('react/jsx-runtime'),
  '@/components/resilience/PrivateSessionProvider':{usePrivateSessionStorage:()=>sessionStorage},
  '@/components/session-dock/SessionDockProvider':{useSessionDock:()=>{}},
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
let provider, options
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
const button=text=>tree.root.findAllByType('button').find(n=>n.props.children===text)
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
const rows=()=>labelled('Saved loop playlist').findAllByType('li')
const labels=()=>rows().map(row=>row.findAllByType('span')[0].props.children[2])
const rowButton=async(index,text)=>act(async()=>rows()[index].findAllByType('button').find(n=>n.props.children===text).props.onClick())
const select=async index=>act(async()=>rows()[index].findAllByType('button')[0].props.onClick())
const press=async label=>act(async()=>labelled(label).props.onClick())
const submit=async()=>act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){},currentTarget:{}}))
try {
 await mountPlaylist()
 assert.deepEqual(labels(),['A','B','C'])
 await rowButton(2,'Move up');await rowButton(1,'Move up')
 assert.deepEqual(labels(),['C','A','B'])
 assert.equal(calls.length,0,'reordering never sends remote writes')
 await select(0)
 assert.equal(provider.time,30);assert.equal(provider.state,2)
 await press('Audition C');assert.equal(provider.state,1)
 await press('Next loop');assert.equal(provider.time,10);assert.equal(provider.state,2)
 await press('Previous loop');assert.equal(provider.time,30);assert.equal(provider.state,2)
 await rowButton(0,'Rename / adjust');await change('Passage label','C revised');await change('Loop end seconds','37')
 reject=true;await submit()
 assert.deepEqual(labels(),['C','A','B']);assert.equal(labelled('Passage label').props.value,'C revised')
 assert.equal(provider.time,30)
 reject=false;await submit()
 assert.deepEqual(labels(),['C revised','A','B'])
 assert.equal(calls.at(-1)[1].youtube_video_id,'recording-a')
 await click('Manage passage')
 reject=true;await click('Delete passage')
 assert.deepEqual(labels(),['C revised','A','B'])
 reject=false;await click('Delete passage')
 assert.deepEqual(labels(),['A','B'])
 reject=true;await click('Undo');assert.deepEqual(labels(),['A','B']);assert.ok(button('Undo'))
 reject=false;await click('Undo')
 assert.deepEqual(labels(),['C revised','A','B'],'Undo preserves the deleted loop playlist position')
 assert.equal(Number(calls.at(-1)[1].end_seconds),37)
 await act(async()=>tree.unmount());await mountPlaylist()
 // Remount with server-returned restored ID, preserving session order.
 await act(async()=>tree.update(React.createElement(PlaylistPlayer,{...props,savedLoops:[saved[0],saved[1],{...saved[2],id:99,label:'C revised',end_seconds:37}]})))
 assert.deepEqual(labels(),['C revised','A','B'])
 assert.equal(provider.state,2,'remount never auto-auditions')
 console.log('PASS: playlist selection/audition, displayed previous/next, local reorder, rename/adjust, rejected update/delete/Undo, restored order and source payload')
} finally {if(tree)await act(async()=>tree.unmount());globalThis.FormData=NativeFormData}
