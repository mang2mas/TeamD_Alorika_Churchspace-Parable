# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo.

## What this is

ChurchSpace (UI name: Parable): a mobile-first web app for churches and youth in Laguna,
Philippines. Read these before larger changes:

- `docs/ARCHITECTURE.md`: stack, data model, RLS approach, decisions already made
- `docs/SAFETY_AND_PRIVACY.md`: moderation, crisis flow, anonymity, minors, RA 10173
- `docs/ROADMAP.md`: phases and their "done" checklists. **Current: demo track** (all features on seed data, no backend). Production phases are parked until the team picks them up again.

## Commands

- `npm run dev`: dev server
- `npm run check`: lint, format check, typecheck, unit tests, build, bundle size.
  **Run it (and `npm run e2e` when UI changed) before saying something is done.**
- `npm test` / `npm run test:watch`: Vitest
- `npm run e2e`: Playwright (needs `npx playwright install chromium` once)
- `npm run format`: Prettier

## Working rules

- Work one roadmap phase at a time, in small reviewable commits. Plan first; get approval for
  anything that changes product behavior, safety, privacy, or the stack.
- Don't touch unrelated code. Don't reformat files you aren't changing.
- Ask the team (don't assume) for product, safety or legal decisions. Flag legal questions
  rather than guessing.

## Code rules

- TypeScript strict. No `any`, no `as any`. Prefer narrowing and type guards over casts.
- Folder layout: `src/features/<app>/{components,model}`. Pure logic goes in `model/` with a
  `*.test.ts` next to it. Cross-feature code goes in `src/shared/`. App chrome in `src/shell/`.
- Component files export only components (react-refresh rule). Put constants in a `.ts` file.
- Anything with logic gets tests: badge rules, streaks, prayer cap and waitlist, filters,
  search, navigation. Characterization tests in `src/app/App.test.tsx` pin current behavior;
  update them deliberately, never just to make them pass.
- Keep the current visual language (Warm Editorial light / Deep Sanctuary dark, Lora + Inter,
  tokens in `src/styles/index.css`). Use the tokens, not new hex values.
- Mobile-first and accessible: real buttons and links, labels on every control, visible focus,
  no hover-only actions, contrast 4.5:1 or better.
- Accessibility debt is tracked in exactly two places: the warn-only block in
  `eslint.config.js` and `KNOWN_VIOLATIONS_PHASE_1` in `e2e/a11y.spec.ts`. Both must only
  shrink. Never add entries to make new code pass.
- Bundle budget: 150 kB gzip JS (`.size-limit.json`). Lazy-load anything heavy.

## Security and privacy rules

- **Never put secrets in `VITE_*` variables**: Vite inlines them into the public bundle. Only
  the Supabase URL and anon key are allowed client-side.
- Server-only keys (Supabase service role, Anthropic, Resend, VAPID private key) live in
  Supabase Edge Function secrets. Never in the repo, never in `.env.local`.
- From Phase 1: Row Level Security is the source of truth for permissions. UI checks are only
  for display. Every table has RLS enabled and pgTAP tests (allowed role + denied role).
- Anonymous questions are never linked to an account in the database (see
  `docs/ARCHITECTURE.md`, "Anonymity model"). Never add a column, log line or analytics event
  that could re-link them. Never show badges, streaks or church on anonymous posts.
- Collect the minimum personal data. Users aged 13–17 get stricter defaults.
- Claude API calls happen only in Edge Functions, with rate limits, structured outputs and
  the refusal fallback described in the docs.

## Windows note

The team develops on Windows. Keep npm scripts cross-platform (no `rm -rf`, no `&` chaining
tricks). Line endings are normalized to LF by `.gitattributes`.
