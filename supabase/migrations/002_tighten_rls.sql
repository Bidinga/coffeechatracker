-- =============================================================
-- Migration 002: lock the database down to "own rows only" and make
-- the leaderboard authenticated-only.
--
-- Run this ONCE in your existing Supabase project:
--   SQL Editor -> New query -> paste -> Run
-- (Fresh installs already include this via supabase/schema.sql.)
--
-- After this:
--   * The public API only ever returns a signed-in user's OWN profile/chats.
--   * Other people's chat notes/contacts are never readable via the API.
--   * The leaderboard (safe aggregate: name/team/emoji/counts) requires login.
--   * Logged-out / anonymous requests get nothing.
-- =============================================================

-- interns: read your own row only.
drop policy if exists "read all interns" on public.interns;
drop policy if exists "read own intern" on public.interns;
create policy "read own intern"
  on public.interns for select
  to authenticated
  using (auth.uid() = id);

-- coffee_chats: read your own rows only.
drop policy if exists "read all chats" on public.coffee_chats;
drop policy if exists "read own chats" on public.coffee_chats;
create policy "read own chats"
  on public.coffee_chats for select
  to authenticated
  using (auth.uid() = intern_id);

-- leaderboard view: signed-in interns only.
grant select on public.leaderboard to authenticated;
revoke select on public.leaderboard from anon;
