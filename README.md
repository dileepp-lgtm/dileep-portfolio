# Dileep P — Portfolio (React)

A React + Vite port of the static site in `../portfolio/`.
**The HTML version is untouched and still works on its own** — this is a parallel
copy you can develop and deploy independently.

## Run it

```bash
cd portfolio-react
npm install     # first time only
npm run dev     # http://localhost:5173
npm run build   # production build → dist/
npm run preview # preview the build
```

Only four packages: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`.

## Where things live

```
src/
  data/
    work.js      ← the whole gallery: 9 sections, 30 cards, 30 decks (168 pages),
                   7 videos, 12 agency links. Auto-extracted from the HTML build.
    site.jsx     ← bio, stats, experience, expertise, process, tools, contact
    agentKb.js   ← the assistant's answers (same file as the HTML build)
  components/    ← one component per section
  effects/       ← CursorGrid, BorderGlow, SplashCursor (the same vanilla modules,
                   imported for their side effects and mounted from App.jsx)
  hooks/         ← theme, reveal-on-scroll, sticky-nav state
  styles/global.css  ← the original stylesheet, url() paths rewritten to /assets/
public/assets/   ← images, video, resume PDF (copied from the HTML build)
```

### Adding work
Edit `src/data/work.js` — add the image paths to `DECKS`, a label to `DECK_NAMES`,
and a card entry in the matching section. No component changes needed.

## Notes

- **Everything from the HTML build is ported**: gallery filtering, the full-screen
  deck viewer (page counter, progress bar, keyboard nav, focus trap), reveal
  animations, counters, dark mode, the hero cursor grid, card border-glow, the
  fluid cursor, and the CV assistant.
- **The assistant** answers locally from `agentKb.js` with no API key. To switch on
  real LLM answers, deploy `api/chat.js` and set `VITE_AGENT_ENDPOINT` in a
  `.env` file — see `AI-AGENT-SETUP.md`. Never put a key in `src/`.
- **Safe to delete**: `public/assets/js/` and `public/assets/css/` were copied over
  but aren't used by the React app (it imports `src/effects/*` and
  `src/styles/global.css`). Removing them saves ~200 KB in `dist/`. I couldn't
  delete them from here — permissions on the mounted folder.
- `src/data/site.js` and `src/data/agent-kb.raw.js` are one-line aliases kept only
  so extension-less imports resolve; the real files are `site.jsx` / `agentKb.js`.

## Deploy

```bash
npm run build
```
Then upload `dist/`, or connect the repo to Vercel/Netlify (build `npm run build`,
output `dist`). `vite.config.js` sets `base: '/'`, so serve it from a domain root.
