# ChurchSpace (Parable): Audit and Architecture

## Context
We won HackLaguna with a prototype. Now we want a real product for Laguna churches and youth. This document records the audit of the current repo (Step 1) and the approved production architecture (Step 2), including the decisions the team has made.

**Status:** approved on 2026-11-22. Still to come, each with its own review: Step 3 (safety and privacy design), Step 4 (phased roadmap), then Phase 0 (cleanup and tooling).

---

## Step 1: Audit

### Important: the repo is not the prototype the brief describes
This repo is **"Parable"**, Tomas's first scaling pass. It has 23 files and about 554 lines of code. It contains:
- **No window manager.** It is a single page with a sticky header, a module switcher (`Sanctuary | Mentorship | Outreach`), and two modals.
- **No TypeScript.** It is plain `.jsx`.
- **No Daily Word, Prayer Requests, Outreach Finder, Settings, Profile or About.** Mentorship and Outreach render one shared "coming soon" page.
- **No localStorage data.** Only the theme is persisted. All posts live in memory and reset on refresh.
- **Gemini, not Claude.** The README and `.env.example` mention Gemini.

The only feature that exists is an early **Forum** ("Freedom Wall" Q&A), mixed into a feed of media cards.

### Stack and structure
- Vite 5, React 18 and plain JSX, Tailwind 3, lucide-react. There is no router, no state library, no linter, no tests, no CI and no TypeScript.
- `src/App.jsx`: all state lives here (`items`, `filter`, `search`, `openId`, `composer`, `toast`, `module`). It passes everything down as props.
- `src/components/`: Navbar, MasonryFeed, QuestionCard, MediaCard, ReaderModal, ComposerModal, DogRouterWidget ("Ask Bark"), FeaturePlaceholder.
- `src/data/seedData.js` holds 4 questions, 4 media items and an `AI_TAKEAWAYS` lookup by topic.
- `src/utils/search.js` does keyword and synonym substring matching. `src/utils/theme.js` handles the light/dark theme through localStorage.
- **Theme system (good):** CSS custom properties in `src/index.css` are read by Tailwind colors in `tailwind.config.js`. A script in `index.html` applies the theme before first paint, so the page doesn't flash.
- **"Window manager" equivalent:** a `module` string in `App.jsx` picks a view. Modals are boolean or id flags. Nothing is URL-addressable.

### Code quality issues
- **Data won't survive real use.** IDs are `'q' + Date.now()`. Times are stored as display strings ("21h ago"). The author is hardcoded as "Kiko Mendoza" and the church as "Calamba". The per-user `helped` flag is stored on the shared item. **Any reply marks a question "answered"**, even the asker's own reply. Inputs have no length limits or trimming (`App.jsx:44`).
- **Anonymity is cosmetic.** "Anonymous" only swaps the display string (`App.jsx:46`). Nothing separates identity from content.
- **The AI is fake and mislabelled.** It shows a static takeaway per topic, labelled "AI Scripture & Sunday Lecture Takeaway" (`QuestionCard.jsx:7`). Real users would read that as generated content.
- **Secret-leak pattern.** `VITE_GEMINI_API_KEY` in `.env.example`: Vite inlines every `VITE_*` variable into the client bundle.
- **Share is broken.** It copies `/#id`, but nothing reads the hash on load. It also shows "Link copied" even when the clipboard call fails (`App.jsx:52-55`).
- **Duplicated code.** The input/field class string is repeated in 4 files. The color `bg-emerald text-[#071917]` is hardcoded about 8 times. Overlay and close logic is duplicated across the two modals, and the Composer has no Escape handling. ReaderModal reaches into QuestionCard and MediaCard for helpers.
- **Toasts.** The `setTimeout` is never cleared, so toasts overlap.
- **Performance on low bandwidth.** Google Fonts loads through a CSS `@import`, which blocks rendering. Unsplash covers are fetched at 900px with no `srcset`. Every item renders at once, with no pagination. The resize listener isn't throttled.
- **Missing states.** There is no error boundary and no loading state. The feed and Bark do have empty states.

