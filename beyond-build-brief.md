# Beyond — Build Brief for Claude Code (v3 · local-first · two-sided)

> Hand this to Claude Code as the spec. Goal: a clickable, high-fidelity mobile **PWA** with **two sides** — a member app and a coach app — that brings the [Beyond prototype](../prototype/beyond-prototype.html) to life. **No backend yet.** Data lives in memory on the device and resets on hard refresh. The HTML prototype is the **visual source of truth**.

---

## 0. How to start (kickoff)

Run [Claude Code](https://www.claude.com/product/claude-code) from **this `build/` folder** — it's your Cursor workspace and where the app will live. Both `beyond-build-brief.md` and `beyond-prototype.html` are already here, so the project is self-contained. Build **one phase at a time** — run it, click through, then ask for the next. Don't ask for the whole app in one go; you'll catch drift earlier this way.

**Paste this first message:**

> Read `beyond-build-brief.md` and `beyond-prototype.html` in full — the markdown is the logic, the HTML is the look-and-feel. Build **Phase 1 only** (section 12, step 1): scaffold a Vite + React + TypeScript + Tailwind PWA **in this current folder** (it's fine that the brief and prototype already sit here), with the design tokens from section 10, the base components (card, button, bottom nav, toast, bottom sheet), the in-memory seeded store, and the `dataService` + `aiService` stubs from sections 6 and 9. Do **not** build the screens yet. When done, start the dev server, tell me the URL, and stop for review.

**Then, after each phase looks right, continue with:**

> Phase 2 now: sign-in (PIN pad + member/coach role picker + live role switcher) and member onboarding + mock paywall.

> Phase 3 now: the member app screens — Home, Group, Coach, Learn, Progress.

> Phase 4 now: the coach app — Today, Members (roster + detail + record check-in), Group, Content.

> Phase 5 now: wire the AI summaries via the mock `aiService`.

> Phase 6 now: PWA manifest + icons + install prompt, then deploy to a shareable URL.

---

## 1. What we're building

A community app for people who've left a health retreat and want to keep the habits, connection, and 1:1 support going — plus the coach's side for running it.

One line: *your retreat, continued.*

Working name: **Beyond** (placeholder — keep all brand strings in one config file).

This stage is about **the experience**: open a link, type a PIN, click through, and feel it — as both a member and a coach. It does not need a backend, accounts, or real data persistence. Move fast, show people, refine the feel.

**Two apps, one codebase.** A role picker on sign-in switches between the **Member** experience and the **Coach** experience. Same data, viewed from two sides. Do not build two repos.

---

## 2. The plan: local now, Supabase later

Build in two phases. This brief is **Phase 1**. Phase 2 (the Supabase swap) is in the appendix — build toward it, don't build it yet.

| | Phase 1 — local-first (build now) | Phase 2 — Supabase (later) |
|---|---|---|
| Data | In-memory store, seeded on load | Postgres + Auth + Realtime |
| Sign-in | PIN + role picker | Magic link, real accounts |
| Multi-user | Simulated (seeded members) | Real, live across devices |
| Purpose | Feel the experience, demo fast | Prove people pay and stay |

**The rule that makes the swap cheap:** all data access goes through one module, `dataService` (section 6). Screens never touch the store directly. Phase 2 replaces that one module with Supabase calls; the screens don't change. This protects the expensive work — the UI.

---

## 3. Stack (Phase 1)

- **Framework:** React + [Vite](https://vitejs.dev/) + TypeScript.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), tokens from section 10.
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — installable, manifest + icons, "Add to Home Screen".
- **Routing:** React Router.
- **State:** React context over an in-memory store. No server, no database, no auth provider.
- **Persistence:** none by default — reseed on every page load so each demo starts clean. (To survive refreshes later, persist the store to `localStorage`; it's a one-line change.)
- **Hosting:** Vercel or Netlify static deploy. One URL the cohort opens on their phones.

Mobile-first: design for a 390px viewport. On desktop, render inside the phone frame (centred) so a laptop demo looks intentional; on mobile viewports (≤ ~480px) drop the frame and go full-bleed — the real phone is the frame. The installed PWA runs full-screen via `display: standalone`. No native-only dependencies — the React code ports to Expo later if we go to the app stores.

---

## 4. Sign-in & roles

- **Sign-in screen:** a simple 4-digit PIN pad. Any PIN works (or accept a fixed demo PIN, e.g. `1234`). No real auth.
- **Role picker:** on the same screen, choose **"I'm a member"** or **"I'm a coach"**. This sets the active role for the session and routes to the right app.
- A small role switcher (e.g. in a settings/profile menu) lets you flip roles live during a demo without re-entering the PIN.

---

## 5. Information architecture

### Member app (bottom nav: Home · Group · Coach · Learn · Progress)

- **Welcome** → **PIN + role** → **Onboarding** (first run: confirm cohort → set first goal) → **Paywall (mock)** → app.
- **Home** — greeting, "day N since the retreat" tracker, next check-in card, goal ring, today's content + "mark done", daily affirmation, latest group post preview.
- **Group** — cohort feed: composer, posts, likes, leader posts, pinned next-meet-up card with RSVP.
- **Coach** — your coach's profile, upcoming check-in, "Book a check-in" booking sheet, past check-ins with goal scores, **"AI summary of my month"**.
- **Learn** — this week's recipes (with shopping list), movement videos, a cook-along card. Cards with simple actions (no detail pages in v1).
- **Progress** — goal-score trend chart, streak/attendance stats, encouragement card.

### Coach app (bottom nav: Today · Members · Group · Content)

- **Today** — coach greeting, today's scheduled calls, quick stats (active members, calls this week), members needing attention.
- **Members** — roster of the cohort. Tap a member → **member detail**: their goals, full check-in history (scores + blockers), and an **AI summary of that member's month** (the report engine). Record a new check-in here: goal score, top blocker, commitment, notes.
- **Group** — post to the cohort feed as the leader; see member posts.
- **Content** — light view of this week's content drops (what members receive). Read-only is fine for v1.

**In scope (v1):** everything above.
**Out of scope (note as future):** real auth/backend, live cross-device sync, a meet-ups screen, content detail pages, comments, real payments, push notifications.

---

## 6. The data-service layer (most important instruction)

Create one module, `src/services/dataService.ts`, that exposes typed functions and hides where data comes from. Screens import only this.

```ts
// Phase 1: backed by the in-memory store. Phase 2: swap body for Supabase.
getCurrentUser(): Profile
getCohortFeed(): Post[]
addPost(body: string): Post
toggleLike(postId: string): void
getCheckIns(memberId: string): CheckIn[]
bookCheckIn(slot: Date): CheckIn
recordCheckIn(input: RecordCheckInInput): CheckIn   // coach side
getGoals(memberId: string): Goal[]
getContentForWeek(): ContentItem[]
markContentDone(contentId: string): void
getMembers(): Profile[]                               // coach side
getSubscription(): Subscription
startMockSubscription(): Subscription
```

Mirror this for AI in `src/services/aiService.ts` (section 9). Keep both swappable.

---

## 7. Local data shape (TypeScript)

The in-memory store is seeded on load. Types mirror the future tables exactly, so Phase 2 is a clean swap.

```ts
type Role = 'member' | 'coach';

interface Profile { id: string; fullName: string; avatarInitial: string; role: Role; cohortId: string; onboarded: boolean; }
interface Cohort  { id: string; name: string; retreatName: string; }
interface Goal    { id: string; profileId: string; title: string; target?: string; active: boolean; createdAt: string; }
interface CheckIn { id: string; memberId: string; leaderId: string; scheduledAt: string;
                    status: 'upcoming' | 'completed' | 'cancelled';
                    goalScore?: number; topBlocker?: string; commitment?: string; notes?: string; }
interface Post    { id: string; authorId: string; cohortId: string; body: string; createdAt: string; likedBy: string[]; }
interface ContentItem { id: string; type: 'recipe' | 'movement' | 'affirmation' | 'event';
                        title: string; description?: string; payload?: any; weekOf: string; doneBy: string[]; }
interface Subscription { profileId: string; plan: string; status: 'mock' | 'active' | 'cancelled'; startedAt: string; }
interface AiSummary { memberId: string; generatedAt: string; headline: string; wins: string[]; watchOuts: string[]; suggestedFocus: string; }
```

---

## 8. Screen specs & acceptance criteria

**Member — Home:** name + day-counter; next `upcoming` check-in ("Join"/"Reschedule"→Coach tab); active goal with progress ring; one movement item with a working "Mark done"; cycling affirmation; latest post preview → Group.

**Member — Group:** cohort posts newest-first (author, time-ago, body, likes); composer adds a post to the top instantly; like toggles and persists in `likedBy`; pinned meet-up card with RSVP (toast).

**Member — Coach:** coach profile; upcoming check-in; booking sheet with 3 seeded slots → writes an `upcoming` check-in + toast; past check-ins with scores; "AI summary of my month" → calls `aiService` and renders an `AiSummary`.

**Member — Learn:** this week's content by type; recipe shows a shopping list; actions can toast in v1.

**Member — Progress:** bar chart of `goalScore` across completed check-ins; streak, meet-ups, attendance stats; encouragement card.

**Coach — Today:** today's calls; quick stats; "members needing attention" (e.g. low recent goal score or no recent post).

**Coach — Members:** roster; member detail shows goals + full check-in history + AI summary; "Record check-in" form writes a `completed` check-in (score, blocker, commitment, notes) that immediately feeds that member's Progress and Home.

**Coach — Group / Content:** post to the feed as leader; view this week's content.

**Definition of done:** from one device you can — sign in with a PIN as a member, onboard, pass the mock paywall, post to the group, book a check-in, and see an AI summary; then switch role to coach, open that member, record a check-in, and see it reflected on the member's Progress. All without a backend.

---

## 9. AI features

- One module, `aiService.ts`, with e.g. `summariseMember(memberId): Promise<AiSummary>`.
- **Phase 1 default: mock.** Return a canned but realistic `AiSummary` built from the member's seeded check-ins and posts (e.g. headline, 2–3 wins, 1–2 watch-outs, a suggested focus). Instant, free, no keys.
- **Optional real call:** behind the same function, call an LLM (Claude or similar) with the member's check-in text. **Security flag:** a real API key in client code is acceptable only for a local, un-deployed prototype — never ship it in a public deploy. Route real calls through a serverless function in Phase 2.
- Surfacing: member sees a summary of their own month; coach sees a per-member summary. Same engine, two audiences — this is the seed of the parent-report idea in [Craig's concept](../research/conversation-with-craig-raising-better-humans.md).

---

## 10. Design system (match the prototype)

From `beyond-prototype.html`. Put colours in Tailwind config.

- **Colours:** cream `#F4EFE7`, sand `#EAE2D4`, white `#FCFAF6`, ink `#2A2A26`, muted `#7C766B`, green `#3A5145`, green-soft `#6F8472`, sage `#A7B59C`, terra `#C97B5A`, line `#E2D9CB`.
- **Type:** [Fraunces](https://fonts.google.com/specimen/Fraunces) for headings, [Inter](https://fonts.google.com/specimen/Inter) for body/UI.
- **Components:** rounded cards (~22px), soft shadows, generous whitespace; primary (green) / ghost (sage outline) / accent (terra) buttons; 5-tab bottom nav with line icons; bottom sheet for booking; toast for confirmations; conic-gradient ring for goals; simple bar chart for trends. No emojis in chrome — use SVG icons. Calm, natural, premium.

---

## 11. Seed data

Make it feel alive on load:

- 1 cohort: "April Cohort" (Gwinganna).
- 1 coach (Lucy Holloway) + 4 members (you + Sarah, Tom, plus one more) so the coach roster and feed are populated.
- 4–5 posts (member wins/struggles + a leader prompt), varied likes.
- For each member: 1–2 completed check-ins (with scores + blockers) and 1 upcoming, so Progress charts and AI summaries have material.
- This week's content: 1 recipe (shopping list in `payload`), 1 movement video, 1 cook-along event.
- 5 affirmations.

---

## 12. Build phases (fast)

1. **Scaffold** — Vite + React + TS + Tailwind + vite-plugin-pwa; tokens; base components (card, button, nav, toast, sheet); the in-memory store + `dataService`.
2. **Sign-in + role routing** — PIN pad, role picker, role switcher; member onboarding + mock paywall.
3. **Member app** — Home, Group (posts/likes), Coach (booking + AI summary), Learn, Progress.
4. **Coach app** — Today, Members (roster + detail + record check-in), Group, Content.
5. **AI** — `aiService` mock; wire the summaries.
6. **Polish + deploy** — PWA manifest + icons (`display: standalone`), install prompt, responsive phone frame (desktop only, full-bleed on mobile), then deploy. Target: **GitHub Pages** — set Vite `base` to the repo name (e.g. `/beyond/`) for a project page, build to `dist/`, and serve over HTTPS so the PWA installs on mobile.

Ship something clickable after phase 2; layer the rest.

---

## 13. Constraints & non-goals (Phase 1)

- No backend, no real auth, no real payments, no live cross-device sync.
- Data is in memory and resets on hard refresh — that's intended.
- Keep all data access behind `dataService` and all AI behind `aiService`.
- Keep brand strings (name, tagline, colours) in one config for fast rebranding.
- Performance and scale are not priorities. The two-sided experience is.

---

## Appendix — Phase 2: swapping to Supabase

When you need two real people interacting live, replace the in-memory store inside `dataService` with [Supabase](https://supabase.com/) (Postgres + Auth + Realtime + RLS). Magic-link sign-in replaces the PIN. The screens don't change. Starter schema:

```sql
create table cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  retreat_name text default 'Gwinganna',
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, avatar_initial text,
  role text not null default 'member' check (role in ('member','leader')),
  cohort_id uuid references cohorts,
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  title text not null, target text, active boolean default true,
  created_at timestamptz default now()
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references profiles on delete cascade,
  leader_id uuid references profiles,
  scheduled_at timestamptz not null,
  status text default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  goal_score int check (goal_score between 0 and 10),
  top_blocker text, commitment text, notes text,
  created_at timestamptz default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles on delete cascade,
  cohort_id uuid references cohorts on delete cascade,
  body text not null, created_at timestamptz default now()
);

create table post_likes (
  post_id uuid references posts on delete cascade,
  profile_id uuid references profiles on delete cascade,
  primary key (post_id, profile_id)
);

create table content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('recipe','movement','affirmation','event')),
  title text not null, description text, payload jsonb, week_of date,
  created_at timestamptz default now()
);

create table content_completions (
  profile_id uuid references profiles on delete cascade,
  content_id uuid references content_items on delete cascade,
  completed_at timestamptz default now(),
  primary key (profile_id, content_id)
);

create table subscriptions (
  profile_id uuid primary key references profiles on delete cascade,
  plan text default 'monthly',
  status text default 'mock' check (status in ('mock','active','trial','cancelled')),
  started_at timestamptz default now()
);
```

RLS: a signed-in user reads rows for their own cohort and writes their own rows; the leader reads/writes check-ins for members in their cohort. Subscribe to `posts` and `post_likes` for the live feed. Move real AI calls into a Supabase Edge Function so no key ships to the client.
