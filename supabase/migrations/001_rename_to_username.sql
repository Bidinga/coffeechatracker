-- =============================================================
-- Migration 001: rename interns.full_name -> interns.username,
-- and stop auto-filling the name from the email prefix.
--
-- Run this ONCE in your existing Supabase project:
--   SQL Editor -> New query -> paste -> Run
-- (Fresh installs don't need this — supabase/schema.sql is already updated.)
-- =============================================================

-- 1. Rename the column — only if it still needs it (safe to re-run).
--    If you got an error here before, it's because the column was already
--    renamed or the base schema was never run. This guard handles both.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'interns'
      and column_name = 'full_name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'interns'
      and column_name = 'username'
  ) then
    alter table public.interns rename column full_name to username;
  end if;
end $$;

-- 2. Recreate the leaderboard view so its output column is `username`.
--    (A view's output column can't be renamed in place, so we drop + recreate.)
drop view if exists public.leaderboard;
create view public.leaderboard as
  select
    i.id,
    i.username,
    i.team,
    i.emoji,
    count(c.id)::int       as chat_count,
    count(c.id) filter (where c.chat_date >= current_date - interval '7 days')::int as chats_this_week,
    max(c.chat_date)       as last_chat,
    count(distinct c.department) filter (where c.department is not null)::int as departments_met
  from public.interns i
  left join public.coffee_chats c on c.intern_id = i.id
  group by i.id, i.username, i.team, i.emoji
  order by chat_count desc, last_chat desc nulls last;
grant select on public.leaderboard to anon, authenticated;

-- 3. Stop seeding the name from the email prefix; new users get a blank
--    username, which sends them through Onboarding to pick one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.interns (id, username)
  values (new.id, '')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. OPTIONAL: blank out names that were auto-derived from emails so existing
--    users are prompted to choose a real username next time they sign in.
--    Uncomment if you want that (safe to skip — they can edit it anyway):
-- update public.interns set username = '';
