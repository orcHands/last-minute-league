import analyticsJson from '../processed/franchise_analytics.json'
import { normalizeManager } from '../managerCanon'

export type FranchisePosition = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'K'

export interface FranchiseAllTeamSlot {
  slot: string
  player: string | null
  position: FranchisePosition | null
  points: number
}

export interface FranchiseAllTeam {
  tier: number
  slots: FranchiseAllTeamSlot[]
}

export interface FranchiseAllTeamGroup {
  managerId: string
  teams: FranchiseAllTeam[]
}

export interface FranchiseSeasonPoints {
  season: number
  QB: number
  RB: number
  WR: number
  TE: number
  DEF: number
  K: number
}

export interface FranchiseWeeklyScoring {
  index: number
  season: number
  week: number
  managerId: string
  points_for: number
  points_against: number
  optimal: number | null
}

export interface FranchiseRival {
  opponent: string
  meetings: number
  w: number
  l: number
  ties: number
  avg_margin: number
  seasons: number
  playoff_meetings: number
  bowl_meetings: number
  score_100: number
}

export interface FranchisePlayerLeader {
  player: string
  position: FranchisePosition
  points: number
  starts: number
  seasons: number[]
}

export interface FranchiseDraftPick {
  player: string
  position: string
  season: number
  round: number
  pick: number
  overall: number
  points: number
  starts: number
  value: number
}

export interface FranchiseWaiverPick {
  player: string
  position: string
  season: number
  week: number
  points: number
  starts: number
}

export interface FranchiseGameRecord {
  season: number
  week: number
  manager: string
  opponent_franchise_id: string | null
  points_for: number
  points_against: number
  margin: number
  combined: number
  result: 'W' | 'L' | 'T'
}

export interface FranchiseComebackRecord {
  season: number
  week: number
  opponent_franchise_id: string
  points_made_up: number
}

export interface FranchiseBenchRegret {
  season: number
  week: number
  players: string[]
  bench_points: number
  regret: number
  actual_result: 'W' | 'L' | 'T'
  optimal_result: 'W' | 'L' | 'T'
}

export interface FranchiseAffinityRow {
  name: string
  players: number
  starts: number
  points: number
  ppg: number
}

export interface FranchiseDraftRound {
  round: number
  franchise: number
  league: number
}

export interface FranchiseFinishPoint {
  season: number
  rank: number | null
  field_size: number
  expected_rank: number
  projected: boolean
}

export interface FranchiseAnalytics {
  allTeams: FranchiseAllTeamGroup[]
  pointsBySeason: FranchiseSeasonPoints[]
  weeklyScoring: FranchiseWeeklyScoring[]
  rivals: FranchiseRival[]
  leaders: Record<'overall' | FranchisePosition, FranchisePlayerLeader[]>
  draft: { best: FranchiseDraftPick[]; worst: FranchiseDraftPick[]; rounds: FranchiseDraftRound[] }
  waiver: { best: FranchiseWaiverPick[]; worst: FranchiseWaiverPick[] }
  games: {
    blowoutWins: FranchiseGameRecord[]
    blowoutLosses: FranchiseGameRecord[]
    closestWins: FranchiseGameRecord[]
    closestLosses: FranchiseGameRecord[]
    comebackWins: FranchiseComebackRecord[]
    comebackLosses: FranchiseComebackRecord[]
    benchRegrets: FranchiseBenchRegret[]
    highestCombined: FranchiseGameRecord[]
    lowestCombined: FranchiseGameRecord[]
  }
  affinity: Record<'nfl' | 'college' | 'conference', { frequency: FranchiseAffinityRow[]; ppg: FranchiseAffinityRow[] }>
  finishChart: FranchiseFinishPoint[]
}

interface RawAnalyticsFile {
  franchises: Record<string, any>
}

const raw = analyticsJson as unknown as RawAnalyticsFile

function buildAnalytics(value: any): FranchiseAnalytics {
  return {
    allTeams: value.all_teams.map((group: any) => ({
      managerId: normalizeManager(group.manager),
      teams: group.teams,
    })),
    pointsBySeason: value.points_by_season,
    weeklyScoring: value.weekly_scoring.map((point: any) => ({
      ...point,
      managerId: normalizeManager(point.manager),
    })),
    rivals: value.rivals,
    leaders: value.leaders,
    draft: value.draft,
    waiver: value.waiver,
    games: {
      blowoutWins: value.games.blowout_wins,
      blowoutLosses: value.games.blowout_losses,
      closestWins: value.games.closest_wins,
      closestLosses: value.games.closest_losses,
      comebackWins: value.games.comeback_wins,
      comebackLosses: value.games.comeback_losses,
      benchRegrets: value.games.bench_regrets,
      highestCombined: value.games.highest_combined,
      lowestCombined: value.games.lowest_combined,
    },
    affinity: value.affinity,
    finishChart: value.finish_chart,
  }
}

const FRANCHISE_ANALYTICS = new Map(
  Object.entries(raw.franchises).map(([id, value]) => [id, buildAnalytics(value)]),
)

export function getFranchiseAnalytics(franchiseId: string): FranchiseAnalytics | undefined {
  return FRANCHISE_ANALYTICS.get(franchiseId)
}
