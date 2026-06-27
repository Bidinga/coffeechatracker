# ☕ Coffee Chat Tracker

A little web app for interns to log their coffee chats and compete on a
**real-time leaderboard**. Sign in with a magic email link, log who you talked
to, and watch the rankings update live for everyone.

Built with **React + TypeScript + Vite + Tailwind**, backed by **Supabase**
(Postgres + Auth + Realtime), deployable free on **Vercel**.

---

## What it does

- **Magic-link login** — no passwords. Interns enter their email, click the link.
- **Log coffee chats** — who, their title, department, date, notes.
- **Personal dashboard** — total chats, chats this week, departments met.
- **Live leaderboard** — ranks update in real time across every open browser
  (Supabase Realtime). Public — anyone can peek without signing in.
- **Profiles** — name, team, emoji avatar.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env     # then fill in your Supabase keys (step 2)
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Until you add Supabase
keys, the app shows a friendly setup notice.

---

## 2. Set up Supabase (free, ~5 min)

1. Create an account at [supabase.com](https://supabase.com) and click
   **New project**. Pick a name, a strong DB password, and the free plan.
2. When it finishes provisioning, go to **SQL Editor → New query**, paste the
   entire contents of [`supabase/schema.sql`](supabase/schema.sql), and click
   **Run**. This creates the tables, the leaderboard view, security rules, the
   signup trigger, and enables realtime.
3. Go to **Settings → API** and copy:
   - **Project URL** → put in `.env` as `VITE_SUPABASE_URL`
   - **anon public** key → put in `.env` as `VITE_SUPABASE_ANON_KEY`
   - _(The anon key is safe in frontend code — Row Level Security protects the data.)_
4. Restart `npm run dev`. You can now sign in with your email.

### Email / magic links

On the free tier, Supabase sends magic links using its built-in email service,
which is **rate-limited (a few per hour)** and fine for testing or a small
cohort. For a real intern group, add a free SMTP provider under
**Authentication → Emails → SMTP Settings** (e.g. Resend, Brevo, SendGrid).

Also under **Authentication → URL Configuration**, set the **Site URL** to your
deployed URL (and add `http://localhost:5173` to **Redirect URLs**) so the magic
link sends people to the right place.

---

## 3. Deploy to Vercel (free)

1. Push this repo to GitHub (it's already wired to your `coffeechatracker` repo):
   ```bash
   git add -A
   git commit -m "Coffee chat tracker"
   git push
   ```
2. At [vercel.com](https://vercel.com), **Add New → Project**, import the repo.
   Vercel auto-detects Vite — no config needed.
3. In the project's **Settings → Environment Variables**, add the same two vars
   from your `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy. Then copy the live URL into Supabase **Authentication → URL
   Configuration → Site URL** so magic links work in production.

---

## How real-time works

The leaderboard reads from a Postgres `leaderboard` view (computed counts per
intern). The app subscribes to changes on the `coffee_chats` table via Supabase
Realtime; whenever anyone logs or deletes a chat, every connected browser
re-fetches the view and the rankings animate to their new positions.

## Project structure

```
supabase/schema.sql      Database schema, RLS policies, realtime, trigger
src/
  lib/supabase.ts        Supabase client + config check
  types/index.ts         Shared TypeScript types
  hooks/
    useAuth.tsx          Session + profile context
    useCoffeeChats.ts    The current user's chats (add/delete)
    useLeaderboard.ts    Live leaderboard subscription
  pages/
    LoginPage.tsx        Magic-link sign in
    OnboardingPage.tsx   Set name / team / emoji on first login
    DashboardPage.tsx    Stats + your chats + log button
    LeaderboardPage.tsx  Live ranked leaderboard + podium
  components/
    Navbar.tsx
    LogChatModal.tsx
    SetupNotice.tsx
  App.tsx                Routing / auth gating
  main.tsx               Entry point
```

## Security notes

- Row Level Security is on for both tables. Signed-in users can **read**
  everyone's data (needed for the leaderboard) but can only **write/edit/delete
  their own** chats and profile.
- The leaderboard view is intentionally readable by anonymous visitors so the
  public leaderboard works. If you want the leaderboard private, remove the
  `grant select on public.leaderboard to anon` line in the schema and the public
  `/leaderboard` route in `src/App.tsx`.
