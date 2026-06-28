-- =============================================================
-- Coffee Chat Tracker — Supabase schema
-- Run this in your Supabase project: SQL Editor -> New query -> paste -> Run
-- Fully idempotent: safe to run on a brand-new project OR re-run on an
-- existing one (including older versions that used `full_name`).
-- =============================================================

-- ---------- TABLES ----------

create table if not exists public.interns (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null default '',  -- chosen by the user during onboarding
  team        text,
  emoji       text default '☕',          -- simple, free "avatar"
  created_at  timestamptz not null default now()
);

-- Upgrade older databases that still have `full_name`: rename it to `username`
-- (only when needed, so this is safe to run repeatedly).
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

create table if not exists public.coffee_chats (
  id           uuid primary key default gen_random_uuid(),
  intern_id    uuid not null references public.interns (id) on delete cascade,
  person_name  text not null,
  person_title text,
  department   text,
  chat_date    date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists coffee_chats_intern_id_idx on public.coffee_chats (intern_id);
create index if not exists coffee_chats_chat_date_idx  on public.coffee_chats (chat_date);

-- Prevent accidental duplicates: at most one chat per person (case/space-
-- insensitive name) per day per intern. This also makes inserts effectively
-- idempotent against double-clicks and network retries.
-- First remove any pre-existing duplicates (keep the earliest of each group)
-- so the unique index can be built.
delete from public.coffee_chats
where id in (
  select id from (
    select id, row_number() over (
      partition by intern_id, lower(trim(person_name)), chat_date
      order by created_at, id
    ) as rn
    from public.coffee_chats
  ) t
  where rn > 1
);

create unique index if not exists coffee_chats_one_per_person_per_day
  on public.coffee_chats (intern_id, lower(trim(person_name)), chat_date);

-- ---------- LEADERBOARD VIEW ----------
-- Computed live from the tables. The frontend re-queries this whenever a
-- realtime change on coffee_chats fires. Dropped + recreated (not "create or
-- replace") so re-running after a column rename never errors.

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

-- Leaderboard is for signed-in interns only: grant to authenticated, and
-- explicitly revoke anon so logged-out visitors get nothing.
grant select on public.leaderboard to authenticated;
revoke select on public.leaderboard from anon;

-- ---------- ROW LEVEL SECURITY ----------

alter table public.interns      enable row level security;
alter table public.coffee_chats enable row level security;

-- You can only read YOUR OWN profile row via the API. The leaderboard's
-- display names come from the `leaderboard` view (which aggregates safely),
-- not from reading this table directly.
drop policy if exists "read all interns" on public.interns;
drop policy if exists "read own intern" on public.interns;
create policy "read own intern"
  on public.interns for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "insert own intern" on public.interns;
create policy "insert own intern"
  on public.interns for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "update own intern" on public.interns;
create policy "update own intern"
  on public.interns for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- You can only read YOUR OWN chats (this keeps notes / who-you-met private).
-- Leaderboard counts are computed by the view, which runs with owner
-- privileges and so can still count everyone's chats without exposing rows.
drop policy if exists "read all chats" on public.coffee_chats;
drop policy if exists "read own chats" on public.coffee_chats;
create policy "read own chats"
  on public.coffee_chats for select
  to authenticated
  using (auth.uid() = intern_id);

drop policy if exists "insert own chats" on public.coffee_chats;
create policy "insert own chats"
  on public.coffee_chats for insert
  to authenticated
  with check (auth.uid() = intern_id);

drop policy if exists "update own chats" on public.coffee_chats;
create policy "update own chats"
  on public.coffee_chats for update
  to authenticated
  using (auth.uid() = intern_id)
  with check (auth.uid() = intern_id);

drop policy if exists "delete own chats" on public.coffee_chats;
create policy "delete own chats"
  on public.coffee_chats for delete
  to authenticated
  using (auth.uid() = intern_id);

-- ---------- AUTO-CREATE INTERN ON SIGNUP ----------
-- New auth user -> matching interns row with a BLANK username. The blank
-- username is what triggers the Onboarding screen so the user picks their own.

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- REALTIME ----------
-- Add coffee_chats to the realtime publication so the leaderboard updates live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'coffee_chats'
  ) then
    alter publication supabase_realtime add table public.coffee_chats;
  end if;
end $$;
