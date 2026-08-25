import recordsJson from '../processed/records_expanded.json'

export interface ExpandedGameRef {
  season: number
  week: number
  opponent_id: string
  score: number
  opponent_score: number
  result?: string
}

export interface StreakRecord {
  manager_id: string
  games: number
  start: ExpandedGameRef
  end: ExpandedGameRef
}

export interface ScheduleRecord {
  manager_id: string
  games: number
  w: number
  l: number
  t: number
  actual_pct: number
  all_play_pct: number
  median_pct: number
  schedule_delta: number
}

export interface BenchCareerRecord {
  player: string
  position: string
  bench_points: number
  bench_games: number
  top_manager_id: string
  top_manager_points: number
}

export interface BenchGameRecord {
  season: number
  week: number
  manager_id: string
  opponent_id: string | null
  player: string
  position: string
  bench_points: number
}

export interface EscapeAct {
  season: number
  week: number
  manager_id: string
  opponent_id: string
  score: number
  opponent_score: number
  regret: number
  optimal: number
}

export interface PostseasonRecord {
  manager_id?: string
  franchise_id?: string
  games: number
  w: number
  l: number
  t: number
  win_pct: number
  points: number
  ppg: number
  points_against: number
}

export interface PostseasonPlayerTotal {
  player: string
  position: string
  points: number
  starts: number
  ppg: number
  top_manager_id: string
}

export interface PostseasonPlayerGame {
  season: number
  week: number
  manager_id: string
  opponent_id: string | null
  player: string
  position: string
  points: number
  bracket: string
}

export interface PostseasonMultiplier {
  manager_id: string
  regular_games: number
  postseason_games: number
  regular_ppg: number
  postseason_ppg: number
  delta: number
  multiplier: number
}

export interface PostseasonGame {
  season: number
  week: number
  bracket?: string
  label?: string
  winner_id: string
  loser_id: string
  winner_score: number
  loser_score: number
  margin?: number
  winner_seed?: number
  loser_seed?: number
  seed_delta?: number
  deficit?: number
  gate?: string
}

export interface PostseasonLuck {
  manager_id: string
  games: number
  actual_wins: number
  expected_wins: number
  luck_delta: number
}

export interface BowlMvpRecord {
  player: string
  position: string
  points: number
  manager: string
  team: string
  side: string
  season_avg: number
  delta_vs_avg: number
  type: string
}

export interface BowlHistoryRow {
  season: number
  week: number
  bowl: string
  winner_id: string
  winner_team: string
  winner_score: number
  runner_up_id: string
  runner_up_team: string
  runner_up_score: number
  mvp: BowlMvpRecord | null
  venue: string | null
  city: string | null
  state: string | null
  attendance: number | string | null
  attendance_value: number | null
  indoor: boolean
  weather: { low: number; cond: string; emoji: string } | null
}

export interface DefenseRecord {
  defense: string
  started_points: number
  starts: number
  started_ppg: number
  roster_weeks: number
  drafted_times: number
  earliest_draft: { overall: number; season: number; manager_id: string } | null
  waiver_adds: number
  top_waiver_manager_id: string | null
}

export interface DefenseGameRecord {
  defense: string
  season: number
  week: number
  manager_id: string
  points: number
}

export interface TradeSide {
  manager_id: string
  players: Array<{ player: string; first_week: number | null; started_points: number }>
  started_points: number
}

export interface TradeTree {
  season: number
  date: string
  sides: TradeSide[]
  total_started_points: number
}

interface ExpandedRecords {
  meta: { scope: string; schedule: string; postseason_expected: string; trade: string }
  streaks: { wins: StreakRecord[]; losses: StreakRecord[] }
  schedule_robbery: ScheduleRecord[]
  bench_mob: {
    career: BenchCareerRecord[]
    single_games: BenchGameRecord[]
    escape_acts: EscapeAct[]
    perfect_lineups: Array<{ manager_id: string; perfect_weeks: number }>
  }
  postseason: {
    manager_records: PostseasonRecord[]
    franchise_records: PostseasonRecord[]
    manager_records_by_bracket: Record<'Championship' | 'Consolation', PostseasonRecord[]>
    franchise_records_by_bracket: Record<'Championship' | 'Consolation', PostseasonRecord[]>
    player_totals: PostseasonPlayerTotal[]
    single_games_by_position: Record<string, PostseasonPlayerGame[]>
    multipliers: PostseasonMultiplier[]
    unlucky: PostseasonLuck[]
    greatest_comebacks: PostseasonGame[]
    tightest_games: PostseasonGame[]
    biggest_blowouts: PostseasonGame[]
    upsets: PostseasonGame[]
    bowls: Record<string, BowlHistoryRow[]>
    coldest_bowls: BowlHistoryRow[]
    warmest_bowls: BowlHistoryRow[]
    most_attended_bowls: BowlHistoryRow[]
    host_leaders: Array<{ location: string; games: number }>
  }
  defenses: { teams: DefenseRecord[]; single_games: DefenseGameRecord[] }
  trade_trees: TradeTree[]
}

export const EXPANDED_RECORDS = recordsJson as unknown as ExpandedRecords
