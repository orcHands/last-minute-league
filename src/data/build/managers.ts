import franchisesJson from '../processed/franchises.json'
import franchiseRecordsJson from '../processed/franchise_records.json'
import {
  CANONICAL_IDS, DISPLAY_NAMES, normalizeManager, logoLarge, logoSmall,
  MANAGER_COLORS, MANAGER_HOME_LOCATIONS, placeholderTeamName, type ManagerId,
} from '../managerCanon'
import { buildCareerRecords, leagueData } from './careerRecords'
import { buildChampionshipCounts, buildDivisionTitleCounts } from './honorsHelpers'

export interface Manager {
  id: string
  name: string
  fullName: string
  teamName: string
  franchiseId: string
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  logoSmall: string
  logoLarge: string | null
  homeLocation: string
  seasons: number
  careerRecord: { w: number; l: number; t: number }
  careerPF: number
  careerPA: number
  avgPF: number
  avgPA: number
  playoffAppearances: number
  divisionTitles: number
  championships: number
  division: 'oconner' | 'toretto' | null
  bio?: string
  active: boolean
}

interface FranchiseStint {
  manager: string
  seasons: number[]
  evidence?: string
}

interface FranchiseRaw {
  id: string
  founder: string
  status: 'active' | 'retired'
  current: string | null
  label: string
  note?: string
  retired_after?: number
  stints: FranchiseStint[]
}

const franchisesRaw = (franchisesJson as { franchises: FranchiseRaw[] }).franchises

function franchiseForManager(id: ManagerId): FranchiseRaw | undefined {
  return franchisesRaw.find(f => f.stints.some(s => normalizeManager(s.manager) === id))
}

const careerRecords = buildCareerRecords()
const championshipCounts = buildChampionshipCounts()
const divisionTitleCounts = buildDivisionTitleCounts()

export const MANAGERS: Manager[] = CANONICAL_IDS.map((id): Manager => {
  const franchise = franchiseForManager(id)
  const stint = franchise?.stints.find(s => normalizeManager(s.manager) === id)
  const career = careerRecords.get(id) ?? {
    w: 0, l: 0, t: 0, pf: 0, pa: 0, playoffAppearances: 0, seasonsPlayed: new Set<number>(),
  }
  const seasonsPlayed = [...career.seasonsPlayed]
  const colors = MANAGER_COLORS[id]
  const games = career.w + career.l + career.t

  const currentManager = franchise?.current
  const active = franchise?.status === 'active' && !!currentManager && normalizeManager(currentManager) === id

  return {
    id,
    name: DISPLAY_NAMES[id].name,
    fullName: DISPLAY_NAMES[id].fullName,
    teamName: placeholderTeamName(id),
    franchiseId: franchise?.id ?? id,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    tertiaryColor: colors.tertiary,
    logoSmall: logoSmall(id),
    logoLarge: logoLarge(id),
    homeLocation: MANAGER_HOME_LOCATIONS[id],
    seasons: stint?.seasons.length ?? seasonsPlayed.length,
    careerRecord: { w: career.w, l: career.l, t: career.t },
    careerPF: career.pf,
    careerPA: career.pa,
    avgPF: games > 0 ? career.pf / games : 0,
    avgPA: games > 0 ? career.pa / games : 0,
    playoffAppearances: career.playoffAppearances,
    divisionTitles: divisionTitleCounts.get(id) ?? 0,
    championships: championshipCounts.get(id) ?? 0,
    // Divisions are reshuffled every season — not a stable per-manager fact.
    // Brice is the one documented exception: always Brian O'Conner Memorial.
    division: id === 'brice' ? 'oconner' : null,
    active,
  }
})

export const getManager = (id: string): Manager | undefined =>
  MANAGERS.find(m => m.id === id)

export const ACTIVE_MANAGERS = MANAGERS.filter(m => m.active)

// ─────────────────────────────────────────────
// FRANCHISES
// ─────────────────────────────────────────────
export interface Franchise {
  id: string
  nickname: string
  managers: string[]
  managerStints: { managerId: string; seasons: number[] }[]
  latestTeamNickname: string | null
  latestSeason: number | null
  allTimeRecord: { w: number; l: number; t: number }
  winPct: number
  allTimePF: number
  allTimePA: number
  avgPF: number
  avgPA: number
  playoffAppearances: number
  divisionTitles: number
  divisionTitleYears: number[]
  championships: number
  championshipYears: number[]
  bestFinish: { rank: number; season: number } | null
  active: boolean
  lore?: string
}

interface FranchiseRecordRow {
  id: string
  label: string
  status: string
  seasons: number
  games: number
  w: number
  l: number
  t: number
  win_pct: number
  pf: number
  pa: number
  playoff_appearances: number
  championships: number[]
  division_titles: number[]
  best_finish: { rank: number; season: number } | null
  ring_of_honor_plaques: number
}

const franchiseRecordsRaw = (franchiseRecordsJson as { franchises: FranchiseRecordRow[] }).franchises

export const FRANCHISES: Franchise[] = franchisesRaw.map((f): Franchise => {
  const record = franchiseRecordsRaw.find(r => r.id === f.id)
  const managerIds: string[] = []
  for (const stint of f.stints) {
    const id = normalizeManager(stint.manager)
    if (managerIds[managerIds.length - 1] !== id) managerIds.push(id)
  }
  const games = (record?.w ?? 0) + (record?.l ?? 0) + (record?.t ?? 0)
  const latestSeason = f.stints.reduce(
    (latest, stint) => Math.max(latest, ...stint.seasons),
    0,
  ) || null
  const latestManagerId = f.current
    ? normalizeManager(f.current)
    : managerIds[managerIds.length - 1]
  const latestTeamNickname = latestSeason
    ? leagueData[String(latestSeason)]?.standings.find(
      row => normalizeManager(row.manager) === latestManagerId,
    )?.team ?? null
    : null

  return {
    id: f.id,
    // PLACEHOLDER nickname (real franchise nicknames not yet exported — see managerCanon.ts header)
    nickname: f.label,
    managers: managerIds,
    managerStints: managerIds.map(managerId => ({
      managerId,
      seasons: f.stints
        .filter(stint => normalizeManager(stint.manager) === managerId)
        .flatMap(stint => stint.seasons)
        .sort((a, b) => a - b),
    })),
    latestTeamNickname,
    latestSeason,
    allTimeRecord: { w: record?.w ?? 0, l: record?.l ?? 0, t: record?.t ?? 0 },
    winPct: record?.win_pct ?? 0,
    allTimePF: record?.pf ?? 0,
    allTimePA: record?.pa ?? 0,
    avgPF: games > 0 ? (record?.pf ?? 0) / games : 0,
    avgPA: games > 0 ? (record?.pa ?? 0) / games : 0,
    playoffAppearances: record?.playoff_appearances ?? 0,
    divisionTitles: record?.division_titles.length ?? 0,
    divisionTitleYears: record?.division_titles ?? [],
    championships: record?.championships.length ?? 0,
    championshipYears: record?.championships ?? [],
    bestFinish: record?.best_finish ?? null,
    active: f.status === 'active',
  }
})

export const getFranchise = (id: string): Franchise | undefined =>
  FRANCHISES.find(f => f.id === id)
