> **⚠️ HISTORICAL — not current state.** Last updated 2026-07-29, at commit
> `5c15968`. The repo has moved on substantially since (season detail pages
> for all 13 seasons, position-weighted awards, Hall of Fame + Records
> datasets, playoff weather). **`AGENT_HANDOFF.md` is the authoritative
> current-state doc — read that first.** Keep this one for *why* a component
> ended up the way it did, not for *what exists today*.

# Session Handoff — LMFL_Dashboard

Last updated: **2026-07-29**. Covers the landing-page redesign + power-rankings session. Supersedes the previous handoff (the original data-wiring session); the still-relevant parts of that one are folded in below under *Older context that still matters*.

There's also a repo-root `HANDOFF.md` — that's a **different document** (data-pipeline / scraping recipe), unrelated to this one.

## Current state

The app is **live and deployed**: https://orchands.github.io/last-minute-league/

- Repo `orcHands/last-minute-league`, **public**, `LMFL_Dashboard/` is the git root. Branch `main`.
- Push to `main` → GitHub Actions builds with `VITE_BASE_PATH=/last-minute-league/` → Pages. **A push updates the live site.** Always `npm run build` first; a red build leaves a broken public site.
- Last commit: `5c15968` "Redesign landing page, add power rankings, merge Records section". Working tree clean, in sync with origin.

## What this session did

