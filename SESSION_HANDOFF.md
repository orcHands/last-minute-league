# Session Handoff — LMFL_Dashboard data wiring

**Not a git repo** (checked at session start — no `.git`). There is no commit history to diff against; this doc plus the file tree *is* the record of what changed. If you set up git later, consider an initial commit before making further changes so you have a real baseline.

There's already a repo-root `HANDOFF.md` (data-pipeline recipe, scraping gotchas) — that's a **different document**, unrelated to this one. This file only covers the dashboard app build session.

## What this session did

Started from a Figma Make export where `src/data/league.ts` was **100% hand-authored mock data** (fake managers, fake stats, fake team names). Ended with the dashboard wired entirely to the real `data/processed/*.json` files, plus several rounds of bug fixes and feature additions driven by user review of the live app.

### 1. Core data wiring
- Copied `data/processed/*.json` → `src/data/processed/` (league, honors, franchises, franchise_records, gate_timelines, manager_phase_splits, bench_regret, enemies_analysis, nflteam_analysis, aggregations, bowl_mvps, college_analysis).
- Built `src/data/managerCanon.ts`: the 23-manager identity layer. `ALIASES` maps every raw name string seen across the JSON files (`"Dave Lang"`, `"whitaker"`, `"Kelly Brown"`, etc.) to one canonical id. **If you ever see a console warning `[managerCanon] unknown manager alias: "X"`, add it here.**
- Built `src/data/build/*.ts` — one module per data domain, all pure transforms over the copied JSON:
  - `careerRecords.ts` — per-manager career W/L/PF aggregated from `league.json` standings; also `leagueAvgPtsPerWeek()`.
  - `honorsHelpers.ts` — season-level honors lookups (championship counts, per-season podium/bowls).
  - `managers.ts` — builds `MANAGERS[]` and `FRANCHISES[]`.
  - `seasons.ts` — builds `SEASONS[]` from `honors.json` (champion, runner-up, third, consolation, Letty, **plus real per-season team names** — see below).
  - `mnm.ts` — builds `MONDAY_NIGHT_MIRACLES[]` from `gate_timelines.json`, joining `mnf_comebacks` against the matching `timelines` entry by (season, week, manager pair) to build the gate-by-gate chart data.
  - `boards.ts` — `PHASE_SPLITS`, `BENCH_REGRET`, `NEMESIS_DATA`, `FANDOM_DATA`.
  - `leagueStats.ts` — `ALL_TIME_STANDINGS`, `LEAGUE_STATS` (all-time records, defense records, etc.)
  - `nflTeamColors.ts` — NFL team → hex color lookup (for Fandom board swatches).
  - `headToHead.ts` — new: all-pairs manager W-L-T, computed by replaying every `league.json` matchup.
- `src/data/league.ts` is now just a **barrel re-export** with the exact same public API the mock had (`MANAGERS`, `getManager`, `SEASONS`, `MONDAY_NIGHT_MIRACLES`, etc.), so most page/component code needed zero changes.
- `Players.tsx` and `Leaderboards.tsx` (RecruitingBoard, DefensesBoard) had their own hardcoded arrays *outside* `league.ts` — those were rewired separately, directly against `aggregations.json` / `bowl_mvps.json` / `college_analysis.json` / `enemies_analysis.json`.

