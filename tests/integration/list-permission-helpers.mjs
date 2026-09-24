// Disposable PostgreSQL only; never connects to a project or reads credentials.
// PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node tests/integration/list-permission-helpers.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const { PGlite } = await import(process.env.PGLITE_MODULE)
const db = new PGlite()
const owner = '00000000-0000-0000-0000-000000000001'
const recipient = '00000000-0000-0000-0000-000000000002'
const outsider = '00000000-0000-0000-0000-000000000003'
try {
  // Minimal structural dependencies; functions/policies come from the actual
  // migration. This does not reproduce unspecified base-table policies.
  await db.exec(`
    create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql as
      $$ select nullif(current_setting('test.user_id', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    create table public.learning_lists(id bigint primary key, user_id text, visibility text);
    create table public.learning_list_items(id bigint, learning_list_id bigint);
    create table public.learning_list_shares(id bigint, learning_list_id bigint, shared_with_user_id uuid);
    insert into public.learning_lists values (7, '${owner}', 'private'), (8, '${owner}', 'public');
    insert into public.learning_list_shares values (1, 7, '${recipient}');
  `)
  await db.exec(await readFile(new URL('../../supabase/migrations/20260623002000_fix_learning_list_share_rls_recursion.sql', import.meta.url), 'utf8'))
  if (!process.argv.includes('--baseline')) {
    await db.exec(await readFile(new URL('../../supabase/migrations/20260922131057_bind_learning_list_helpers_to_caller.sql', import.meta.url), 'utf8'))
  }
  await db.exec(`set role authenticated; set test.user_id = '${outsider}'`)
  const probes = [
    ['is_learning_list_owner', owner],
    ['has_direct_learning_list_share', recipient],
    ['can_view_learning_list', owner],
  ]
  const findings = []
  for (const [name, impersonated] of probes) {
    const query = async (id, user) => (await db.query(`select public.${name}($1, $2) as allowed`, [id, user])).rows[0].allowed
    assert.equal(await query(7, outsider), false, `${name}: outsider control`)
    assert.equal(await query(999, impersonated), false, `${name}: missing control`)
    const leaked = await query(7, impersonated)
    console.log(`${name}: outsider own identity=false; missing=false; supplied other identity=${leaked}`)
    if (leaked) findings.push(name)
  }
  assert.deepEqual(findings, [], 'Authenticated outsider must not distinguish private existence by supplying another identity')
  await db.exec(`set test.user_id = '${owner}'`)
  assert.equal((await db.query(`select public.is_learning_list_owner(7, '${owner}') as allowed`)).rows[0].allowed, true)
  assert.equal((await db.query(`select public.can_view_learning_list(7, '${owner}') as allowed`)).rows[0].allowed, true)
  await db.exec(`set test.user_id = '${recipient}'`)
  assert.equal((await db.query(`select public.has_direct_learning_list_share(7, '${recipient}') as allowed`)).rows[0].allowed, true)
  assert.equal((await db.query(`select public.can_view_learning_list(7, '${recipient}') as allowed`)).rows[0].allowed, true)
  assert.equal((await db.query(`select public.is_learning_list_owner(7, '${recipient}') as allowed`)).rows[0].allowed, false)
  await db.exec(`reset role; delete from public.learning_list_shares; set role authenticated`)
  assert.equal((await db.query(`select public.can_view_learning_list(7, '${recipient}') as allowed`)).rows[0].allowed, false)
  assert.equal((await db.query(`select public.can_view_learning_list(8, '${recipient}') as allowed`)).rows[0].allowed, true)
  await db.exec(`set test.user_id = ''`)
  assert.equal((await db.query('select public.can_view_learning_list(8, null) as allowed')).rows[0].allowed, true)
  assert.equal((await db.query('select public.can_view_learning_list(7, null) as allowed')).rows[0].allowed, false)
  assert.equal((await db.query(`select public.is_learning_list_owner(7, '${owner}') as allowed`)).rows[0].allowed, false)
  console.log('PASS: identity binding, owner, shared reader, ordinary viewer, revoked and null-identity public/private controls')

  // Base learning_lists policies are not in this repository's migrations.
  // These expressions match the linked pg_policies read on 2026-09-22.
  await db.exec(`reset role;
    alter table public.learning_lists enable row level security;
    alter table public.learning_list_items enable row level security;
    alter table public.learning_list_shares enable row level security;
    grant select, insert, update, delete on public.learning_lists, public.learning_list_items, public.learning_list_shares to authenticated;
    create policy "owners can read own learning_lists" on public.learning_lists for select to authenticated using (user_id = auth.uid()::text);
    create policy "authenticated can read public learning_lists" on public.learning_lists for select to authenticated using (visibility = 'public');
    create policy "owners can insert learning_lists" on public.learning_lists for insert to authenticated with check (user_id = auth.uid()::text);
    create policy "owners can update learning_lists" on public.learning_lists for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
    create policy "owners can delete learning_lists" on public.learning_lists for delete to authenticated using (user_id = auth.uid()::text);
    insert into public.learning_list_items values (1, 7), (2, 8);
    insert into public.learning_list_shares values (1, 7, '${recipient}');
    set role authenticated;
  `)
  for (const [user, ids] of [[owner, [7, 8]], [recipient, [7, 8]], [outsider, [8]]]) {
    await db.exec(`set test.user_id = '${user}'`)
    assert.deepEqual((await db.query('select id from public.learning_lists order by id')).rows.map(row => row.id), ids)
    assert.deepEqual((await db.query('select learning_list_id from public.learning_list_items order by learning_list_id')).rows.map(row => row.learning_list_id), ids)
    if (user !== owner) {
      assert.deepEqual((await db.query("update public.learning_lists set visibility='public' where id=7 returning id")).rows, [])
      assert.deepEqual((await db.query('delete from public.learning_list_items where learning_list_id=7 returning id')).rows, [])
      assert.deepEqual((await db.query('delete from public.learning_list_shares where learning_list_id=7 returning id')).rows, [])
      await assert.rejects(db.query('insert into public.learning_list_items values (3,7)'), /row-level security/)
      await assert.rejects(db.query(`insert into public.learning_list_shares values (2,7,'${outsider}')`), /row-level security/)
    }
  }
  await db.exec(`set test.user_id = '${owner}'`)
  assert.equal((await db.query('insert into public.learning_list_items values (3,7) returning id')).rows.length, 1)
  assert.equal((await db.query('delete from public.learning_list_items where id=3 returning id')).rows.length, 1)
  assert.equal((await db.query('delete from public.learning_list_shares where id=1 returning id')).rows.length, 1)
  await db.exec(`set test.user_id = '${recipient}'`)
  assert.deepEqual((await db.query('select id from public.learning_lists where id in (7,999)')).rows, [])
  assert.deepEqual((await db.query('select id from public.learning_list_items where learning_list_id=7')).rows, [])
  console.log('PASS: real PostgreSQL RLS owner/shared/outsider reads, denied mutations, owner writes and immediate revocation')
} finally {
  await db.close()
}
