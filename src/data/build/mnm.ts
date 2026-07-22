import gateTimelinesJson from '../processed/gate_timelines.json'
import { normalizeManager } from '../managerCanon'

export interface GateTimelinePoint {
  gate: string
  home: number
  away: number
}

export interface MondayNightMiracle {
  id: string
  season: number
  week: number
  winner: string
  loser: string
  winnerFinal: number
  loserFinal: number
  margin: number
  deficitAtSundayNight: number
  mondayNightGain: number
  description: string
  gateTimeline: GateTimelinePoint[]
}

interface GateStep { gate: string; label: string; add: number; cum: number }
interface TimelineSide { manager: string; team: string; final: number; series: GateStep[] }
interface TimelineEntry { season: number; week: number; complete: boolean; A: TimelineSide; B: TimelineSide }
interface MnfComeback {
  season: number
  week: number
  winner: string
  loser: string
  deficit_before_MNF: number
  final: string
  mnf_pts_winner: number
}

interface GateTimelinesFile {
  gate_order: string[]
  timelines: TimelineEntry[]
  mnf_comebacks: MnfComeback[]
}

const gateTimelinesData = gateTimelinesJson as unknown as GateTimelinesFile

const GATE_SHORT_LABEL: Record<string, string> = {
  THU: 'Thu', FRI: 'Fri', SAT: 'Sat',
  SUN_EARLY: 'Sun Early', SUN_AFT: 'Sun Aft', SUN_NIGHT: 'Sun Night',
  MON: 'Mon Night', TUE: 'Tue', WED: 'Wed',
}

function buildGateTimeline(winnerSide: TimelineSide, loserSide: TimelineSide): GateTimelinePoint[] {
  const points: GateTimelinePoint[] = []
  let home = 0
  let away = 0
  let started = false

  for (const gate of gateTimelinesData.gate_order) {
    const winStep = winnerSide.series.find(s => s.gate === gate)
    const loseStep = loserSide.series.find(s => s.gate === gate)
    if (winStep) home = winStep.cum
    if (loseStep) away = loseStep.cum
    if (winStep || loseStep) started = true
    if (started) {
      points.push({ gate: GATE_SHORT_LABEL[gate] ?? gate, home, away })
    }
  }
  return points
}

// Ranked by how big a deficit was overcome; keep the top handful as the
// league's "greatest hits" — both Landing and Leaderboards render the full
// exported list without further slicing.
const TOP_N = 8

export const MONDAY_NIGHT_MIRACLES: MondayNightMiracle[] = gateTimelinesData.mnf_comebacks
  .slice()
  .sort((a, b) => b.deficit_before_MNF - a.deficit_before_MNF)
  .slice(0, TOP_N)
  .map((comeback): MondayNightMiracle | null => {
    const winnerId = normalizeManager(comeback.winner)
    const loserId = normalizeManager(comeback.loser)

    const timeline = gateTimelinesData.timelines.find(t => {
      if (t.season !== comeback.season || t.week !== comeback.week) return false
      const sides = new Set([normalizeManager(t.A.manager), normalizeManager(t.B.manager)])
      return sides.has(winnerId) && sides.has(loserId)
    })

    if (!timeline) return null

    const winnerSide = normalizeManager(timeline.A.manager) === winnerId ? timeline.A : timeline.B
    const loserSide = normalizeManager(timeline.A.manager) === winnerId ? timeline.B : timeline.A

    const gateTimeline = timeline.complete ? buildGateTimeline(winnerSide, loserSide) : []

    return {
      id: `mnm-${comeback.season}-wk${comeback.week}`,
      season: comeback.season,
      week: comeback.week,
      winner: winnerId,
      loser: loserId,
      winnerFinal: winnerSide.final,
      loserFinal: loserSide.final,
      margin: Math.abs(winnerSide.final - loserSide.final),
      deficitAtSundayNight: -Math.abs(comeback.deficit_before_MNF),
      mondayNightGain: comeback.mnf_pts_winner,
      description: `Down ${comeback.deficit_before_MNF.toFixed(1)} after Sunday Night Football. Won ${winnerSide.final.toFixed(2)}–${loserSide.final.toFixed(2)}.`,
      gateTimeline,
    }
  })
  .filter((m): m is MondayNightMiracle => m !== null)
