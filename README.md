# Parable

A youth faith-community sanctuary: anonymous Q&A (Freedom Wall), curated media, and an assistive topic router. Built as a pitch-ready MVP.

## 1. Quick Start

```bash
npm install
cp .env.example .env   # optional: the demo runs fully on seed data
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## 2. Architecture Summary

```
parable/
├── index.html
├── tailwind.config.js        # Deep Sanctuary colors, Lora/Inter fonts
├── .env.example
└── src/
    ├── main.jsx
    ├── index.css             # Google Fonts import + Tailwind
    ├── App.jsx               # State: items, filter, search, modals, toast
    ├── data/seedData.js      # 4 questions + 4 media items + AI takeaways
    ├── utils/search.js       # Keyword + synonym matching, FAQ labels
    └── components/
        ├── Navbar.jsx            # Glass header, module switcher, search, Ask / Post
        ├── MasonryFeed.jsx       # Round-robin 1/2/3 flex columns
        ├── QuestionCard.jsx      # Typographic card + AI pill
        ├── MediaCard.jsx         # Cover card, badge, hover Share
        ├── ReaderModal.jsx       # Substack-style reader, replies, Continue Exploring
        ├── ComposerModal.jsx     # Publish new question with auto AI takeaway
        ├── DogRouterWidget.jsx   # "Ask Bark" assistive router
        └── FeaturePlaceholder.jsx# Shared "coming soon" for Mentorship & Outreach
```

**Feature 1 (Sanctuary)** is fully wired: `App.jsx` owns all state and passes handlers down. Filters and search produce `visible`, which `MasonryFeed` splits across columns. Clicking a card sets `openId`, which opens `ReaderModal`. The composer prepends a new post with a topic-matched AI takeaway. The Bark router filters the feed or opens threads directly.

**Features 2 & 3 (Mentorship, Outreach)** both render the single `FeaturePlaceholder` component, chosen by the module switcher in the header.

**Theming:** `src/index.css` defines CSS custom properties (`--canvas`, `--card`, `--fg`, `--sage`, ...). `:root` holds the light "Warm Editorial" palette (default); `[data-theme="dark"]` holds "Deep Sanctuary". Tailwind colors in `tailwind.config.js` read these variables. `src/utils/theme.js` stores the choice in `localStorage` (`parable-theme`), and a small script in `index.html` applies it before first paint.

## 3. Live Demo & Query Cheat Sheet

Type these into the **Top Search Bar** (filters the grid live) and into **Ask Bark** (suggests FAQs and threads). Synonyms are expanded in `src/utils/search.js`.

| Keyword | Matching feed items | Bark FAQ pill | Bark thread |
|---|---|---|---|
| `finances` | Q: "How do I stop panicking about tuition and family finances?", Article: "Trusting God When the Budget Is Tight" | How do I handle money stress? | Tuition and family finances (Santa Rosa) |
| `worship` | Q: "My worship feels empty lately...", Reel: "Worship Is Not a Performance" | What if worship feels empty? | Worship feels empty (San Pedro) |
| `friends` | Q: "My barkada stopped inviting me...", Podcast: "Finding Real Friends in a Lonely Season" | How do I keep friends and my faith? | Barkada thread (Calamba) |
| `doubt` | Q: "Why does God feel silent...", Article: "Honest Doubt Is Not the Opposite of Faith" | Is it okay to doubt God? | God feels silent (Cabuyao) |
| `anxious` | Same results as `finances` (matches the Anxiety topic) | How do I handle money stress? | Tuition and family finances |

Pitch flow: search `finances` → clear → open Ask Bark, type `worship` → click the thread → reply in the Reader → click **+ Ask / Post** and publish a new question.

## 4. Supabase Integration Notes

- **Data:** replace the `initialItems` import in `src/App.jsx` with a `useEffect` that loads from Supabase (`supabase.from('posts').select('*, comments(*)')` and `supabase.from('media').select('*')`). Keep the same field names as `seedData.js`.
- **Writes:** in `App.jsx`, `publish`, `addReply`, and `toggleHelpful` currently update local state. Make each insert/update into Supabase first, then update state.
- **Search:** swap `matches()` in `src/utils/search.js` for Postgres full-text search (`textSearch`) or a `pg_trgm` index. Keep the synonym map as a query-expansion step.
- **AI takeaways:** `AI_TAKEAWAYS` in `seedData.js` simulates the output. Replace with a call to Gemini (`VITE_GEMINI_API_KEY`, ideally via a Supabase Edge Function so the key stays server-side), passing the post title, body, and topic, and storing the returned `{ verse, takeaway }` on the post row.
- **Auth:** replace the hard-coded "Kiko Mendoza" in `Navbar.jsx` and `App.jsx` with `supabase.auth.getUser()`.
