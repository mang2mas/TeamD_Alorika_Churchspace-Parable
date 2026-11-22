# ChurchSpace (Parable)

A workspace for local churches, youth and their communities in Laguna, Philippines: anonymous faith
questions, daily verses and streaks, prayer requests, and an outreach finder. It started as our
HackLaguna prototype and is now being built into a real product.

> **Status:** working demo. Every feature runs in the browser on sample data, saved in
> localStorage. There is no backend and no real accounts yet; the production plan is in
> [docs/ROADMAP.md](docs/ROADMAP.md).

## Quick start

Requires Node 24 (see `.nvmrc`; Node 22.12+ works).

```bash
npm install
npm run dev          # http://localhost:5173
```

No environment variables are needed yet. `.env.example` lists the Supabase values that Phase 1
will use; copy it to `.env.local` then.

## Scripts

| Command             | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Start the dev server                                               |
| `npm run build`     | Production build to `dist/`                                        |
| `npm run preview`   | Serve the production build                                         |
| `npm run lint`      | ESLint (TypeScript, React hooks, accessibility)                    |
| `npm run format`    | Format everything with Prettier (`format:check` only checks)       |
| `npm run typecheck` | TypeScript, strict mode                                            |
| `npm test`          | Unit and component tests (Vitest); `test:watch` for watch mode     |
| `npm run e2e`       | End-to-end and accessibility tests (Playwright, against the build) |
| `npm run size`      | Bundle size budget (run after `build`)                             |
| `npm run check`     | Everything CI runs except e2e. Run this before calling work done.  |

First time running e2e tests: `npx playwright install chromium`.

## Project layout

```
src/
  app/              entry (main.tsx), App with the routes (one lazy chunk per app)
  shell/            header, mobile bottom tabs, "View as" role switcher, toasts
  features/<app>/   forum, daily-word, prayer, outreach, me
                    each with pages/, components/ and model/ (seed data + pure logic + tests)
  shared/demo/      demo users and roles, KJV verse list
  shared/store/     the persisted demo store (Zustand) and toasts
  shared/ui/        shared UI pieces and class recipes
  shared/lib/       dates and theme
  styles/           Tailwind v4 tokens and global CSS
  test/             Vitest setup
e2e/                Playwright specs
docs/               architecture, safety and privacy, roadmap
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): audit of the prototype, production stack, data
  model, RLS approach
- [docs/SAFETY_AND_PRIVACY.md](docs/SAFETY_AND_PRIVACY.md): moderation, crisis flow, RA 10173
  privacy, roles, church verification, accessibility, notifications
- [docs/ROADMAP.md](docs/ROADMAP.md): phases 0–6 with "done" checklists and required keys
- [CLAUDE.md](CLAUDE.md): working rules for contributors and AI assistants

## Presenting the demo

Before each presentation: **Me → Settings → Reset demo data**. Use the **View as** switch (top
right) to change roles. Everyone in the demo is fictional.

| Role               | Person      | What to show                                                                                   |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| Youth / Member     | Jessa       | Ask anonymously on the Freedom Wall, post ideas, claim a tech task, read today's verse         |
| Discipler / Leader | Ate Rina    | Reply to a question (marks it "Answered by a leader"), Discipler dashboard, Prayer leader view |
| Media Volunteer    | Kuya Migs   | Sunday Message to Cards: generate cards, export a PNG                                          |
| Church Admin       | Ptr. Daniel | Confirm tech tasks (awards badges), Partner inbox                                              |
| Moderator          | Paolo       | Forum review queue, verify church claims                                                       |

A 5-minute walkthrough that covers all seven problems:

1. **Forum (Jessa):** search `finances`, open a question, ask one anonymously. Open **Post ideas**
   and copy a caption.
2. **Badges:** in **Tech tasks**, open **My tasks** and mark the Instagram templates done. Switch to
   Ptr. Daniel, **All**, **Confirm completed**: Jessa earns the Designer badge.
3. **Daily Word (Jessa):** tap **I read today's verse**: the streak goes from 9 to 10. Switch to Ate
   Rina, open the **Discipler dashboard** and nudge someone who has gone quiet.
4. **Sunday Cards (Kuya Migs):** **Generate cards** from the sample notes, change the style, export a PNG.
5. **Prayer (Jessa):** submit a request: Calamba Youth is full, so it goes to the waitlist. Switch to
   Ate Rina, open **Leader view**, check in on an overdue request and mark one answered: the next
   request moves up.
6. **Outreach:** filter by town, open a church and **Request to partner** (as Ptr. Daniel). Claim
   _Hope Chapel San Pedro_ as Jessa, then approve it as Paolo in **Verify claims**.
