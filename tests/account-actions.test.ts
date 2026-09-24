import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { settingsPatch } from '../lib/account-settings.ts'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const compiled=ts.transpileModule(readFileSync(new URL('../lib/actions/account-settings.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
function fixture(signedIn=true, fail=false) {
  const writes: {table:string;method:string;values:Record<string,unknown>;filters:unknown[][]}[]=[]
  const paths:string[]=[]
  const db={auth:{getUser:async()=>({data:{user:signedIn?{id:'current-user'}:null}})},from(table:string) {
    let write:typeof writes[number] | undefined
    const chain=new Proxy({}, {get(_target,method:string) {
      if(method==='then') return (resolve:(value:unknown)=>unknown)=>Promise.resolve({data:write?{id:'current-user'}:{username:'piper'},error:write&&fail?{code:'23505'}:null}).then(resolve)
      return (...args:unknown[])=> {
        if(['upsert','update','insert'].includes(method)){write={table,method,values:args[0] as Record<string,unknown>,filters:[]};writes.push(write)}
        if(method==='eq') write?.filters.push(args)
        return chain
      }
    }})
    return chain
  }}
  const loadedModule={exports:{} as {saveAccountSettings:(form:FormData)=>Promise<{error?:string;saved?:boolean}>}}
  new Function('require','module','exports',compiled)((id:string)=>{
    if(id.includes('supabase/server'))return{createClient:async()=>db}
    if(id.includes('account-settings'))return{settingsPatch}
    if(id==='next/cache')return{revalidatePath:(path:string)=>paths.push(path)}
    throw new Error(id)
  },loadedModule,loadedModule.exports)
  return {...loadedModule.exports,writes,paths}
}
test('settings action checks authentication and validation before attempting writes',async()=> {
  const form=new FormData();form.set('section','profile');form.set('username','bad space')
  for(const signedIn of [false,true]) {const f=fixture(signedIn);assert.ok((await f.saveAccountSettings(form)).error);assert.equal(f.writes.length,0)}
})
test('settings action updates only the current owner and the selected group',async()=> {
  const f=fixture();const form=new FormData()
  for(const [key,value] of Object.entries({section:'practice',practice_diary_enabled:'on',id:'victim',user_id:'victim',show_identity:'on',role:'admin'})) form.set(key,value)
  assert.deepEqual(await f.saveAccountSettings(form),{saved:true})
  assert.deepEqual(f.writes,[{table:'profiles',method:'update',values:{practice_diary_enabled:true},filters:[['id','current-user']]}])
  assert.ok(f.paths.includes('/users/piper'))
})
test('notifications use owner-scoped preferences without changing profile privacy',async()=> {
  const f=fixture();const form=new FormData();form.set('section','notifications');form.set('digest_frequency','weekly');form.set('user_id','victim')
  assert.deepEqual(await f.saveAccountSettings(form),{saved:true})
  assert.equal(f.writes[0].table,'notification_preferences');assert.equal(f.writes[0].values.user_id,'current-user');assert.equal('show_identity' in f.writes[0].values,false)
})
test('a rejected settings save remains an error and does not invalidate successful content',async()=> {
  const f=fixture(true,true);const form=new FormData();form.set('section','profile');form.set('username','piper')
  assert.deepEqual(await f.saveAccountSettings(form),{error:'That username is already taken.'});assert.equal(f.paths.length,0)
})