### 1. Landing page rebuilt against a Figma comp
Hoss supplied a comp (Figma MCP couldn't read the file — access error; they pasted a screenshot instead, which worked fine). Three judgment calls were confirmed with them before building:
- **The comp's white background was a Carbon-token artifact, not a light-mode request.** Everything stays dark `#161616`. If a future comp looks light, ask before converting.
- The giant `LMFL` wordmark is a **deliberate ghosted watermark** (`#303030` on `#161616`, `aria-hidden`, decorative). The dedication text next to it was raised to `#f4f4f4` to clear WCAG AA — the comp had it at ~2:1, which was not intentional.
- Nav was relabelled/reordered **and** Post-season + Leaderboards merged (see §3).

New landing structure, top to bottom: hero → stat bar → all-time standings → H2H matrix → power rankings → skill matrix → section nav → asterisk note.

### 2. New components
- **`StatBar.tsx`** — 7 tiles with a Carbon rainbow of top rules: seasons 13, franchises 15, managers 23, games played 1,217, points scored 275,661.56, players rostered 957, Fast & Furious films 11. All derived from real data **except the film count, which is hardcoded lore** (commented as such).
- **`AllTimeStandingsTable.tsx`** — replaced the champions roll. Sortable, tabbed franchise (15) / manager (23), with W–L–T, avg PF and PA per game (avg is the primary line, total is the sub-line, and sorting is by **average**), PF−PA delta, playoff apps, division titles, rings. Large logo per row with monogram fallback.
- **`PowerRankingChart.tsx`** — replaced the Monday Night Miracle teaser. Cumulative **all-play win rate** per franchise across all **208 weeks** of league history, rank 1 on top. Legend split active/retired; hovering a chip highlights its ribbon.
- **`ManagerSkillMatrix.tsx`** — scatter of lineup-setting skill (x: league-avg regret − own avg regret) vs roster ceiling (y: avg optimal pts/wk). Managers plotted as their small logo in a colored ring.

### 3. Records merge (IA change)
`/postseason` and `/leaderboards` are gone from the nav and merged into **`/records`**, an 8-item sidebar page (Post-season & Bowls first, then the 7 existing boards).

**Important structural consequence:** `Postseason.tsx` and `Leaderboards.tsx` are now **content modules, not pages**. They export board components (`PhaseBoard`, `BenchBoard`, `MondayNightMiracleBoard`, etc.) that `Records.tsx` composes. Neither has page chrome any more, and neither has a default page export in the old sense (`Postseason.tsx`'s default is now `PostseasonBoard`, a content-only component). Don't "restore" their headers.

Old routes redirect: `/postseason` and `/leaderboards` → `/records`, so shared links keep working.

Nav is now: LMFL · Franchises · Seasons · Players · Records · About.

### 4. Data layer
- `careerRecords.ts` now tracks **ties, points against, and playoff appearances** (`playoffs` flag on each standings row) alongside W/L/PF.
- `honorsHelpers.ts` gained `buildDivisionTitleCounts()`.
- `managers.ts` — `Manager` and `Franchise` both gained `avgPF`, `avgPA`, `playoffAppearances`, `divisionTitles`, and ties on the record.
- **New `powerRankings.ts`** — the all-play computation. Three subtleties worth preserving:
  - A franchise's ribbon starts at its **actual founding week** (Zac's starts 2017, not 2013).
  - It **carries its cumulative record forward through playoff-bracket bye weeks**, so ribbons don't gap out over the last 2–3 weeks of a season.
  - It **ends** at the last week of a retired franchise's final season (Dave Lang 2014; Kyle and Kelly Brown 2018). Verified by measuring the rendered SVG path bounding boxes.
- **New `managerSkillMatrix.ts`** — derives both axes from `bench_regret.json`'s per-team-week actual/optimal/regret.
- `leagueStats.ts` gained `gamesPlayed`, `pointsScored`, `playersRostered`.

**Number provenance** (all verified against source data before use — the comp's figures matched exactly):
- `gamesPlayed` 1,217 = count of matchups (**not** team-games, which would be 2,434).
- `pointsScored` 275,661.56 = sum of **both sides of every matchup**. Note this differs from summing `standings[].pf` (235,012.74) because standings PF excludes playoff games. Use the matchup sum.
- `playersRostered` 957 = non-DEF entries in `player_positions.json` (989 total − 32 DEF units). **`player_positions.json` (22KB) was copied into the app specifically to avoid bundling `boxscores.json` (2.6MB) for one number.**

### 5. Bug fixed in passing
`AllTimeStandingsTable` replaced the old landing standings, which had silently filtered out any manager with **<20 career games** — Laskey (13), Aboubacar (14) and Alex (14) were missing, so the page showed 20 of 23 managers. Filter removed; all 23 now appear. (`ALL_TIME_STANDINGS` in `leagueStats.ts` still has that 20-game filter and still feeds the Franchises page — left alone deliberately, but be aware it exists.)

### 6. Full names scrubbed from the public bundle (privacy)
Everything under `src/data/` is bundled into the JS served from GitHub Pages, so
raw pipeline values are publicly readable via view-source even when the UI never
renders them. Hoss asked for three managers' full names to be removed.

- **`scripts/sync_app_data.py`** (workspace root, *outside this repo* — it reads
  `data/processed/`, which also lives outside the repo) copies source JSON into
  `src/data/processed/` while rewriting `David Laskey`→`Laskey`,
  `Dylan Snyder`→`Dylan`, `Dave Lang`→`Lang`. 509 occurrences across 12 files.
  It ends with a leak check that exits non-zero if anything slipped through.
- **Use that script, never a plain `cp`**, when adding or refreshing app data.
- Full-name keys were removed from `ALIASES` in `managerCanon.ts` too — a string
  literal there ships exactly as publicly as one in JSON. The matching
  `fullName` fields were blanked to the short names.
- If you hand-copy a file and see `[managerCanon] unknown manager alias: "Dave Lang"`
  in the console, that's this invariant catching you. Re-run the script.
- Two occurrences were only caught by the leak check because they sit mid-sentence
  in free-text `note` fields (`"Sara inherits David Laskey's 2014 team"`,
  `"four Kyle/Dylan Snyder swaps"`), not as quoted data values. Scrubbing is a
  plain substring replace for that reason.

**Still exposed, deliberately not scrubbed** (Hoss was told): `Kelly Brown`
(~185 occurrences in data), `Jayson Margalus` (Jay's `fullName`), and
`Brice Marino` (the dedication line, added on request). Adding any of them is a
new `NAME_SCRUB` entry plus the matching `ALIASES` edit, then re-run the script.
The site does send `<meta name="robots" content="noindex, nofollow">`, so it
shouldn't surface in search — but it is still reachable by URL.

### 7. Power-ranking ribbons are per-manager gradients
Each franchise ribbon now runs through the colours of every manager who owned it,
in order, instead of a single current-owner colour.

- `powerRankings.ts` exports `ManagerSegment[]` per franchise. Segments **tile**
  the franchise's span (each runs until the next begins) so the gradient has no
  undefined gaps, and consecutive stints by the same manager are merged —
  `kelly-brown` has two back-to-back stints in the data and correctly collapses
  to one segment, which is why there are 4 multi-manager gradients, not 5.
- `startFraction`/`endFraction` are in **objectBoundingBox units**, which works
  because a ribbon's bounding box is exactly its own tenure — so the fractions
  drop straight into `<linearGradient>` stops with no pixel math.
- Handovers get a ~2% blend band (clamped to 40% of a short tenure, since
  Aboubacar's is only ~8% of the span) so a change reads as a transition.
- The legend swatch mirrors the ribbon; the tooltip names the manager for the
  hovered week.

### 8. Site title and favicon
- `.figma/make/site.json` now sets `title` ("Last Minute Football League"),
  a real `description`, and `icons.icon`. **Vite reads this file at server start**,
  so a title change needs a dev-server restart, not just a reload.
- `public/favicon.svg` — hand-authored football. The favicon href is the
  *relative* `favicon.svg` on purpose: it resolves correctly both at `/` in dev
  and under `/last-minute-league/` on Pages. An absolute `/favicon.svg` would
  404 in production.

## Known open items / gotchas

- **`StatTile.tsx` is now orphaned.** Its last consumer was the "League at a glance" block that `StatBar` replaced. Safe to delete, or repurpose — left in place rather than deleting something Hoss might want.
- **`/franchises/:id` route still doesn't exist.** `ManagerCard.tsx` links to it; `App.tsx` only has `/franchises`. Pre-existing gap from the original Figma Make output — clicking a manager card still does nothing. Probably the highest-value small fix available.
- **`team_names.json` still not exported** — `teamName` is still `placeholderTeamName()` (the manager's short name). Same for franchise nicknames, which fall back to `franchises.json`'s `label`. Everything reads through `managerCanon.ts`, so swapping it in should be a one-file change.
- **The dedication pill is fully rounded**, which breaks the "square corners, radius 0" rule. Deliberate, per the comp, confirmed with Hoss. Don't "fix" it.
- **The repo is public** and now includes Brice Marino's photo plus all 23 real member names. Hoss was told and is fine with it — but keep it in mind before adding anything more personal.
- **`PHASE_SPLITS` "avg" columns are an approximation** — `pts_vs_mean` is relative to each phase's own weekly mean, which isn't available in isolation, so the code adds it to a single league-wide average. Flagged in `boards.ts`.
- **`FandomEntry.claimedTeam`** is a hardcoded list of 9 managers in `boards.ts` (`CLAIMED_TEAMS`) — curated canon from the original mock, not derived, not independently verified.
- **`scripts/sync_app_data.py` is not in this repo.** It lives at the workspace
  root alongside `data/processed/`, both of which sit outside the git root. A
  fresh clone won't have either — you'd need the data workspace to refresh app
  data at all. Same is true of the root `CLAUDE.md`.
- **The Browser-pane preview gets stuck after programmatic scrolling** — screenshots
  come back solid black even though the DOM is fine. A fresh `navigate` clears it.
  When that fails, verifying via `javascript_tool` (computed styles, SVG attributes,
  bounding boxes) is more reliable than fighting the screenshotter, and is how the
  gradient stops and ribbon end-points were actually checked.
- **No automated tests.** Verification is `npx tsc --noEmit` + `npm run build` + manual browser checks.
- **Bundle is ~2.16MB** (422KB gzipped) and Vite warns about it. Fine for now; if it grows, the JSON imports are the thing to code-split, and `boxscores.json` should probably never be imported directly.

## Working-with-Hoss notes

- Hoss is learning to code — explain what changed and why, keep diffs legible.
- **Verify numbers against the source data before building UI on them.** Every figure in the comp turned out to be correct, but that was worth confirming rather than assuming, and it caught the PF-vs-matchup-sum distinction.
- **Ask before big structural calls** (theme scope, nav/routing changes, anything that touches pages below the one being edited). The three questions asked this session all changed the implementation materially.
- Hoss pastes screenshots when a tool can't reach something — that works well; don't stall on the tool.
- Preview tooling: another chat's dev server may already hold port 5173. The root `.claude/launch.json` has `autoPort: true` so a second server gets a free port. **Console errors can be stale HMR artifacts from mid-edit saves** — confirm in a fresh tab before chasing them.

## Older context that still matters

- **`managerCanon.ts` is the identity layer.** If you see `[managerCanon] unknown manager alias: "X"` in the console, add `X` to `ALIASES`.
- **Colors are real canon** (Hoss's card sheet): `primary` = light swatch (the one rendered everywhere), `secondary` = dark, `tertiary` = accent. Verify color work with `getComputedStyle`, not screenshot thumbnails — small-scale renders lie.
- **Dave Lang's short display name is "Lang", not "Dave"** — deliberate, to avoid collision with David Laskey. `fullName` is still "Dave Lang".
- Real data has overridden mock facts in several places and **that's expected, not a bug**: Kyle is a real 23rd manager; 2013 champion is Carter (not Jay); best lineup-setter is David Laskey; smallest margin ever is a genuine 0.00 tie (pb vs Brice, 2014 wk11); the MNF miracle is whitaker vs pb (2018 wk8).
- `LMFL_Logo_transparent.png` is a chroma-keyed version of the original (which has an opaque white background). Nav points at the transparent one.

## How to run

```bash
cd LMFL_Dashboard
npm install
npm run dev        # Vite dev server
npx tsc --noEmit   # typecheck — must be clean
npm run build      # must pass before pushing; a push deploys to the live site
```

## Suggested next moves

1. Add the `/franchises/:id` detail route — the one obviously broken link in the app.
2. Start the records backlog (SITEMAP §6): single-game / weekly / season records, All-Pro team, trophy cabinets. Most of these need `boxscores.json`, `drafts.json` or `all_division.json` copied into `src/data/processed/` first — weigh the bundle cost on boxscores.
3. Delete or repurpose the orphaned `StatTile.tsx`.