### Accessibility gaps
- **Mobile users can't reach other modules.** The module switcher is `hidden sm:flex` (`Navbar.jsx:11`), and phones are most of our users.
- **Share is invisible on touch.** The button is `opacity-0` until hover (`MediaCard.jsx:22`).
- **Dialogs are incomplete.** They have no `aria-labelledby`, no focus trap, no initial focus and no focus return. Clicking the overlay closes the Composer and loses whatever was typed.
- **Cards are clickable `<article tabIndex=0>` elements with a button inside.** Interactive elements are nested, and Space doesn't activate them.
- **Missing roles and labels.** The filter chips have no `aria-pressed`. The Bark panel has no dialog role and no Escape. The anonymous switch has no accessible label.
- **Contrast is unmeasured.** It needs checking for `text-sage/60`, `text-fg/70` and light-mode `text-warn` on `amber/10`.

### Everything that is mocked or faked
| Area | Current state |
|---|---|
| Auth and user | Hardcoded "Kiko Mendoza", avatar "K" |
| Church and roles | Hardcoded "Calamba". No roles. |
| Data | In-memory seed arrays, lost on refresh |
| AI takeaways | Static dictionary per topic |
| "Answered" status | Any reply |
| Helpful counts and timestamps | Local to the session. Times are strings. |
| Search and the "Bark" router | Client-side substring and synonym match |
| Media (reels, podcasts) | Unsplash images. The play button does nothing. |
| Share links | Copies a URL that doesn't route |
| Mentorship, Outreach | Placeholder pages |
| **Not present, not even mocked** | Daily Word, flashcards, streaks, discipler dashboard, Sunday Message to Cards, PNG export, Prayer Requests (cap, waitlist, check-ins), Outreach Finder, claim flow, badges, tech tasks, post ideas, notifications, moderation and reporting, Settings, Profile, About |

### Keep vs rewrite (honest)
- **Keep:** the visual language (the "Warm Editorial" light and "Deep Sanctuary" dark themes, Lora with Inter, the card styling). Keep the CSS-variable token setup, the theme pre-paint script, the empty-state copy and tone, the feed, reader and composer layouts, and the synonym-expansion idea (including Tagalog words like *barkada*), which can run server-side as query expansion.
- **Rewrite:** all of the logic: state, data, handlers, search, modals and navigation. Port each component to TypeScript, built on shared UI primitives.
- **Rewrite is cheap.** At 554 lines, a rewrite costs little, and patching it would carry the wrong data model forward.

### The winning AI Studio prototype (config files only)
We have the prototype's `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json` and `.gitignore`, but not its `src/`. Findings:

**Same stack as our target.** It used Vite 8, React 19, Tailwind v4 and TypeScript. That confirms the stack choice below.

**Its AI ran server-side.** Gemini was called through an Express server (`@google/genai`, `express`, `dotenv`; `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`). Supabase Edge Functions calling Claude replace that server.

**Problems not to carry over:**
- **TypeScript 7.0.2.** typescript-eslint supports only TypeScript below 6.1, so we pin TypeScript 6.0.x until it catches up.
- **`tsconfig` isn't strict.** It also sets `allowJs` and `experimentalDecorators`, and the `@/` alias points at the repo root.
- **The only "lint" was `tsc --noEmit`.** There were no tests.
- **`<body class="overflow-hidden select-none">`.** That's the desktop-OS look; it breaks scrolling on mobile and stops users copying verse text.
- **Three Google Font families** (DM Sans, JetBrains Mono, Plus Jakarta Sans) and the `motion` animation library: too heavy for low-end phones.
- **Small rough edges:** the package is named `react-example`, and the `clean` script uses `rm -rf`, which doesn't work in Windows cmd.

**Worth keeping:** the `.gitignore` (`.env*` with `!.env.example`) and the SEO and Open Graph meta tags.

---

## Step 2: Proposed architecture

