# AGENTS.md

## Cursor Cloud specific instructions

This is a **Spelling Trainer** PWA — a purely client-side Vite + React + TypeScript app with no backend or database.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves at `localhost:5173`) |
| Lint | `npm run lint` |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- There are no automated tests configured yet (no test framework or test scripts in `package.json`).
- The app uses `window.speechSynthesis` for TTS — this requires a browser environment and may not produce audio in headless/VM contexts, but the UI still functions correctly.
- The `vite.config.ts` sets `base` to `/spelling_bee/` in production mode; in dev mode it defaults to `/`. No special env vars are needed for local development.
- Word data lives in `public/data/wordlists.json` (static JSON, no API calls).
- Progress is persisted in browser `localStorage`.
