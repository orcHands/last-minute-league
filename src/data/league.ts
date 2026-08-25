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
export type { FranchisePowerSeries, PowerRankPoint, PowerRankWeekLabel, PowerRankingRow, ManagerSegment, SeasonManagerPowerSeries, SeasonPowerRanking } from './build/powerRankings'
export type { DraftPosition, DraftPick, DraftPositionResult, DraftManagerValue, DraftReport } from './build/draftReports'
export type { ManagerSkillPoint, ManagerSkillMatrix } from './build/managerSkillMatrix'
export type { FranchiseDetail, FranchiseHomeVenue, FranchiseRecordSplit } from './build/franchiseDetails'
export type { FranchiseHonor, FranchiseHonorKind } from './build/franchiseHonors'
export type { FranchiseRingOfHonorEntry } from './build/franchiseRingOfHonor'
export type { FranchiseAnalytics, FranchiseAffinityRow, FranchiseAllTeam, FranchiseAllTeamGroup, FranchiseAllTeamSlot, FranchiseBenchRegret, FranchiseComebackRecord, FranchiseDraftPick, FranchiseDraftRound, FranchiseFinishPoint, FranchiseGameRecord, FranchisePlayerLeader, FranchisePosition, FranchiseRival, FranchiseSeasonPoints, FranchiseWaiverPick, FranchiseWeeklyScoring } from './build/franchiseAnalytics'
export type { DivisionKey } from './divisionCanon'
export type { TeamGameRecord, MatchupRecord, LeagueWeekRecord, ManagerSeasonRecord, PlayerGameRecord, PlayerSeasonRecord, ScoreAberration, WhispererRow, HallOfFameInductee, HallOfFameClass, RecordPosition, TeamGameRecordKey, MatchupRecordKey, LeagueWeekRecordKey, ManagerSeasonRecordKey } from './build/recordBook'
export type { StreakRecord, ScheduleRecord, BenchCareerRecord, BenchGameRecord, EscapeAct, PostseasonRecord, PostseasonPlayerTotal, PostseasonPlayerGame, PostseasonMultiplier, PostseasonGame, PostseasonLuck, BowlHistoryRow, DefenseRecord, DefenseGameRecord, TradeTree, TradeSide } from './build/expandedRecords'

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
export { getSeasonPowerRanking } from './build/powerRankings'
export { DRAFT_POSITIONS, DRAFT_REPORT_YEARS, getDraftReport } from './build/draftReports'
export { MANAGER_SKILL_MATRIX } from './build/managerSkillMatrix'
export { getFranchiseDetail } from './build/franchiseDetails'
export { FRANCHISE_HONORS, getFranchiseHonors } from './build/franchiseHonors'
export { FRANCHISE_RING_OF_HONOR, getFranchiseRingOfHonor } from './build/franchiseRingOfHonor'
export { getFranchiseAnalytics } from './build/franchiseAnalytics'
export { DIVISION_NAMES, canonicalDivisionName, divisionKey } from './divisionCanon'
export { LEAGUE_RECORD_BOOK, SCORE_ABERRATIONS, POSITION_WHISPERERS, RECORD_INSIGHT_METHOD, HALL_OF_FAME, RECORD_POSITIONS } from './build/recordBook'
export { EXPANDED_RECORDS } from './build/expandedRecords'
export { getSeasonDetail, SEASON_DETAIL_YEARS } from './build/seasonDetail'
export { FUTURE_SEASON, FUTURE_SEASON_BOWLS, FUTURE_SEASON_DIVISIONS, FUTURE_SEASON_DRAFT } from './build/futureSeason'
export type { FutureSeasonTeam, FutureSeasonDivision, FutureDraftPick, FutureDraftRound, FutureBowlSite } from './build/futureSeason'
export type { SeasonDetail, StandingRowDetail, BowlCard, BowlMvp, Bracket, BracketRound, BracketEntry, BracketWeather, AwardFinalist, AllDivision, AllDivisionTeam, AllDivisionSlot } from './build/seasonDetail'
