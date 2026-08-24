// Season detail page data — bowls, standings+divisions, champions/consolation
// brackets, season awards top-5. Pre-computed by the Python pipeline in the
// data workspace (not this repo) into data/processed/season_details/{year}.json,
// then copied here same as every other processed file. See CLAUDE.md for the
// copy convention (scripts/sync_app_data.py) — this file should get the same
// name-scrubbing treatment once it's wired into that script.
//
// All 13 seasons (2013-2025) are generated as of 2026-08-23. Vite's
// import.meta.glob picks up whatever's in season_details/ at build time, so
// adding or regenerating a year is just "drop the JSON in," no code change.
import { normalizeManager, type ManagerId } from '../managerCanon'

const seasonFiles = import.meta.glob('../processed/season_details/*.json', { eager: true }) as Record<string, { default: unknown }>

export interface StandingRowDetail {
  rank: number
  team: string
  manager: ManagerId
  playoffs: boolean
  wlt: string
  divisionWlt: string | null
  division: string | null
  pfTotal: number
  pfAvg: number | null
  paTotal: number
  paAvg: number | null
  regretTotal: number
  regretAvg: number | null
}

export interface BowlMvp {
  player: string
  position: string
  points: number
  manager: ManagerId
  team: string
  side: string
  seasonAvg: number
  deltaVsAvg: number
  type: string
}

export interface BowlCard {
  key: string
  bowl: string
  bowlLabel: string
  week: number
  winnerManager: ManagerId
  winnerTeam: string
  loserManager: ManagerId
  loserTeam: string
  finalScore: string
  mvp: BowlMvp | null
}

export interface BracketWeather {
  low: number
  cond: string
  emoji: string
}

export interface BracketEntry {
  kind: 'game' | 'bye'
  label: string
  week: number
  terminal?: boolean
  team?: string
  manager?: ManagerId
  rank?: number
  t1?: string
  m1?: ManagerId
  s1?: number
  rank1?: number
  t2?: string
  m2?: ManagerId
  s2?: number
  rank2?: number
  venue?: string | null
  city?: string | null
  state?: string | null
  attendance?: number | null
  indoor?: boolean
  weather?: BracketWeather | null
}

export interface BracketRound {
  week: number
  entries: BracketEntry[]
}

export interface Bracket {
  activeTeams: string[]
  inactiveTeams: string[]
  rounds: BracketRound[]
}

export interface AwardFinalist {
  rank: number
  player?: string
  teamDef?: string
  pts?: number
  manager?: ManagerId
  avgRegret?: number
  totalRegret?: number
  week?: number
  winner?: ManagerId
  loser?: ManagerId
  deficitOverAvg?: number
  winnerPts?: number
  loserPts?: number
  margin?: number
  delta?: number
  thisSeasonPts?: number
  priorSeasonPts?: number
  pickOverall?: number
  ptsRank?: number
  draftPool?: number
  // Coordinator-of-the-year (manager-level slot streaming) shape
  ppg?: number
  total?: number
  games?: number
  // Letty Ortiz Award (season points leader) shape
  pf?: number
  pfAvg?: number
  // Position-weighted scoring (round 5) — MVP / Rookie / Draft Steal / Waiver
  pos?: string
  dominance?: number
  z?: number
  share?: number
  vor?: number
  posBaseline?: number
}

export interface AllDivisionSlot {
  slot: string
  player: string | null
  pos: string | null
  pts: number | null
  manager: ManagerId | null
}

export interface AllDivisionTeam {
  label: string
  managers: string[]
  firstTeam: AllDivisionSlot[]
  secondTeam: AllDivisionSlot[]
}

export interface AllDivision {
  oconner: AllDivisionTeam
  toretto: AllDivisionTeam
}

export interface SeasonDetail {
  year: number
  standings: StandingRowDetail[]
  divisions: Record<string, StandingRowDetail[]>
  bowls: BowlCard[]
  championsBracket: Bracket
  consolationBracket: Bracket
  awardNames: Record<string, string>
  awardDescriptions: Record<string, string>
  awardsTop5: Record<string, AwardFinalist[]>
  awardsPartial: string[]
  allDivision: AllDivision | null
}

function toManagerId(raw: string): ManagerId {
  return normalizeManager(raw)
}

interface RawStanding {
  rank: number; team: string; manager: string; playoffs: boolean; wlt: string
  division_wlt: string | null; division: string | null
  pf_total: number; pf_avg: number | null; pa_total: number; pa_avg: number | null
  regret_total: number; regret_avg: number | null
}

