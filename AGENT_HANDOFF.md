# LMFL Dashboard — agent handoff

Authoritative current-state document. Last updated 2026-08-24 (round 2).

## Remaining scope

| # | Work | Starting point | Data ready? |
|---|---|---|---|
| 1 | **Players section** | `src/pages/Players.tsx` is a 136-line stub. See **§5.4** | **Partly — read §5.4 before starting** |
| 2 | Franchise detail views | `src/pages/Franchises.tsx` is an index (~235 lines). Needs detail routes. See §5.1 | Partly — rivalries done, ~10 rollups are not |
| 3 | Records book board | **Expanded 2026-08-25.** `LeagueRecordBook.tsx` is the first of 6 boards and consumes `records_board.json`, `league_record_insights.json`, and `records_expanded.json`. | Yes |
| 4 | Hall of Fame gallery | **Built 2026-08-25** at the bottom of the League Record Book board. See §5.3 + §6 | Yes |

Awards, brackets, standings, All-Division, bowls, playoff venues/weather and
all 13 season pages are built and shipping.

## ⚠️ More than one agent is working in this repo

As of 2026-08-24 the owner is handing individual pages to different assistants
in parallel, each pushing to `main` on a public repo where **a push deploys the
live site.** Before you start:

1. `git pull --rebase` first. Do not assume your clone is current.
2. **Stay inside your assigned page.** Shared files — `managerCanon.ts`,
   `league.ts`, `build/*`, `AGENTS.md` — are where two agents collide. If your
   task genuinely needs a change there, make it minimal and say so in the
   commit message.
3. Run the full §9 checklist before every push. A red build leaves a broken
   public site for everyone, not just you.
4. If `git push` is rejected, **rebase and re-run the checklist**. Never
   force-push.

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
| `AGENTS.md` *(this repo)* | Stack facts + doc map. Short. |
| `CLAUDE.md` *(project root, outside this repo)* | Data dictionary, slot vocabulary, scoring rules |
| `SITEMAP.md` *(project root, outside this repo)* | Canonical IA. Section "Records catalog" is the spec for scope item 3 |
| **§4.1 below** | What is *not* in `src/`. Read it before planning any page, or you will plan around data that isn't here. |
| **§10 below** | What changed most recently, including two bugs that made rebuilds non-reproducible. |
| `src/data/managerCanon.ts` | Manager IDs, display names, the 3-color palette per manager |
| `src/data/build/seasonDetail.ts` | The pattern every page follows: raw JSON in, typed objects out |
| `src/components/SeasonDetailBody.tsx` | The most complete page. Copy its structure |

**Do not start from `SESSION_HANDOFF.md`.** It is history (2026-07-29) and
predates every change since; it is banner-marked as such.

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
| `franchise_ring_of_honor.json` | Per-franchise Ring of Honor: 58 plaques from the statistical baseline plus owner-canonical legacy inductions, jersey numbers, franchise-lineage drafter, selective franchise-only starts and Started Points PPG, uniform references, and portrait filenames |
| `honors.json` | Per-season podium, division winners, Letty points leader, bowl venues |
| `aggregations.json` | `leaderboard_started`, `leaderboard_bench`, `leaderboard_combined`, `seasons_played`, `waiver_value` |
| `manager_phase_splits.json` | Early/mid/late scoring per manager |
| `gate_timelines.json` | Win-probability-by-gate + Monday Night Miracle comebacks |
| `bench_regret.json` | Points left on the bench, per manager-week |
| `enemies_analysis.json` | Head-to-head, "greatest enemy" |
| `college_analysis.json`, `nflteam_analysis.json` | College/NFL-team affinity |
| `hall_of_fame.json` | Full HOF classes — see §6 |
| `records_board.json` | Every record list the Records page needs — see §5.2 |
| `records_expanded.json` | Streaks, all-play luck, Bench Mob, trade trees, postseason records/bowls, and all-32 D/ST usage |
| `rivalries.json` | **New 2026-08-24.** Top 5 rivals **per franchise**, two candidate metrics — see §5.1 |

Known data gaps, already handled elsewhere — show a badge, don't plot:
**2020** has no comeback/gate data (COVID), **2024 week 17** is incomplete,
**2013** is an 8-game season numbered weeks 7–14, not 1–8.

### 4.1 What is deliberately NOT in `src/` — read before you plan a page

`src/` is the whole world you have. There is no API, no `data/` directory in a
clone, and **you cannot run the pipeline** (§3.2). The following exist only on
the owner's machine, one level above this repo:

| Missing from `src/` | Rows | What it would unlock |
|---|---|---|
| `boxscores.json` | 37,565 | **Any per-player detail view.** Every start, bench, slot, week, points. |
| `drafts.json` | 13 seasons | Draft history, best-pick-by-value, most-drafted NFL team |
| `transactions_raw.json` | — | Waiver and trade history |
| `nflverse/*.csv` | ~220 MB | Rosters, colleges, rookie years, NFL teams |

If your page needs one of these, **stop and ask the owner to run the pipeline
and commit the output.** Do not approximate it from the top-100 leaderboards,
and do not invent it. This is the single most common way to waste a session
here.

---

## 5. Page work

### 5.1 Franchise pages

`src/pages/Franchises.tsx` exists (~235 lines) as an index. Needs a detail
route per franchise. Route `/franchises/:franchiseId`, following §7.3 —
selection in the URL, detail rendered under the index header.

**Scope, settled by the owner 2026-08-24 — this REVERSES the earlier plan:**
every stat is **franchise-lifetime, blending all owners in the chain.** There
are no manager sub-pages in this pass. A franchise like
"Benedict → Aboubacar → Kat → Alex" gets one merged all-time scorers list, one
Ring of Honor, one everything. Owner: *"I'm sure Kevin and Megan don't mind if
some of the names are strange. We can always build manager specific sections
later."*

**Buildable today, no new data:** logo, name and owner lineage
(`franchises.json`); combined W/L, PF, PA, playoff appearances, titles, best
finish (`franchise_records.json`); Ring of Honor honorees with jersey number,
franchise-lineage drafter, selective franchise-only starts and Started Points
PPG, uniform references, and portrait filename
(`franchise_ring_of_honor.json`); **top 5 rivals (`rivalries.json`)**.

**Not buildable — needs a pipeline run, so ask:** regular-vs-playoff split
(`franchise_records.json` carries ONE combined record only); average and
highest finishes; top-10 all-time scorers and top-5 per position; top-10
single-game performances; bench regrets with player detail (`bench_regret.json`
is manager-week totals, not per-player); blowouts and closest games; draft and
waiver value; rookie seasons; points-by-position per season; and located-in /
stadium / capacity, which lives only in `scripts/season_detail/stadiums.py` and
has never been exported to JSON.

**Not defined anywhere yet:** first/second All-Time Franchise teams; most-drafted colleges and conferences (there
is no current-conference map, and realignment means a 2013 pick's conference is
not its 2026 conference).

Ring of Honor portrait slots are defined for 45 unique subjects. Roger Craig and
Frank Gore have landed; the remaining 43 portraits use the fixed 69×50 initials
fallback. Asset status,
uniform references, and destination filenames live in the project-root
`PLAYER_IMAGE_PUNCHLIST.md`. Single-manager franchises use that manager's
palette for every plaque. In inherited franchises, a plaque uses the first
manager in that same franchise lineage who drafted the player; unrelated
league managers must never supply Ring colors.

Ring stats normally count only Games Started and Started Points PPG for the
displayed franchise lineage. Owner-canonical exceptions Roger Craig and Frank
Gore use full NFL regular-season Games Played and Yahoo default half-PPR PPG;
their inputs and scoring formula live in `scripts/build_franchise_ring_of_honor.py`.

#### `rivalries.json`

