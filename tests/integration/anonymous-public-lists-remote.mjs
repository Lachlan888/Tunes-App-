// Read-only anonymous API verification. No session, admin key or write calls.
// node --env-file=.env.local tests/integration/anonymous-public-lists-remote.mjs
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {auth:{persistSession:false,autoRefreshToken:false}})
const list = await db.from('learning_lists').select('id,user_id,name,description,visibility').eq('id',19).eq('visibility','public').single()
assert.ifError(list.error)
assert.equal(list.data.visibility,'public')
const items = await db.from('learning_list_items').select('id,position,pieces(id,title,key,style,time_signature,composer,reference_url)').eq('learning_list_id',19).order('position')
assert.ifError(items.error)
assert.equal(items.data.length,4)
assert.ok(items.data.every(row=>row.pieces?.id))
const profile = await db.from('profiles').select('id,username,display_name').eq('id',list.data.user_id).maybeSingle()
assert.ifError(profile.error)
assert.ok(profile.data?.id)
for (const [table,columns] of [['piece_media_links','id,piece_id,url,label,media_type,notes,created_by,created_at'],['piece_sheet_music_links','id,piece_id,url,label']]) {
  const result=await db.from(table).select(columns).in('piece_id',items.data.map(row=>row.pieces.id)).order('created_at')
  assert.ifError(result.error)
}
for (const id of [52,999999999]) {
  const result=await db.from('learning_lists').select('id,name').eq('id',id)
  assert.ifError(result.error)
  assert.deepEqual(result.data,[])
}
const denied=await db.from('profiles').select('role,bio').eq('id',list.data.user_id)
assert.equal(denied.error?.code,'42501')
const browse=await db.from('learning_lists').select('id,user_id,name,description').eq('visibility','public').order('id',{ascending:false})
assert.ifError(browse.error)
assert.ok(browse.data.some(row=>row.id===19))
console.log('PASS: anonymous API public list 19, four nested tunes, owner attribution, media queries and browse; private/missing controls hidden; profile role/bio denied. No writes.')