interface RawBowlMvp {
  season: number; bowl: string; bowl_label: string; week: number
  winner_manager: string; winner_team: string; loser_manager: string; loser_team: string
  final_score: string
  mvp: { player: string; position: string; points: number; manager: string; team: string
          side: string; season_avg: number; delta_vs_avg: number; type: string } | null
}

interface RawBracketEntry {
  kind: 'game' | 'bye'; label: string; week: number; terminal?: boolean
  team?: string; manager?: string; rank?: number
  t1?: string; m1?: string; s1?: number; rank1?: number
  t2?: string; m2?: string; s2?: number; rank2?: number
  venue?: string | null; city?: string | null; state?: string | null
  attendance?: number | null; indoor?: boolean
  weather?: { low: number; cond: string; emoji: string } | null
  venue_info?: unknown
}

interface RawBracket {
  active_teams: string[]; inactive_teams: string[]
  rounds: { week: number; entries: RawBracketEntry[] }[]
}

interface RawAwardFinalist {
  player?: string; team_def?: string; pts?: number; manager?: string
  avg_regret?: number; total_regret?: number
  week?: number; winner?: string; loser?: string; deficit_before_MNF?: number
  final?: string; mnf_pts_winner?: number
  winner_pts?: number; loser_pts?: number; margin?: number
  delta?: number; this_season_pts?: number; prior_season_pts?: number
  pick_overall?: number; pts_rank?: number; draft_pool?: number; vor?: number
  ppg?: number; total?: number; games?: number
  pf?: number; pf_avg?: number
  pos?: string; dominance?: number; z?: number; share?: number; pos_baseline?: number
}

interface RawAllDivisionSlot {
  slot: string; player: string | null; pos: string | null; pts: number | null; manager: string | null
}

interface RawAllDivisionTeam {
  label: string; managers: string[]; firstTeam: RawAllDivisionSlot[]; secondTeam: RawAllDivisionSlot[]
}

interface RawAllDivision {
  oconner: RawAllDivisionTeam
  toretto: RawAllDivisionTeam
}

interface RawSeasonDetail {
  year: number
  standings: RawStanding[]
  divisions: Record<string, RawStanding[]>
  bowl_mvps: Record<string, RawBowlMvp>
  champions_bracket: RawBracket
  consolation_bracket: RawBracket
  awards_top5: Record<string, RawAwardFinalist[]>
  award_names: Record<string, string>
  award_descriptions?: Record<string, string>
  all_division: RawAllDivision | null
}

function convertStanding(r: RawStanding): StandingRowDetail {
  return {
    rank: r.rank, team: r.team, manager: toManagerId(r.manager), playoffs: r.playoffs,
    wlt: r.wlt, divisionWlt: r.division_wlt, division: r.division,
    pfTotal: r.pf_total, pfAvg: r.pf_avg, paTotal: r.pa_total, paAvg: r.pa_avg,
    regretTotal: r.regret_total, regretAvg: r.regret_avg,
  }
}

function convertBracketEntry(e: RawBracketEntry): BracketEntry {
  return {
    kind: e.kind, label: e.label, week: e.week, terminal: e.terminal,
    team: e.team, manager: e.manager ? toManagerId(e.manager) : undefined, rank: e.rank,
    t1: e.t1, m1: e.m1 ? toManagerId(e.m1) : undefined, s1: e.s1, rank1: e.rank1,
    t2: e.t2, m2: e.m2 ? toManagerId(e.m2) : undefined, s2: e.s2, rank2: e.rank2,
    venue: e.venue, city: e.city, state: e.state, attendance: e.attendance,
    indoor: e.indoor, weather: e.weather,
  }
}

function convertBracket(b: RawBracket): Bracket {
  return {
    activeTeams: b.active_teams, inactiveTeams: b.inactive_teams,
    rounds: b.rounds.map(rd => ({ week: rd.week, entries: rd.entries.map(convertBracketEntry) })),
  }
}

// Awards with a genuine top-5 finalist list from the mechanical/verified
// builders. As of 2026-08-23 round 3 that's ALL of them -- rookie_of_the_year
// was the last holdout, and the "no rookie-class dataset exists" conclusion
// turned out to be wrong: data/nflverse/roster_{year}.csv carries rookie_year
// and entry_year for every player. Rank 1 reproduces all 13 verified ROY
// winners exactly. The awardsPartial machinery below is kept (not deleted)
// so a future award that genuinely can't be ranked still degrades gracefully.
const FULL_TOP5_AWARDS = new Set([
  'rookie_of_the_year', 'letty_ortiz_award',
  'mvp', 'qb_of_the_year', 'rb_of_the_year', 'wr_of_the_year', 'te_of_the_year',
  'kicker_of_the_year', 'dst_of_the_year', 'bench_whisperer', 'comeback_of_the_year',
  'biggest_blowout', 'most_improved_player', 'waiver_pickup_of_the_year',
  'draft_steal_of_the_year', 'offensive_coordinator_of_the_year',
  'defensive_coordinator_of_the_year', 'special_teams_coordinator_of_the_year',
])

