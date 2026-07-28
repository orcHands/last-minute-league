import benchRegretJson from '../processed/bench_regret.json'
import { MANAGERS } from './managers'
import { normalizeManager } from '../managerCanon'

// ─────────────────────────────────────────────
// MANAGER SKILL vs ROSTER STRENGTH
//
// Two independent axes derived from bench_regret.json's per-team-week
// actual/optimal/regret figures:
//
//   Roster Strength = average OPTIMAL points/week a manager's roster could
//   have produced with a perfect lineup every week. This only reflects
//   talent acquired via draft/waivers/trades — it has nothing to do with
//   whether the manager actually started the right players.
//
//   Manager Skill = league-average regret minus the manager's own average
//   regret (regret = optimal - actual, i.e. points left on the bench).
//   Positive means less regret than the league average — a manager who
//   reliably starts their best lineup, independent of how good that
//   lineup's ceiling was.
// ─────────────────────────────────────────────

export interface ManagerSkillPoint {
  managerId: string
  label: string
  color: string
  logoSmall: string
  monogram: string
  retired: boolean
  weeks: number
  avgOptimal: number
  avgRegret: number
  skillDelta: number
}

export interface ManagerSkillMatrix {
  points: ManagerSkillPoint[]
  leagueAvgRegret: number
  leagueAvgOptimal: number
}

interface TeamWeekRegretRow { season: number; week: number; manager: string; actual: number; optimal: number; regret: number }
const byTeamweek = (benchRegretJson as unknown as { by_teamweek: TeamWeekRegretRow[] }).by_teamweek

function buildManagerSkillMatrix(): ManagerSkillMatrix {
  const sums = new Map<string, { optimalSum: number; regretSum: number; weeks: number }>()
  let totalOptimal = 0
  let totalRegret = 0
  let totalWeeks = 0

  for (const row of byTeamweek) {
    const id = normalizeManager(row.manager)
    const entry = sums.get(id) ?? { optimalSum: 0, regretSum: 0, weeks: 0 }
    entry.optimalSum += row.optimal
    entry.regretSum += row.regret
    entry.weeks += 1
    sums.set(id, entry)

    totalOptimal += row.optimal
    totalRegret += row.regret
    totalWeeks += 1
  }

  const leagueAvgOptimal = totalOptimal / totalWeeks
  const leagueAvgRegret = totalRegret / totalWeeks

  const points: ManagerSkillPoint[] = MANAGERS
    .map((m): ManagerSkillPoint | null => {
      const entry = sums.get(m.id)
      if (!entry || entry.weeks === 0) return null
      const avgOptimal = entry.optimalSum / entry.weeks
      const avgRegret = entry.regretSum / entry.weeks
      return {
        managerId: m.id,
        label: m.name,
        color: m.primaryColor,
        logoSmall: m.logoSmall,
        monogram: m.name.slice(0, 2).toUpperCase(),
        retired: !m.active,
        weeks: entry.weeks,
        avgOptimal,
        avgRegret,
        skillDelta: leagueAvgRegret - avgRegret,
      }
    })
    .filter((p): p is ManagerSkillPoint => p !== null)

  return { points, leagueAvgRegret, leagueAvgOptimal }
}

export const MANAGER_SKILL_MATRIX: ManagerSkillMatrix = buildManagerSkillMatrix()
