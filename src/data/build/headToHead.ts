import { CANONICAL_IDS, normalizeManager, type ManagerId } from '../managerCanon'
import { leagueData } from './careerRecords'

export interface H2HRecord {
  w: number
  l: number
  t: number
}

type Matrix = Record<ManagerId, Partial<Record<ManagerId, H2HRecord>>>

function buildMatrix(): Matrix {
  const matrix = {} as Matrix
  for (const id of CANONICAL_IDS) matrix[id] = {}

  const bump = (a: ManagerId, b: ManagerId, result: keyof H2HRecord) => {
    const existing = matrix[a][b] ?? { w: 0, l: 0, t: 0 }
    existing[result] += 1
    matrix[a][b] = existing
  }

  for (const season of Object.values(leagueData)) {
    for (const games of Object.values(season.matchups)) {
      for (const g of games) {
        const a = normalizeManager(g.m1)
        const b = normalizeManager(g.m2)
        if (a === b || !matrix[a] || !matrix[b]) continue
        if (g.s1 > g.s2) { bump(a, b, 'w'); bump(b, a, 'l') }
        else if (g.s1 < g.s2) { bump(a, b, 'l'); bump(b, a, 'w') }
        else { bump(a, b, 't'); bump(b, a, 't') }
      }
    }
  }

  return matrix
}

export const HEAD_TO_HEAD: Matrix = buildMatrix()

/** This manager's record against that manager, or null if they've never met. */
export function getH2H(a: string, b: string): H2HRecord | null {
  return HEAD_TO_HEAD[a as ManagerId]?.[b as ManagerId] ?? null
}
