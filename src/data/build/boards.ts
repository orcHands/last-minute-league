import phaseSplitsJson from '../processed/manager_phase_splits.json'
import benchRegretJson from '../processed/bench_regret.json'
import enemiesJson from '../processed/enemies_analysis.json'
import nflTeamJson from '../processed/nflteam_analysis.json'
import { CANONICAL_IDS, normalizeManager, type ManagerId } from '../managerCanon'
import { leagueAvgPtsPerWeek } from './careerRecords'
import { nflTeamColor } from './nflTeamColors'

// ─────────────────────────────────────────────
// PHASE SPLITS (Drafter vs Closer)
// ─────────────────────────────────────────────
export interface PhaseEntry {
  managerId: string
  earlyAvg: number
  earlyVsLeague: number
  midAvg: number
  midVsLeague: number
  lateAvg: number
  lateVsLeague: number
}

interface PhaseStat { weeks: number; seasons: number; pts_vs_mean: number; all_play_pct: number }
interface ManagerPhaseSplit { early: PhaseStat; mid: PhaseStat; late: PhaseStat }
const phaseSplitsData = (phaseSplitsJson as { managers: Record<string, ManagerPhaseSplit> }).managers

function findKey<T>(obj: Record<string, T>, id: ManagerId): string | undefined {
  return Object.keys(obj).find(k => normalizeManager(k) === id)
}

const leagueAvg = leagueAvgPtsPerWeek()

export const PHASE_SPLITS: PhaseEntry[] = CANONICAL_IDS
  .map((id): PhaseEntry | null => {
    const key = findKey(phaseSplitsData, id)
    if (!key) return null
    const p = phaseSplitsData[key]
    // NOTE: "Avg" columns are an approximation — pts_vs_mean is relative to
    // each phase's own weekly mean, which we don't have in isolation, so we
    // add it to the single league-wide average per week instead of a
    // phase-specific one.
    return {
      managerId: id,
      earlyAvg: leagueAvg + p.early.pts_vs_mean,
      earlyVsLeague: p.early.pts_vs_mean,
      midAvg: leagueAvg + p.mid.pts_vs_mean,
      midVsLeague: p.mid.pts_vs_mean,
      lateAvg: leagueAvg + p.late.pts_vs_mean,
      lateVsLeague: p.late.pts_vs_mean,
    }
  })
  .filter((p): p is PhaseEntry => p !== null)

// ─────────────────────────────────────────────
// BENCH REGRET (Points Left on Bench)
// ─────────────────────────────────────────────
export interface BenchRegretEntry {
  rank: number
  managerId: string
  avgRegretPerWeek: number
  worstWeek: { season: number; week: number; regret: number; started: number; optimal: number } | null
}

interface CareerRegretRow { manager: string; weeks: number; avg_regret: number; total_regret: number }
interface TeamWeekRegretRow { season: number; week: number; manager: string; actual: number; optimal: number; regret: number }
const benchRegretData = benchRegretJson as unknown as { career: CareerRegretRow[]; by_teamweek: TeamWeekRegretRow[] }

export const BENCH_REGRET: BenchRegretEntry[] = benchRegretData.career
  .slice()
  .sort((a, b) => b.avg_regret - a.avg_regret)
  .map((row, i): BenchRegretEntry => {
    const id = normalizeManager(row.manager)
    const worst = benchRegretData.by_teamweek
      .filter(w => normalizeManager(w.manager) === id)
      .sort((a, b) => b.regret - a.regret)[0]

    return {
      rank: i + 1,
      managerId: id,
      avgRegretPerWeek: row.avg_regret,
      worstWeek: worst
        ? { season: worst.season, week: worst.week, regret: worst.regret, started: worst.actual, optimal: worst.optimal }
        : null,
    }
  })

// ─────────────────────────────────────────────
// NEMESIS MATCHUPS
// ─────────────────────────────────────────────
export interface NemesisEntry {
  managerId: string
  nemesisId: string
  meetings: number
  ptsAgainst: number
  managerRecord: { w: number; l: number }
}

interface TopEnemy { opponent: string; pts_against: number; games: number; avg: number; their_record_vs_you: string }
interface ManagerEnemyEntry { franchise: string; top_enemies: TopEnemy[] }
const manageEnemiesData = (enemiesJson as { manager_enemies: Record<string, ManagerEnemyEntry> }).manager_enemies

export const NEMESIS_DATA: NemesisEntry[] = CANONICAL_IDS
  .map((id): NemesisEntry | null => {
    const key = findKey(manageEnemiesData, id)
    if (!key) return null
    const top = manageEnemiesData[key].top_enemies[0]
    if (!top) return null
    // "their_record_vs_you" is this manager's own record against the opponent
    // (verified against known canon: Carter's entry for Brice reads "15-11",
    // matching Carter leading that rivalry 15–11).
    const [w, l] = top.their_record_vs_you.split('-').map(Number)
    return {
      managerId: id,
      nemesisId: normalizeManager(top.opponent),
      meetings: top.games,
      ptsAgainst: top.pts_against,
      managerRecord: { w, l },
    }
  })
  .filter((n): n is NemesisEntry => n !== null)

// ─────────────────────────────────────────────
// NFL FANDOM SCORECARD
// ─────────────────────────────────────────────
export interface FandomEntry {
  managerId: string
  claimedTeam: string
  claimedTeamColor: string
  topRosteredTeam: string
  topRosteredColor: string
  verdict: 'confirmed' | 'partial' | 'busted'
  note?: string
}

// Self-reported fan claims — not derivable from any processed file, kept as
// curated canon. "Actually rosters" side is recomputed from real data below.
const CLAIMED_TEAMS: Partial<Record<ManagerId, string>> = {
  benedict: 'Patriots',
  brice: 'Dolphins',
  michael: 'Cowboys',
  whitaker: 'Bears',
  ryan: 'Bears',
  pb: 'Bears',
  tommy: 'Lions',
  zac: 'Rams',
  carter: 'Raiders',
}

interface ByManagerEntry { franchise: string; top_teams: [string, number][] }
const nflByManager = (nflTeamJson as unknown as { by_manager: Record<string, ByManagerEntry> }).by_manager

export const FANDOM_DATA: FandomEntry[] = (Object.keys(CLAIMED_TEAMS) as ManagerId[])
  .map((id): FandomEntry | null => {
    const claimedTeam = CLAIMED_TEAMS[id]
    const key = findKey(nflByManager, id)
    if (!claimedTeam || !key) return null
    const topRosteredTeam = nflByManager[key].top_teams[0]?.[0] ?? '—'
    const verdict: FandomEntry['verdict'] =
      topRosteredTeam === claimedTeam ? 'confirmed'
      : nflByManager[key].top_teams.slice(0, 3).some(([t]) => t === claimedTeam) ? 'partial'
      : 'busted'

    return {
      managerId: id,
      claimedTeam,
      claimedTeamColor: nflTeamColor(claimedTeam),
      topRosteredTeam,
      topRosteredColor: nflTeamColor(topRosteredTeam),
      verdict,
    }
  })
  .filter((f): f is FandomEntry => f !== null)