function convertFinalist(a: RawAwardFinalist, rank: number): AwardFinalist {
  return {
    rank,
    player: a.player, teamDef: a.team_def, pts: a.pts,
    manager: a.manager ? toManagerId(a.manager) : undefined,
    avgRegret: a.avg_regret, totalRegret: a.total_regret,
    week: a.week,
    winner: a.winner ? toManagerId(a.winner) : undefined,
    loser: a.loser ? toManagerId(a.loser) : undefined,
    deficitOverAvg: a.deficit_before_MNF,
    winnerPts: a.winner_pts, loserPts: a.loser_pts, margin: a.margin,
    delta: a.delta, thisSeasonPts: a.this_season_pts, priorSeasonPts: a.prior_season_pts,
    pickOverall: a.pick_overall, ptsRank: a.pts_rank, draftPool: a.draft_pool, vor: a.vor,
    ppg: a.ppg, total: a.total, games: a.games,
    pf: a.pf, pfAvg: a.pf_avg,
    pos: a.pos, dominance: a.dominance, z: a.z, share: a.share, posBaseline: a.pos_baseline,
  }
}

function convertAllDivisionSlot(s: RawAllDivisionSlot): AllDivisionSlot {
  return { slot: s.slot, player: s.player, pos: s.pos, pts: s.pts, manager: s.manager ? toManagerId(s.manager) : null }
}

function convertAllDivisionTeam(t: RawAllDivisionTeam): AllDivisionTeam {
  return {
    label: t.label, managers: t.managers,
    firstTeam: t.firstTeam.map(convertAllDivisionSlot),
    secondTeam: t.secondTeam.map(convertAllDivisionSlot),
  }
}

function buildBowls(raw: Record<string, RawBowlMvp>): BowlCard[] {
  return Object.entries(raw).map(([key, b]) => ({
    key,
    bowl: b.bowl,
    bowlLabel: b.bowl_label,
    week: b.week,
    winnerManager: toManagerId(b.winner_manager),
    winnerTeam: b.winner_team,
    loserManager: toManagerId(b.loser_manager),
    loserTeam: b.loser_team,
    finalScore: b.final_score,
    mvp: b.mvp ? {
      player: b.mvp.player, position: b.mvp.position, points: b.mvp.points,
      manager: toManagerId(b.mvp.manager), team: b.mvp.team, side: b.mvp.side,
      seasonAvg: b.mvp.season_avg, deltaVsAvg: b.mvp.delta_vs_avg, type: b.mvp.type,
    } : null,
  }))
}

function buildOne(raw: RawSeasonDetail): SeasonDetail {
  const awardsTop5: Record<string, AwardFinalist[]> = {}
  const awardsPartial: string[] = []
  for (const [key, arr] of Object.entries(raw.awards_top5)) {
    awardsTop5[key] = arr.map((a, i) => convertFinalist(a, i + 1))
    if (!FULL_TOP5_AWARDS.has(key)) awardsPartial.push(key)
  }
  return {
    year: raw.year,
    standings: raw.standings.map(convertStanding),
    divisions: Object.fromEntries(
      Object.entries(raw.divisions).map(([d, rows]) => [d, rows.map(convertStanding)])
    ),
    bowls: buildBowls(raw.bowl_mvps),
    championsBracket: convertBracket(raw.champions_bracket),
    consolationBracket: convertBracket(raw.consolation_bracket),
    awardNames: raw.award_names,
    awardDescriptions: raw.award_descriptions ?? {},
    awardsTop5,
    awardsPartial,
    allDivision: raw.all_division ? {
      oconner: convertAllDivisionTeam(raw.all_division.oconner),
      toretto: convertAllDivisionTeam(raw.all_division.toretto),
    } : null,
  }
}

const SEASON_DETAILS: Record<number, SeasonDetail> = {}
for (const mod of Object.values(seasonFiles)) {
  const raw = mod.default as RawSeasonDetail
  SEASON_DETAILS[raw.year] = buildOne(raw)
}

export function getSeasonDetail(year: number): SeasonDetail | undefined {
  return SEASON_DETAILS[year]
}

export const SEASON_DETAIL_YEARS: number[] = Object.keys(SEASON_DETAILS).map(Number).sort((a, b) => a - b)
