# Franchise honors design QA

## Evidence

- Source visual truth: `/Users/pbmarken/.codex/generated_images/01a035a0-fc78-72f2-b123-f066d4822033/exec-6d1096f7-ca5e-44c5-9947-e19d6ad43647.png`
- Additional source truth for Carter's hero: `/Users/pbmarken/Desktop/Screenshot 2026-08-24 at 4.43.37 PM.png`
- Browser-rendered implementation: `/var/folders/m8/p8ppw5ss1hg8hw_cnbd2nyrr0000gn/T/franchise-honors-final-1440.png`
- Combined comparison: `/var/folders/m8/p8ppw5ss1hg8hw_cnbd2nyrr0000gn/T/franchise-honors-final-design-comparison.png`
- Viewport and state: Carter franchise detail, Carbon dark theme, `1440 × 1024` CSS px, device pixel ratio `1`.
- Source pixels: `1487 × 1058`, normalized to `1440 × 1024` for the comparison. Implementation pixels: `1440 × 1024`.

## Full-view comparison

The final browser render preserves the selected compact vertical silhouette: straight cloth body, white field, Carter-red side bands, dark top mount and weighted footer, centered logo/name/year hierarchy, and the uncontained Carbon page surface. The user-requested multi-banner system is an intentional expansion from the single-banner mock. Carter's supplied tortilla-toss photo is now the hero background with the existing dark readability overlay intact.

## Focused banner comparison

The original-resolution comparison and the `1440 × 1024` implementation capture were inspected for the banner hardware, fabric texture, logo scale, stitched-color treatment, name wrapping, and year hierarchy. Division and Letty art remain at their reduced optical scales. Bowl-family scales are now Voltron `0.60`, Tokyo Drift `0.75`, and Lemon Pepper Wing `0.50`; 2020 bowl art overrides the family scale at `1.00` so it matches the Teremana logo height.

## Required fidelity surfaces

- Fonts and typography: IBM Plex Sans is used for section and award copy; IBM Plex Mono with tabular numerals is used for seasons. Sizes remain on the project's 12/14/16/20/28/32 scale, with banner award names and seasons both at weight `700`.
- Spacing and layout rhythm: banner aspect, hardware, internal spacing, and section rhythm match the selected direction. Responsive grid checks passed at 1904/1440/1056/800/600/390px with 6/5/4/3/2/1 columns and no horizontal overflow.
- Colors and tokens: each honor resolves the winning manager for that season. Their primary fills the cloth, secondary normally supplies text and borders, and tertiary supplies the top and weighted-bottom bars. Brice, Whitaker, and Kyle use white text for contrast; PB uses their super-dark indigo tertiary as the banner border. Kevin's secondary is Steelers black `#000000` and tertiary is white; Jay's historic banners remain bright pink with deep-indigo text and borders.
- Image quality and asset fidelity: real season-specific bowl logos, both real division logos, the real Letty trophy art, the supplied Carter background, and a project-local woven cloth texture are used. Division marks receive a subtle light halo and dark drop shadow for same-hue backgrounds. No image failures were observed.
- Copy and content: all bowl and award names come from `honors.json`. Division banners read “Brian O'Connor Memorial Division Winner” or “Toretto Family Division Winner,” and the canonical division names now flow through season standings and All-Division teams. The 2013 asterisk treatment is retained.

## Interaction and accessibility checks

- Pointer motion feeds a pinned-top spring chain across 12 cloth bands, producing a traveling ripple that settles through neighbor constraints. Pointer position also moves the highlight and shadow across the weave.
- A 140px scroll impulse produced a restrained `1.35deg` sway and settled to `0.03deg` after 1.3 seconds; the lower weight counter-rotates.
- `prefers-reduced-motion` disables cloth, footer, and ripple transforms.
- The stadium-specific heading and keyboard-accessible Show/Hide control remain available when the banner grid is collapsed.
- Semantic section/article headings and descriptive banner labels are present.
- Browser console: no warnings or errors. Failed images: none.

## Comparison history

