# ChurchSpace: Roadmap

**Status:** Step 4. Moderation moving to Phase 2 approved on 2026-11-22; awaiting final review. Read with [ARCHITECTURE.md](ARCHITECTURE.md) and [SAFETY_AND_PRIVACY.md](SAFETY_AND_PRIVACY.md).

Each phase ships on its own. A phase is done only when every box is ticked **and** `npm run lint`, `npm run typecheck`, `npm test`, `supabase test db` and `npm run e2e` pass in CI.

**Demo track (2026-11-22):** the team chose to build every feature first as a working demo on seed data (no backend, no real auth), to show organizers how the system works. Production phases 1–6 below are parked, not dropped. The demo's model code (streaks, prayer cap/waitlist, badges, sermon cards) has tests and carries over.

**One change from the original brief (approved):** the moderation pipeline, including crisis detection, moves **into Phase 2**. Prayer requests are where people are most likely to write about self-harm or abuse ("please pray, I don't want to live anymore"). We can't ship free-text prayer requests without it. So the first Claude API use is the moderation classifier in Phase 2, not Sunday Cards.

---

## Phase 0: Cleanup, hygiene, tooling (no features)
The goal is a typed, linted and tested base that looks and behaves exactly like today's Parable UI.

**Toolchain.** Versions match the winning prototype, with one exception:
- Vite 8, React 19, Tailwind v4 (`@tailwindcss/vite`), React Router is deferred to Phase 1 (it is now at v8; Phase 0 changes no navigation).
- **TypeScript 6.0.x, not 7.** The prototype used TS 7.0.2, but typescript-eslint (8.73) supports only TypeScript below 6.1, so TS 7 would break linting. We move to TS 7 when typescript-eslint supports it.
- `strict: true`, `noUncheckedIndexedAccess`. No `allowJs`; no `experimentalDecorators`. The prototype had both and wasn't strict.
- The `@/` alias points to `src/` (the prototype pointed it at the repo root).

**Changes:**
- [x] Port the existing components and utilities to `.tsx`/`.ts` under the new folder layout. **No behavior or visual change.**
- [x] Move theme tokens to Tailwind v4 `@theme` and keep the pre-paint theme script.
- [x] Self-host the Lora and Inter subsets and remove the CSS `@import` from Google Fonts.
- [x] Set up ESLint (flat config): typescript-eslint, react-hooks, jsx-a11y. Add Prettier. *(An import-order rule was not added; can come later if the team wants it.)*
- [x] Set up Vitest and Testing Library, with first tests for `search.ts` (synonym expansion) and the theme hook.
- [x] Add a Playwright skeleton with one smoke test (the app loads and the feed renders) and axe checks.
- [x] Add a GitHub Actions workflow running lint, typecheck, unit tests, build and the size budget (size-limit). E2E runs on pull requests.
- [x] Update `.env.example` to contain only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. **Remove `VITE_GEMINI_API_KEY`**: a `VITE_` variable gets inlined into the client bundle, which would leak the key.
- [x] Use the prototype's `.gitignore` (`.env*`, `!.env.example`, coverage, logs), plus `playwright-report/` and `supabase/.temp/`.
- [x] Add `.nvmrc` and `engines`, and use scripts that work on Windows (no `rm -rf`).
- [x] Add a `CLAUDE.md`: commands, folder rules, "RLS is the source of truth", "no secrets in `VITE_*`", "tests for logic", and links to the docs.
- [x] Update the README.

**Done when:** the app looks identical to today, CI is green, and it has no JavaScript files and no `any` types.
**Keys you need:** none.

**Result (2026-11-22, branch `chore/phase-0`):** `npm run check` and `npm run e2e` pass locally. 35 unit/component tests and 20 end-to-end/accessibility tests pass. JS is 77 kB gzip (budget 150 kB) and CSS 8.5 kB. All 16 before/after screenshots (both themes, mobile and desktop, feed/reader/composer/Bark) match. **Still to confirm:** GitHub Actions has not run yet; it runs on the first push of the branch.

