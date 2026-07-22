import franchisesJson from '../processed/franchises.json'
import franchiseRecordsJson from '../processed/franchise_records.json'
import {
  CANONICAL_IDS, DISPLAY_NAMES, normalizeManager, logoLarge, logoSmall,
  MANAGER_COLORS, placeholderTeamName, type ManagerId,
} from '../managerCanon'
import { buildCareerRecords } from './careerRecords'
import { buildChampionshipCounts } from './honorsHelpers'

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
  seasons: number
  careerRecord: { w: number; l: number }
  careerPF: number
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

export const MANAGERS: Manager[] = CANONICAL_IDS.map((id): Manager => {
  const franchise = franchiseForManager(id)
  const stint = franchise?.stints.find(s => normalizeManager(s.manager) === id)
  const career = careerRecords.get(id) ?? { w: 0, l: 0, pf: 0, seasonsPlayed: new Set<number>() }
  const seasonsPlayed = [...career.seasonsPlayed]
  const colors = MANAGER_COLORS[id]

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
    seasons: stint?.seasons.length ?? seasonsPlayed.length,
    careerRecord: { w: career.w, l: career.l },
    careerPF: career.pf,
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
  allTimeRecord: { w: number; l: number }
  allTimePF: number
  championships: number
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

  return {
    id: f.id,
    // PLACEHOLDER nickname (real franchise nicknames not yet exported — see managerCanon.ts header)
    nickname: f.label,
    managers: managerIds,
    allTimeRecord: { w: record?.w ?? 0, l: record?.l ?? 0 },
    allTimePF: record?.pf ?? 0,
    championships: record?.championships.length ?? 0,
    active: f.status === 'active',
  }
})