Top 5 rivals **per franchise** — this is a per-franchise slice, not a league
leaderboard. Built by `scripts/build_rivalries.py` (owner's machine).

```
franchises: { <franchiseId>: { B: [...5], C: [...5] } }
```

Two candidate metrics ship side by side; the owner picks one and the loser gets
deleted. Do not average them.

- **B** — `0.40·z(meetings) + 0.30·z(balance) + 0.30·z(−avg margin)`. Steady,
  volume-driven.
- **C** — as B, but meetings are stakes-weighted: regular 1, **playoff 3, named
  bowl 5**. Surfaces short-but-loaded series.

Each rival row carries `meetings`, `w`, `l`, `ties`, `avg_margin`, `seasons`,
`playoff_meetings`, `bowl_meetings`, `score`, `score_100`, and full `closest`
and `biggest` game records with season, week and both scores.

Three things the UI must get right:

- **Use `score_100`, not `score`.** Raw z-sums go negative and "rivalry score
  −0.75" reads as a bug. `score_100` is a min-max rescale; ranking is identical.
- **Scores are comparable across franchise pages by design.** Kelly Brown's best
  rival scores 79 where Tommy's scores 100, because she played three seasons.
  Do not re-normalise per franchise — that would make every franchise's #1 look
  equally heated, which is false.
- **If metric C is chosen, put `playoff_meetings` and `bowl_meetings` in the
  visible row, not a tooltip.** Under C a 4-meeting series legitimately outranks
  a 13-meeting one. Without the stakes columns on screen that looks broken.

**Franchise ids only — no labels, deliberately.** Three franchise labels embed a
full legal name. Resolve display names through `franchises.json` per §3.1.

The Lang franchise has only 4 opponents clearing the 3-meeting floor. Render
4 rows, do not pad to 5.

### 5.2 Records page

`src/pages/Records.tsx` already exists and works: a sidebar of **6 boards**
(League Record Book, Post-season & Bowls, Monday Night Miracle, Drafter vs
Closer, Recruiting Board, NFL Defenses), each a component composed into the page. `Postseason.tsx` and
`Leaderboards.tsx` are content modules feeding it, **not pages** — don't add
page chrome to them.

The **"League Record Book" is the default/first board**. It is fed by
`records_board.json`, `league_record_insights.json`, and `records_expanded.json`
for era-adjusted aberrations, positional Whisperers, streaks, schedule luck,
Bench Mob/escape acts, and trade trees. Postseason multiplier and Giant Killers
live on the rebuilt Post-season & Bowls board. Points Left on Bench, Nemesis &
Rivalries, and Fandom Scorecard no longer have sidebar tabs.
Every row carries `season` and `week`, so deep-link each to `/seasons/{year}`.

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

The gallery is built at the bottom of the League Record Book board using
`hall_of_fame.json`; it deliberately has no separate nav entry.

**One wrinkle to handle in the UI:** classes are emitted per year, but under
the 250-point floor **not every year has a class**. The first class is
**2020**; 2018 and 2019 produce no inductees at all and are simply absent
from `classes[]`. Don't render an empty shell for a missing year, and don't
assume `classes[i].year` increments by one.

### 5.4 Players section

`src/pages/Players.tsx` is a **136-line stub**: a top-10 started-points list and
a column of Teremana Tequila Bowl MVPs. Everything below is unbuilt.

#### Read this first — the hard boundary

**Per-player detail pages are NOT buildable from what is committed.** There is
no `boxscores.json` in `src/` (§4.1). What exists is aggregate: the top 100 by
started points, the top 25 player games and seasons, positional records, bowl
MVPs, and the Hall of Fame. There is no route to a player's game log, season
splits, or which managers rostered him, because the 37,565-row source is not in
this repo.

So there are two different jobs, and they are not interchangeable:

**Job A — buildable now.** A rich *Players* index built from aggregate data:

| Section | Source | Note |
|---|---|---|
| All-time leaderboards | `aggregations.json` → `leaderboard_started` / `leaderboard_bench` / `leaderboard_combined` | 100 rows each. The stub shows 10 of one of them. |
| Bowl MVP gallery | `bowl_mvps.json` | **52 MVPs across all four bowls.** The stub renders only Teremana — the other three bowls are already in the file and unused. |
| Positional record boards | `records_board.json` → `by_position` | QB / RB / WR / TE / K / DEF, each with `single_game` and `single_season` |
| Top player games and seasons | `records_board.json` → `player_game_overall`, `player_season_overall` | Top 25 each, every row carries `season` + `week` — deep-link to `/seasons/{year}` |
| Ring of Honor, cross-franchise | `franchise_ring_of_honor.json` | Honoree, position, seasons, started points, how acquired |
| Hall of Fame | `hall_of_fame.json` | Or as its own page — see §5.3 |

`player_positions.json` (989 entries, name → position) is the join key for
colour-coding by position. `bench_regret.json` is manager-week, not per-player —
it does not belong on this page.

**Job B — blocked.** True per-player pages at `/players/:playerId` need a new
precomputed `player_index.json` derived from `boxscores.json`: per player, the
seasons played, career started points, PPG, games started, which managers
rostered him and for how much, best game, best season. That is a pipeline task
on the owner's machine (§3.2), roughly one script. **Ask before assuming it
exists; do not approximate it from the top-100 leaderboards.**

If you were handed "build the player pages" with no further detail, Job A is
what you can deliver today. Say so rather than inventing data.

#### Conventions specific to this page

- Position colours already in the stub: QB `#4589ff`, RB `#42be65`, WR
  `#f1c21b`, TE `#FF832B`, K `#8d8d8d`, DEF/DST `#8A3FFC`. Reuse, don't reinvent.
- Player photos do not exist for anyone. `AssetImage` fallback chips only (§7.5).
- The stub hardcodes a two-column grid with no breakpoint handling. It will
  overflow on `sm`. Fix that rather than extending it.

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

### Resolved: 250-point career floor, Ray Rice excluded

Applying the rule strictly by class year produced very weak early classes —
in 2018 the induction pool included a kicker with 15 career points, while
2026 was stacked with Antonio Brown (1929) and Drew Brees (1752). The owner
resolved this on 2026-08-24:

- **`MIN_CAREER_PTS = 250`** — a player under this never appears on the
  ballot, no matter how long he's been retired. This pushed the first class
  from 2018 to **2020** (Calvin Johnson, Peyton Manning) and every class is
  now thinner-but-real rather than padded. See `rule.min_career_pts` in the
  JSON.
- **`EXCLUDED_PLAYERS = {'Ray Rice'}`** — permanent, explicit, independent of
  the point floor above. See `rule.excluded_players` in the JSON. Do not
  re-add him if the floor changes later.

Both are one-line constants at the top of the local `hall_of_fame.py`. Career
total still ranks the hall (longevity beats peak) — that part of the rule is
unchanged.

---

## 7. Conventions — match these or the page will look foreign

### 7.1 Type: IBM Carbon scale only

Allowed sizes for new work: **12 / 14 / 16 / 20 / 28 / 32**. Never add a 10, 11
or 13.

**Correction, 2026-08-24.** This section used to claim 10/11/13 had been removed
codebase-wide. They had not. A `grep -rn "fontSize: 1[013]" src/` finds **~80
remaining sites** across 20+ files — mostly uppercase letterspaced "eyebrow"
labels at 11px and Recharts axis ticks at 10px. Even `Seasons.tsx`, the page the
original pass covered, still has four.

Do **not** mass-fix them as a side quest. Changing 11 → 12 on every eyebrow label
shifts layout on every page at once, and the owner has not approved that. Leave
them, add none, and raise it as its own task.

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
- ~~`src/data/espnIds.json` is orphaned~~ — removed 2026-08-24.
- `AGENTS.md` used to be Figma Make scaffold that told agents to write
  Tailwind and claimed a hosted dev server. Rewritten 2026-08-24. If you see
  Tailwind classes anywhere in `src/`, they are vestigial — don't copy them.
- **~80 off-scale font sizes remain in `src/`** (10/11/13px). Documented, not a
  licence to add more — see §7.1.
- `rivalries.json` is committed but **not yet re-exported through
  `src/data/league.ts`**. Whoever builds §5.1 adds the barrel export; until then
  it is dead weight in the bundle (110 KB).
- The `weather` field on a bracket entry can legitimately be `null` on an
  outdoor game — 43 readings are still unsourced (§10). `VenueLine` already
  renders a graceful gap. Never fill one with an invented number.

---

## 9. Before you push

1. `npx tsc --noEmit` — clean
2. `VITE_BASE_PATH=/last-minute-league/ npm run build` — clean
3. Load every page you touched and check the browser console
4. Confirm no horizontal page overflow at 1280 and 1680 wide
5. **Run the leak check.** Ask the owner for the three scrubbed names, then:

   ```bash
   grep -rn "First Last" src/ && echo "LEAK" || echo "clean"
   ```

   Check **every file type under `src/`, not just JSON** — on 2026-08-24 two
   of the three names were found sitting in `src/imports/FIGMA_MAKE_BRIEF.md`,
   a committed markdown file in a **public** repo, having survived the commit
   whose entire purpose was scrubbing them. The bundle was clean; the repo
   was not. Both matter.
6. Push to `main` — **this deploys the live site**

---

## 10. Changed 2026-08-24 (round 2)

Recorded so the next agent doesn't re-derive any of it.

### Canon changes the owner made

- **2020 was a Miami bubble.** *Every* 2020 game, regular season and post,
  was played in Miami at one of four venues. Non-final playoff games used to be
  routed to each host manager's own home stadium, which contradicted this.
  Assignment now lives in `scripts/season_detail/bowl_venues.py`: Champions
  QF+SF at the Orange Bowl, Champions 5th Place and Consolation SF at Marlins
  Park (roofed → "Indoors"), Consolation QF and 11th Place at Homestead-Miami
  Speedway, and **all four bowls at Hard Rock** — Hard Rock is the finals venue
  and nothing else uses it. Attendance is a flat **40% of capacity** (COVID
  rule), which reproduces the 26,130 `honors.json` already carried.
- **Named bowls now carry weather.** The old rule was "real canon venue, no
  invented weather", which left a blank line on every bowl card. Ten roofed
  venues (Tokyo Dome, Mercedes-Benz Atlanta, Georgia Dome, Mercedes-Benz
  Superdome, Edward James Dome, SoFi, AT&T Field, National Stadium Kallang,
  State Farm Glendale, Superior Dome) now render "Indoors", covering 28 of the
  52 bowl games. The open-air ones look up `WEATHER[(city, date)]` like any
  other game.
- **Rings are 💍, not 🏆**, in the Rings column of both standings tables.
- **The "20XX Season" banner bar is gone** from the season detail card. The
  champion-colour accent moved onto the card; the asterisk badge became a
  footnote under the podium tiles.
- **Laskey's large logo landed.** `large_logos/` is 23 of 23 — the monogram
  fallback no longer fires for anyone.

### Bugs fixed

- **`manifests.py` hid 17 games from the weather manifest.** It skipped every
  entry with `terminal == True`. 5th- and 11th-Place Games *are* terminal but
  are **not** named bowls — they're played at the higher seed's home stadium
  and need a real reading. They went unlisted, and therefore unsourced, for 13
  seasons. **`terminal` never means "this is a bowl". The correct test is
  `venue_info`, which only the four named bowls carry.**
- **`build_season_detail.py` was not deterministic.** Two set-iteration bugs
  meant identical input produced different JSON between runs. `bracket.py`
  iterated the `byes` set directly, so bye-card order was whatever Python's
  per-process hash seed produced (and was never seed-ordered). `awards.py`
  sorted a *set* of player names on VOR alone, so ties — and there are many
  `vor == 0.0` rows — broke on set order, shifting `pts_rank` and the Draft
  Steal top 5. Both now have explicit tiebreaks; verified stable across three
  full 13-season rebuilds. **If a rebuild ever produces a diff with no input
  change, look for `sorted(set)` or `for x in set`.**

### Still outstanding

- **43 playoff games have no weather reading** (19 at home stadiums, 24 at
  bowls). `WEATHER_NEEDED.md` at the project root lists every one, grouped by
  city, with a sourceability tier on bowl rows: T1 straightforward, T2 real but
  obscure station (Utqiaġvik `PABR`, McMurdo, Pyongyang, Al Asad, Zhezkazgan),
  T3 proxy-only (North Sentinel, Prypiat, Kīlauea). Owner is sourcing these.
- **196 award photo slots** remain empty, as before, and that is expected.
- **`rivalries.json` carries two competing metrics.** The owner has not picked
  (§5.1).

---

## 11. Changed 2026-08-25

- Current canon: Alex = **Coffin Floppers**, Detroit / Ford Field; Kevin =
  **The Princess McBride**, Pittsburgh / Acrisure Stadium; Jason =
  **Et tu, Boutte?**; Patrick = **Toyotathon**.
- Kyle owns the Monchhichi art, Tampa venue, and peach/brown palette. Dylan
  owns the Bloodsport/flag art, East Rutherford venue, and red/blue palette.
- Kyle's franchise header is `franchise_backgrounds/kyle.png`, the owner's
  wide Monchhichi photo. The older mislabeled `kyle.jpg` remains unused.
- `records_expanded.json` now includes locked 2026–2028 bowl hosts and bids,
  reconstructed regular-season playoff seeds, trade draft picks, and all 32
  NFL defenses. Future hosts are displayed but excluded from historical counts.
- Historical season cards and matchup records display the manager name plus
  the team name recorded for that season; current-team overrides must never
  rewrite old seasons (for example, 2025 champion Kevin / The Princess McBride).
- `/seasons/2026` is an upcoming-season module, not fabricated season-detail
  JSON. It holds the current 12-team field, divisions, 15-round draft order,
  declared keepers, and four locked bowl sites. Results-based sections remain
  explicit empty states until real 2026 data lands.
- The Records page no longer exposes the Points Left on Bench, Nemesis &
  Rivalries, or Fandom Scorecard boards. Bench Mob lives inside the League
  Record Book; the postseason board owns bowls, postseason multipliers, and
  Giant Killers.