1. Initial pass found two P2 visual differences: division/Letty artwork occupied more area than the Teremana logo, and the year lacked the mock's display emphasis.
2. Applied optical logo scales (`0.76` division, `0.52` Letty) and increased the year to the approved 32/40 type token.
3. Reduced the division and Letty marks by a further 33% (`0.51` and `0.35`), added constraint-inspired cloth motion and reactive shading, and added the stadium heading row with its Show/Hide control.
4. Added bowl-family and 2020 optical scales, per-winning-manager palettes, canonical division-winner copy, removed the center rule, and replaced the generic franchise status line with a positive data-derived tagline.
5. Matched 2020 bowl art to Teremana height, strengthened award/year weights, added same-hue division-logo contrast, and applied the requested Brice/Whitaker/Kyle, Kevin, and PB color overrides. No actionable P0/P1/P2 issues remain.

## Findings

No actionable P0/P1/P2 findings remain.

## Open questions

None.

## Implementation checklist

- [x] Real franchise honors derived outside the component and re-exported through `league.ts`.
- [x] Four-to-six-column desktop behavior plus tablet/mobile fallbacks.
- [x] Constraint-inspired pointer ripple, reactive shading, damped scroll sway, weighted footer, and reduced-motion mode.
- [x] Stadium-specific heading and Show/Hide control.
- [x] Title-less franchise fallback displays recorded highest finish and season.
- [x] Per-winning-manager historical banner palettes and updated Kevin black.
- [x] Bowl-family plus Teremana-height 2020 logo scaling and center-rule removal.
- [x] Division-logo halo/shadow, heavier banner copy, and manager-specific contrast overrides.
- [x] Canonical division names across standings, manager cards, All-Division teams, and banners.
- [x] Positive, data-derived franchise taglines replace the generic status line.
- [x] Carter background and optical logo sizing updated from user feedback.
- [x] PB franchise-home canon moved to Montréal and Stade Olympique across the app and season-detail pipeline.
- [x] TypeScript, production build, responsive layouts, assets, overflow, console, and interactions verified.

## Ring of Honor follow-up

- Source truth: `/Users/pbmarken/Desktop/MikeAlstott.png` (168×174 reference card).
- Implementation capture: `/var/folders/m8/p8ppw5ss1hg8hw_cnbd2nyrr0000gn/T/lmfl-ring-of-honor-pb.png` at the 1280×720 browser viewport.
- Combined comparison: `/private/tmp/lmfl-ring-card-comparison.png`; reference 168×174 beside the 152×172 live Mike Alstott plaque.
- The live card matches the supplied number/portrait/name/stat hierarchy, 2px manager-secondary border, rounded card silhouette, and manager-primary body while remaining slightly narrower. Mike Alstott's explicitly suppressed statistics correctly leave the lower region open.
- The complete statistical baseline and eight owner-canonical legacy additions now produce 58 plaques across the 15 franchise pages. Whitaker's six earlier selections are restored; Christian Okoye was subsequently removed from Patrick's Ring by owner request.
- All 45 unique portrait subjects use an exact 69×50 image or initials slot and are tracked alphabetically with every needed NFL uniform in `PLAYER_IMAGE_PUNCHLIST.md`.
- Palette attribution is franchise-local: single-manager franchises use one standard palette across the row; inherited franchises use the first manager in that same lineage who drafted the player. A data audit found zero out-of-lineage managers.
- Ring statistics are also franchise-local: Games Started counts only starts by managers in the displayed franchise lineage, and PPG is Started Points divided by those same starts. A player honored by multiple franchises therefore has a separate stat line on each page.
- Owner-canonical legacy exceptions Roger Craig and Frank Gore display full NFL regular-season Games Played plus calculated Yahoo default half-PPR PPG. Their supplied transparent 69×50 portraits render in the same fixed image slots; the punchlist marks both Ready.
- The Ring Show/Hide control follows Carbon's default 48×24 track and 18×18 handle dimensions, exposes `role="switch"`, `aria-checked`, `aria-expanded`, and an explicit On/Off state, and uses the current manager's primary color when On.
- At 1280px, Patrick's six 152px cards fit on one row with no page or section overflow. The control was verified On, Off, hidden, restored, and keyboard-focusable.

final result: passed
