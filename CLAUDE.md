# LMFL_Dashboard

The Last Minute Football League site. This directory is the git root; the repo is
`orcHands/last-minute-league` (public), deployed to
https://orchands.github.io/last-minute-league/

## Start here
- **`SESSION_HANDOFF.md`** (this directory, in the repo) — what the last session changed, known gaps, gotchas.
- **`../CLAUDE.md`** — league canon, data dictionary, design system, architecture rules. The authoritative orientation doc. **Note:** it lives in Hoss's local workspace one level up, *outside* this repo, so it is not in a fresh clone. If you're working from a clone alone, `SESSION_HANDOFF.md` is your only orientation.

## Stack facts that differ from the original Figma Make scaffold
This project started as a Figma Make export and has since moved out of it. `AGENTS.md`
is leftover scaffold documentation and is **out of date** — specifically:

- **There is no always-running dev server.** Start it yourself with `npm run dev`
  (Vite picks the port; another session may already hold 5173).
- **Styling is inline style objects, not Tailwind.** Tailwind v4 is still installed
  but effectively unused — match the surrounding inline-style code, don't introduce
  utility classes.

## Commands
```bash
npm install
npm run dev        # Vite dev server
npx tsc --noEmit   # typecheck — must be clean
npm run build      # must pass before pushing; pushing to main deploys the live site
```
