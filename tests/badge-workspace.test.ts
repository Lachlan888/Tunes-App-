import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { badgeFamilies, awardAnnouncementKey, isRecentAward, badgeNextAction } from '../lib/badges/identity.ts'
import { getShellKind } from '../components/layout/navItems.ts'
import type { Badge, BadgeIndexData, BadgeDetailData } from '../lib/types/badges.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
function moduleFrom(path: string, dependencies: Record<string, unknown>) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const loaded = {exports:{} as Record<string, (...args: unknown[]) => Promise<unknown>>}
  new Function('require','module','exports',compiled)((id:string)=> {
    if (id in dependencies) return dependencies[id]
    throw new Error(`Unexpected dependency ${id}`)
  },loaded,loaded.exports)
  return loaded.exports
}
const badge: Badge = {id:1,owner_user_id:'owner',name:'Tune Hound',slug:'tune-hound',description:'A weathered tunebook.',commentary:'Keep listening.',category:'repertoire',visibility:'public',awarding_mode:'auto_when_eligible',condition_logic:{conditions:[{type:'known_tune_count',count:5}]},created_at:'2026-09-01',updated_at:null}
type Read = {table:string;calls:[string,...unknown[]][]}
function fixture(viewer: string | null, record: Badge | null = badge) {
  const reads: Read[] = []
  let calculations = 0
  const db = { auth:{getUser:async()=>({data:{user:viewer ? {id:viewer} : null}})},from(table:string) {
    const read: Read = {table,calls:[]};reads.push(read)
    const response = () => ({error:null,count:0,data:table==='badges' ? (read.calls.some(c=>c[0]==='maybeSingle') ? record : record ? [record] : []) : []})
    const chain = new Proxy({}, {get(_target,method:string) {
      if(method==='then') return (resolve:(v:unknown)=>unknown)=>Promise.resolve(response()).then(resolve)
      return (...args:unknown[])=>{read.calls.push([method,...args]);return chain}
    }})
    return chain
  }}
  const dependencies = {
    '@/lib/supabase/server': {createClient:async()=>db},
    '@/lib/badges/conditions': {normaliseBadgeConditionLogic:(v:unknown)=>v,summariseBadgeConditionLogicWithNames:async()=> 'Know five tunes.',calculateBadgeProgress:async()=>{calculations++;return {isEligible:false,isCalculable:true,current:2,required:5,label:'Know five tunes.'}}},
    '@/lib/services/badge-awards': {autoAwardBadgeIfEligible:async()=>{throw new Error('Unexpected award write')}},
  }
  return {reads,db,dependencies,get calculations(){return calculations},loader:moduleFrom('../lib/loaders/badges.ts',dependencies)}
}

