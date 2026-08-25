import recordsJson from '../processed/records_board.json'
import hallJson from '../processed/hall_of_fame.json'
import insightsJson from '../processed/league_record_insights.json'
import { normalizeManager } from '../managerCanon'
import { withBase } from '../../lib/assetPath'

export const RECORD_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'] as const
export type RecordPosition = (typeof RECORD_POSITIONS)[number]

export type TeamGameRecordKey =
  | 'highest_score'
  | 'lowest_score'
  | 'biggest_blowout'
  | 'most_points_in_a_loss'
  | 'fewest_points_in_a_win'

export type MatchupRecordKey =
  | 'highest_combined'
  | 'lowest_combined'
  | 'closest'
  | 'biggest_margin'

export type LeagueWeekRecordKey = 'highest_scoring_week' | 'lowest_scoring_week'
export type ManagerSeasonRecordKey = 'most_points' | 'fewest_points' | 'best_ppg'

export interface TeamGameRecord {
  season: number
  week: number
  managerId: string
  opponentId: string
  points: number
  opponentPoints: number
  margin: number
  won: boolean
}

export interface MatchupRecord {
  season: number
  week: number
  winnerId: string
  loserId: string
  combined: number
  margin: number
  winnerPoints: number
  loserPoints: number
}

export interface LeagueWeekRecord {
  season: number
  week: number
  points: number
}

export interface ManagerSeasonRecord {
  managerId: string
  season: number
  points: number
  games: number
  ppg: number
}

export interface PlayerGameRecord {
  season: number
  week: number
  managerId: string
  player: string
  position: RecordPosition
  points: number
}

export interface PlayerSeasonRecord {
  player: string
  season: number
  position: RecordPosition
  managerId: string
  points: number
}

interface RawTeamGameRecord {
  season: number; week: number; manager: string; opponent: string
  pts: number; opp_pts: number; margin: number; won: boolean
}

interface RawMatchupRecord {
  season: number; week: number; winner: string; loser: string
  combined: number; margin: number; winner_pts: number; loser_pts: number
}

interface RawLeagueWeekRecord { season: number; week: number; pts: number }
interface RawManagerSeasonRecord { manager: string; season: number; pts: number; games: number; ppg: number }
interface RawPlayerGameRecord { season: number; week: number; manager: string; player: string; pos: RecordPosition; pts: number }
interface RawPlayerSeasonRecord { player: string; season: number; pos: RecordPosition; manager: string; pts: number }

interface RawRecordBook {
  scope: string
  team_game: Record<TeamGameRecordKey, RawTeamGameRecord[]>
  matchup: Record<MatchupRecordKey, RawMatchupRecord[]>
  league_week: Record<LeagueWeekRecordKey, RawLeagueWeekRecord[]>
  manager_season: Record<ManagerSeasonRecordKey, RawManagerSeasonRecord[]>
  player_game_overall: RawPlayerGameRecord[]
  player_season_overall: RawPlayerSeasonRecord[]
  by_position: Record<RecordPosition, {
    single_game: RawPlayerGameRecord[]
    single_season: RawPlayerSeasonRecord[]
  }>
}

const rawRecords = recordsJson as unknown as RawRecordBook

function teamGame(row: RawTeamGameRecord): TeamGameRecord {
  return {
    season: row.season,
    week: row.week,
    managerId: normalizeManager(row.manager),
    opponentId: normalizeManager(row.opponent),
    points: row.pts,
    opponentPoints: row.opp_pts,
    margin: row.margin,
    won: row.won,
  }
}

function matchup(row: RawMatchupRecord): MatchupRecord {
  return {
    season: row.season,
    week: row.week,
    winnerId: normalizeManager(row.winner),
    loserId: normalizeManager(row.loser),
    combined: row.combined,
    margin: row.margin,
    winnerPoints: row.winner_pts,
    loserPoints: row.loser_pts,
  }
}

