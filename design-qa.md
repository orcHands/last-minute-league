# Seasons page design QA

## Evidence

- Source visual truth:
  - `/Users/pbmarken/Desktop/Screenshot 2026-08-24 at 11.46.33 AM.png` — VisualLeague draft-board reference, 3694 × 2194 px.
  - `/Users/pbmarken/Desktop/Screenshot 2026-08-24 at 11.46.14 AM.png` — VisualLeague pick/value-analysis reference, 5320 × 2350 px.
- Browser-rendered implementation:
  - `/private/tmp/lmfl-season-qa/implementation-draft-board-desktop.png` — 1440 × 2583 px capture from a 1440 × 1000 CSS viewport at density 1.
  - `/private/tmp/lmfl-season-qa/implementation-draft-value-desktop.png` — 1440 × 1000 px capture from a 1440 × 1000 CSS viewport at density 1.
  - `/private/tmp/lmfl-season-qa/implementation-power-ranking-desktop.png` — 1440 × 1000 px capture from a 1440 × 1000 CSS viewport at density 1.
  - `/private/tmp/lmfl-season-qa/implementation-draft-board-mobile.png` — 390 × 844 px capture from a 390 × 844 CSS viewport at density 1.
- Same-input comparisons:
  - `/private/tmp/lmfl-season-qa/qa-draft-board-comparison.png` — source board and implementation normalized to 1000 px high and placed side by side.
  - `/private/tmp/lmfl-season-qa/qa-draft-analysis-comparison.png` — source analysis region and implementation normalized to 1000 px high and placed side by side.
- State: 2025 season selected; Carbon dark theme; full draft report populated. The reference is an inspiration target rather than an LMFL state, so comparison is structural and visual-language based rather than pick-for-pick.

## Full-view comparison

- The implementation preserves the reference's dense team-column board, round rows, position color coding, compact cards, best/worst positional analysis, and horizontal value visualization.
- Intentional differences are correct for the product: IBM Carbon surfaces and typography replace VisualLeague styling; player photos and NFL logos are omitted per request; canonical manager names/logos replace third-party handles/avatars; square corners and LMFL spacing/tokens are retained.
- The redundant summary bar is absent. The selected season array flows directly into the four bowl cards.

## Focused-region comparison

- Draft board: all six requested position colors are present; manager columns and round labels remain legible; the board owns its horizontal overflow on narrow screens.
- Bowl cards: all four logo image boxes measure 300–319 px high. At 390 px viewport the square logos receive 340 px of available width, enough to preserve the 300 px visible-art target without overrun.
- Draft analysis: best/worst cards preserve the position color as the strongest categorical cue, while green/red rules and signed values distinguish the result. The diverging stacked bar chart communicates both positive and negative positional value more clearly than the source's one-direction bars.
- Weekly ranking: the line chart resets at Week 1, uses canonical manager colors, offers hover tooltips, and lets mouse/keyboard/touch users persist a manager selection.

## Required fidelity surfaces

- Fonts and typography: IBM Plex Sans is used for copy and IBM Plex Mono for rounds, picks, values, ranks, weeks, and scores. New type uses only the allowed 12/14/16/20 px scale with tabular numerals.
- Spacing and layout rhythm: 48 px section rhythm matches the existing season detail page. Dense board cards use compact internal spacing; analytical cards have clearer 16 px padding. All corners remain square and elevation comes from Carbon layers/borders.
- Colors and tokens: Carbon Gray 100 surfaces are preserved. Position mapping is pink QB, mint RB, baby-blue WR, orange TE, purple D/ST, and light-gray K. Manager series use manager-canon colors.
- Image quality and asset fidelity: real per-season bowl art and manager logos are used. No player photos, NFL logos, generated placeholders, custom SVGs, or CSS illustrations were introduced. Every image retains the existing fallback behavior.
- Copy and content: “Started Points” is used consistently. The methodology states that the report uses full-season Started Points produced for the drafting manager and defines positional expectation; no league fact was invented.
- Accessibility and behavior: focus rings remain global; ranking legend controls are semantic buttons with `aria-pressed`; board/position legends are labeled; internal scroll frames are keyboard-focusable; the document itself has no horizontal overflow at 390 px.

## Comparison history

1. P2 — Season awards forced document-level mobile overflow.
   - Evidence: at a 390 px viewport, the document measured 476 px wide because award cards had a hard 460 px minimum.
   - Fix: changed the awards grid minimum to `min(100%, 460px)`.
   - Post-fix evidence: document client width and scroll width both measure 390 px; the draft board remains independently scrollable at 356 px client / 2180 px content.
2. P2 — Bowl-card horizontal padding constrained square logo art below the intended visible-height target on mobile.
   - Evidence: at 390 px the logo box had only 308 px of available width.
   - Fix: reduced only horizontal logo-region padding from 24 px to 8 px while retaining 24 px vertical breathing room.
   - Post-fix evidence: mobile image boxes measure 340 px wide and 300–319 px high inside 356 px cards, with no page overflow.

## Primary interactions tested

- Loaded `#/seasons/2025` at desktop and mobile viewport widths.
- Selected a manager in the weekly ranking; `aria-pressed` changed to `true` and the line focus persisted.
- Scrolled the draft board horizontally while the page width remained fixed.
- Checked desktop and mobile browser logs after interaction: no errors or warnings.

## Follow-up polish

- P3: the full static data bundle is now about 557 kB gzip and still triggers the existing Vite chunk-size warning. Per-season code splitting would improve first load but is outside this visual change.

final result: passed
