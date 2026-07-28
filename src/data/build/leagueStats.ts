import enemiesJson from '../processed/enemies_analysis.json'
import aggregationsJson from '../processed/aggregations.json'
import playerPositionsJson from '../processed/player_positions.json'
import { normalizeManager } from '../managerCanon'
import { leagueData, leagueAvgPtsPerWeek } from './careerRecords'
import { MANAGERS, FRANCHISES } from './managers'
import { BENCH_REGRET } from './boards'

export interface StandingRow {
  id: string
  w: number
  l: number
  pct: number
  pf: number
  championships: number
}

export const ALL_TIME_STANDINGS: StandingRow[] = MANAGERS
  .filter(m => m.careerRecord.w + m.careerRecord.l >= 20)
  .map(m => ({
    id: m.id,
    w: m.careerRecord.w,
    l: m.careerRecord.l,
    pct: m.careerRecord.w / (m.careerRecord.w + m.careerRecord.l),
    pf: m.careerPF,
    championships: m.championships,
  }))
  .sort((a, b) => b.pct - a.pct)

// Same shape, aggregated by franchise chain (see franchises.ts / franchise_records.json)
// instead of by individual manager. Every franchise has enough games played that no
// minimum-sample filter is needed (unlike ALL_TIME_STANDINGS above).
export const ALL_TIME_FRANCHISE_STANDINGS: StandingRow[] = FRANCHISES
  .map(f => {
    const games = f.allTimeRecord.w + f.allTimeRecord.l
    return {
      id: f.id,
      w: f.allTimeRecord.w,
      l: f.allTimeRecord.l,
      pct: games > 0 ? f.allTimeRecord.w / games : 0,
      pf: f.allTimePF,
      championships: f.championships,
    }
  })
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

/** Total head-to-head games ever played (one per matchup, not per team). */
function countGamesPlayed(): number {
  let games = 0
  for (const season of Object.values(leagueData)) {
    for (const week of Object.values(season.matchups)) games += week.length
  }
  return games
}

/** Every point scored by anyone, ever — both sides of every matchup, regular season + playoffs. */
function sumPointsScored(): number {
  let pts = 0
  for (const season of Object.values(leagueData)) {
    for (const week of Object.values(season.matchups)) {
      for (const g of week) pts += g.s1 + g.s2
    }
  }
  return pts
}

// Distinct human players who have appeared on any roster. DEF units are team
// defenses, not players, so they're excluded (989 total entries − 32 DEF = 957).
const playersRostered = Object.values(playerPositionsJson as Record<string, string>)
  .filter(pos => pos !== 'DEF').length

export const LEAGUE_STATS = {
  seasons: new Set(Object.keys(leagueData)).size,
  managers: MANAGERS.length,
  franchises: FRANCHISES.length,
  gamesPlayed: countGamesPlayed(),
  pointsScored: sumPointsScored(),
  playersRostered,
  // League lore, not derived data: the Fast & Furious film count the league's
  // bowl names riff on (11 films through Fast X).
  fastFuriousFilms: 11,
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