function managerSeason(row: RawManagerSeasonRecord): ManagerSeasonRecord {
  return {
    managerId: normalizeManager(row.manager),
    season: row.season,
    points: row.pts,
    games: row.games,
    ppg: row.ppg,
  }
}

function playerGame(row: RawPlayerGameRecord): PlayerGameRecord {
  return {
    season: row.season,
    week: row.week,
    managerId: normalizeManager(row.manager),
    player: row.player,
    position: row.pos,
    points: row.pts,
  }
}

function playerSeason(row: RawPlayerSeasonRecord): PlayerSeasonRecord {
  return {
    player: row.player,
    season: row.season,
    position: row.pos,
    managerId: normalizeManager(row.manager),
    points: row.pts,
  }
}

export const LEAGUE_RECORD_BOOK = {
  scope: rawRecords.scope,
  teamGame: Object.fromEntries(
    Object.entries(rawRecords.team_game).map(([key, rows]) => [key, rows.map(teamGame)]),
  ) as Record<TeamGameRecordKey, TeamGameRecord[]>,
  matchup: Object.fromEntries(
    Object.entries(rawRecords.matchup).map(([key, rows]) => [key, rows.map(matchup)]),
  ) as Record<MatchupRecordKey, MatchupRecord[]>,
  leagueWeek: Object.fromEntries(
    Object.entries(rawRecords.league_week).map(([key, rows]) => [key, rows.map(row => ({
      season: row.season, week: row.week, points: row.pts,
    }))]),
  ) as Record<LeagueWeekRecordKey, LeagueWeekRecord[]>,
  managerSeason: Object.fromEntries(
    Object.entries(rawRecords.manager_season).map(([key, rows]) => [key, rows.map(managerSeason)]),
  ) as Record<ManagerSeasonRecordKey, ManagerSeasonRecord[]>,
  playerGameOverall: rawRecords.player_game_overall.map(playerGame),
  playerSeasonOverall: rawRecords.player_season_overall.map(playerSeason),
  byPosition: Object.fromEntries(RECORD_POSITIONS.map(position => [position, {
    singleGame: rawRecords.by_position[position].single_game.map(playerGame),
    singleSeason: rawRecords.by_position[position].single_season.map(playerSeason),
  }])) as Record<RecordPosition, { singleGame: PlayerGameRecord[]; singleSeason: PlayerSeasonRecord[] }>,
}

export interface ScoreAberration {
  rank: number
  season: number
  week: number
  managerId: string
  opponentId: string
  score: number
  opponentScore: number
  margin: number
  seasonMean: number
  zScore: number
  direction: 'high' | 'low'
}

export interface WhispererRow {
  rank: number
  managerId: string
  score: number
  draftPercentile: number
  waiverPercentile: number
  lineupPercentile: number
  draftValuePerSeason: number
  waiverPointsPerSeason: number
  lineupEfficiency: number
  draftPicks: number
  waiverStarts: number
  lineupWeeks: number
  seasons: number
}

interface RawInsights {
  scope: string
  aberration_method: string
  whisperer_method: {
    weights: { draft: number; waiver: number; lineup: number }
    draft: string
    waiver: string
    lineup: string
    eligibility: string
  }
  aberrations: Array<{
    rank: number; season: number; week: number; manager_id: string; opponent_id: string
    score: number; opponent_score: number; margin: number; season_mean: number
    z_score: number; direction: 'high' | 'low'
  }>
  whisperers: Record<RecordPosition, Array<{
    rank: number; manager_id: string; score: number
    draft_percentile: number; waiver_percentile: number; lineup_percentile: number
    draft_value_per_season: number; waiver_pts_per_season: number; lineup_efficiency: number
    draft_picks: number; waiver_starts: number; lineup_weeks: number; seasons: number
  }>>
}

const rawInsights = insightsJson as unknown as RawInsights