test('all badge categories have text and a coherent motif/shape independent of colour',()=> {
  assert.equal(Object.keys(badgeFamilies).length,8)
  for(const family of Object.values(badgeFamilies)) {assert.ok(family.label);assert.ok(family.shape);assert.ok(family.motif);assert.ok(['plum','ink','timber'].includes(family.ink))}
  assert.equal(badgeNextAction({...badge,viewer_award:null,viewer_progress:null}).href,'/library/known')
})
test('award announcements are scoped to recipient and award, and exclude old, future or invalid timestamps',()=> {
  const now=Date.parse('2026-09-11T12:00:00Z')
  assert.equal(isRecentAward('2026-09-11T11:00:00Z',now),true)
  for(const timestamp of ['bad date','2026-09-12','2026-09-10T12:00:00Z']) assert.equal(isRecentAward(timestamp,now),false)
  assert.notEqual(awardAnnouncementKey('a',1),awardAnnouncementKey('b',1))
  assert.notEqual(awardAnnouncementKey('a',1),awardAnnouncementKey('a',2))
})
test('internal authoring paths preserve consumer badge index and detail routes',()=> {
  for(const path of ['/badges/new','/badges/tune-hound/edit','/moderator','/dev/design-system']) assert.equal(getShellKind(path,true),'internal')
  for(const path of ['/badges','/badges/tune-hound']) assert.equal(getShellKind(path,true),'consumer')
  assert.equal(getShellKind('/badges/new',false),'signed-out')
})
test('discovery explicitly excludes other creators’ private and unlisted badges',async()=> {
  for(const viewer of [null,'owner']) {
    const f=fixture(viewer,null)
    await f.loader.loadBadgeIndexData()
    const query=f.reads.find(r=>r.table==='badges')!
    assert.ok(query.calls.some(c=> viewer ? c[0]==='or' && c[1]==='visibility.eq.public,owner_user_id.eq.owner' : c[0]==='eq' && c[1]==='visibility' && c[2]==='public'))
  }
})
test('private badge detail stops before criteria, recipients or inventory reads for a non-owner',async()=> {
  const f=fixture('visitor',{...badge,visibility:'private'})
  const result=await f.loader.loadBadgeDetailData('tune-hound') as BadgeDetailData
  assert.equal(result.status,'not_found')
  assert.deepEqual(f.reads.map(r=>r.table),['badges'])
  assert.equal(f.calculations,0)
})
test('unlisted direct links retain access; manual and undefined criteria have no invented progress',async()=> {
  const f=fixture('visitor',{...badge,visibility:'unlisted',awarding_mode:'manual',condition_logic:{}})
  const result=await f.loader.loadBadgeDetailData('tune-hound') as BadgeDetailData
  assert.equal(result.status,'loaded')
  if(result.status==='loaded') {assert.equal(result.badge.viewer_progress?.isCalculable,false);assert.equal(result.badge.viewer_progress?.isEligible,false)}
  assert.equal(f.calculations,0)
  const empty=fixture('owner',{...badge,condition_logic:{}})
  const index=await empty.loader.loadBadgeIndexData() as BadgeIndexData
  assert.equal(index.badges[0].viewer_progress?.isCalculable,false)
})
test('signed-out create and edit reject before any data query, non-owner edit before form inventory',async()=> {
  const guest=fixture(null)
  await assert.rejects(guest.loader.loadCreateBadgeData(),/Not authenticated/)
  await assert.rejects(guest.loader.loadEditBadgeData('tune-hound'),/Not authenticated/)
  assert.equal(guest.reads.length,0)
  const visitor=fixture('visitor')
  const denied=await visitor.loader.loadEditBadgeData('tune-hound') as {status:string}
  assert.equal(denied.status,'not_owner')
  assert.deepEqual(visitor.reads.map(r=>r.table),['badges'])
})
test('owner edit remains permitted and retains the awarded-condition lock data',async()=> {
  const f=fixture('owner')
  const result=await f.loader.loadEditBadgeData('tune-hound') as {status:string;awardCount:number}
  assert.equal(result.status,'loaded')
  assert.equal(result.awardCount,0)
  assert.ok(f.reads.some(r=>r.table==='badge_awards' && r.calls.some(c=>c[0]==='eq' && c[1]==='badge_id' && c[2]===1)))
})
test('moderator and app-admin access fail closed while keeping their distinct role systems',async()=> {
  for(const [role,admin,moderatorAllowed,devAllowed] of [['user',null,false,false],['moderator',null,true,false],['admin',null,true,false],['user','owner',false,true]] as const) {
    const f=fixture('viewer')
    const db={...f.db,from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:admin ? {role:admin} : null,error:null})})})})}
    const roles=moduleFrom('../lib/auth/roles.ts',{'next/navigation':{notFound:()=>{throw new Error('NOT_FOUND')}},'@/lib/auth/session':{getCurrentUserRole:()=>role,requireUserContext:async()=>({supabase:db,user:{id:'viewer'},role})}})
    for(const [guard,allowed] of [['requireModerator',moderatorAllowed],['requireAppAdmin',devAllowed]] as const) {
      if(allowed) await roles[guard]()
      else await assert.rejects(roles[guard](),/NOT_FOUND/)
    }
  }
})

