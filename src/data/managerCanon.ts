// Manager identity — the single place that resolves every inconsistent name
// string across data/processed/*.json into one canonical id.
//
// Colors below are real canon (Hoss's manager card sheet, 2026-07-21).
// Most teamName values are still placeholders pending team_names.json. Current
// names that Hoss explicitly settles live in CURRENT_TEAM_NAMES until that
// file lands; historical season names continue to come from league.json.

import { withBase } from '../lib/assetPath'

export const CANONICAL_IDS = [
  'jay', 'brice', 'zac', 'pb', 'whitaker', 'michael', 'ryan', 'tommy',
  'carter', 'kevin', 'benedict', 'laskey', 'sara', 'jason', 'dylan',
  'becca', 'megan', 'aboubacar', 'kat', 'alex', 'dave', 'kelly', 'kyle',
] as const

export type ManagerId = (typeof CANONICAL_IDS)[number]

// Short display name + full name per canonical id. Short names match what
// every processed JSON file actually uses as its "manager" field (so the
// ALIASES map below is mostly identity + a handful of full-name variants).
export const DISPLAY_NAMES: Record<ManagerId, { name: string; fullName: string }> = {
  jay: { name: 'Jay', fullName: 'Jayson Margalus' },
  brice: { name: 'Brice', fullName: 'Brice' },
  zac: { name: 'Zac', fullName: 'Zac' },
  pb: { name: 'pb', fullName: 'Patrick' },
  whitaker: { name: 'whitaker', fullName: 'Whitaker' },
  michael: { name: 'Michael', fullName: 'Michael' },
  ryan: { name: 'Ryan', fullName: 'Ryan' },
  tommy: { name: 'Tommy', fullName: 'Tommy' },
  carter: { name: 'Carter', fullName: 'Carter' },
  kevin: { name: 'Kevin', fullName: 'Kevin' },
  benedict: { name: 'Benedict', fullName: 'Benedict' },
  laskey: { name: 'Laskey', fullName: 'Laskey' },
  sara: { name: 'Sara', fullName: 'Sara' },
  jason: { name: 'Jason', fullName: 'Jason' },
  dylan: { name: 'Dylan', fullName: 'Dylan' },
  becca: { name: 'Becca', fullName: 'Becca' },
  megan: { name: 'Megan', fullName: 'Megan' },
  aboubacar: { name: 'Aboubacar', fullName: 'Aboubacar' },
  kat: { name: 'Kat', fullName: 'Kat' },
  alex: { name: 'Alex', fullName: 'Alex' },
  dave: { name: 'Lang', fullName: 'Lang' },
  kelly: { name: 'Kelly', fullName: 'Kelly Brown' },
  kyle: { name: 'Kyle', fullName: 'Kyle' },
}

// PRIVACY: the app's copies of data/processed/*.json are scrubbed of full
// legal names by scripts/sync_app_data.py before they land in src/, because
// everything in src/data/ is bundled into the JS served publicly from GitHub
// Pages. That means no full-name keys belong in this map either — a string
// literal here ships just as publicly as one in the JSON. Sync app data with
// that script, never a plain `cp`; if you see an unknown-alias warning in the
// console after copying a file by hand, that's this invariant catching you.
//
// Every raw display string seen across league.json, honors.json,
// franchises.json, gate_timelines.json, manager_phase_splits.json,
// bench_regret.json, enemies_analysis.json, nflteam_analysis.json.
const ALIASES: Record<string, ManagerId> = {
  Jay: 'jay',
  Kevin: 'kevin',
  Brice: 'brice',
  Carter: 'carter',
  whitaker: 'whitaker',
  Whitaker: 'whitaker',
  Michael: 'michael',
  Ryan: 'ryan',
  Tommy: 'tommy',
  pb: 'pb',
  Benedict: 'benedict',
  Aboubacar: 'aboubacar',
  Kat: 'kat',
  Alex: 'alex',
  Dylan: 'dylan',
  becca: 'becca',
  Becca: 'becca',
  Megan: 'megan',
  Laskey: 'laskey',
  Sara: 'sara',
  Jason: 'jason',
  Zac: 'zac',
  Kyle: 'kyle',
  'Kelly Brown': 'kelly',
  Kelly: 'kelly',
  Dave: 'dave',
  Lang: 'dave',
}

