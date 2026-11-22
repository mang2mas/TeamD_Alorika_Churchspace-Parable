# Parable

A workspace for local churches, youth and their communities in Laguna, Philippines: anonymous faith
questions, daily Bible verses with streaks, prayer requests that actually get followed up, and an
outreach finder that helps churches find each other. Built by Team D at HackLaguna.

> **This is a working demo.** Every feature runs in the browser on sample data (saved in your
> browser's localStorage). There is no backend and no real accounts yet. All churches and people
> in the demo are fictional.

## 1. Quick Start

Requires Node 22.12 or newer (Node 24 recommended, see `.nvmrc`).

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). No `.env` file is needed for the demo.

**Before every presentation:** open **Me → Settings → Reset demo data** so everything starts fresh.

> **Blank white page after pulling new changes?** An old dev server is probably still running.
> Stop it (Ctrl + C), run `npm install` again, then `npm run dev`, and hard-refresh the browser
> (Ctrl + Shift + R).

## 2. What Parable Offers

Parable solves seven real problems we heard from Laguna churches. Each one has a home in the app:

| #   | Problem                                                              | Where it's solved                                                                                          |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Youth have faith questions but won't ask in person                   | **Forum → Freedom Wall**: ask anonymously; a local leader answers                                          |
| 2   | Members want to share their faith online but don't know what to post | **Forum → Post ideas**: daily ideas with ready-to-copy captions                                            |
| 3   | New believers drop off after week one; disciplers can't follow up    | **Daily Word**: verse flashcards and streaks, plus a **Discipler dashboard** that shows who has gone quiet |
| 4   | Churches can't find each other when planning outreaches              | **Outreach Finder**: churches by town, what they can share, and "Request to partner"                       |
| 5   | Prayer requests get buried in group chats and nobody follows up      | **Prayer**: a request form with a per-group cap, a waitlist, and check-in reminders for leaders            |
| 6   | Churches need tech help but can't find students with the skills      | **Forum → Tech tasks**: churches post jobs, students claim them and earn skill badges                      |
| 7   | The Sunday message is forgotten by Monday                            | **Daily Word → Sunday Message to Cards**: sermon notes in, shareable verse and quote cards out (PNG)       |

### Forum

- **Freedom Wall.** Ask a faith question, anonymously if you want. Only a reply from a Discipler /
  Leader marks a question **"Answered by a leader"**. Questions waiting 12+ hours are flagged so
  leaders see them first. Search understands related words (`finances` also finds money, tuition,
  budget). **Ask Bark** (the wolf, bottom right) points you to related questions.
- **Report and review.** Anyone can report a post. Three reports hide it until a moderator keeps or
  removes it in the **Review queue**. Anonymous askers stay anonymous, even to moderators.
- **Post ideas.** Fresh ideas every day (verse posts, testimonies, prayer prompts, Sunday recaps,
  polls), each with a caption you can copy. "Give me more ideas" makes a new batch.
- **Tech tasks.** Church admins post jobs (design, video, social media, web, sound). Students claim
  a task, mark it done, and the admin confirms it.
- **Badges, earned automatically.** Skill badges (Designer, Videographer…) come from confirmed
  tasks; level II after 3. Topic badges (Encourager · Doubt…) come from 3 replies in one topic.
  Badges show on profiles and named posts, never on anonymous ones.

### Daily Word

- **Today's verse** as a flip card: try to recall it, tap to reveal, then "I read today's verse".
- **Streaks** like GitHub/TikTok: current and longest streak, plus a 12-week grid of reading days.
- **Practice deck** of starter verses.
- **Discipler dashboard** (Discipler / Leader): disciples grouped into "Gone quiet (3+ days)",
  "New this week" and "On track", with who replied to you. Send a **Nudge** with a ready message.
- **Sunday Message to Cards** (Media Volunteer / Church Admin): paste the sermon notes and get
  verse cards (Bible references are found automatically), quote cards (the strongest lines), and
  captions for Facebook, Instagram and TikTok. Pick a style (light, dark, gold) and size (square or
  story), edit any text, and **Export PNG**.

