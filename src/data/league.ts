// Last Minute Fantasy League — real data, derived from data/processed/*.json
// (copied into src/data/processed/). See src/data/build/* for the transforms
// and src/data/managerCanon.ts for the manager-identity + placeholder layer
// (colors/team names are PLACEHOLDER pending Cowork's team_colors.json /
// team_names.json export — see CLAUDE.md).

export type { Manager, Franchise } from './build/managers'
export type { Season } from './build/seasons'
export type { GateTimelinePoint, MondayNightMiracle } from './build/mnm'
export type { PhaseEntry, BenchRegretEntry, NemesisEntry, FandomEntry } from './build/boards'
export type { StandingRow } from './build/leagueStats'
export type { H2HRecord } from './build/headToHead'
export type { FranchisePowerSeries, PowerRankPoint, PowerRankWeekLabel, PowerRankingRow, ManagerSegment } from './build/powerRankings'
export type { ManagerSkillPoint, ManagerSkillMatrix } from './build/managerSkillMatrix'

export interface LeaderboardEntry {
  rank: number
  managerId: string
  value: number
  label?: string
  context?: string
}

export { MANAGERS, getManager, ACTIVE_MANAGERS, FRANCHISES, getFranchise } from './build/managers'
export { SEASONS } from './build/seasons'
export { MONDAY_NIGHT_MIRACLES } from './build/mnm'
export { PHASE_SPLITS, BENCH_REGRET, NEMESIS_DATA, FANDOM_DATA } from './build/boards'
export { ALL_TIME_STANDINGS, ALL_TIME_FRANCHISE_STANDINGS, LEAGUE_STATS } from './build/leagueStats'
export { getH2H } from './build/headToHead'
export { FRANCHISE_POWER_SERIES, POWER_RANKING_WEEKS, POWER_RANKING_ROWS, POWER_RANKING_MAX_RANK } from './build/powerRankings'
export { MANAGER_SKILL_MATRIX } from './build/managerSkillMatrix'
export { getSeasonDetail, SEASON_DETAIL_YEARS } from './build/seasonDetail'
export type { SeasonDetail, StandingRowDetail, BowlCard, BowlMvp, Bracket, BracketRound, BracketEntry, BracketWeather, AwardFinalist, AllDivision, AllDivisionTeam, AllDivisionSlot } from './build/seasonDetail'
