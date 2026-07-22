# Last Minute — Figma Make Brief

*Paste this whole document into Figma Make as the brief. It defines the product, the design system, tokens, components, page templates, and real content. Where it names a Carbon token, treat the Carbon v11 value as source of truth; hex values are given so you can reproduce Carbon faithfully without the library loaded.*

---

## 1. Product

A static website celebrating the **Last Minute** fantasy-football league (2013–present) — all-time standings, records, stats, and lore. It's a gift for the league's commissioner, Brice. No login, no data entry: it's a read-only, browse-and-explore stats site.

- **Audience:** ~23 league members, mostly tech / game-design folks. Many on large, high-DPI monitors (4K). Design for a sit-back, explore-the-history experience.
- **Tone:** warm, funny, celebratory, a little nerdy. Never locker-room or aggressive. Data-proud but human.
- **Voice examples:** "The Dynasty." "down 43.9 Sunday night, won by 0.04." "if someone ends up with only kickers, that would be incredible."

## 2. Design system directives (non-negotiable)

- **System:** IBM **Carbon Design System v11**.
- **Theme:** **Dark — Gray 100** (primary), with **Gray 90** for elevated surfaces (cards, menus, table headers). Do not use light themes.
- **Type:** **IBM Plex Sans** for all copy (headings, body, labels, nav). **IBM Plex Mono** for all *data* — every number, score, percentage, record value, date, standings/leaderboard cell, and stat-tile figure. This copy/data split is a core identity of the site; apply it everywhere.
- **Feel:** Carbon-native. Square corners (0 radius) by default, depth via layer color tokens rather than heavy shadows, generous whitespace on the spacing scale, crisp data tables.

## 3. Foundations

### 3.1 Color — Carbon Gray 100 (dark) semantic tokens

| Token | Hex | Use |
|---|---|---|
| `background` | `#161616` | Page background |
| `layer-01` | `#262626` | Cards, primary raised surfaces |
| `layer-02` | `#393939` | Nested surfaces, table header, hover |
| `layer-03` | `#525252` | Third-level surfaces |
| `border-subtle` | `#393939` | Dividers, card/table borders |
| `border-strong` | `#6f6f6f` | Emphasized borders |
| `text-primary` | `#f4f4f4` | Headings + body |
| `text-secondary` | `#c6c6c6` | Supporting text |
| `text-helper` / placeholder | `#8d8d8d` | Captions, meta |
| `link` (on dark) | `#78a9ff` | Links (Blue 40 for contrast on dark) |
| `focus` | `#ffffff` | Focus ring |
| `support-error` | `#fa4d56` | Losses / negative deltas |
| `support-success` | `#42be65` | Wins / positive deltas |
| `support-warning` | `#f1c21b` | Asterisk-season / caution badges |
| `support-info` | `#4589ff` | Neutral info badges |

Use semantic tokens, not raw hex, wherever possible. Positive/negative stat deltas (e.g. phase-split +/- vs average) use success/error.

### 3.2 Manager accent colors (data identity layer)

Carbon supplies the chrome; each of the 23 managers has a **3-color palette** used as *identity accents* — the primary color is the row accent bar, card top-bar, and chart series color; the secondary/tertiary are supporting fills/badges. These are provided in the project's `data/processed` / `team_colors` data. Examples:

- Jay (Jayson Margalus) — primary `#FF0055`
- Brice (Miami Brice) — primary `#41B6E6`
- Zac (Goffsides) — primary `#3AC6F0`
- Patrick/pb (Las Vegas Vroom Vrooms) — primary `#9DFF00`

**Contrast rule:** manager primaries are for accent bars, chips, and chart lines only. For any *text or fill that must be read* on the `#161616` background, use Carbon `text-primary`/`text-secondary` or the manager's darker companion color — never a pale primary as small text. Several primaries are light (they have a dark companion in-palette for this reason). All accents must clear WCAG AA against their background.

### 3.2a Division accent colors (fixed canon)

