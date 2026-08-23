// Per-season bowl logo assets — public/images/BowlGame_logos/<Bowl>_Logos/<file>.
// Filenames don't share one convention across the four folders (verified
// against actual files), so this is a lookup table, not a formula.
import { withBase } from '../lib/assetPath'

const FOLDERS: Record<string, { dir: string; prefix: string }> = {
  'Teremana Tequila Bowl': { dir: 'TeremanaTequilaBowl_logos', prefix: 'TeremanaBowl' },
  'Kumho Tires Tokyo Drift Bowl': { dir: 'TokyoDriftBowl_Logos', prefix: 'TokyoDriftBowl' },
  'Ludacris Presents the Magic City Lemon Pepper Wing Bowl': { dir: 'LemonPepperWingBowl_Logos', prefix: 'WingBowl' },
  'Voltron Global Bowl Hosted by Tyrese Gibson': { dir: 'VoltronGlobalBowl_Logos', prefix: 'VoltronGlobalBowl' },
}

export function bowlLogoUrl(bowlName: string, year: number): string | null {
  const entry = FOLDERS[bowlName]
  if (!entry) return null
  return withBase(`images/BowlGame_logos/${entry.dir}/${entry.prefix}_${year}.png`)
}

// Bowl header cards render each logo at a fixed HEIGHT (not a fixed square
// box) so the four cards line up evenly — a jagged bottom edge otherwise,
// since the four logo files aren't drawn with the same internal padding.
// Measured directly off the 2014 PNGs: how much of each canvas's height is
// actually covered by non-transparent artwork (Pillow bbox, 2026-08-23).
// Wing Bowl is ~edge-to-edge (0.999) -- that's the reference apparent size
// Hoss asked to match. Teremana/Tokyo Drift have visible margin baked into
// the file, so their box needs to be a bit taller to reach the same
// apparent (visible-pixel) height as Wing Bowl.
//
// This is measured per-file, not computed from a formula, so it only
// covers the 2014 logo variants used in this pass -- if a later season's
// bowl art has different padding, re-measure rather than assume this
// table still applies (getbbox() on the RGBA PNG, visible_h / canvas_h).
const VISIBLE_HEIGHT_FRACTION: Record<string, number> = {
  'Teremana Tequila Bowl': 0.940,
  'Kumho Tires Tokyo Drift Bowl': 0.948,
  'Ludacris Presents the Magic City Lemon Pepper Wing Bowl': 0.999,
  'Voltron Global Bowl Hosted by Tyrese Gibson': 1.000,
}

/** Box height to use so this bowl's VISIBLE artwork renders at `targetVisiblePx`. */
export function bowlLogoBoxHeight(bowlName: string, targetVisiblePx: number): number {
  const frac = VISIBLE_HEIGHT_FRACTION[bowlName] ?? 1.0
  return Math.round(targetVisiblePx / frac)
}