### Stack (decisions and why)
| Concern | Choice | Why |
|---|---|---|
| Build | **Vite 8 + React 19 + TypeScript 6.0.x (strict)**, not Next.js | Already on Vite. The app is mostly behind login, so server rendering helps little. A static app is the cheapest to host, and offline/PWA support is simpler. Server code is just a few functions (below). *Tradeoff:* public pages (church directory, shared links) don't get server rendering. If directory SEO matters, prerender `/churches/:slug` in Phase 5. |
| Routing | **React Router v7**, each app a lazy route | Every app is URL-addressable, the Android back button closes sheets, and share links work. Splitting code per app keeps the first load small. |
| Styling | **Tailwind v4**, with the current tokens moved to `@theme` | Migrating 554 lines now is cheap. It would cost more later. |
| UI primitives | **Radix UI** (Dialog, Switch, Tabs, Popover) inside our own `shared/ui` | Focus traps and ARIA are handled. Unused parts are dropped from the bundle. |
| Server state | **TanStack Query** + `supabase-js` + generated DB types | Caching, retries, optimistic updates, offline-aware mutations |
| UI state | **Zustand**: a small store for theme, toasts and open sheets only. **No window manager** (team decision). | |
| Validation | **Zod** schemas in `supabase/functions/_shared/schemas`, imported by the client through a `@schemas` alias | One source of truth, shared by the client and Edge Functions |
| Backend | **Supabase**: Postgres, Auth, Row Level Security (RLS), Realtime, Storage, Edge Functions, pg_cron. **Singapore region.** | One vendor with a free tier, and the region is close to the Philippines. Edge Functions hold all secrets. pg_cron runs the nudges and reminders. |
| Auth | Email magic link / one-time password (OTP), plus Google sign-in | Free. Phone OTP costs money per SMS; we can revisit that at the pilot. |
| AI | **Claude API from Edge Functions only** (`@anthropic-ai/sdk` via `npm:`), default model `claude-opus-5-5`, low/medium effort, structured outputs through `output_config.format` from Zod, server-side refusal fallback, prompt caching on the system prompt | The key never reaches the client. A sermon costs about $0.04 at $4/$20 per million input/output tokens. Moving cheaper routes such as post ideas to Sonnet or Haiku is a cost decision for the team. |
| Rate limiting | A Postgres token-bucket table checked by a `check_rate_limit(user, action)` function inside every Edge Function and write function | No Redis to run. It is enough at pilot scale. |
| PNG export | `html-to-image`, loaded only when used, on the client | No server cost, and it works offline |
| PWA and offline | `vite-plugin-pwa` (Workbox). The next 7 days of verse cards are cached in IndexedDB. Reviews done offline go into a queue and sync with client UUIDs, so they're never counted twice. | |
| Tests | Vitest + Testing Library + MSW (mocks network calls). **pgTAP for RLS and SQL logic.** Playwright for end-to-end tests against local Supabase. | Permissions live in RLS, so RLS needs its own tests |
| CI | GitHub Actions: lint (ESLint with typescript-eslint and jsx-a11y), typecheck, Vitest, `supabase test db`, Playwright on pull requests, and a bundle-size budget | |
| Hosting | **Cloudflare Pages** (recommended over Vercel) | It's a static app either way. Cloudflare's free tier has unlimited bandwidth and allows commercial and nonprofit use; Vercel Hobby doesn't allow commercial use. It also has edge servers in Manila and Singapore. |
| Notifications | **Web Push (free) plus an in-app inbox.** Email through Resend for leader digests and account mail. | Most youth in the Philippines use Android Chrome, where web push works. On iOS, push only works once the app is added to the home screen. Messenger is deferred: Meta's 24-hour window and app review make scheduled reminders hard. Telegram has low reach among these users. SMS works as a paid fallback later. |

### Decisions made
1. **Shell:** keep the current repo's UI. The desktop window manager is dropped for now. The shell is the routed, mobile-first layout described below.
2. **Prototype:** not needed for the architecture. The AI Studio version would only help as a reference for how flashcards, streaks and cards looked, so share it before Phase 3 if it's easy.
3. **Anonymity:** **no one, ever**, for now. Community-specific accounts may come later.
4. **Minors:** **13+**, with guardian consent for ages 13–17. Final wording needs legal review.

### Anonymity model (follows from decision 3)
- **Sign-in is still required to post.** That lets us apply the age gate and rate limits. A Postgres function inserts the post. Only the Edge Function can call it, and it never records the account.
- **Rate limits are counted per account without a link to the post.** A per-day counter keyed by user id records "posted N times today" with no question id. It is purged daily.
- **The asker still has access through a device token.** The client generates a random token and keeps it in IndexedDB. Only `sha256(token)` is stored on the question. The asker proves ownership with the token to see replies, close the question or delete it. On app open, the client checks its tokens for new answers.
- **Tradeoffs we accept:**
  - Clearing the browser or switching phones loses access to past anonymous questions. The UI warns about this.
  - No push notification for answers to anonymous questions, since a push endpoint would link the device to the post.
  - **We can't ban an anonymous abuser.** We rely on pre-publish filtering, holding posts for review, and removal.
