import enemiesJson from '../processed/enemies_analysis.json'
import aggregationsJson from '../processed/aggregations.json'
import { normalizeManager } from '../managerCanon'
import { leagueData, leagueAvgPtsPerWeek } from './careerRecords'
import { MANAGERS, FRANCHISES } from './managers'
import { BENCH_REGRET } from './boards'

export interface StandingRow {
  managerId: string
  w: number
  l: number
  pct: number
  pf: number
  championships: number
}

export const ALL_TIME_STANDINGS: StandingRow[] = MANAGERS
  .filter(m => m.careerRecord.w + m.careerRecord.l >= 20)
  .map(m => ({
    managerId: m.id,
    w: m.careerRecord.w,
    l: m.careerRecord.l,
    pct: m.careerRecord.w / (m.careerRecord.w + m.careerRecord.l),
    pf: m.careerPF,
    championships: m.championships,
  }))
  .sort((a, b) => b.pct - a.pct)

function findAllTimePointsRecord() {
  let best = { managerId: '', value: 0, season: 0 }
  for (const [yearStr, season] of Object.entries(leagueData)) {
    for (const row of season.standings) {
      if (row.pf > best.value) {
        best = { managerId: normalizeManager(row.manager), value: row.pf, season: Number(yearStr) }
      }
    }
  }
  return best
}

function findSmallestMargin() {
  let smallest = { value: Infinity, season: 0, week: 0 }
  for (const [yearStr, season] of Object.entries(leagueData)) {
    for (const [weekStr, games] of Object.entries(season.matchups)) {
      for (const g of games) {
        const margin = Math.abs(g.s1 - g.s2)
        if (margin < smallest.value) {
          smallest = { value: margin, season: Number(yearStr), week: Number(weekStr) }
        }
      }
    }
  }
  return smallest
}

const kelce = (aggregationsJson as { leaderboard_started: { player: string; pos: string; pts: number }[] })
  .leaderboard_started.find(p => p.player === 'Travis Kelce')

const topDefenseGame = (enemiesJson as {
  nfl_defense_scoring: { single_best_game: { defense: string; pts: number; started_by: string; season: number; week: number } }
}).nfl_defense_scoring.single_best_game

const leagueAvgBenchRegret =
  BENCH_REGRET.reduce((sum, r) => sum + r.avgRegretPerWeek, 0) / (BENCH_REGRET.length || 1)

export const LEAGUE_STATS = {
  seasons: new Set(Object.keys(leagueData)).size,
  managers: MANAGERS.length,
  franchises: FRANCHISES.length,
  avgPtsPerWeek: leagueAvgPtsPerWeek(),
  leagueAvgBenchRegret,
  allTimePointsRecord: findAllTimePointsRecord(),
  smallestMarginEver: findSmallestMargin(),
  kelceTotalPts: kelce?.pts ?? 0,
  topDefenseGame: {
    team: topDefenseGame.defense,
    pts: topDefenseGame.pts,
    managerId: normalizeManager(topDefenseGame.started_by),
    season: topDefenseGame.season,
    week: topDefenseGame.week,
  },
}
