// Disposable PostgreSQL; no credentials, remote connection or production writes.
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE)
const db = new PGlite()
try {
  await db.exec(`
    create role anon; create role authenticated;
    create table learning_lists(id bigint primary key,user_id text,name text,description text,visibility text,is_imported boolean);
    create table learning_list_items(id bigint,learning_list_id bigint,piece_id bigint,position int);
    create table pieces(id bigint,title text,key text,style text,time_signature text,composer text,reference_url text,notes text);
    create table profiles(id uuid,username text,display_name text,role text,bio text);
    create table piece_media_links(id bigint,piece_id bigint,url text,label text,media_type text,notes text,created_by uuid,created_at timestamptz);
    create table piece_sheet_music_links(id bigint,piece_id bigint,url text,label text,created_at timestamptz,created_by uuid);
    insert into learning_lists values (1,'00000000-0000-0000-0000-000000000001','Public',null,'public',false),(2,'00000000-0000-0000-0000-000000000002','Secret',null,'private',false);
    insert into learning_list_items values (1,1,10,0),(2,2,20,0);
    insert into pieces(id,title) values (10,'Public tune'),(20,'Private-only tune'),(30,'Unlisted tune');
    insert into profiles(id,username,role,bio) values ('00000000-0000-0000-0000-000000000001','public-owner','admin','private biography'),('00000000-0000-0000-0000-000000000002','private-owner','user','secret');
    insert into piece_media_links(id,piece_id,url) values (1,10,'https://example.com/public'),(2,20,'https://example.com/private');
    insert into piece_sheet_music_links(id,piece_id,url) values (1,10,'https://example.com/public.pdf'),(2,20,'https://example.com/private.pdf');
  `)
  const tables = ['learning_lists','learning_list_items','pieces','profiles','piece_media_links','piece_sheet_music_links']
  for (const table of tables) await db.exec(`
    alter table ${table} enable row level security;
    grant all on ${table} to anon, authenticated;
    create policy signed_in_read on ${table} for select to authenticated using (true);
  `)
  if (!process.argv.includes('--baseline')) {
    const dir = new URL('../../supabase/migrations/', import.meta.url)
    const migration = (await readdir(dir)).find(name => name.endsWith('_allow_anonymous_public_list_reads.sql'))
    assert.ok(migration)
    await db.exec(await readFile(new URL(migration, dir), 'utf8'))
  }
  await db.exec('set role anon')
  assert.deepEqual((await db.query('select id from learning_lists order by id')).rows, [{id:1}], 'signed-out public list must be readable')
  assert.deepEqual((await db.query('select id from learning_lists where id in (2,999)')).rows, [], 'private and missing indistinguishable')
  const joined = await db.query(`select l.name,i.position,p.title,r.username,m.url,s.url as sheet from learning_lists l
    join learning_list_items i on i.learning_list_id=l.id join pieces p on p.id=i.piece_id
    join profiles r on r.id::text=l.user_id left join piece_media_links m on m.piece_id=p.id
    left join piece_sheet_music_links s on s.piece_id=p.id order by s.created_at`)
  assert.deepEqual(joined.rows, [{name:'Public',position:0,title:'Public tune',username:'public-owner',url:'https://example.com/public',sheet:'https://example.com/public.pdf'}])
  for (const table of ['learning_list_items','piece_media_links','piece_sheet_music_links']) assert.deepEqual((await db.query(`select id from ${table}`)).rows, [{id:1}])
  assert.deepEqual((await db.query('select id from pieces')).rows, [{id:10}])
  assert.equal((await db.query('select id from profiles')).rows.length,1)
  for (const query of ['select role from profiles','select bio from profiles','select notes from pieces','select is_imported from learning_lists','select created_by from piece_sheet_music_links']) await assert.rejects(db.query(query), /permission denied/)
  for (const table of tables) {
    for (const query of [`insert into ${table}(id) values (null)`,`update ${table} set id=id`,`delete from ${table}`,`truncate ${table}`]) await assert.rejects(db.query(query), /permission denied/)
  }
  console.log('PASS: anonymous public detail join, browse, tunes, attribution and media; private/missing/unlisted rows concealed; sensitive columns and writes denied')
  await db.exec("reset role; update learning_lists set visibility='private' where id=1; set role anon")
  for (const table of tables) assert.deepEqual((await db.query(`select id from ${table}`)).rows, [], `${table}: visibility revocation is immediate`)
  await db.exec('set role authenticated')
  for (const table of tables) assert.ok((await db.query(`select * from ${table}`)).rows.length >= 2, `${table}: authenticated policy unchanged`)
  console.log('PASS: immediate public-to-private revocation across dependencies; existing authenticated read policy preserved')
} finally { await db.close() }