- **Crisis:** resources are shown to the asker immediately, in the same session, when they submit. Safeguarding leaders are alerted that a crisis post exists. They reply in the thread, and the asker sees the reply through their token.
- **No identifying signals on anonymous posts:** no badges, no streak, no church name, and only coarse timestamps ("today", not the exact minute).
- **Future:** "community accounts" (such as verified youth workers) can be added without changing this model.

### UI direction (keep the current look, fix the shell)
- **Mobile:** a bottom tab bar (Forum, Daily Word, Prayer, Outreach, Me) and a floating "Ask" button. Reader and Composer become routed full-screen sheets. **Desktop:** the current glass header and module switcher, extended to all apps.
- **One design system** in `shared/ui`: Button, Field, Chip, Card, Sheet/Dialog, EmptyState, Skeleton, Toast. It replaces the duplicated class strings.
- **Performance and accessibility basics:** self-hosted subset fonts, responsive images, actions visible on touch, skeleton loaders, and strings ready for translation (Taglish copy later).
- **Keep "Bark"** as a friendly "help me find" assistant, as a tab or sheet so it doesn't cover content on mobile.
- **Anonymous posts never show badges, streaks or church name.** These could identify the asker. They show only "Anonymous · Laguna".

### Folder structure
```
src/
  app/            main.tsx, router.tsx, providers.tsx
  shell/          AppShell, nav (tabs/header), sheet host, toasts, error boundary
  features/
    forum/        routes/ components/ api/(queries, mutations) model/(pure logic) *.test.ts
    daily-word/   prayer/   outreach/   profile/   settings/   about/
  shared/
    ui/  lib/(supabase, queryClient, time.ts = Asia/Manila)  auth/(session, RequireRole)  types/database.ts (generated)
  styles/tokens.css
supabase/
  migrations/  seed.sql  tests/ (pgTAP)
  functions/_shared/ (schemas, claude.ts, rateLimit.ts, moderation.ts)
  functions/{sunday-cards, post-ideas, moderate-content, send-notifications}/
e2e/              Playwright specs
```

### Data model (core tables)
**Identity and orgs**
- `profiles` (id = auth user, display_name, avatar_path, town, birth_year_month, created_at, deleted_at). Holds only minimal data; the UI only ever shows an age group.
- `guardian_consents` (user_id, guardian_email, confirmed_at). Only for users aged 13–17, deleted 1 year after they turn 18.
- `churches` (id, slug, name, town, denomination, status `unclaimed|pending|verified`, shares[], outreach_types[], public contact)
- `church_roles` (user_id, church_id, role `member|discipler|media_volunteer|church_admin|moderator|safeguarding_lead`). The primary key is all three columns, so one user can hold several roles.
- `platform_roles` (user_id, role `platform_admin|moderator`)
- `groups` (id, church_id, name, kind, prayer_cap) and `group_members` (group_id, user_id, role `member|leader`)
- `church_claims` (church_id, claimant_id, evidence_path in a **private** bucket, status, reviewed_by, reviewed_at)
- `consents` (user_id, purpose, policy_version, granted_at, revoked_at, guardian_confirmed_at)
- `audit_log` (actor, action, target, reason, at). Append-only.

**Forum**
- `questions` (id, church_id nullable, topic, title, body, is_anonymous, `author_id` **null when anonymous**, `owner_token_hash` (set only when anonymous), status `pending|open|answered|hidden|removed`, risk `none|review|crisis`, created_at)
- There is no author-link table: anonymous questions are never linked to an account (see "Anonymity model" below).
- `answers` (question_id, author_id, body, is_leader_answer, status), `helpful_votes` (user_id, target), `reports` (reporter_id, target_type, target_id, reason, status, assigned_to, resolution)
- `tech_tasks` (church_id, created_by, title, skills[], status `open|claimed|done|cancelled`, claimed_by, due_on), `post_ideas` (user_id, prompt, output, source)
- `badge_definitions` (slug, kind `skill|topic`, criteria jsonb) and `user_badges` (user_id, badge_slug, earned_at)