const unknownAliasesSeen = new Set<string>()

/** Normalize any raw manager display string from data/processed/*.json into a canonical id. */
export function normalizeManager(raw: string): ManagerId {
  const id = ALIASES[raw]
  if (!id) {
    if (!unknownAliasesSeen.has(raw)) {
      unknownAliasesSeen.add(raw)
      // eslint-disable-next-line no-console
      console.warn(`[managerCanon] unknown manager alias: "${raw}" — add it to ALIASES in managerCanon.ts`)
    }
    // Fall back to a slugified version so a render still happens instead of throwing.
    return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-') as ManagerId
  }
  return id
}

// Verified against actual files in images/large_logos/ and images/small_logos/.
// Round 6: laskey's large logo landed (Hoss supplied the 500px source, resized
// to 750 with the same rounded-square mask the other 22 use), so the monogram
// fallback no longer fires for anyone.
const LOGO_FILENAMES: Record<ManagerId, { large: string | null; small: string }> = {
  jay: { large: 'Jay', small: 'JAY' },
  brice: { large: 'Brice', small: 'BRICE' },
  zac: { large: 'Zac', small: 'ZAC' },
  pb: { large: 'Patrick', small: 'Patrick' },
  whitaker: { large: 'Whit', small: 'WHITAKER' },
  michael: { large: 'Michael', small: 'MICHAEL' },
  ryan: { large: 'Ryan', small: 'RYAN' },
  tommy: { large: 'Tommy', small: 'TOMMY' },
  carter: { large: 'Carter', small: 'CARTER' },
  kevin: { large: 'Kevin', small: 'KEVIN' },
  benedict: { large: 'Benedict', small: 'BENEDICT' },
  laskey: { large: 'Laskey', small: 'LASKEY' },
  sara: { large: 'Sara', small: 'Sara' },
  jason: { large: 'Jason', small: 'JASON' },
  dylan: { large: 'Dylan', small: 'DYLAN' },
  becca: { large: 'Becca', small: 'BECCA' },
  megan: { large: 'Megan', small: 'MEGAN' },
  aboubacar: { large: 'Aboubacar', small: 'ABOUBACAR' },
  kat: { large: 'Kat', small: 'KAT' },
  alex: { large: 'Alex', small: 'ALEX' },
  dave: { large: 'Lang', small: 'LANG' },
  kelly: { large: 'Kelly', small: 'KELLY' },
  kyle: { large: 'Kyle', small: 'KYLE' },
}

export function logoLarge(id: ManagerId): string | null {
  const file = LOGO_FILENAMES[id].large
  return file ? withBase(`images/large_logos/${file}.png`) : null
}

export function logoSmall(id: ManagerId): string {
  return withBase(`images/small_logos/${LOGO_FILENAMES[id].small}.png`)
}

type ColorTriple = { primary: string; secondary: string; tertiary: string }