The two divisions have **fixed** accent colors — always these:

- **Brian O'Conner Memorial Division** — `#FF3B30` (red)
- **Toretto Family Division** — `#006FFF` (blue)

Use on division headers, division-split standings, the All-Division team, and paired with each division's logo. Two notes: both are fine as accent bars / large marks on `#161616` but **verify WCAG AA before using either for small text**; and keep them on *structural* accents (headers, rules, logo lockups) rather than on numbers or links — `#FF3B30` sits near the loss/error red and `#006FFF` near the link blue, so putting division color on data or links would blur win/loss and interactive meaning.

### 3.3 Typography

Fonts: **IBM Plex Sans** (copy), **IBM Plex Mono** (data). Weights used: Light 300, Regular 400, SemiBold 600.

Copy scale (Plex Sans) — Carbon type tokens:

| Role | Token | Size / line | Weight |
|---|---|---|---|
| Hero / display | fluid `display-02`–`04` | ~42–96 / tight | 300 |
| Page title | `heading-05` | 32 / 40 | 400 |
| Section title | `heading-04` | 28 / 36 | 400 |
| Subsection | `heading-03` | 20 / 28 | 400 |
| Card title | `heading-compact-02` | 16 / 22 | 600 |
| Body | `body-01` | 14 / 20 | 400 |
| Body (long-form) | `body-02` | 16 / 24 | 400 |
| Label / meta | `label-01` | 12 / 16 | 400 |

Data scale (Plex Mono) — for every figure:

| Role | Size / line | Weight | Notes |
|---|---|---|---|
| Stat hero (KPI) | 42 / 50 | 300–400 | Big single numbers on stat tiles |
| Stat large | 28 / 36 | 400 | Card headline figures |
| Stat medium | 20 / 28 | 400 | Secondary figures |
| Data body | 14 / 20 | 400 | Table cells, inline stats (`code-02`) |
| Data label | 12 / 16 | 400 | Column headers, units (`code-01`) |

Number rules: **right-align** numeric columns; Plex Mono is fixed-width so figures align natively. In Plex Sans copy that contains inline numbers, enable `tabular-nums`. Two decimals for fantasy points (e.g. `116.20`), whole numbers for records/counts.

### 3.4 Spacing scale (Carbon)

`2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160` px (tokens `$spacing-01…13`). Use the scale for all padding, gaps, and margins. Card padding `16` (spacing-05) mobile → `24` (spacing-06) desktop. Section rhythm `48–96` (spacing-09–12).

### 3.5 Grid & breakpoints (four tiers + 4K)

Carbon 2x Grid, 32px gutters. Four responsive tiers as requested:

| Tier | Range | Carbon bp | Columns | Margin | Behavior |
|---|---|---|---|---|---|
| **Mobile** | 320–671 | `sm` | 4 | 16 | Single column; cards full-width; tables scroll horizontally or stack to key-value rows |
| **Tablet** | 672–1055 | `md` | 8 | 16 | Two-up cards; condensed tables; nav collapses to menu |
| **Desktop** | 1056–1583 | `lg` / `xlg` | 16 | 16→24 | Full multi-column layouts; persistent left/top nav; full tables |
| **Large / 4K** | ≥1584 | `max` + | 16 | 24–48 | See 4K rule below |

**4K rule (important — the league lives on big monitors):**

- **Reading content** (prose, League History, About) caps at the `max` content width (1584) and centers — don't stretch paragraphs to 3000px.
- **Data-dense surfaces** (standings, leaderboards, dashboards, the gate-timeline chart) may grow to a **wide container up to ~1904px** with 32–48px margins, so tables and charts breathe instead of leaving half the screen empty.
- Optionally define a **2XL tier at ≥1920** that increases margins and stat-tile sizes one step, but keeps the 16-column grid. Never exceed a ~1904 content max for the main column; use the extra 4K real estate for margin and for multi-column dashboard density, not wider line lengths.