**Daily Word**
- `verses` (reference, text, translation), `decks` and `deck_cards`, `reviews` (client_uuid unique, user_id, card_id, reviewed_at)
- `activity_days` (user_id, day in Asia/Manila time, source). Streaks are derived from this table.
- `discipleships` (discipler_id, disciple_id, church_id, status), `nudges`
- `sermons` (church_id, author_id, title, preached_on, notes) and `sermon_cards` (sermon_id, kind `verse|quote|caption`, content jsonb, approved_by)

**Prayer**
- `prayer_requests` (group_id, requester_id, body, visibility `leaders|group`, status `active|waitlisted|answered|closed`, waitlist_position, last_checkin_at)
- `prayer_updates` (request_id, author_id, kind `checkin|update|answered`, body)

**Notifications:** `push_subscriptions` and `notifications` (the inbox)

### RLS approach
- Helper functions, marked `SECURITY DEFINER STABLE` to avoid recursive policies: `has_church_role(church, roles[])`, `is_group_leader(group)`, `is_moderator(church)`.
- **Questions:** anyone signed in reads `open|answered`. Moderators read everything. Insert only through the `submit_question` Edge Function, which runs the moderation pipeline. Direct table inserts are denied.
- **No reveal function exists.** No one can see who wrote an anonymous question; this is enforced by the data model, not just by policy.
- **Prayer requests:** the requester and group leaders can read. Group members can read only when `visibility = group`.
- **Prayer cap and waitlist:** a `submit_prayer_request()` function locks the group row (`FOR UPDATE`) so the cap holds even when two people submit at once. A trigger promotes the next waitlisted request when one closes.
- **Church edits:** need `church_admin` of a **verified** church. A pending claim grants nothing. Only `platform_admin` can approve claims.
- **Discipler dashboard:** a view with discipleship-scoped RLS. Disciplers see the activity of their own disciples only, never reviews of other users.

### How apps share profile, badges and streaks
- One `profiles` row and one set of `church_roles` per user, loaded once into the auth context (`useSession`, `useRoles`).
- **Badges** are awarded in SQL by triggers on events (task completed, leader answer accepted, topic answers). They can't be faked from the client and are tested with pgTAP. Profile displays them; forum author lines show them only on non-anonymous posts.
- **Streaks:** `activity_days` is the single source. A SQL view computes current and longest streak. A small pure TS function adds today's offline reviews before showing the number, tested with Vitest.
- **Logic and where it's tested:**

  | Logic | Tested with |
  |---|---|
  | Badge rules, streak calculation, prayer cap and waitlist | pgTAP and SQL |
  | Optimistic streak and the shell/navigation store | Vitest |
  | Key flows | Playwright |

### Working defaults (still to confirm)
- **Forum scope:** the forum is Laguna-wide, and an asker can route a question to a specific church. A question counts as "Answered" only when a discipler or leader answers. Leaders are nudged when a question is still unanswered after 12 hours.
- **Prayer cap:** the cap means at most N **active** requests per group. Extra requests go to a first-in, first-out waitlist.
- **Crisis content:** it is held from the public feed. The asker sees crisis resources immediately (the Philippine hotline numbers need verifying before launch). Designated safeguarding leaders get a push and an email right away.

### Flagged for legal review (not guessing)
- **Religious affiliation and health details count as *sensitive personal information* under RA 10173.** The whole app reveals religious affiliation, and prayer requests carry health details. This calls for explicit consent and possibly National Privacy Commission (NPC) registration and a Data Protection Officer (DPO).
- **Minors' consent:** whether a guardian checkbox plus a guardian email confirmation is enough for ages 13–17, and how to verify age.
- **Sending anonymous text to the Claude API for moderation:** this needs to be disclosed in the privacy notice.
- **Cross-border data transfer:** data hosted in Singapore, and text sent to the Claude API.
- **Bible translation licensing:** public-domain texts (KJV, WEB, Ang Biblia 1905) are fine. MBB, NIV and ESV need permission.
- **Church-claim evidence:** how long we keep it.
