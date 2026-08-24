# LMFL Dashboard — agent handoff

Everything an agent needs to finish this site. Written 2026-08-24.

**Remaining scope:** (1) Franchise + Manager pages, (2) Records page,
(3) Hall of Fame gallery. All three have their data already precomputed and
committed — the remaining work is React, not data engineering.

---

## 1. What this is

A static history site for a 13-season fantasy football league (2013–2025),
built as a gift for the commissioner. React 19 + Vite 8 + TypeScript, no
backend. Deploys to GitHub Pages from `main` via GitHub Actions.

```
npm install
npm run dev                                  # localhost, hash routing
npx tsc --noEmit                             # must pass
VITE_BASE_PATH=/last-minute-league/ npm run build   # must pass before pushing
```

**A push to `main` deploys the live site.** Always run `tsc` and a production
build first.

---

## 2. Read these first, in this order

| File | Why |
|---|---|
| `CLAUDE.md` *(project root, outside this repo)* | Data dictionary, slot vocabulary, scoring rules |
| `SITEMAP.md` *(project root, outside this repo)* | Canonical IA. Section "Records catalog" is the spec for page 2 |
| `src/data/managerCanon.ts` | Manager IDs, display names, the 3-color palette per manager |
| `src/data/build/seasonDetail.ts` | The pattern every page follows: raw JSON in, typed objects out |
| `src/components/SeasonDetailBody.tsx` | The most complete page. Copy its structure |

---

## 3. Two constraints you must not break

### 3.1 Privacy

`src/**` is bundled into JavaScript served publicly from GitHub Pages. Three
league members appear in the raw source data under their full legal names and
are scrubbed to short forms before anything reaches `src/`.

- The scrub list lives in the **local-only** data pipeline, deliberately not
  in this repo. Do not reconstruct it here.
- Every JSON in `src/data/processed/` has already been scrubbed and leak-checked.
- **If you generate any new file into `src/`, it must go through the same
  scrub.** Ask the owner to run it through the pipeline rather than
  hand-copying from the source data.
- Never add a full legal name as a string literal anywhere in `src/`.

### 3.2 The pipeline is not in this repo

The Python pipeline (`scripts/`) and the raw data (`data/`, ~220 MB of
nflverse CSVs) live in the owner's local project folder, one level **above**
this repo. They are not committed, partly for size and partly because the
scrub list is PII.

**Consequence:** you cannot regenerate data. Everything the three remaining
pages need has therefore been precomputed and committed for you. If you find
you need something that isn't in `src/data/processed/`, do not invent it —
ask the owner to run the pipeline and commit the output.

---

## 4. Data you have

All in `src/data/processed/`, all re-exported through `src/data/league.ts`.
Import from `../data/league`, never from a JSON path directly.

| File | Contents |
|---|---|
| `season_details/{2013..2025}.json` | Per-season: standings, bowls, brackets, All-Division, 18 awards |
| `franchises.json` | 15 franchises, owner lineage |
| `franchise_records.json` | All-time W/L/PF per franchise |
| `franchise_ring_of_honor.json` | Per-franchise Ring of Honor |
| `honors.json` | Per-season podium, division winners, Letty points leader, bowl venues |
| `aggregations.json` | `leaderboard_started`, `leaderboard_bench`, `leaderboard_combined`, `seasons_played`, `waiver_value` |
| `manager_phase_splits.json` | Early/mid/late scoring per manager |
| `gate_timelines.json` | Win-probability-by-gate + Monday Night Miracle comebacks |
| `bench_regret.json` | Points left on the bench, per manager-week |
| `enemies_analysis.json` | Head-to-head, "greatest enemy" |
| `college_analysis.json`, `nflteam_analysis.json` | College/NFL-team affinity |
| `hall_of_fame.json` | **New.** Full HOF classes — see §6 |
| `records_board.json` | **New.** Every record list the Records page needs — see §5 |