### 3.6 Other foundations

- **Radius:** 0 (Carbon square) by default. If softening is desired, max 2px — apply consistently.
- **Elevation:** prefer layer tokens (`layer-01/02/03`) for depth on dark; use Carbon's subtle shadow only for overlays/menus.
- **Icons:** Carbon icon set, 16/20/24/32 grid. Use for nav, stat tiles, trophies, status.
- **Motion:** Carbon productive motion — fast (70–240ms), standard easing `cubic-bezier(0.2,0,0.38,0.9)`. Subtle; this is a browse site, not an app.

### 3.7 Logos & imagery (real assets — use them)

The league has real logo art in the repo under `images/`: two manager-logo sets, per-season bowl logos, both division logos, and the Letty award trophy. Use these instead of generic placeholders. Two hard rules: **(a)** Figma Make can't fetch local files — in Make, reference them by name at the correct aspect ratio with proper alt text; in the built site they resolve from `images/…` (or copy into `public/assets/…`). **(b)** every logo slot must degrade gracefully to a fallback (manager → monogram chip in accent color; bowl → trophy icon + name). Never show a broken image.

All logos are raster PNG with transparency. On the `#161616` dark background, verify each reads with enough contrast; wrap dark-on-transparent marks in a subtle `layer-01` container or add padding/outline. Always provide alt text (team name, bowl + year, or division name).

**Manager logos — two variants, mapped by MANAGER not filename.** Filenames don't align across folders or to data keys, so a manager→asset map is required (put it in the exported `team_colors.json` as `logo_large` / `logo_small` per manager). Small is complete; large is missing only Laskey.

- `images/large_logos/` (TitleCase `.png`) — **hero/identity** use: manager-card header, franchise/manager page hero, matchup card. 22 of 23 — **no David Laskey** (monogram fallback for the large slot).
- `images/small_logos/` (UPPERCASE `.png`, except `Patrick.png` & `Sara.png`) — **compact** use: nav, table row markers, chips, leaderboard rows, stat-tile corner. **23 of 23 — complete.**
- Name-resolution quirks the map must handle: large uses `Whit.png` / `Lang.png` while small uses `WHITAKER.png` / `LANG.png` (both = Whitaker / Dave Lang); `Patrick`=pb. **Laskey is the only gap — small only (`LASKEY.png`), no large.** Sara is now in both.

**Bowl logos — per SEASON, not one per bowl.** Path `images/BowlGame_logos/<Bowl>_Logos/<file>`; each season's bowl instance uses that year's art. 2020 (the Hard Rock bubble) is a valid bowl season and has logos.

- **Teremana Tequila Bowl** (championship): complete 2013–2025 + future 2026–2028. `TeremanaBowl_YYYY.png`.
- **Ludacris … Lemon Pepper Wing Bowl** (consolation): complete 2013–2025. `WingBowl_YYYY.png`.
- **Voltron Global Bowl** (9th): complete 2013–2025. `VoltronGlobalBowl_YYYY.png`.
- **Kumho Tires Tokyo Drift Bowl** (3rd): complete 2013–2025. Files are `Tokyo Drift Bowl <YYYY>.png` — ⚠ they contain **spaces**, so URL-encode the paths (`%20`) in code (the other three bowls are space-free).
- Uses: Bowls pages, playoff-bracket nodes, trophy case, per-season Bowl-MVP cards, and the Season page's postseason section.

