# LMFL Dashboard — start here

**Read `AGENT_HANDOFF.md` next.** It is the single authoritative document:
data inventory, remaining page specs, design tokens, constraints, pre-push
checklist. Everything else in this repo is history or detail.

## Stack facts — get these wrong and the work looks foreign

- **React 19 + Vite 8 + TypeScript.** `react-router-dom` with **HashRouter**
  (required for GitHub Pages).
- **Styling is inline `style={{}}` objects. NOT Tailwind.** Tailwind v4 is
  still in `package.json` but is effectively unused. Do not add utility
  classes, and do not add a CSS-in-JS library.
- **There is no always-running dev server.** Start it yourself with
  `npm run dev`.
- **Design system is IBM Carbon v11, dark Gray 100.** Type scale for new work
  is 12/14/16/20/28/32 — never add a 10, 11 or 13. (~80 legacy off-scale sites
  still exist; see `AGENT_HANDOFF.md` §7.1 before you "helpfully" fix them.)
  IBM Plex Sans for copy, IBM Plex Mono for every number. Full tokens in
  `AGENT_HANDOFF.md` §7.
- **You may not be the only agent in this repo.** `git pull --rebase` before
  you start, stay inside your assigned page, never force-push. See
  `AGENT_HANDOFF.md` — "More than one agent is working in this repo".

> This file was originally a Figma Make export scaffold and described a
> Tailwind app with a hosted dev server. None of that was ever true of this
> project after it left Figma Make. It has been replaced.

## Commands

```bash
npm install
npm run dev                                          # Vite dev server
npx tsc --noEmit                                     # must be clean
VITE_BASE_PATH=/last-minute-league/ npm run build    # must pass before pushing
```

**A push to `main` deploys the live site**
(https://orchands.github.io/last-minute-league/). A red build leaves a broken
public site. Always typecheck and build first.

## Map of the docs

| File | What it is |
|---|---|
| `AGENT_HANDOFF.md` | **Authoritative.** Current state + remaining scope. |
| `CLAUDE.md` *(project root, outside the repo)* | League canon, data dictionary, architecture rules. Not in a fresh clone. |
| `SESSION_HANDOFF.md` | **History**, last updated 2026-07-29. Useful for *why* a component looks the way it does. Do not treat as current state. |
| `src/imports/FIGMA_MAKE_BRIEF.md` | Original design-system brief. |