test('automatic award service preserves manual/private/existing-award boundaries', async () => {
  const f=fixture('viewer')
  const service=moduleFrom('../lib/services/badge-awards.ts',f.dependencies)
  const award={id:1,badge_id:1,recipient_user_id:'viewer',awarded_by_user_id:'owner',award_note:null,awarded_at:'2026-09-11'}
  for(const candidate of [{...badge,visibility:'private'},{...badge,awarding_mode:'manual'},{...badge,awarding_mode:'requestable'}]) {
    assert.equal(await service.autoAwardBadgeIfEligible({supabase:f.db,userId:'viewer',badge:candidate,existingAward:null}),null)
  }
  assert.equal(await service.autoAwardBadgeIfEligible({supabase:f.db,userId:'viewer',badge,existingAward:award}),award)
  assert.equal(f.reads.length,0)
  assert.equal(f.calculations,0)
})

test('a duplicate automatic award returns the stored award without a duplicate notification',async()=> {
  const award={id:7,badge_id:1,recipient_user_id:'viewer',awarded_by_user_id:'owner',award_note:null,awarded_at:'2026-09-11'}
  const reads:Read[]=[]
  const db={from(table:string){
    const read:Read={table,calls:[]};reads.push(read)
    const chain=new Proxy({}, {get(_target,method:string){
      if(method==='then') return (resolve:(v:unknown)=>unknown)=>Promise.resolve(read.calls.some(c=>c[0]==='insert')?{data:null,error:{code:'23505'}}:{data:award,error:null}).then(resolve)
      return (...args:unknown[])=>{read.calls.push([method,...args]);return chain}
    }})
    return chain
  }}
  const service=moduleFrom('../lib/services/badge-awards.ts',{'@/lib/supabase/server':{},'@/lib/badges/conditions':{normaliseBadgeConditionLogic:(v:unknown)=>v,calculateBadgeProgress:async()=>({isEligible:true})}})
  assert.equal(await service.autoAwardBadgeIfEligible({supabase:db,userId:'viewer',badge,existingAward:null}),award)
  assert.deepEqual(reads.map(r=>r.table),['badge_awards','badge_awards'])
})

test('internal actions authenticate and reject absent confirmation before data access', async () => {
  let authenticated = 0
  const context = async () => {
    authenticated++
    return {user:{id:'owner'},supabase:{from(){throw new Error('Unexpected data access')}}}
  }
  const dependencies = {
    'next/navigation': {redirect:(url:string)=>{throw new Error(url)}},
    'next/cache': {revalidatePath:()=>{}},
    '@/lib/auth/roles': {requireModerator:context,requireAppAdmin:context},
    '@/lib/supabase/server': {createClient:async()=>({auth:{getUser:async()=>{authenticated++;return {data:{user:{id:'owner'}}}}},from(){throw new Error('Unexpected data access')}})},
    '@/lib/music/keys': {},
    '@/lib/music/time-signatures': {},
    '@/lib/services/composer-notifications': {},
  }
  const moderation = moduleFrom('../lib/actions/moderation.ts',dependencies)
  const feedback = moduleFrom('../lib/actions/dev-feedback.ts',dependencies)
  const badges = moduleFrom('../lib/actions/badges.ts',dependencies)
  for (const action of ['approvePieceEditRequest','rejectPieceEditRequest','hideReportedComment','dismissCommentReport','actionLoreReport','dismissLoreReport']) {
    await assert.rejects(moderation[action](new FormData()),/confirmation_required/)
  }
  await assert.rejects(feedback.updateBetaFeedbackAdminFields(new FormData()),/confirmation_required/)
  await assert.rejects(badges.deleteBadge(new FormData()),/confirmation_required/)
  assert.equal(authenticated,8)
  const confirmed = new FormData()
  confirmed.set('confirm_action','confirmed')
  await assert.rejects(moderation.hideReportedComment(confirmed),/missing_comment/)
  await assert.rejects(feedback.updateBetaFeedbackAdminFields(confirmed),/missing_feedback/)
  await assert.rejects(badges.deleteBadge(confirmed),/missing_badge/)
})