export const SCORE_ABERRATIONS: ScoreAberration[] = rawInsights.aberrations.map(row => ({
  rank: row.rank,
  season: row.season,
  week: row.week,
  managerId: row.manager_id,
  opponentId: row.opponent_id,
  score: row.score,
  opponentScore: row.opponent_score,
  margin: row.margin,
  seasonMean: row.season_mean,
  zScore: row.z_score,
  direction: row.direction,
}))

export const POSITION_WHISPERERS = Object.fromEntries(RECORD_POSITIONS.map(position => [
  position,
  rawInsights.whisperers[position].map((row): WhispererRow => ({
    rank: row.rank,
    managerId: row.manager_id,
    score: row.score,
    draftPercentile: row.draft_percentile,
    waiverPercentile: row.waiver_percentile,
    lineupPercentile: row.lineup_percentile,
    draftValuePerSeason: row.draft_value_per_season,
    waiverPointsPerSeason: row.waiver_pts_per_season,
    lineupEfficiency: row.lineup_efficiency,
    draftPicks: row.draft_picks,
    waiverStarts: row.waiver_starts,
    lineupWeeks: row.lineup_weeks,
    seasons: row.seasons,
  })),
])) as Record<RecordPosition, WhispererRow[]>

export const RECORD_INSIGHT_METHOD = {
  scope: rawInsights.scope,
  aberration: rawInsights.aberration_method,
  whisperer: rawInsights.whisperer_method,
}

export interface HallOfFameInductee {
  player: string
  position: string
  careerPoints: number
  careerGames: number
  ppg: number
  seasons: number[]
  bestSeason: number
  bestSeasonPoints: number
  topManagerId: string
  topManagerPoints: number
  finalNflSeason: number
  eligibleFrom: number
  waitedYears: number
  portrait: string
}

export interface HallOfFameClass {
  year: number
  eligibleCount: number
  rolledOver: number
  inductees: HallOfFameInductee[]
}

interface RawHall {
  rule: { class_size: number; eligibility_lag_years: number; min_career_pts: number; current_year: number }
  classes: Array<{
    year: number; eligible_count: number; rolled_over: number
    inductees: Array<{
      player: string; pos: string; career_pts: number; career_games: number; ppg: number
      seasons: number[]; best_season: number; best_season_pts: number
      top_manager: string; top_manager_pts: number; final_nfl_season: number
      eligible_from: number; waited_years: number
    }>
  }>
  on_the_ballot: unknown[]
  not_yet_eligible: unknown[]
}

const rawHall = hallJson as unknown as RawHall

function portraitFile(player: string): string {
  const slug = player
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return withBase(`images/player_portraits/${slug}.png`)
}

export const HALL_OF_FAME = {
  rule: {
    classSize: rawHall.rule.class_size,
    eligibilityLagYears: rawHall.rule.eligibility_lag_years,
    minCareerPoints: rawHall.rule.min_career_pts,
    currentYear: rawHall.rule.current_year,
  },
  ballotCount: rawHall.on_the_ballot.length,
  notYetEligibleCount: rawHall.not_yet_eligible.length,
  classes: rawHall.classes.map((hallClass): HallOfFameClass => ({
    year: hallClass.year,
    eligibleCount: hallClass.eligible_count,
    rolledOver: hallClass.rolled_over,
    inductees: hallClass.inductees.map(inductee => ({
      player: inductee.player,
      position: inductee.pos,
      careerPoints: inductee.career_pts,
      careerGames: inductee.career_games,
      ppg: inductee.ppg,
      seasons: inductee.seasons,
      bestSeason: inductee.best_season,
      bestSeasonPoints: inductee.best_season_pts,
      topManagerId: normalizeManager(inductee.top_manager),
      topManagerPoints: inductee.top_manager_pts,
      finalNflSeason: inductee.final_nfl_season,
      eligibleFrom: inductee.eligible_from,
      waitedYears: inductee.waited_years,
      portrait: portraitFile(inductee.player),
    })),
  })),
}
