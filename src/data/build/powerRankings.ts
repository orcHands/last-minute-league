import franchisesJson from '../processed/franchises.json'
import { leagueData } from './careerRecords'
import { FRANCHISES, getManager } from './managers'
import { normalizeManager } from '../managerCanon'

// ─────────────────────────────────────────────
// POWER RANKINGS — cumulative "all-play" win rate per franchise, per week,
// across every week of league history (208 total: every (season, week) pair
// that actually has matchups in league.json). "All-play" means: for a given
// week, compare every team's score against every other team that played that
// week — 1 all-play win per team you outscored, 1 loss per team that
// outscored you. Summed cumulatively, this is the standard "power ranking"
// used across fantasy platforms because it measures true weekly performance
// independent of who your actual opponent happened to be.
//
// Franchises are ranked (1 = best) by cumulative all-play win% among every
// OTHER franchise active that same week. A franchise's ribbon:
//   - starts at the first week of its first season (matches its founding —
//     e.g. Zac's franchise starts in 2017, not 2013)
//   - carries its cumulative record forward (unchanged) through single-
//     elimination playoff-bracket weeks where it drew a bye, so the ribbon
//     doesn't gap out during the last 2-3 weeks of a season
//   - ends after the last week of its final season if retired (Kyle,
//     Kelly Brown, Dave Lang) — no more points are emitted past that week
// ─────────────────────────────────────────────

export interface PowerRankWeekLabel {
  weekIndex: number
  season: number
  week: number
}

export interface PowerRankPoint {
  weekIndex: number
  rank: number
  wins: number
  losses: number
  ties: number
  winPct: number
}

export interface FranchisePowerSeries {
  franchiseId: string
  label: string
  color: string
  retired: boolean
  retiredAfterSeason: number | null
  founded: number
  points: PowerRankPoint[]
}

interface FranchiseStintRaw { manager: string; seasons: number[] }
interface FranchiseRaw { id: string; status: string; retired_after?: number; stints: FranchiseStintRaw[] }
const franchisesRaw = (franchisesJson as { franchises: FranchiseRaw[] }).franchises

/** Every (season, week) that has matchups, in chronological order — 208 total. */
function orderedWeeks(): PowerRankWeekLabel[] {
  const seasons = Object.keys(leagueData).map(Number).sort((a, b) => a - b)
  const weeks: PowerRankWeekLabel[] = []
  let idx = 0
  for (const season of seasons) {
    const weekNums = Object.keys(leagueData[String(season)].matchups).map(Number).sort((a, b) => a - b)
    for (const week of weekNums) {
      idx += 1
      weeks.push({ weekIndex: idx, season, week })
    }
  }
  return weeks
}

export const POWER_RANKING_WEEKS: PowerRankWeekLabel[] = orderedWeeks()

function weekWeekIndex(season: number, week: number): number | undefined {
  return POWER_RANKING_WEEKS.find(w => w.season === season && w.week === week)?.weekIndex
}

interface FranchiseScore { franchiseId: string; score: number }

function scoresForWeek(season: number, week: number): FranchiseScore[] {
  const games = leagueData[String(season)].matchups[String(week)] ?? []
  const out: FranchiseScore[] = []
  for (const g of games) {
    const f1 = getManager(normalizeManager(g.m1))?.franchiseId
    const f2 = getManager(normalizeManager(g.m2))?.franchiseId
    if (f1) out.push({ franchiseId: f1, score: g.s1 })
    if (f2) out.push({ franchiseId: f2, score: g.s2 })
  }
  return out
}

function buildFranchisePowerSeries(): FranchisePowerSeries[] {
  const cumulative = new Map<string, { wins: number; losses: number; ties: number }>()
  const points = new Map<string, PowerRankPoint[]>()
  const eligibility = new Map<string, { start: number; end: number }>()

  for (const f of franchisesRaw) {
    cumulative.set(f.id, { wins: 0, losses: 0, ties: 0 })
    points.set(f.id, [])
    const seasons = f.stints.flatMap(s => s.seasons)
    const firstSeason = Math.min(...seasons)
    const lastSeason = Math.max(...seasons)
    const firstWeekOfSeason = Math.min(...Object.keys(leagueData[String(firstSeason)].matchups).map(Number))
    const lastWeekOfSeason = Math.max(...Object.keys(leagueData[String(lastSeason)].matchups).map(Number))
    const start = weekWeekIndex(firstSeason, firstWeekOfSeason)!
    const end = weekWeekIndex(lastSeason, lastWeekOfSeason)!
    eligibility.set(f.id, { start, end })
  }

  for (const { weekIndex, season, week } of POWER_RANKING_WEEKS) {
    const scores = scoresForWeek(season, week)

    // Update cumulative all-play record for everyone who actually played this week.
    for (const a of scores) {
      let wins = 0, losses = 0, ties = 0
      for (const b of scores) {
        if (a === b) continue
        if (a.score > b.score) wins += 1
        else if (a.score < b.score) losses += 1
        else ties += 1
      }
      const rec = cumulative.get(a.franchiseId)!
      rec.wins += wins
      rec.losses += losses
      rec.ties += ties
    }

    // Rank everyone eligible this week (founded, not yet retired) — franchises
    // on a playoff-bracket bye keep their carried-forward cumulative record.
    const eligibleIds = franchisesRaw
      .map(f => f.id)
      .filter(id => {
        const bounds = eligibility.get(id)!
        return weekIndex >= bounds.start && weekIndex <= bounds.end
      })

    const ranked = eligibleIds
      .map(id => {
        const rec = cumulative.get(id)!
        const total = rec.wins + rec.losses + rec.ties
        const winPct = total > 0 ? (rec.wins + rec.ties * 0.5) / total : 0
        return { id, winPct, ...rec }
      })
      .sort((x, y) => (y.winPct - x.winPct) || (y.wins - x.wins) || x.id.localeCompare(y.id))

    ranked.forEach((r, i) => {
      points.get(r.id)!.push({
        weekIndex,
        rank: i + 1,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        winPct: r.winPct,
      })
    })
  }

  return FRANCHISES.map((f): FranchisePowerSeries => {
    const raw = franchisesRaw.find(r => r.id === f.id)!
    const owner = getManager(f.managers[f.managers.length - 1])
    const bounds = eligibility.get(f.id)!
    return {
      franchiseId: f.id,
      label: f.nickname,
      color: owner?.primaryColor ?? '#8d8d8d',
      retired: !f.active,
      retiredAfterSeason: raw.retired_after ?? null,
      founded: POWER_RANKING_WEEKS.find(w => w.weekIndex === bounds.start)!.season,
      points: points.get(f.id) ?? [],
    }
  })
}

export const FRANCHISE_POWER_SERIES: FranchisePowerSeries[] = buildFranchisePowerSeries()

export const POWER_RANKING_MAX_RANK: number = Math.max(
  ...FRANCHISE_POWER_SERIES.flatMap(s => s.points.map(p => p.rank)),
)

/** Wide-format rows for charting: one row per week, one field per franchise (rank, or absent if not eligible that week). */
export interface PowerRankingRow {
  weekIndex: number
  season: number
  week: number
  [franchiseId: string]: number | string
}

export const POWER_RANKING_ROWS: PowerRankingRow[] = POWER_RANKING_WEEKS.map(w => {
  const row: PowerRankingRow = { weekIndex: w.weekIndex, season: w.season, week: w.week }
  return row
})

for (const series of FRANCHISE_POWER_SERIES) {
  for (const p of series.points) {
    const row = POWER_RANKING_ROWS[p.weekIndex - 1]
    row[series.franchiseId] = p.rank
  }
}
