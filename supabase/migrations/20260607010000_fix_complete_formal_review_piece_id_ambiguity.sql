create or replace function public.complete_formal_review(
  p_submission_key text,
  p_user_piece_id bigint,
  p_outcome text,
  p_note_body text default null,
  p_category_id bigint default null,
  p_focus_id bigint default null,
  p_add_tune_to_focus boolean default false,
  p_today date default ((now() at time zone 'Australia/Melbourne')::date)
)
returns table (
  applied boolean,
  piece_id bigint,
  review_event_id bigint,
  moved_to_known boolean
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submission record;
  v_submission_inserted boolean := false;
  v_piece_id bigint;
  v_stage integer;
  v_existing_next_review_due date;
  v_next_review_due date;
  v_new_stage integer;
  v_interval_days integer;
  v_due_count integer;
  v_practice_diary_enabled boolean := false;
  v_practice_day_id bigint;
  v_practice_event_id bigint;
  v_review_event_id bigint;
  v_moved_to_known boolean := false;
  v_existing_known_id bigint;
  v_first_streak_date date;
  v_date_cursor date;
  v_revision_done boolean;
  v_practice_done boolean;
  v_current_revision integer := 0;
  v_longest_revision integer := 0;
  v_current_practice integer := 0;
  v_longest_practice integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  p_submission_key := nullif(trim(coalesce(p_submission_key, '')), '');

  if p_submission_key is null or length(p_submission_key) < 16 then
    raise exception 'A review submission key is required';
  end if;

  if p_outcome not in ('solid', 'shaky', 'failed') then
    raise exception 'Invalid review outcome';
  end if;

  insert into public.formal_review_submissions (
    user_id,
    submission_key,
    user_piece_id,
    piece_id,
    outcome
  )
  values (
    v_user_id,
    p_submission_key,
    p_user_piece_id,
    0,
    p_outcome
  )
  on conflict (user_id, submission_key) do nothing
  returning * into v_submission;

  v_submission_inserted := found;

  if not v_submission_inserted then
    select frs.*
    into v_submission
    from public.formal_review_submissions as frs
    where frs.user_id = v_user_id
      and frs.submission_key = p_submission_key;

    if v_submission.completed_at is null then
      raise exception 'Review submission is already in progress';
    end if;

    return query
    select
      false,
      v_submission.piece_id,
      v_submission.review_event_id,
      v_submission.moved_to_known;
    return;
  end if;

  select
    up.piece_id,
    up.stage,
    up.next_review_due
  into
    v_piece_id,
    v_stage,
    v_existing_next_review_due
  from public.user_pieces as up
  where up.id = p_user_piece_id
    and up.user_id = v_user_id
  for update;

  if not found then
    raise exception 'Practice tune not found';
  end if;

  update public.formal_review_submissions as frs
  set piece_id = v_piece_id
  where frs.id = v_submission.id;

  if p_category_id is not null and not exists (
    select 1
    from public.practice_note_categories as pnc
    where pnc.id = p_category_id
      and pnc.user_id = v_user_id
      and pnc.is_active = true
  ) then
    raise exception 'Invalid practice note category';
  end if;

  if p_focus_id is not null and not exists (
    select 1
    from public.practice_foci as pf
    where pf.id = p_focus_id
      and pf.user_id = v_user_id
      and pf.status = 'active'
  ) then
    raise exception 'Invalid practice focus';
  end if;

  if p_focus_id is not null and p_add_tune_to_focus then
    insert into public.practice_focus_tunes (
      user_id,
      focus_id,
      piece_id
    )
    select
      v_user_id,
      p_focus_id,
      v_piece_id
    where not exists (
      select 1
      from public.practice_focus_tunes as pft
      where pft.focus_id = p_focus_id
        and pft.piece_id = v_piece_id
    );
  end if;

  v_stage := greatest(coalesce(v_stage, 1), 1);

  if p_outcome = 'solid' then
    v_new_stage := least(v_stage + 1, 10);
  elsif p_outcome = 'shaky' then
    v_new_stage := least(v_stage, 10);
  else
    v_new_stage := greatest(v_stage - 2, 1);
  end if;

  v_moved_to_known := p_outcome = 'solid' and v_new_stage >= 10;

  insert into public.review_events (
    user_piece_id,
    outcome,
    resulting_stage,
    review_submission_key
  )
  values (
    p_user_piece_id,
    p_outcome,
    v_new_stage,
    p_submission_key
  )
  returning id into v_review_event_id;

  if not v_moved_to_known then
    v_interval_days := case v_new_stage
      when 1 then 1
      when 2 then 2
      when 3 then 3
      when 4 then 7
      when 5 then 14
      when 6 then 30
      when 7 then 60
      when 8 then 90
      when 9 then 120
      else 360
    end;

    v_next_review_due := p_today + v_interval_days;

    if v_existing_next_review_due is not null
      and v_existing_next_review_due < p_today then
      loop
        select count(*)
        into v_due_count
        from public.user_pieces as up
        where up.user_id = v_user_id
          and up.status = 'learning'
          and up.next_review_due::date = v_next_review_due
          and up.id <> p_user_piece_id;

        exit when v_due_count < 5;

        v_next_review_due := v_next_review_due + 1;
      end loop;
    end if;

    update public.user_pieces as up
    set
      stage = v_new_stage,
      next_review_due = v_next_review_due,
      status = 'learning'
    where up.id = p_user_piece_id
      and up.user_id = v_user_id;
  end if;

  select coalesce(p.practice_diary_enabled, false)
  into v_practice_diary_enabled
  from public.profiles as p
  where p.id = v_user_id;

  if v_practice_diary_enabled then
    insert into public.practice_days (
      user_id,
      practice_date
    )
    values (
      v_user_id,
      p_today
    )
    on conflict (user_id, practice_date) do update
      set updated_at = public.practice_days.updated_at
    returning id into v_practice_day_id;

    insert into public.practice_events (
      user_id,
      practice_day_id,
      piece_id,
      review_event_id,
      event_type,
      source_type,
      counted_as_review
    )
    values (
      v_user_id,
      v_practice_day_id,
      v_piece_id,
      v_review_event_id,
      'formal_review',
      'review',
      true
    )
    returning id into v_practice_event_id;

    if nullif(trim(coalesce(p_note_body, '')), '') is not null then
      insert into public.practice_notes (
        user_id,
        practice_day_id,
        practice_event_id,
        piece_id,
        review_event_id,
        category_id,
        focus_id,
        body
      )
      values (
        v_user_id,
        v_practice_day_id,
        v_practice_event_id,
        v_piece_id,
        v_review_event_id,
        p_category_id,
        p_focus_id,
        trim(p_note_body)
      );
    end if;
  end if;

  if v_moved_to_known then
    delete from public.user_pieces as up
    where up.id = p_user_piece_id
      and up.user_id = v_user_id;

    select ukp.id
    into v_existing_known_id
    from public.user_known_pieces as ukp
    where ukp.user_id = v_user_id
      and ukp.piece_id = v_piece_id
    limit 1;

    if v_existing_known_id is null then
      insert into public.user_known_pieces (
        user_id,
        piece_id
      )
      values (
        v_user_id,
        v_piece_id
      );

      insert into public.user_activity_events (
        user_id,
        event_type,
        piece_id
      )
      values (
        v_user_id,
        'marked_known',
        v_piece_id
      );
    end if;
  end if;

  insert into public.user_activity_events (
    user_id,
    event_type,
    piece_id
  )
  values (
    v_user_id,
    'tune_reviewed',
    v_piece_id
  );

  select count(*)
  into v_due_count
  from public.user_pieces as up
  where up.user_id = v_user_id
    and up.status = 'learning'
    and up.next_review_due is not null
    and up.next_review_due::date <= p_today;

  insert into public.user_daily_streaks (
    user_id,
    local_date,
    due_count,
    revision_done,
    practice_done,
    updated_at
  )
  values (
    v_user_id,
    p_today,
    v_due_count,
    v_due_count = 0,
    true,
    now()
  )
  on conflict (user_id, local_date) do update
    set
      due_count = excluded.due_count,
      revision_done = excluded.revision_done,
      practice_done = public.user_daily_streaks.practice_done or excluded.practice_done,
      updated_at = now();

  select min(uds.local_date)::date
  into v_first_streak_date
  from public.user_daily_streaks as uds
  where uds.user_id = v_user_id;

  if v_first_streak_date is not null then
    for v_date_cursor, v_revision_done, v_practice_done in
      select
        generated_date::date,
        coalesce(uds.revision_done, false),
        coalesce(uds.practice_done, false)
      from generate_series(v_first_streak_date, p_today, interval '1 day')
        as generated_dates(generated_date)
      left join public.user_daily_streaks as uds
        on uds.user_id = v_user_id
       and uds.local_date::date = generated_date::date
      order by generated_date
    loop
      if v_revision_done then
        v_current_revision := v_current_revision + 1;
        v_longest_revision := greatest(v_longest_revision, v_current_revision);
      else
        v_current_revision := 0;
      end if;

      if v_practice_done then
        v_current_practice := v_current_practice + 1;
        v_longest_practice := greatest(v_longest_practice, v_current_practice);
      else
        v_current_practice := 0;
      end if;
    end loop;

    insert into public.user_streak_stats (
      user_id,
      current_revision_streak,
      longest_revision_streak,
      current_practice_streak,
      longest_practice_streak,
      last_reconciled_date,
      updated_at
    )
    values (
      v_user_id,
      v_current_revision,
      v_longest_revision,
      v_current_practice,
      v_longest_practice,
      p_today,
      now()
    )
    on conflict (user_id) do update
      set
        current_revision_streak = excluded.current_revision_streak,
        longest_revision_streak = excluded.longest_revision_streak,
        current_practice_streak = excluded.current_practice_streak,
        longest_practice_streak = excluded.longest_practice_streak,
        last_reconciled_date = excluded.last_reconciled_date,
        updated_at = now();
  end if;

  update public.formal_review_submissions as frs
  set
    piece_id = v_piece_id,
    review_event_id = v_review_event_id,
    moved_to_known = v_moved_to_known,
    completed_at = now()
  where frs.id = v_submission.id;

  return query
  select
    true,
    v_piece_id,
    v_review_event_id,
    v_moved_to_known;
end;
$$;