## Phase 1: Real backend, auth, shared profile, hardened shell
- [ ] Supabase project in the Singapore region, plus local dev via the Supabase CLI (needs Docker).
- [ ] Migrations for `profiles`, `churches`, `church_roles` (including `safeguarding_lead`), `platform_roles`, `groups`, `group_members`, `consents`, `audit_log`, `notifications`, `push_subscriptions`. Add RLS helper functions.
- [ ] pgTAP tests: RLS is enabled on every table, plus allow and deny tests for each policy.
- [ ] Generated DB types; Supabase client; TanStack Query provider.
- [ ] Auth: magic link or one-time code, plus Google. Onboarding: age gate, consents, guardian flow for ages 13–17, limited mode until the guardian confirms.
- [ ] Join-a-church request and approval.
- [ ] Shell hardening:
  - React Router v8 with a lazy route per app.
  - Mobile bottom tab bar and desktop header.
  - Clear the accessibility debt from Phase 0: delete the warn-only block in `eslint.config.js`, empty `KNOWN_VIOLATIONS_PHASE_1` in `e2e/a11y.spec.ts` (unnamed anonymous switch, dark-theme module chip contrast 4.39:1), make cards real buttons/links, and show module navigation on mobile.
  - Routed sheets and Radix dialogs, with focus management and unsaved-text protection.
  - Toast queue, error boundary, offline banner, skeletons.
  - A shared `shared/ui` kit (Button, Field, Chip, Card, Sheet, EmptyState, Toast).
- [ ] Profile, Settings (theme, data saver, notification preferences, consents) and About.
- [ ] Data export and account deletion, including the 7-day purge job.
- [ ] PWA: manifest, caching of the app shell, install prompt.
- [ ] Contrast unit test on the theme tokens.
- [ ] Vitest coverage for the shell: navigation and routes, sheet open/close and back button, focus return, toast queue.
- [ ] Playwright: sign-up for an adult, sign-up for a minor with the guardian step, delete account.

**Done when:** a real user can sign up, join a church, edit their profile, export their data and delete their account. Every table is covered by RLS and tests.
**Keys you need:**

| Key | Where it goes |
|---|---|
| Supabase project URL and anon key | `.env.local`, and in CI as public values |
| Supabase service-role key | Edge Function secret only, **never** in `.env.local` |
| `SUPABASE_ACCESS_TOKEN` | GitHub secret, for migrations and type generation in CI |
| Google OAuth client ID and secret | Supabase dashboard only, not the repo |

## Phase 2: Prayer Requests (template app) + the moderation pipeline
- [ ] Tables `prayer_requests` and `prayer_updates`. `submit_prayer_request()` locks the group row with `FOR UPDATE`, so the cap holds under concurrent submits. A trigger promotes the next request from the first-in, first-out waitlist.
- [ ] pgTAP: cap and waitlist, including a concurrency test. Visibility rules (`leaders` vs `group`).
- [ ] The intake form works like Google Forms, and shows the waitlist position clearly.
- [ ] Leader view: active, waitlisted and answered requests. Check-in nudges after 3+ days without an update.
- [ ] `_shared/moderation.ts`: Zod checks, rate limits (`check_rate_limit`), wordlist and contact-detail filter, Claude classifier with structured output, and the hold, crisis or publish decision. Unit tests use a mocked Claude client.
- [ ] Crisis flow end to end: support card, voluntary "talk to a leader", alerts to safeguarding leads, escalation after 2 hours.
- [ ] Reports, auto-hide at 3 reports, and the `/mod` review queue (crisis, held, reported), with MFA required.
- [ ] Notification infrastructure: `notification_jobs`, a pg_cron schedule, the `send-notifications` function (web push and email), quiet hours, a daily cap, the in-app inbox.
- [ ] Purge prayer requests 90 days after closing.
- [ ] Playwright: submit a request (active, waitlisted, then promoted), leader check-in, a crisis keyword triggers the flow (with the classifier mocked), report and moderate.
- [ ] Write `docs/BUILDING_AN_APP.md` from this phase. It's the template for every later app.

