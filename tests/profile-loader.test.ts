import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as navigation from '../lib/profile-navigation.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const compiled = ts.transpileModule(readFileSync(new URL('../lib/loaders/profile-public.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText

type Read = { table: string; calls: [string, ...unknown[]][] }
function fixture({viewer = 'owner', friend = false, shared = true, visible = true, preview = false, tab = 'overview', group = 'known', page = 1}: {viewer?:string | null;friend?:boolean;shared?:boolean;visible?:boolean;preview?:boolean;tab?:string;group?:string;page?:number} = {}) {
  const reads: Read[] = []
  const flags = {id:'owner',username:'piper',show_identity:visible,show_instruments:visible,show_public_lists_on_profile:visible,show_composed_tunes_on_profile:visible,show_repertoire_summary:visible,show_repertoire_to_friends:shared,show_comment_activity:visible,show_compare_discoverability:visible,compare_requires_friend:true}
  const db = {auth:{getUser:async()=>({data:{user:viewer ? {id:viewer} : null}})},from(table:string) {
    const read: Read = {table,calls:[]}; reads.push(read)
    const response = () => {
      const columns = String(read.calls.find(c=>c[0]==='select')?.[1])
      let data: unknown = []
      if (table === 'profiles') data = columns === 'display_name,bio' ? {display_name:'Public name',bio:'Shared musical bio'} : columns.startsWith('id,username,show_identity') ? flags : []
      else if (table === 'connections') data = friend ? {id:1,status:'accepted',requester_id:'viewer'} : null
      else if (table === 'pieces') data = [{id:1,title:'Public composition'}]
      else if (table === 'learning_lists') data = Array.from({length:21},(_,i)=>({id:i,name:`Public list ${i}`,visibility:'public',learning_list_items:[{count:3}]}))
      else if (table === 'user_known_pieces' || table === 'user_pieces') data = Array.from({length:21},(_,i)=>({piece_id:i,pieces:{id:i,title:`Tune ${i}`}}))
      else if (table === 'badges') data = Array.from({length:11},(_,i)=>({id:i,name:`Badge ${i}`,badge_awards:[{count:2}]}))
      return {data,error:null,count:21}
    }
    const chain = new Proxy({}, {get(_target,method:string) {
      if (method === 'then') return (resolve:(value:unknown)=>unknown)=>Promise.resolve(response()).then(resolve)
      return (...args:unknown[])=>{read.calls.push([method,...args]);return chain}
    }})
    return chain
  }}
  const loadedModule = {exports:{} as {loadPublicProfileData:(username:string,query:unknown)=>Promise<Record<string,unknown>>}}
  new Function('require','module','exports',compiled)((id:string)=> {
    if (id.includes('supabase/server')) return {createClient:async()=>db}
    if (id.includes('profile-navigation')) return navigation
    if (id === 'next/navigation') return {redirect:(path:string)=>{throw new Error(`REDIRECT ${path}`)}}
    throw new Error(id)
  },loadedModule,loadedModule.exports)
  return {reads, run:()=>loadedModule.exports.loadPublicProfileData('piper',navigation.parseProfileQuery({tab,group,page:String(page),preview:preview?'public':''}))}
}

test('signed-out profiles retain the requested tab through login without reading private data',async()=> {
  const f=fixture({viewer:null,tab:'repertoire',group:'practice',page:2})
  await assert.rejects(f.run(),/REDIRECT \/login\?next=%2Fusers%2Fpiper%3Ftab%3Drepertoire%26page%3D2%26group%3Dpractice/)
  assert.equal(f.reads.length,0)
})
test('hidden profile fields and inventory never enter visitor or public-preview queries',async()=> {
  for (const options of [{viewer:'stranger'}, {viewer:'friend',friend:true}, {viewer:'owner',preview:true}]) {
    const f=fixture({...options,visible:false,shared:false})
    const result=await f.run()
    assert.equal((result.profile as {bio:null}).bio,null)
    assert.equal(result.summary,null)
    assert.ok(!f.reads.some(r=>['user_pieces','user_known_pieces','user_instruments','pieces','learning_lists','user_activity_events'].includes(r.table)))
    assert.ok(!f.reads.some(r=>r.calls.some(c=>String(c[1]).includes('display_name,bio'))))
  }
})
test('repertoire queries enforce owner/friend consent before selecting a bounded page',async()=> {
  for (const [viewer,friend,shared,preview,allowed] of [['owner',false,false,false,true],['friend',true,true,false,true],['stranger',false,true,false,false],['friend',true,false,false,false],['owner',false,true,true,false]] as const) {
    const f=fixture({viewer,friend,shared,preview,tab:'repertoire',group:'practice',page:3})
    const data=await f.run()
    const inventory=f.reads.find(r=>r.table==='user_pieces' && r.calls.some(c=>String(c[1]).includes('pieces!inner')))
    assert.equal(Boolean(inventory),allowed)
    assert.equal((data.tunes as unknown[]).length,allowed?20:0)
    if (inventory) {assert.ok(inventory.calls.some(c=>c[0]==='range' && c[1]===40 && c[2]===60));assert.ok(inventory.calls.some(c=>c[0]==='eq' && c[1]==='status' && c[2]==='learning'))}
  }
})
test('profile lists and badges require explicit public visibility and bounded pagination',async()=> {
  for (const tab of ['lists','badges']) {
    const f=fixture({viewer:'stranger',tab,page:2})
    const result=await f.run()
    assert.equal(result.hasNext,true)
    for(const read of f.reads.filter(r=>['learning_lists','badges','badge_awards'].includes(r.table))) {
      assert.ok(read.calls.some(c=>c[0]==='eq' && String(c[1]).endsWith('visibility') && c[2]==='public'))
      assert.ok(read.calls.some(c=>c[0]==='range' && Number(c[2])-Number(c[1])<=20))
    }
    assert.ok(!f.reads.some(r=>['user_pieces','user_known_pieces'].includes(r.table)))
  }
})
test('Overview shares only a small permitted overlap sample and previews omit it',async()=> {
  const friend=fixture({viewer:'friend',friend:true})
  const result=await friend.run()
  assert.equal((result.sharedTunes as unknown[]).length,3)
  const sample=friend.reads.find(r=>r.table==='user_known_pieces' && r.calls.some(c=>String(c[1]).includes('pieces!inner')))
  assert.ok(sample?.calls.some(c=>c[0]==='range' && c[1]===0 && c[2]===20))
  const preview=await fixture({viewer:'owner',preview:true}).run()
  assert.deepEqual(preview.sharedTunes,[])
})