### Prayer Requests

- **Request form** styled like Google Forms: choose a group, show your name or stay anonymous, and
  choose who sees it (the whole group or leaders only).
- **Per-group cap and waitlist.** Each group follows up a set number of requests at a time (for
  example 5). Extra requests join a waitlist and you see your place in line.
- **Prayer wall** for shared requests, with an "I prayed" button and answered prayers.
- **Leader view** (Discipler / Leader): active, waitlist and answered lists. Requests with no update
  for 3+ days get a **Needs check-in** flag. "Mark answered" automatically moves the next waitlisted
  request up. Leaders can raise or lower the group's cap.

### Outreach Finder

- **Directory** of churches across Calamba, Santa Rosa, Biñan, San Pedro, Cabuyao, Los Baños,
  San Pablo and Sta. Cruz. Filter by town, by what they can share (venue, sound system, volunteers,
  food, transport, medical team) and by outreaches they're open to.
- **Request to partner** (Church Admin / Leader): pick an outreach, a date and a message. Requests
  land in the other church's **Partner inbox**, where the admin accepts or declines.
- **Claim your church.** Members can claim an unclaimed listing with proof. It stays **Pending**
  until a moderator verifies it in **Verify claims**, so nobody can impersonate a church.

### Me

- **Profile:** your role, church, streak, badges, and progress toward the next badge.
- **Settings:** dark mode, **data saver** (skips images on prepaid data), the **View as** switch,
  and **Reset demo data**.
- **About:** the seven problems and a link to the app that solves each one.

## 3. Architecture Summary

```
parable/
├── index.html                 # Theme script runs before first paint (no flash)
├── vite.config.ts             # Vite 8 + React + Tailwind v4, Vitest config
├── .github/workflows/ci.yml   # Lint, typecheck, tests, build, size, e2e on every push/PR
├── docs/                      # Architecture, safety & privacy, roadmap (production plan)
├── e2e/                       # Playwright smoke + accessibility (axe) tests
└── src/
    ├── app/                   # main.tsx, App.tsx (routes; one lazy chunk per app)
    ├── shell/                 # Header, mobile bottom tabs, "View as" switcher, toasts
    ├── features/
    │   ├── forum/             # Freedom Wall, post ideas, tech tasks, review queue, badges
    │   ├── daily-word/        # Flashcards, streaks, discipler dashboard, Sunday Cards
    │   ├── prayer/            # Request form, prayer wall, leader view, cap & waitlist
    │   ├── outreach/          # Directory, partner requests, claims & verification
    │   └── me/                # Profile, settings, about
    │       (each app has pages/, components/ and model/ = seed data + pure logic + tests)
    ├── shared/
    │   ├── store/demo.ts      # The one demo store (Zustand, saved to localStorage)
    │   ├── demo/              # Demo users & roles, KJV verse list
    │   ├── ui/                # Shared UI pieces and class recipes
    │   └── lib/               # Dates, theme
    └── styles/index.css       # Light "Warm Editorial" + dark "Deep Sanctuary" tokens
```

**How it fits together:** every app reads and writes one store in `src/shared/store/demo.ts`. The
store is saved to localStorage, so the demo survives a refresh; **Reset demo data** reloads the
seed. Business rules (streaks, prayer cap and waitlist, badges, sermon-to-cards, "gone quiet") are
plain functions in each app's `model/` folder with unit tests, so they can move to a real backend
later without changing. Sample dates are relative to today, so streaks and "3+ days" flags always
look current.

**Theming:** `src/styles/index.css` defines CSS variables (`--canvas`, `--card`, `--fg`, …) for the
light theme and `[data-theme="dark"]`. Tailwind reads them through `@theme`. The choice is saved in
localStorage (`parable-theme`).

**Stack:** React 19, TypeScript (strict), Vite 8, Tailwind v4, React Router, Zustand,
html-to-image (PNG export), lucide-react icons. Tests: Vitest + Testing Library, Playwright + axe.

## 4. Live Demo & Cheat Sheet

