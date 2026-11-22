# ChurchSpace (Parable)

A workspace for local churches, youth and their communities in Laguna, Philippines: anonymous faith
questions, daily verses and streaks, prayer requests, and an outreach finder. It started as our
HackLaguna prototype and is now being built into a real product.

> **Status:** Phase 0 is done (typed, linted, tested base). The app still runs on seed data: no
> backend, no real accounts yet. See [docs/ROADMAP.md](docs/ROADMAP.md).

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
  app/              entry (main.tsx) and the App component
  shell/            app chrome: Navbar, module list, placeholders
  features/forum/   components/ (UI) and model/ (types, seed data, pure logic + tests)
  shared/lib/       cross-feature code (theme)
  styles/           Tailwind v4 tokens and global CSS
  test/             Vitest setup
e2e/                Playwright specs
docs/               architecture, safety and privacy, roadmap
```

Each future app (Daily Word, Prayer, Outreach, Profile, Settings) gets its own `features/<app>`
folder with the same `components/` + `model/` split.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): audit of the prototype, production stack, data
  model, RLS approach
- [docs/SAFETY_AND_PRIVACY.md](docs/SAFETY_AND_PRIVACY.md): moderation, crisis flow, RA 10173
  privacy, roles, church verification, accessibility, notifications
- [docs/ROADMAP.md](docs/ROADMAP.md): phases 0–6 with "done" checklists and required keys
- [CLAUDE.md](CLAUDE.md): working rules for contributors and AI assistants

## Demo flow (seed data)

Search `finances` → clear → open **Ask Bark** (bottom right), type `worship` → open the thread →
reply in the reader → **+ Ask / Post** and publish a new question.
