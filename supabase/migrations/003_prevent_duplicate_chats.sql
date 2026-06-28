-- =============================================================
-- Migration 003: prevent duplicate coffee chats.
--
-- Run this ONCE in your existing Supabase project:
--   SQL Editor -> New query -> paste -> Run
-- (Fresh installs already include this via supabase/schema.sql.)
--
-- Rule: at most one chat per person (case/space-insensitive name) per day
-- per intern. This blocks accidental double-submits and network retries from
-- creating duplicate rows, while still allowing intentional repeat chats on
-- different days.
-- =============================================================

-- 1. Remove any existing duplicates first (keep the earliest of each group),
--    otherwise the unique index can't be created.
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

-- 2. Enforce uniqueness going forward.
create unique index if not exists coffee_chats_one_per_person_per_day
  on public.coffee_chats (intern_id, lower(trim(person_name)), chat_date);