**Done when:** a pilot group can run prayer requests end to end, with caps, waitlist, nudges, moderation and crisis handling.
**Keys you need:**

| Key | Where it goes |
|---|---|
| `ANTHROPIC_API_KEY` | Edge Function secret |
| `RESEND_API_KEY`, plus a verified sending domain | Edge Function secret |
| VAPID public and private keys (generated locally with `web-push generate-vapid-keys`) | Public key in `.env.local`, private key as a function secret |

## Phase 3a: Daily Word
- [ ] Verses (public-domain translations only), decks, flashcard review, and the offline review queue in IndexedDB, synced with client UUIDs.
- [ ] `activity_days` and the streak view. pgTAP covers gaps, the Manila-midnight boundary, and duplicate offline syncs. A pure TS function adds today's offline reviews before showing the streak (Vitest).
- [ ] A GitHub/TikTok-style streak display: a heatmap and a flame. Shown publicly only for adults.
- [ ] Discipler dashboard: disciples who replied vs. went quiet for 3+ days, with a one-tap nudge.
- [ ] Streak reminder and discipler digest notifications.

**Done when:** a new believer can keep a streak offline, and their discipler sees who has gone quiet and gets a nudge about it.

## Phase 3b: Sunday Message to Cards
- [ ] Media volunteer pastes sermon notes. The `sunday-cards` Edge Function calls Claude (`claude-opus-5-5`, structured output from a Zod schema, prompt caching, refusal fallback, rate limit), checks the result, and returns verse cards, quote cards and captions.
- [ ] Edit, then church admin approves, then the cards are published to members.
- [ ] PNG export with `html-to-image`, loaded only when needed, in sizes for Facebook feed, Instagram/TikTok story and square.
- [ ] Bible references in the output are checked against our verses table, so the AI never invents a verse text.

**Done when:** the Sunday message becomes shareable cards by Monday morning.

## Phase 4: Forum
- [ ] Questions under the anonymity model: no author link, device-token ownership. Answers and helpful votes. "Answered" only by a leader. A 12-hour unanswered nudge.
- [ ] Port Parable's feed, reader and composer onto real data. Server-side search with synonym expansion (Postgres full-text search plus the synonym groups).
- [ ] Daily post ideas through the `post-ideas` function (Claude).
- [ ] Church tech tasks: create, claim, complete.
- [ ] Badges: `badge_definitions` and SQL triggers, tested with pgTAP. Never shown on anonymous posts.
- [ ] Playwright: an anonymous ask from one device, a leader answers, the asker sees the answer through the token, and the asker can't be identified by anyone, including moderators.

**Done when:** a youth can ask anonymously, get a local leader's answer within a day, and nobody can find out who asked.

## Phase 5: Outreach Finder
- [ ] Church directory by town: what each church can share and what outreach it is open to. Imported from a source we have permission to use (to be decided in this phase).
- [ ] The claim and verify flow, as specified in SAFETY_AND_PRIVACY.md §4.
- [ ] "Request to partner" between verified churches, held for churches that haven't claimed their listing.
- [ ] Optional: prerender `/churches/:slug` for SEO and link previews.

**Done when:** two verified churches can find each other and agree on an outreach in the app.

## Phase 6: Pilot and polish
- [ ] Legal review checklist completed (SAFETY_AND_PRIVACY.md).
- [ ] Onboard 1–2 Laguna churches. Train their safeguarding leads and moderators, and set up the core team on-call rotation for crisis escalation.
- [ ] Aggregate analytics only: weekly active users per app, median answer time, streak retention at week 1 and week 4, prayer check-in rate.
- [ ] In-app feedback form, and a weekly review with the pilot churches.
- [ ] Measure each of the 7 north-star problems with one metric each. Fix the top issues. Translation pass for Filipino and Taglish copy.

**Done when:** the pilot churches have used it for 4+ weeks and we have one metric per north-star problem.