Known data gaps, already handled elsewhere — show a badge, don't plot:
**2020** has no comeback/gate data (COVID), **2024 week 17** is incomplete,
**2013** is an 8-game season numbered weeks 7–14, not 1–8.

---

## 5. Page work

### 5.1 Franchise + Manager pages

`src/pages/Franchises.tsx` exists (~235 lines) as an index. Needs a detail
route per franchise, and manager sub-pages under it.

**IA, decided and canonical (SITEMAP §"IA hierarchy"):** Franchise is the
parent, Manager nests under it. 8 of 15 franchises are solo-owner — for those
the franchise page *is* the manager page, no duplicate.

Per-franchise: owner lineage, nickname, all-time W/L/PF, trophy cabinet,
Ring of Honor, titles, lore slot.
Per-manager: player-card header (monogram, 3-color palette, team name,
location), career record + PF/gm, team-name history, awards + Ring of Honor,
keeper history, draft/waiver value, phase splits, comeback/collapse cut.

Suggested routes: `/franchises/:franchiseId`, `/franchises/:franchiseId/:managerId`.
Follow the pattern in §7.3 — selection in the URL, detail rendered under the
index header.

### 5.2 Records page

`src/pages/Records.tsx` exists (~130 lines). `records_board.json` has
everything, already shaped as top-N lists, each row carrying `season` and
`week` so you can deep-link to `/seasons/{year}`.

```
team_game:      highest_score, lowest_score, biggest_blowout,
                most_points_in_a_loss, fewest_points_in_a_win
matchup:        highest_combined, lowest_combined, closest, biggest_margin
league_week:    highest_scoring_week, lowest_scoring_week
manager_season: most_points, fewest_points, best_ppg
player_game_overall / player_season_overall   (top 25)
by_position:    QB|RB|WR|TE|K|DEF -> single_game, single_season
```

Scope is **full season including playoffs** — these are all-time record
books, so the regular-season-only convention used by the season awards
deliberately does not apply.

SITEMAP calls this page "lookup-first": the user question is *"someone hung
50 on me, where does that rank?"* Design for scanning and search, not for
narrative.

### 5.3 Hall of Fame gallery

See §6 — the rule has a wrinkle the owner needs to decide on.

---

## 6. Hall of Fame

`hall_of_fame.json`. The owner's rule, implemented literally:

- inductees must be **retired** NFL players
- eligible **5 years** after their final NFL season
- at most **5 per class**
- anyone eligible but not picked **rolls over** to later classes

Ranked by **career started points in this league** (regular season +
playoffs) — it's the league's hall, so a player is measured by what he did
for these managers, not by his NFL résumé. Retirement is the last season the
player appears in an nflverse roster.

```
classes[]        year, inductees[], eligible_count, rolled_over, weakest_pts
on_the_ballot[]  eligible, not yet inducted, ordered by career points
not_yet_eligible[]  still active or inside the 5-year window
```

Each inductee carries `pos`, `career_pts`, `career_games`, `ppg`, `seasons`,
`best_season` + `best_season_pts`, `top_manager` + `top_manager_pts`,
`final_nfl_season`, `eligible_from`, `waited_years` — enough for a rich
gallery card without any extra lookups.

### ⚠️ Decision the owner needs to make before this ships

Applying the rule strictly by class year produces **very weak early classes**,
because in 2018 only 7 players were eligible at all:

```
2018  Tony Gonzalez (134 career pts), Ray Rice (117), Andre Brown (51),
      Jermichael Finley (18), David Akers (15)
2019  Knowshon Moreno (170), Reggie Wayne (138), Ben Tate (81),
      Montee Ball (36), Kyle Orton (18)
...
2026  Antonio Brown (1929), Drew Brees (1752), Cam Newton (1530),
      Le'Veon Bell (1453), Ben Roethlisberger (1198)
```

A hall whose charter class is a 15-point kicker and whose ninth class is
Antonio Brown reads as broken, even though it follows the rule exactly.

Two fixes, both one-line changes in the local `hall_of_fame.py`:

1. **Minimum threshold** (recommended) — require e.g. 250+ career points, so
   a thin class is simply smaller than five rather than padded with players
   nobody remembers.
2. **Inaugural class** — induct a larger first class (say the top 20 of
   everyone eligible as of the site's launch), then 5/year after.

**Do not silently pick one.** Ask the owner. Also note the current output
ranks by career total, so longevity beats peak — a different `ranked_by`
would produce a materially different hall.

---

## 7. Conventions — match these or the page will look foreign

### 7.1 Type: IBM Carbon scale only

Allowed sizes: **12 / 14 / 16 / 20 / 28 / 32**. Nothing else. 10, 11 and 13px
were removed across the whole season page in a dedicated pass — do not
reintroduce them.

| Use | Token | px / line-height |
|---|---|---|
| Dense data rows | body-compact-01 | 14 / 18 |
| Labels, captions, secondary values | label-01 / helper-text-01 | 12 / 16 |
| Card titles | heading-compact-01 | 14 / 18, weight 600 |
| Scores in cards | — | 16 / 22 |
| Section headings | heading-03 | 20 / 28 |
| Page title | — | 32 / 40 |

Fonts: **IBM Plex Sans** for copy, **IBM Plex Mono** for anything numeric
(with `fontVariantNumeric: 'tabular-nums'` on columns that align).

### 7.2 Color

Carbon Gray 100 dark. Page `#161616`, card `#262626`, panel `#1c1c1c`,
border `#393939`, inner rule `#2e2e2e`. Text `#f4f4f4` primary, `#c6c6c6`
secondary, `#8d8d8d` muted, `#6f6f6f` faint. Link `#78a9ff`. Accent/gold
`#f1c21b`.

Divisions: O'Conner Memorial `#FF3B30`, Toretto Family `#006FFF`.
Tier colors: first team gold `#B3995D`, second team silver `#B0B7BC`.
Per-manager palettes: `MANAGER_COLORS` in `src/data/managerCanon.ts`.
Styling is inline `style={{}}` objects throughout — match it, don't
introduce a CSS-in-JS library or Tailwind classes for new work.

### 7.3 Routing

Hash routing. **Detail views render inside their index page, under its
header — not on a separate page.** `/seasons/:year` renders `<Seasons />`
with the year preselected; `SeasonDetailBody` is the chrome-less body
component. Selection lives in the URL so it is linkable, survives refresh,
and the back button steps out of it. Do the same for franchises.

### 7.4 Naming

Bowls and awards always use their **full canonical name** — "Letty Ortiz
Award for Excellence in Roster Management", never "Letty Award". Names come
from the JSON (`award_names`), never hardcoded in a component.

### 7.5 Assets

`AssetImage` handles every image, with a fallback chip on error. Manager
logos: `getManager(id).logoSmall / .logoLarge`. Award/MVP photos are
manually sourced into `public/images/season_awards/{year}/` — **196 of these
slots are still empty and that is expected**; they render the fallback chip.
Use `withBase()` from `src/lib/assetPath` for every public path, or it breaks
on the Pages subpath.

---

## 8. Known issues, inherited

- `src/index.css` loads all four IBM Plex faces from `https://static.figma.com/font/...`,
  a leftover from the original Figma Make export. The live site's typography
  depends on Figma's CDN. Worth self-hosting the woff2 files in `public/`.
- The bundle is ~2.5 MB raw / ~477 KB gzipped in one chunk — it's the season
  JSON. Fine at this size; code-split per season if it grows.
- `src/data/espnIds.json` is orphaned and untracked. Delete it.

---

## 9. Before you push

1. `npx tsc --noEmit` — clean
2. `VITE_BASE_PATH=/last-minute-league/ npm run build` — clean
3. Load every page you touched and check the browser console
4. Confirm no horizontal page overflow at 1280 and 1680 wide
5. Confirm no full legal name appears anywhere under `src/`
6. Push to `main` — **this deploys the live site**