// Real canon, from Hoss's manager card sheet (23 managers, light/dark/accent
// swatches per card, top-to-bottom on each card = light/dark/accent).
// primary = light (top-listed swatch — used for borders, text, chart series
// everywhere in the app), secondary = dark, tertiary = accent.
export const MANAGER_COLORS: Record<ManagerId, ColorTriple> = {
  jay: { primary: '#FF0055', secondary: '#000055', tertiary: '#CD0155' },
  brice: { primary: '#41B6E6', secondary: '#DB3EB1', tertiary: '#333333' },
  zac: { primary: '#3AC6F0', secondary: '#C02922', tertiary: '#F9E02B' },
  pb: { primary: '#9DFF00', secondary: '#EE4B2B', tertiary: '#0D0A1F' },
  whitaker: { primary: '#E36A4A', secondary: '#4078BE', tertiary: '#F9E4DC' },
  michael: { primary: '#CC8130', secondary: '#BA0C2F', tertiary: '#003278' },
  ryan: { primary: '#B3995D', secondary: '#AA0000', tertiary: '#262012' },
  tommy: { primary: '#8FBCE6', secondary: '#092C5C', tertiary: '#F5D130' },
  carter: { primary: '#CC0000', secondary: '#200000', tertiary: '#F4F4F4' },
  kevin: { primary: '#FFC20E', secondary: '#000000', tertiary: '#B1B1B1' },
  benedict: { primary: '#B0B7BC', secondary: '#002244', tertiary: '#C0001D' },
  laskey: { primary: '#B09AD6', secondary: '#2F174F', tertiary: '#643CDD' },
  sara: { primary: '#FF6700', secondary: '#404040', tertiary: '#58595B' },
  jason: { primary: '#7BBD00', secondary: '#003831', tertiary: '#2B751C' },
  dylan: { primary: '#FF0000', secondary: '#002FA7', tertiary: '#A6A6A6' },
  becca: { primary: '#FF8C00', secondary: '#8A226F', tertiary: '#757575' },
  megan: { primary: '#00C8B3', secondary: '#6155F5', tertiary: '#1C2E39' },
  aboubacar: { primary: '#BE74C6', secondary: '#5D56A7', tertiary: '#561E2B' },
  kat: { primary: '#FFFF00', secondary: '#FF0099', tertiary: '#006FFF' },
  alex: { primary: '#9AAFCB', secondary: '#23345A', tertiary: '#81271A' },
  dave: { primary: '#D2E3B2', secondary: '#28234B', tertiary: '#AAD06C' },
  kelly: { primary: '#FABBCB', secondary: '#00555A', tertiary: '#613F75' },
  kyle: { primary: '#FFA85C', secondary: '#523F28', tertiary: '#F3D2AF' },
}

// Current/latest home location from the home-stadium canon. This is the
// compact city/state identity shown on franchise cards; stadium-era history
// remains in the local season-detail pipeline.
export const MANAGER_HOME_LOCATIONS: Record<ManagerId, string> = {
  jay: 'Blacksburg, VA',
  brice: 'Miami, FL',
  zac: 'Chicago, IL',
  pb: 'Montréal, QC',
  whitaker: 'Bloomington, IN',
  michael: 'Dallas, TX',
  ryan: 'Santa Clara, CA',
  tommy: 'Arlington, TX',
  carter: 'Lubbock, TX',
  kevin: 'Pittsburgh, PA',
  benedict: 'Foxborough, MA',
  laskey: 'London, UK',
  sara: 'Knoxville, TN',
  jason: 'Oakland, CA',
  dylan: 'East Rutherford, NJ',
  becca: 'Indianapolis, IN',
  megan: 'Inglewood, CA',
  aboubacar: 'Austin, TX',
  kat: 'Eugene, OR',
  alex: 'Detroit, MI',
  dave: 'Champaign, IL',
  kelly: 'Ann Arbor, MI',
  kyle: 'Tampa, FL',
}

// Current-season team identities. Deliberately partial: falling back to a
// manager's short name is more honest than inventing names for the other 20.
export const CURRENT_TEAM_NAMES: Partial<Record<ManagerId, string>> = {
  brice: 'Tua Fault',
  zac: 'Goffsides',
  whitaker: 'The Caleb Will-Wins',
  michael: 'The Fumblers',
  ryan: 'The Kittle Prince',
  tommy: 'Kenosha Kickers',
  carter: 'Arc the Ladd McConkey',
  kevin: 'The Princess McBride',
  jason: 'Et tu, Boutte?',
  megan: 'Tiny Panthers',
  alex: 'Coffin Floppers',
  pb: 'Toyotathon',
}

export function currentTeamName(id: ManagerId): string | null {
  return CURRENT_TEAM_NAMES[id] ?? null
}

/** PLACEHOLDER team name — real canon (11 manager names + 4 franchise nicknames) not yet exported. */
export function placeholderTeamName(id: ManagerId): string {
  return currentTeamName(id) ?? DISPLAY_NAMES[id].name
}