Use the **View as** switch (top right) to change who you are. Each role sees different screens;
sections only some roles can use are tagged (Leader, Media, Admin, Mod).

| Role               | Person      | What to show                                                                                |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------- |
| Youth / Member     | Jessa       | Ask anonymously, post ideas, claim a tech task, read today's verse, submit a prayer request |
| Discipler / Leader | Ate Rina    | Reply to a question (marks it answered), Discipler dashboard, Prayer leader view            |
| Media Volunteer    | Kuya Migs   | Sunday Message to Cards: generate cards, export a PNG                                       |
| Church Admin       | Ptr. Daniel | Confirm tech tasks (awards badges), post a task, Partner inbox                              |
| Moderator          | Paolo       | Forum review queue, verify church claims                                                    |

**Search cheat sheet** (Freedom Wall search box and Ask Bark):

| Type this  | You'll find                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `finances` | Tuition and family finances question + "Budget Is Tight" article            |
| `worship`  | "My worship feels empty lately" + "Worship Is Not a Performance" reel       |
| `friends`  | Barkada question + "Finding Real Friends" podcast                           |
| `doubt`    | All 3 Doubt questions + "Honest Doubt Is Not the Opposite of Faith" article |

**5-minute pitch flow** (covers all seven problems):

1. **Forum (Jessa):** search `finances`, open a question, then **+ Ask / Post** a question
   anonymously. Open **Post ideas** and copy a caption.
2. **Badges:** in **Tech tasks → My tasks**, mark "Instagram story templates" done. Switch to
   **Ptr. Daniel → All → Confirm completed**: Jessa earns the **Designer** badge.
3. **Daily Word (Jessa):** tap **I read today's verse**: the streak goes from 9 to 10. Switch to
   **Ate Rina → Discipler dashboard** and nudge someone who has gone quiet.
4. **Sunday Cards (Kuya Migs):** **Generate cards** from the sample sermon, change the style, and
   **Export PNG**.
5. **Prayer (Jessa):** submit a request: Calamba Youth is full, so it joins the waitlist. Switch to
   **Ate Rina → Leader view**, check in on an overdue request, then mark one answered: the next
   request moves up.
6. **Outreach:** filter by town and open a church. As **Ptr. Daniel**, accept a request in the
   **Partner inbox**. As **Jessa**, claim _Hope Chapel San Pedro_; as **Paolo**, approve it in
   **Verify claims**.

## 5. Scripts & Quality Checks

| Command           | What it does                                                                     |
| ----------------- | -------------------------------------------------------------------------------- |
| `npm run dev`     | Start the dev server                                                             |
| `npm run build`   | Production build to `dist/`                                                      |
| `npm run preview` | Serve the production build                                                       |
| `npm run check`   | Lint, format check, typecheck, unit tests, build, bundle size                    |
| `npm test`        | Unit and component tests (Vitest); `npm run test:watch` to watch                 |
| `npm run e2e`     | End-to-end + accessibility tests (first time: `npx playwright install chromium`) |
| `npm run format`  | Format everything with Prettier                                                  |

Run `npm run check` before pushing. GitHub Actions runs the same checks plus the e2e tests on
every push and pull request.

## 6. Demo Notes & Next Steps

- **"Generated" content is rule-based, not AI.** Sunday Cards and post ideas use an offline demo
  generator (labelled "Demo generator" in the app), so the demo never depends on Wi-Fi or an API
  key. The planned version runs AI on a server, never in the browser.
- **Bible verses are KJV** (public domain). Other translations (including Tagalog) need a verified,
  licensed text.
- **Notifications are shown in the app, not sent.** Nudges and check-in reminders are logged on
  screen; the real app would send push notifications.
- **Production plan:** Supabase (database, login, row-level security), real moderation and crisis
  handling, and Philippine Data Privacy Act (RA 10173) compliance are planned in
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/SAFETY_AND_PRIVACY.md](docs/SAFETY_AND_PRIVACY.md)
  and [docs/ROADMAP.md](docs/ROADMAP.md).
- Contributor rules (including for AI coding assistants) are in [CLAUDE.md](CLAUDE.md).