### 2. Real data overrode the mock in several places — this is expected, not a bug
The mock's specific facts were often wrong; real data wins per explicit user decision. Confirmed corrections already baked in:
- **Kyle** is a real 23rd manager, missing from the mock entirely (retired, no large logo, small logo only).
- **2013 champion is Carter**, not Jay.
- **Best lineup setter is David Laskey** (10.4 avg regret/wk), not Kelly.
- **Brice's real top-rostered NFL team is the Dolphins** (matches his claimed fandom → "confirmed", not the mock's "partial/Packers").
- Real MNF-miracle nemesis is **whitaker vs. pb** (2018 wk8), not whitaker vs. zac as the mock claimed.
- There's a genuine **exact-tie game** (pb vs. Brice, 2014 wk11, 108.18–108.18) — real "smallest margin ever" is 0.00, better than the mock's fabricated 0.04.
- **Divisions are reshuffled every season** — NOT a stable per-manager fact like the mock implied. The one documented exception: **Brice is always Brian O'Conner Memorial**. `Manager.division` is now `'oconner'` for Brice only, `null` for everyone else (see `managers.ts`). Don't try to "fix" this back to a computed-per-manager field — it was computed wrong before (from "most recent season", which is meaningless since it's random) and the user corrected it directly.

### 3. Bugs fixed that were pre-existing in the Figma Make output (not introduced this session)
- Unused imports (`Badge`, `MANAGERS`, `Cell`, `ReferenceLine`, `LEAGUE_AVG`) tripping `noUnusedLocals`.
- A literal duplicate `borderTop` key in `ManagerCard.tsx`'s style object.
- A duplicate React key (`'vs Avg'` used 3× as a `key` prop) in `Leaderboards.tsx`'s PhaseBoard table header — caused a real console error.
- Recharts v3 `Tooltip` `formatter` type mismatch (value can be `undefined` per the newer types) in both `MatchupCard.tsx` and `Leaderboards.tsx`.

### 4. Images (user added `public/images/` mid-session)
- Manager large/small logos: needed **zero code changes** — `managerCanon.ts`'s logo path mapping was already correct, just needed the files to exist.
- Bowl logos: `Postseason.tsx` had dead `logoPath` stubs pointing at **wrong folder names** (e.g. `TeremanaBowl_Logos` vs. the real `TeremanaTequilaBowl_logos`). Fixed, and added a `BowlLogo` component (image + emoji-trophy fallback on error) wired into both the 4 bowl overview cards and every row of the Teremana history table.
- Added shared `src/components/AssetImage.tsx` (generic image-with-fallback) — used for division logos in `ManagerCard.tsx`, the Letty Award trophy in `Seasons.tsx`, and the manager avatars in the new H2H matrix.
- `public/images/LMFL_Logo.png` (the nav wordmark) has an **opaque white background** — no ImageMagick on this machine, so Pillow was pip-installed and used to chroma-key white → transparent and crop to content bbox, saved as `public/images/LMFL_Logo_transparent.png` (original left untouched). `Nav.tsx` points at the transparent version.

### 5. Real per-season team names
Added `championTeam` / `runnerUpTeam` / `thirdPlaceTeam` / `consolationTeam` / `pointsLeaderTeam` to the `Season` interface (`seasons.ts`), sourced from the `"team"` field already present in `honors.json`'s podium/third_place_game/consolation_winner/points_leader entries. Wired into the grey sub-labels in Landing's Champions Roll, Seasons.tsx (grid + detail), and Postseason.tsx's history table — these used to just repeat the manager's name; now they show the actual fantasy team name for that specific year (e.g. Carter's 2013 team was "Ice Kingdom Gunters").

### 6. Polish requested via live review
- Champions Roll: asterisk pills killed entirely (footer note already explains 2013/2020); generic 🏆 emoji replaced with the real per-season Teremana Bowl logo, enlarged to 56px.
- Removed the "Kelce started pts" stat tile (unexplained/unnecessary per user).
- "League at a Glance" trimmed from 7 tiles to 4 — dropped Seasons/Owners/Active-Franchises since those are already stated in the hero eyebrow line right above.
- New **head-to-head matrix** (`src/components/H2HMatrix.tsx` + `src/data/build/headToHead.ts`): 23×23 grid under Champions Roll, sticky row/column headers with manager logos, green border = row-manager leads the series, red = trails, genuinely blank cells for pairs who never met (different eras, e.g. Jay vs. Kevin).

## Known open items / not done

- **Colors are now real canon** (update, post-handoff-draft): Hoss supplied a manager-card sheet (23 managers, light/dark/accent swatches per card, listed top-to-bottom as light/dark/accent) and it's wired in — `managerCanon.ts`'s `MANAGER_COLORS` (was `PLACEHOLDER_COLORS`, HSL-generated). Final mapping (after a correction — it was accent/dark/light at first): `primary` = **light** (the top-listed swatch — the one actually rendered everywhere: card borders, chart lines, H2H matrix), `secondary` = dark, `tertiary` = accent. Verified all 23 render correctly via computed-style check in the browser (don't trust a screenshot thumbnail for color-accuracy checks — colors can look wrong at small scale even when correct; `getComputedStyle` is the reliable check). **`team_names.json` is still NOT exported** — `teamName` is still just the manager's short display name (`placeholderTeamName()` in `managerCanon.ts`), flagged with a comment there. When that file lands in `data/processed/`, swap it in — no other file should need to change since everything reads through `managerCanon.ts`.
- **Dave Lang's short display name is "Lang", not "Dave"** — changed per Hoss's explicit correction, to avoid confusion with David Laskey (also sometimes "Dave" colloquially). `DISPLAY_NAMES.dave.name` in `managerCanon.ts`. `fullName` is still "Dave Lang"; the `dave` canonical id and `ALIASES` entries (`"Dave"`, `"Dave Lang"` → `dave`) are unchanged since those match raw source-data strings, not display.
- The card sheet also had a **richer per-manager monogram** than what the app currently generates (e.g. "DLG" for Dave Lang, "VFL" for Sara, "BRK" for Laskey) — not wired in, since it wasn't asked for. If Hoss wants it, add a `MONOGRAMS: Record<ManagerId, string>` map to `managerCanon.ts` next to `MANAGER_COLORS` and use it in place of the `name.slice(0,2).toUpperCase()` fallbacks in `ManagerCard.tsx`, `StandingsTable.tsx`, and `H2HMatrix.tsx`.
- Some card headers on that sheet are full legal names (Carter Dotson, Ryan Evans, Michael Bean, etc.), others are affectionate team-name nicknames (Benny Football → Benedict, A Moderate Breakfast → Laskey, Brice Puls, Patrick Brown). These were used only to *identify* which card belongs to which manager — not wired into `fullName` or `teamName` anywhere, since the ask was specifically about colors.
- `FandomEntry.claimedTeam` (self-reported fan claims, e.g. "Brice claims Dolphins") is a small hardcoded list of 9 managers in `boards.ts` (`CLAIMED_TEAMS`) — preserved from the original mock as curated canon, not derived from any data file, not independently verified.
- `ManagerCard.tsx` links to `/franchises/:id`, but `App.tsx` has no route for that — pre-existing gap from the original Figma Make output, not touched this session. Clicking a manager card currently does nothing useful.
- `PHASE_SPLITS`'s "avg" columns (early/mid/late average points) are an approximation — `pts_vs_mean` from `manager_phase_splits.json` is relative to each phase's own weekly mean, which isn't available in isolation, so the code adds it to a single league-wide average instead. Flagged with a comment in `boards.ts`.
- No automated test suite. Verification this session was `npx tsc --noEmit` (clean) + manual browser checks via the preview tooling (clean console throughout).
- A `.claude/launch.json` was added at the **project root** (not inside `LMFL_Dashboard/`) so the preview tool could start `npm run dev` — this is tooling config, not part of the shipped app.
- This machine had **no Node/npm/pnpm/Homebrew** at session start — user installed Node via the official nodejs.org installer mid-session. If a fresh session hits the same "command not found," that's the fix.

## How to run

```bash
cd LMFL_Dashboard
npm install
npm run dev       # prints a localhost URL, usually :5173
npx tsc --noEmit  # typecheck
```