**Award & division logos** (in `images/`):
- `LettyAward_trophy.png` — the Letty Ortiz Award (season points leader). Use on Season pages, the Letty leaderboard, and winners' trophy cabinets.
- `BrianOConnerMemorialDivision_Logo.png` + `TorettoFamilyDivision_logo.png` — the two divisions; pair each with its fixed accent color (§3.2a: O'Conner `#FF3B30`, Toretto `#006FFF`) on Season-page division headers/standings and the All-Division team.

Sizing: large logo ~ card-hero scale (e.g. 96–160px tall, keep aspect); small logo 16–24px chip; award/division logos scale to context. Don't upscale small into hero slots.

## 4. Component kit (build these ~10 parts, then compose pages from them)

1. **Page shell / nav** — top bar with wordmark + section nav (Landing, Seasons, Franchises, Players, Post-season & Bowls, Leaderboards, About); collapses to a menu on mobile/tablet. Dark `background`; nav on `layer-01`. Small manager logos may mark the active-team context where relevant.
2. **Stat tile (KPI)** — label (Plex Sans `label-01`) + big figure (Plex Mono stat-hero) + optional delta (success/error) + optional icon. The atomic data unit; used in rows across every page.
3. **Manager card** — top accent bar in manager primary color; **large logo as the primary identity mark (monogram chip is the fallback when the large logo is missing, e.g. Laskey)**; team name (Plex Sans); career figures (Plex Mono); trophy chips. Links to the manager sub-page.
4. **Franchise card** — umbrella card showing the ownership chain as a mini-timeline; franchise nickname; all-time W/L/PF; trophy count.
5. **Standings / records table** — Carbon data table, dark. Plex Mono numeric cells, right-aligned; Plex Sans name cells; **small manager logo (fallback: monogram) + manager accent as a 3px left-edge row marker** in the name cell; row hover `layer-02`; sortable headers; sticky header. Must degrade to horizontal scroll (mobile) or stacked rows.
6. **Matchup card + gate-timeline chart** — two competitors (manager accent colors) with final score (Plex Mono), and the **stepped cumulative "gate timeline"** chart (x-axis = kickoff gates Thu→Sat→Sun early/aft/night→Mon; two stepped lines in the two managers' accent colors). This is the Monday Night Miracle visual. Show a **data-gap badge** when `complete=false` (2020, 2024 wk17) instead of plotting.
7. **Bowl bracket** — the 4-bowl postseason structure with named trophies; per-game MVP. Use that **season's** bowl logo on each bowl node (fallback: trophy icon + name; all four bowls are complete 2013–2025).
8. **Chart** — general dark chart component (bump charts, phase-split bars, all-play). Manager accent colors as series; Carbon grid/axis in `border-subtle`; Plex Mono axis/value labels.
9. **Trophy cabinet** — grid of trophy/award chips with counts; used on Franchise and Manager sub-pages.
10. **Badges** — asterisk-season badge (warning), data-gap badge, status (win/loss) pills. Small, Plex Sans label / Plex Mono if numeric.

## 5. Page templates (compose from the kit)

- **Landing — "League History":** hero (display type) + champions roll call + section jump tiles + one hero stat (a Monday Night Miracle) + asterisk-seasons note. Dedication to Brice.
- **Seasons:** index grid (season → champ, runner-up, points leader, asterisk badge) → per-season page (standings, two divisions + winners, playoff bracket + 4 bowls, Bowl MVPs, All-Division team, All-Pro team, draft + keepers, that season's records + best comeback, weekly scores).
- **Franchises (Managers nested):** *Franchise is the parent.* Index of 15 franchises (12 active / 3 retired) as continuity timelines → per-franchise page (lineage, nickname, all-time W/L/PF, trophy cabinet, franchise Ring of Honor, lore) → **manager sub-page** per owner (player card, career, awards, keeper value, draft/waiver skill, **phase splits**, **comeback/collapse cut**, **points left on bench**, rivalries, bio). For a solo-owner franchise, the franchise page *is* that manager's page — no duplicate.
- **Players:** started-points leaderboards + positional leaders → per-player page (which managers rostered them, Ring of Honor, bowl-MVP moments). Keep light.
- **Post-season & Bowls:** the 4 named bowls (trophies, venues), bowl history, all 52 Bowl MVPs, trophy case, venue map.
- **Leaderboards & Records:** named boards (Monday Night Miracle comebacks · Drafter-vs-Closer phase splits · Points Left on the Bench · Recruiting Board [college/conference] · Fandom Scorecard [NFL team] · Nemesis + beatdown record book · highest-scoring NFL defenses — all detailed with real content in §7) + a lookup-first records catalog (single-game / weekly / season records, team and player). Search/filter first.
- **About / Methodology:** "Started Points" definition, asterisk-season explainer, data provenance, credits.

## 6. Real content to use (no lorem ipsum)

Ground every mockup in real league data:

- **League:** 13 seasons (2013–present), 23 owners, 15 franchises. 2013 was a half-season (started NFL wk 7); 2020 was the COVID "bubble" season — both are **asterisk seasons** (badge them, don't smooth their per-season averages).
- **Franchise nicknames:** The Dynasty (jay→kevin, 4 rings), Free Agents (benedict→aboubacar→kat→alex), The Snyder Cut (dylan→becca→megan), Moneyball (laskey→sara→jason).
- **Manager team names:** Miami Brice, Goffsides (Zac), Touchdown(); (whitaker), The Fumblers (Michael), Bay Area Trubiskys (Ryan), Las Vegas Vroom Vrooms (pb), Tommy Turbos, Carter Air Raiders.
- **Bowls:** Teremana Tequila Bowl (championship; always full name), Kumho Tires Tokyo Drift Bowl (3rd), Ludacris Presents the Magic City Lemon Pepper Wing Bowl (consolation), Voltron Global Bowl Hosted by Tyrese Gibson (9th).
- **Sample stat tiles:** "Jay — late-season +11.9 pts/wk (67% all-play), the league's clearest closer." "League leaves 16.4 pts on the bench per week." "Travis Kelce — 2,612.76 all-time started points."
- **Sample Monday Night Miracle:** 2018 wk8 — whitaker trailed by 43.9 after Sunday night, won 116.16–116.20 (by 0.04) on Monday.
- **Sample matchup card:** Miami Brice (`#41B6E6`) vs Goffsides (`#3AC6F0`), with the stepped gate timeline.
- **Logos:** real manager logos (large + small) and per-season bowl logos are in the repo — use them per §3.7, always with a fallback.

## 7. Built leaderboards & their real content (build these boards)

Every dataset below is already computed and lives in `data/processed/`. Build each as a named board under **Leaderboards**, and surface the per-manager / per-franchise cuts on those pages (§5). Mock them with the **real numbers given** — never placeholder data. New component variants noted at the end.

### 7.1 Monday Night Miracle — comebacks (`gate_timelines.json`)
Board = comebacks ranked by deficit erased; component = matchup card + stepped gate-timeline chart (kit #6).
- 2018 wk8 — whitaker trailed by 43.9 after Sunday night, won 116.16–116.20 (by 0.04).
- 2021 wk2 — whitaker dropped +62.6 on Monday to beat Tommy.
- 2018 wk11 — Carter +67.2 Monday over Jason.

### 7.2 Drafter vs Closer — phase splits (`manager_phase_splits.json`)
Board = managers by early / mid / late scoring vs the weekly league average; component = grouped bars (kit #8) + a per-manager phase strip.
- Jay climbs every phase: early +6.3 → mid +6.7 → **late +11.9** (the league's clear closer).
- Tommy is a front-runner: elite early +7.4, fades to late −2.3.
- pb (Hoss) underwater all three phases.

### 7.3 Points Left on the Bench (`bench_regret.json`)
Board = optimal-lineup regret; component = standings/records table (kit #5).
- League leaves **16.4 pts on the bench per week**.
- Worst single week ever: **pb, 2016 wk4 — left 82.7** (started 76.4 of a possible 159.1).
- Best lineup-setter: Kelly Brown, 11.0/wk.

### 7.4 Recruiting Board — college & conference (`college_analysis.json`)
Board = draft affinity by school + conference (manager / franchise / league) and highest-scoring schools & conferences; component = affinity bar list + table. **Conference = current alignment** (Texas = SEC, Cal & Stanford = ACC).
- League drafts SEC-heaviest (579 picks) and SEC scores most (73k). Alabama is #1 school (113 picks, 16,140 pts).
- **Carter is the league's #1 Big XII drafter** — his Texas Tech identity, confirmed.
- By position: QB → Big Ten, RB/WR → SEC, TE → ACC.

### 7.5 Fandom Scorecard — NFL team (`nflteam_analysis.json`)
Board = which NFL teams each manager rosters, plus a **"claims vs reality" scorecard**; component = fandom-scorecard variant + affinity bars.
- Confirmed: **Benedict = Patriots**, **Brice = Dolphins + Packers**, **Michael = Cowboys**.
- **The Bears Paradox:** seven self-declared Bears fans, but only whitaker actually rosters Bears players — the rest draft chalk because the Bears are a fantasy wasteland.
- League most-rostered: 49ers 186, Patriots 184, Packers 181.

### 7.6 Nemesis & the Beatdown Record Book (`enemies_analysis.json`)
Per-manager / per-franchise **"Nemesis" panel** (the opponent who's scored the most on you, all-time + your H2H record) and a **record book** of the biggest single-game hits by position.
- **Brice ⇄ Carter** is THE rivalry: 26 meetings, ~3,200 points each way, Carter leads 15–11.
- pb's nemesis: **Brice** (2,497 pts over 21 meetings, Brice 14–7).
- Record book: RB **Jamaal Charles 61.5** (Jay on Kyle, 2013 wk15); WR **Julio Jones 52.8** dropped on pb (Dylan, 2017 wk12 — the "turn the phone off" game).

### 7.7 Highest-scoring NFL defenses (`enemies_analysis.json`)
Board = NFL team D/ST by total started points; component = table.
- Patriots 1,283 · Ravens 1,227 · Rams 1,224 · Seahawks 1,011. Best game ever: Chiefs 57.5 (Dave Lang, 2013 wk14).

### New component variants (extend the kit)
- **Fandom scorecard** — three columns: *claim* (Plex Sans) · *reality* (top rostered team, with logo/accent) · *verdict* (✓/⚠️/❌ pill). Used on the NFL-team board + manager pages.
- **Nemesis panel** — opponent identity (logo → monogram fallback + accent) + points-against (Plex Mono) + H2H record; sits on manager & franchise pages.
- **Affinity bar list** — ranked horizontal bars (school / conference / NFL team), colored by conference or team where a color exists, Plex Mono values.

## 8. Accessibility & dark-mode rules

- Target **WCAG 2.1 AA**. Carbon tokens are AA-compliant on Gray 100 — keep body text on `text-primary`/`text-secondary`, not manager accents.
- Every manager accent used behind text must be checked for contrast; when it fails, swap to the dark companion or a Carbon text token.
- Visible focus states (white focus ring) on all interactive elements; full keyboard nav; sortable tables operable by keyboard.
- Numeric data in Plex Mono, right-aligned, with clear column labels; don't rely on color alone for win/loss — pair with text or icon.

## 9. Do / Don't

- **Do** split copy (Plex Sans) from data (Plex Mono) rigorously — it's the signature.
- **Do** cap reading width at ~1584 even on 4K; give big screens margin and density, not longer lines.
- **Do** badge asterisk seasons (2013, 2020) and show data-gap badges for incomplete gate timelines (2020, 2024 wk17).
- **Do** use the real manager, bowl, division, and award logos, with a fallback per slot (manager → monogram chip; bowl → trophy icon). Only remaining gap: no **large** Laskey logo (small exists). All logo files are now clean, space-free names (Tokyo Drift = `TokyoDriftBowl_YYYY.png`). Never render a broken image.
- **Don't** stretch prose full-width on 4K, use manager accent colors for body text, round corners heavily, or introduce non-Carbon components.
- **Don't** smooth away the league's quirks — the weirdness (half-seasons, a bench full of kickers, a 0.04-point comeback) is the charm.
