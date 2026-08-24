import draftReportsJson from '../processed/draft_reports.json'
import { normalizeManager } from '../managerCanon'

export const DRAFT_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'] as const
export type DraftPosition = (typeof DRAFT_POSITIONS)[number]

export interface DraftPick {
  round: number
  pick: number
  overall: number
  managerId: string
  player: string
  position: DraftPosition
  startedPts: number
  positionDraftRank: number
  expectedPts: number
  value: number
}

export interface DraftPositionResult {
  best: DraftPick
  worst: DraftPick
}

export interface DraftManagerValue {
  managerId: string
  total: number
  QB: number
  RB: number
  WR: number
  TE: number
  DEF: number
  K: number
}

export interface DraftReport {
  year: number
  managerOrder: string[]
  rounds: number
  picks: DraftPick[]
  bestWorst: Partial<Record<DraftPosition, DraftPositionResult>>
  managerValues: DraftManagerValue[]
  methodology: { scope: string; value: string }
}

interface RawPick {
  round: number
  pick: number
  overall: number
  manager: string
  player: string
  position: DraftPosition
  started_pts: number
  position_draft_rank: number
  expected_pts: number
  value: number
}

interface RawSeason {
  year: number
  manager_order: string[]
  rounds: number
  picks: RawPick[]
  best_worst: Partial<Record<DraftPosition, { best: RawPick; worst: RawPick }>>
  manager_values: Array<Record<DraftPosition | 'manager' | 'total', number | string>>
}

interface RawReports {
  methodology: { scope: string; value: string }
  seasons: Record<string, RawSeason>
}

const raw = draftReportsJson as unknown as RawReports

function mapPick(pick: RawPick): DraftPick {
  return {
    round: pick.round,
    pick: pick.pick,
    overall: pick.overall,
    managerId: normalizeManager(pick.manager),
    player: pick.player,
    position: pick.position,
    startedPts: pick.started_pts,
    positionDraftRank: pick.position_draft_rank,
    expectedPts: pick.expected_pts,
    value: pick.value,
  }
}

function buildReport(season: RawSeason): DraftReport {
  const bestWorst: DraftReport['bestWorst'] = {}
  for (const position of DRAFT_POSITIONS) {
    const result = season.best_worst[position]
    if (result) bestWorst[position] = { best: mapPick(result.best), worst: mapPick(result.worst) }
  }

  return {
    year: season.year,
    managerOrder: season.manager_order.map(normalizeManager),
    rounds: season.rounds,
    picks: season.picks.map(mapPick),
    bestWorst,
    managerValues: season.manager_values.map(row => ({
      managerId: normalizeManager(String(row.manager)),
      total: Number(row.total),
      QB: Number(row.QB),
      RB: Number(row.RB),
      WR: Number(row.WR),
      TE: Number(row.TE),
      DEF: Number(row.DEF),
      K: Number(row.K),
    })),
    methodology: raw.methodology,
  }
}

const REPORTS = new Map(
  Object.values(raw.seasons).map(season => [season.year, buildReport(season)]),
)

export const DRAFT_REPORT_YEARS = [...REPORTS.keys()].sort((a, b) => a - b)
export function getDraftReport(year: number): DraftReport | null {
  return REPORTS.get(year) ?? null
}
