do $$
declare
  index_record record;
begin
  for index_record in
    select indexname
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'practice_foci'
      and indexdef ilike '%unique%'
      and indexdef ilike '%user_id%'
      and indexdef ilike '%active%'
  loop
    execute format('drop index if exists public.%I', index_record.indexname);
  end loop;
end $$;
