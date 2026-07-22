import league from '../processed/league.json'
import { normalizeManager, type ManagerId } from '../managerCanon'

interface StandingRow {
  rank: string
  playoffs: boolean
  team: string
  manager: string
  wlt: string
  pf: number
  pa: number
}

interface MatchupGame {
  t1: string
  m1: string
  s1: number
  t2: string
  m2: string
  s2: number
}

interface SeasonEntry {
  champion_manager: string
  leagueId: string
  podium: string[]
  standings: StandingRow[]
  matchups: Record<string, MatchupGame[]>
}

const leagueData = league as unknown as Record<string, SeasonEntry>

export interface CareerRecord {
  w: number
  l: number
  pf: number
  seasonsPlayed: Set<number>
}

/** Aggregate career W/L/PF per manager across every season's standings. */
export function buildCareerRecords(): Map<ManagerId, CareerRecord> {
  const byManager = new Map<ManagerId, CareerRecord>()

  for (const [yearStr, season] of Object.entries(leagueData)) {
    const year = Number(yearStr)
    for (const row of season.standings) {
      const id = normalizeManager(row.manager)
      const [wStr, lStr] = row.wlt.split('-')
      const w = Number(wStr)
      const l = Number(lStr)

      const existing = byManager.get(id) ?? { w: 0, l: 0, pf: 0, seasonsPlayed: new Set<number>() }
      existing.w += w
      existing.l += l
      existing.pf += row.pf
      existing.seasonsPlayed.add(year)
      byManager.set(id, existing)
    }
  }

  return byManager
}

/** Total league-wide points-for divided by total games played, as a per-week average baseline. */
export function leagueAvgPtsPerWeek(): number {
  let totalPf = 0
  let totalGames = 0
  for (const season of Object.values(leagueData)) {
    for (const row of season.standings) {
      const [wStr, lStr, tStr] = row.wlt.split('-')
      totalGames += Number(wStr) + Number(lStr) + Number(tStr ?? 0)
      totalPf += row.pf
    }
  }
  return totalPf / totalGames
}

export { leagueData }
