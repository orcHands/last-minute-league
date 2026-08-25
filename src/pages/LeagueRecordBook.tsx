import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AssetImage from '../components/AssetImage'
import {
  ALL_TIME_FRANCHISE_STANDINGS,
  ALL_TIME_STANDINGS,
  HALL_OF_FAME,
  EXPANDED_RECORDS,
  LEAGUE_RECORD_BOOK,
  LEAGUE_STATS,
  POSITION_WHISPERERS,
  RECORD_INSIGHT_METHOD,
  RECORD_POSITIONS,
  SCORE_ABERRATIONS,
  getFranchise,
  getManager,
  type HallOfFameInductee,
  type LeagueWeekRecord,
  type ManagerSeasonRecord,
  type MatchupRecord,
  type PlayerGameRecord,
  type PlayerSeasonRecord,
  type RecordPosition,
  type ScoreAberration,
  type StandingRow,
  type TeamGameRecord,
  type BenchCareerRecord,
  type BenchGameRecord,
  type EscapeAct,
  type ScheduleRecord,
  type StreakRecord,
  type TradeTree,
} from '../data/league'

const POSITION_COLORS: Record<RecordPosition, string> = {
  QB: '#4589ff', RB: '#42be65', WR: '#f1c21b', TE: '#ff832b', K: '#8d8d8d', DEF: '#8a3ffc',
}

const TEAM_GAME_LABELS = {
  highest_score: ['Highest score', 'The biggest team totals ever posted.'],
  lowest_score: ['Lowest score', 'The weeks everyone would rather leave on tape.'],
  biggest_blowout: ['Biggest blowout', 'Largest victory margins in league history.'],
  most_points_in_a_loss: ['Most points in a loss', 'Great weeks wasted by an even greater opponent.'],
  fewest_points_in_a_win: ['Fewest points in a win', 'Winning ugly is still winning.'],
} as const

const MATCHUP_LABELS = {
  highest_combined: ['Highest combined', 'The loudest two-team shootouts.'],
  lowest_combined: ['Lowest combined', 'Games played in statistical mud.'],
  closest: ['Closest games', 'Ties and finishes measured in hundredths.'],
  biggest_margin: ['Biggest margin', 'The widest final gaps.'],
} as const

const WEEK_LABELS = {
  highest_scoring_week: ['Highest-scoring league weeks', 'Every team, every point, one enormous week.'],
  lowest_scoring_week: ['Lowest-scoring league weeks', 'League-wide offensive outages.'],
} as const

const SEASON_LABELS = {
  most_points: ['Most Started Points', 'Full-season team totals, playoffs included.'],
  fewest_points: ['Fewest Started Points', 'Full-season team totals, playoffs included.'],
  best_ppg: ['Best Started Points per game', 'The fairest peak-season comparison across schedule lengths.'],
} as const

const RECORD_GROUPS = [
  { id: 'all-time', label: 'All-time' },
  { id: 'team-games', label: 'Team games' },
  { id: 'matchups', label: 'Matchups' },
  { id: 'league-weeks', label: 'League weeks' },
  { id: 'manager-seasons', label: 'Manager seasons' },
  { id: 'players', label: 'Players' },
  { id: 'positions', label: 'By position' },
  { id: 'streaks', label: 'Ironman & spiral' },
  { id: 'schedule', label: 'Schedule robbery' },
  { id: 'bench-mob', label: 'Bench Mob' },
  { id: 'trades', label: 'Trade trees' },
] as const

type RecordGroup = (typeof RECORD_GROUPS)[number]['id']

const mono: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontVariantNumeric: 'tabular-nums',
}

function managerName(id: string | null | undefined): string {
  return id ? getManager(id)?.name ?? id : '—'
}

function franchiseName(id: string): string {
  return getFranchise(id)?.nickname ?? id
}

function signed(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
}

function seasonLabel(season: number): string {
  return `${season}${season === 2013 || season === 2020 ? '*' : ''}`
}

function SeasonWeek({ season, week }: { season: number; week?: number }) {
  return (
    <Link to={`/seasons/${season}`} style={{ color: '#78a9ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {seasonLabel(season)}{week === undefined ? '' : ` · W${week}`}
    </Link>
  )
}

function ManagerName({ id }: { id: string }) {
  const manager = getManager(id)
  if (!manager) return <>{id}</>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <AssetImage
        src={manager.logoSmall}
        alt=""
        size={20}
        fallback={<span style={{ width: 20, color: manager.primaryColor, ...mono }}>{manager.name.slice(0, 2).toUpperCase()}</span>}
      />
      {manager.name}
    </span>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8d8d8d', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <div style={{ marginBottom: 20, maxWidth: 860 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ margin: '0 0 8px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 20, lineHeight: '28px', fontWeight: 400, color: '#f4f4f4' }}>
        {title}
      </h2>
      <p style={{ margin: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '20px', color: '#a8a8a8' }}>
        {detail}
      </p>
    </div>
  )
}

interface Column<T> {
  label: string
  render: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'right'
  width?: number | string
}

function RankedTable<T>({ rows, columns, keyFor, empty = 'No matching records.' }: {
  rows: T[]
  columns: Column<T>[]
  keyFor: (row: T, index: number) => string
  empty?: string
}) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', ...mono }}>
        <thead>
          <tr>
            <th style={{ width: 44, padding: '8px 12px', textAlign: 'right', color: '#6f6f6f', fontSize: 12, fontWeight: 400, borderBottom: '1px solid #393939' }}>#</th>
            {columns.map(column => (
              <th key={column.label} style={{
                width: column.width, padding: '8px 12px', textAlign: column.align ?? 'left', color: '#8d8d8d',
                fontSize: 12, lineHeight: '16px', fontWeight: 400, borderBottom: '1px solid #393939', whiteSpace: 'nowrap',
              }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={keyFor(row, index)}>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: index < 3 ? '#f1c21b' : '#6f6f6f', fontSize: 14, borderBottom: '1px solid #2e2e2e' }}>
                {index + 1}
              </td>
              {columns.map(column => (
                <td key={column.label} style={{
                  padding: '10px 12px', textAlign: column.align ?? 'left', color: '#f4f4f4', fontSize: 14,
                  lineHeight: '18px', borderBottom: '1px solid #2e2e2e', whiteSpace: 'nowrap',
                }}>
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} style={{ padding: 24, color: '#8d8d8d', fontSize: 14, textAlign: 'center' }}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RecordPanel({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #393939', backgroundColor: '#1c1c1c', minWidth: 0 }}>
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid #393939' }}>
        <h3 style={{ margin: '0 0 4px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, lineHeight: '22px', fontWeight: 600, color: '#f4f4f4' }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d' }}>{detail}</p>
      </div>
      {children}
    </section>
  )
}

function contains(search: string, ...values: Array<string | number | boolean>): boolean {
  if (!search) return true
  return values.join(' ').toLowerCase().includes(search)
}

function AllTimeTables({ search }: { search: string }) {
  const managers = ALL_TIME_STANDINGS.filter(row => contains(search, managerName(row.id), row.w, row.l, row.pf, row.championships))
  const franchises = ALL_TIME_FRANCHISE_STANDINGS.filter(row => contains(search, franchiseName(row.id), row.w, row.l, row.pf, row.championships))
  const columns: Column<StandingRow>[] = [
    { label: 'Name', render: row => row.id.includes('-') || getFranchise(row.id) ? franchiseName(row.id) : <ManagerName id={row.id} /> },
    { label: 'W–L', align: 'right', render: row => `${row.w}–${row.l}` },
    { label: 'Win %', align: 'right', render: row => `${(row.pct * 100).toFixed(1)}%` },
    { label: 'Started Points', align: 'right', render: row => row.pf.toLocaleString(undefined, { maximumFractionDigits: 1 }) },
    { label: 'Rings', align: 'right', render: row => row.championships },
  ]
  const managerColumns: Column<StandingRow>[] = columns.map((column, index) =>
    index === 0 ? { ...column, render: (row: StandingRow) => <ManagerName id={row.id} /> } : column,
  )
  const franchiseColumns: Column<StandingRow>[] = columns.map((column, index) =>
    index === 0 ? { ...column, render: (row: StandingRow) => franchiseName(row.id) } : column,
  )
  return (
    <div className="record-panel-grid">
      <RecordPanel title="All-time manager table" detail="Managers with at least 20 games, ranked by win percentage.">
        <RankedTable rows={managers} columns={managerColumns} keyFor={row => row.id} />
      </RecordPanel>
      <RecordPanel title="All-time franchise table" detail="Every continuity chain, all owners blended together.">
        <RankedTable rows={franchises} columns={franchiseColumns} keyFor={row => row.id} />
      </RecordPanel>
    </div>
  )
}

function TeamGameTables({ search }: { search: string }) {
  return (
    <div className="record-panel-grid">
      {Object.entries(TEAM_GAME_LABELS).map(([key, copy]) => {
        const rows = LEAGUE_RECORD_BOOK.teamGame[key as keyof typeof LEAGUE_RECORD_BOOK.teamGame]
          .filter(row => contains(search, managerName(row.managerId), managerName(row.opponentId), row.season, row.week, row.points, row.opponentPoints))
        return (
          <RecordPanel key={key} title={copy[0]} detail={copy[1]}>
            <RankedTable<TeamGameRecord>
              rows={rows}
              keyFor={(row, index) => `${row.season}-${row.week}-${row.managerId}-${index}`}
              columns={[
                { label: 'Manager', render: row => <ManagerName id={row.managerId} /> },
                { label: 'Score', align: 'right', render: row => row.points.toFixed(2) },
                { label: 'Opponent', render: row => managerName(row.opponentId) },
                { label: 'Final', align: 'right', render: row => `${row.points.toFixed(2)}–${row.opponentPoints.toFixed(2)}` },
                { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
              ]}
            />
          </RecordPanel>
        )
      })}
    </div>
  )
}

function MatchupTables({ search }: { search: string }) {
  return (
    <div className="record-panel-grid">
      {Object.entries(MATCHUP_LABELS).map(([key, copy]) => {
        const rows = LEAGUE_RECORD_BOOK.matchup[key as keyof typeof LEAGUE_RECORD_BOOK.matchup]
          .filter(row => contains(search, managerName(row.winnerId), managerName(row.loserId), row.season, row.week, row.combined, row.margin))
        return (
          <RecordPanel key={key} title={copy[0]} detail={copy[1]}>
            <RankedTable<MatchupRecord>
              rows={rows}
              keyFor={(row, index) => `${row.season}-${row.week}-${row.winnerId}-${index}`}
              columns={[
                { label: 'Matchup', render: row => <><span style={{ color: '#f4f4f4' }}>{managerName(row.winnerId)}</span><span style={{ color: '#6f6f6f' }}> vs </span>{managerName(row.loserId)}</> },
                { label: 'Final', align: 'right', render: row => `${row.winnerPoints.toFixed(2)}–${row.loserPoints.toFixed(2)}` },
                { label: 'Combined', align: 'right', render: row => row.combined.toFixed(2) },
                { label: 'Margin', align: 'right', render: row => row.margin.toFixed(2) },
                { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
              ]}
            />
          </RecordPanel>
        )
      })}
    </div>
  )
}

function LeagueWeekTables({ search }: { search: string }) {
  return (
    <div className="record-panel-grid">
      {Object.entries(WEEK_LABELS).map(([key, copy]) => {
        const rows = LEAGUE_RECORD_BOOK.leagueWeek[key as keyof typeof LEAGUE_RECORD_BOOK.leagueWeek]
          .filter(row => contains(search, row.season, row.week, row.points))
        return (
          <RecordPanel key={key} title={copy[0]} detail={copy[1]}>
            <RankedTable<LeagueWeekRecord>
              rows={rows}
              keyFor={(row, index) => `${row.season}-${row.week}-${index}`}
              columns={[
                { label: 'When', render: row => <SeasonWeek season={row.season} week={row.week} /> },
                { label: 'League Started Points', align: 'right', render: row => row.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
              ]}
            />
          </RecordPanel>
        )
      })}
    </div>
  )
}

function ManagerSeasonTables({ search }: { search: string }) {
  return (
    <div className="record-panel-grid">
      {Object.entries(SEASON_LABELS).map(([key, copy]) => {
        const rows = LEAGUE_RECORD_BOOK.managerSeason[key as keyof typeof LEAGUE_RECORD_BOOK.managerSeason]
          .filter(row => contains(search, managerName(row.managerId), row.season, row.points, row.games, row.ppg))
        return (
          <RecordPanel key={key} title={copy[0]} detail={copy[1]}>
            <RankedTable<ManagerSeasonRecord>
              rows={rows}
              keyFor={(row, index) => `${row.managerId}-${row.season}-${index}`}
              columns={[
                { label: 'Manager', render: row => <ManagerName id={row.managerId} /> },
                { label: 'Season', align: 'right', render: row => <SeasonWeek season={row.season} /> },
                { label: 'Started Points', align: 'right', render: row => row.points.toFixed(2) },
                { label: 'Games', align: 'right', render: row => row.games },
                { label: 'PPG', align: 'right', render: row => row.ppg.toFixed(2) },
              ]}
            />
          </RecordPanel>
        )
      })}
    </div>
  )
}

function PlayerTables({ search }: { search: string }) {
  const gameRows = LEAGUE_RECORD_BOOK.playerGameOverall.filter(row => contains(search, row.player, row.position, managerName(row.managerId), row.season, row.week, row.points))
  const seasonRows = LEAGUE_RECORD_BOOK.playerSeasonOverall.filter(row => contains(search, row.player, row.position, managerName(row.managerId), row.season, row.points))
  return (
    <div className="record-panel-grid">
      <RecordPanel title="Best player games" detail="Top 25 single-game Started Points performances, all positions.">
        <RankedTable<PlayerGameRecord>
          rows={gameRows}
          keyFor={(row, index) => `${row.player}-${row.season}-${row.week}-${index}`}
          columns={[
            { label: 'Player', render: row => row.player },
            { label: 'Pos', render: row => <span style={{ color: POSITION_COLORS[row.position] }}>{row.position === 'DEF' ? 'D/ST' : row.position}</span> },
            { label: 'Manager', render: row => managerName(row.managerId) },
            { label: 'Started Points', align: 'right', render: row => row.points.toFixed(2) },
            { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
          ]}
        />
      </RecordPanel>
      <RecordPanel title="Best player seasons" detail="Top 25 full-season Started Points totals, playoffs included.">
        <RankedTable<PlayerSeasonRecord>
          rows={seasonRows}
          keyFor={(row, index) => `${row.player}-${row.season}-${index}`}
          columns={[
            { label: 'Player', render: row => row.player },
            { label: 'Pos', render: row => <span style={{ color: POSITION_COLORS[row.position] }}>{row.position === 'DEF' ? 'D/ST' : row.position}</span> },
            { label: 'Manager', render: row => managerName(row.managerId) },
            { label: 'Started Points', align: 'right', render: row => row.points.toFixed(2) },
            { label: 'Season', align: 'right', render: row => <SeasonWeek season={row.season} /> },
          ]}
        />
      </RecordPanel>
    </div>
  )
}

function PositionTables({ search }: { search: string }) {
  const [position, setPosition] = useState<RecordPosition>('QB')
  const records = LEAGUE_RECORD_BOOK.byPosition[position]
  const gameRows = records.singleGame.filter(row => contains(search, row.player, managerName(row.managerId), row.season, row.week, row.points))
  const seasonRows = records.singleSeason.filter(row => contains(search, row.player, managerName(row.managerId), row.season, row.points))
  return (
    <div>
      <div style={{ display: 'flex', gap: 1, overflowX: 'auto', marginBottom: 16 }}>
        {RECORD_POSITIONS.map(item => (
          <button key={item} onClick={() => setPosition(item)} style={{
            border: '1px solid #393939', borderTop: `3px solid ${position === item ? POSITION_COLORS[item] : '#393939'}`,
            backgroundColor: position === item ? '#262626' : '#1c1c1c', color: position === item ? '#f4f4f4' : '#a8a8a8',
            padding: '10px 18px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, whiteSpace: 'nowrap',
          }}>
            {item === 'DEF' ? 'D/ST' : item}
          </button>
        ))}
      </div>
      <div className="record-panel-grid">
        <RecordPanel title={`${position === 'DEF' ? 'D/ST' : position} single-game records`} detail="The position's biggest individual weeks.">
          <RankedTable<PlayerGameRecord>
            rows={gameRows}
            keyFor={(row, index) => `${row.player}-${row.season}-${row.week}-${index}`}
            columns={[
              { label: 'Player', render: row => row.player },
              { label: 'Manager', render: row => managerName(row.managerId) },
              { label: 'Started Points', align: 'right', render: row => row.points.toFixed(2) },
              { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
            ]}
          />
        </RecordPanel>
        <RecordPanel title={`${position === 'DEF' ? 'D/ST' : position} single-season records`} detail="The position's largest full-season totals.">
          <RankedTable<PlayerSeasonRecord>
            rows={seasonRows}
            keyFor={(row, index) => `${row.player}-${row.season}-${index}`}
            columns={[
              { label: 'Player', render: row => row.player },
              { label: 'Manager', render: row => managerName(row.managerId) },
              { label: 'Started Points', align: 'right', render: row => row.points.toFixed(2) },
              { label: 'Season', align: 'right', render: row => <SeasonWeek season={row.season} /> },
            ]}
          />
        </RecordPanel>
      </div>
    </div>
  )
}

function AberrationTable({ search }: { search: string }) {
  const rows = SCORE_ABERRATIONS.filter(row => contains(search, managerName(row.managerId), managerName(row.opponentId), row.season, row.week, row.score, row.zScore))
  return (
    <RecordPanel title="Biggest single-game aberrations" detail="Era-adjusted extremes: distance from that season's scoring environment, not just raw points.">
      <RankedTable<ScoreAberration>
        rows={rows}
        keyFor={row => `${row.rank}-${row.season}-${row.week}-${row.managerId}`}
        columns={[
          { label: 'Manager', render: row => <ManagerName id={row.managerId} /> },
          { label: 'Score', align: 'right', render: row => row.score.toFixed(2) },
          { label: 'Season avg', align: 'right', render: row => row.seasonMean.toFixed(2) },
          { label: 'Aberration', align: 'right', render: row => <span style={{ color: row.direction === 'high' ? '#42be65' : '#ff8389' }}>{signed(row.zScore)}σ</span> },
          { label: 'Opponent', render: row => `${managerName(row.opponentId)} (${row.opponentScore.toFixed(2)})` },
          { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
        ]}
      />
    </RecordPanel>
  )
}

function WhispererBoard() {
  return (
    <div className="whisperer-grid">
      {RECORD_POSITIONS.map(position => {
        const rows = POSITION_WHISPERERS[position]
        const winner = rows[0]
        const manager = getManager(winner.managerId)
        return (
          <article key={position} style={{ border: '1px solid #393939', borderTop: `4px solid ${POSITION_COLORS[position]}`, backgroundColor: '#1c1c1c', minWidth: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #393939' }}>
              <Eyebrow>{position === 'DEF' ? 'D/ST' : position} Whisperer</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {manager && <AssetImage src={manager.logoSmall} alt="" size={36} fallback={null} />}
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: '#f4f4f4', fontSize: 20, lineHeight: '28px' }}>{managerName(winner.managerId)}</div>
                  <div style={{ color: '#f1c21b', fontSize: 16, lineHeight: '22px', ...mono }}>{winner.score.toFixed(1)} / 100</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #393939' }}>
              {[
                ['Draft', winner.draftPercentile], ['Waiver', winner.waiverPercentile], ['Lineup', winner.lineupPercentile],
              ].map(([label, value], index) => (
                <div key={String(label)} style={{ padding: '12px 8px', textAlign: 'center', borderRight: index < 2 ? '1px solid #393939' : undefined }}>
                  <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px', fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</div>
                  <div style={{ color: '#f4f4f4', fontSize: 14, lineHeight: '18px', ...mono }}>{Number(value).toFixed(0)}th</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 16px 12px' }}>
              {rows.slice(1, 4).map(row => (
                <div key={row.managerId} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 8, padding: '5px 0', color: '#c6c6c6', fontSize: 12, lineHeight: '16px', ...mono }}>
                  <span style={{ color: '#6f6f6f' }}>#{row.rank}</span><span>{managerName(row.managerId)}</span><span>{row.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PortraitFallback({ player, position }: { player: string; position: string }) {
  const initials = player.split(/\s+/).map(part => part[0]).join('').slice(0, 3).toUpperCase()
  const color = POSITION_COLORS[(position === 'DST' ? 'DEF' : position) as RecordPosition] ?? '#8d8d8d'
  return (
    <div style={{ width: 69, height: 50, display: 'grid', placeItems: 'center', backgroundColor: '#262626', borderLeft: `4px solid ${color}`, color: '#f4f4f4', fontSize: 14, ...mono }} aria-label={`${player} portrait placeholder`}>
      {initials}
    </div>
  )
}

function HallCard({ inductee }: { inductee: HallOfFameInductee }) {
  return (
    <article style={{ border: '1px solid #393939', backgroundColor: '#1c1c1c', padding: 16, display: 'grid', gridTemplateColumns: '69px minmax(0, 1fr)', gap: 14 }}>
      <AssetImage
        src={inductee.portrait}
        alt={`${inductee.player} portrait`}
        width={69}
        height={50}
        fallback={<PortraitFallback player={inductee.player} position={inductee.position} />}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <h4 style={{ margin: 0, color: '#f4f4f4', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, lineHeight: '22px', fontWeight: 600 }}>{inductee.player}</h4>
          <span style={{ color: POSITION_COLORS[(inductee.position === 'DST' ? 'DEF' : inductee.position) as RecordPosition] ?? '#8d8d8d', fontSize: 12, ...mono }}>{inductee.position === 'DEF' ? 'D/ST' : inductee.position}</span>
        </div>
        <div style={{ color: '#a8a8a8', fontSize: 12, lineHeight: '16px', marginTop: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Best with {managerName(inductee.topManagerId)} · {inductee.bestSeason} peak
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #2e2e2e', paddingTop: 10 }}>
        {[
          ['Started Points', inductee.careerPoints.toFixed(2)], ['Starts', String(inductee.careerGames)], ['PPG', inductee.ppg.toFixed(2)],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ color: '#6f6f6f', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>{label}</div>
            <div style={{ color: '#f4f4f4', fontSize: 14, lineHeight: '18px', ...mono }}>{value}</div>
          </div>
        ))}
      </div>
    </article>
  )
}

function HallOfFame() {
  return (
    <section style={{ paddingTop: 64 }}>
      <SectionHeading
        eyebrow="The bottom of the book"
        title="Last Minute League Hall of Fame"
        detail={`Retired for at least ${HALL_OF_FAME.rule.eligibilityLagYears} years, at least ${HALL_OF_FAME.rule.minCareerPoints} career Started Points, and no more than ${HALL_OF_FAME.rule.classSize} inductees per class. Empty years are skipped; unfinished ballots roll forward.`}
      />
      <div style={{ display: 'flex', gap: 1, marginBottom: 24, overflowX: 'auto' }}>
        {[
          ['First class', String(HALL_OF_FAME.classes[0]?.year ?? '—')],
          ['Classes', String(HALL_OF_FAME.classes.length)],
          ['On the ballot', String(HALL_OF_FAME.ballotCount)],
          ['Not yet eligible', String(HALL_OF_FAME.notYetEligibleCount)],
        ].map(([label, value]) => (
          <div key={label} style={{ minWidth: 160, flex: 1, padding: 16, backgroundColor: '#262626', borderTop: '3px solid #f1c21b' }}>
            <div style={{ color: '#8d8d8d', fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</div>
            <div style={{ color: '#f4f4f4', fontSize: 20, lineHeight: '28px', ...mono }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 32 }}>
        {HALL_OF_FAME.classes.map(hallClass => (
          <section key={hallClass.year}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid #393939', paddingBottom: 10, marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400, fontFamily: "'IBM Plex Sans', sans-serif" }}>Class of {hallClass.year}</h3>
              <span style={{ color: '#8d8d8d', fontSize: 12, ...mono }}>{hallClass.inductees.length} inducted · {hallClass.rolledOver} rolled over</span>
            </div>
            <div className="hall-grid">
              {hallClass.inductees.map(inductee => <HallCard key={inductee.player} inductee={inductee} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function StreakTables({ search }: { search: string }) {
  const columns: Column<StreakRecord>[] = [
    { label: 'Manager', render: row => <ManagerName id={row.manager_id} /> },
    { label: 'Games', align: 'right', render: row => row.games },
    { label: 'Started', align: 'right', render: row => <SeasonWeek season={row.start.season} week={row.start.week} /> },
    { label: 'First opponent', render: row => managerName(row.start.opponent_id) },
    { label: 'Ended', align: 'right', render: row => <SeasonWeek season={row.end.season} week={row.end.week} /> },
    { label: 'Last opponent', render: row => managerName(row.end.opponent_id) },
  ]
  return (
    <div className="record-panel-grid">
      <RecordPanel title="Longest winning streaks" detail="Consecutive full-season wins, including runs that cross season boundaries.">
        <RankedTable rows={EXPANDED_RECORDS.streaks.wins.filter(row => contains(search, managerName(row.manager_id), row.games, row.start.season, row.end.season))} columns={columns} keyFor={(row, index) => `win-${row.manager_id}-${row.start.season}-${index}`} />
      </RecordPanel>
      <RecordPanel title="Longest losing spirals" detail="Consecutive full-season losses, with the first and last victims named.">
        <RankedTable rows={EXPANDED_RECORDS.streaks.losses.filter(row => contains(search, managerName(row.manager_id), row.games, row.start.season, row.end.season))} columns={columns} keyFor={(row, index) => `loss-${row.manager_id}-${row.start.season}-${index}`} />
      </RecordPanel>
    </div>
  )
}

function ScheduleTables({ search }: { search: string }) {
  const rows = EXPANDED_RECORDS.schedule_robbery.filter(row => contains(search, managerName(row.manager_id), row.games, row.actual_pct, row.all_play_pct, row.schedule_delta))
  const columns: Column<ScheduleRecord>[] = [
    { label: 'Manager', render: row => <ManagerName id={row.manager_id} /> },
    { label: 'Actual W–L', align: 'right', render: row => `${row.w}–${row.l}` },
    { label: 'Actual %', align: 'right', render: row => `${row.actual_pct.toFixed(2)}%` },
    { label: 'All-play %', align: 'right', render: row => `${row.all_play_pct.toFixed(2)}%` },
    { label: 'Median %', align: 'right', render: row => `${row.median_pct.toFixed(2)}%` },
    { label: 'Schedule delta', align: 'right', render: row => <span style={{ color: row.schedule_delta >= 0 ? '#42be65' : '#ff8389' }}>{row.schedule_delta > 0 ? '+' : ''}{row.schedule_delta.toFixed(2)}</span> },
  ]
  return (
    <div className="record-panel-grid">
      <RecordPanel title="Schedule beneficiaries" detail="Actual win percentage most above all-play performance.">
        <RankedTable rows={rows.slice(0, 12)} columns={columns} keyFor={row => `lucky-${row.manager_id}`} />
      </RecordPanel>
      <RecordPanel title="Schedule robbery victims" detail="Actual win percentage most below all-play performance.">
        <RankedTable rows={[...rows].sort((a, b) => a.schedule_delta - b.schedule_delta).slice(0, 12)} columns={columns} keyFor={row => `robbed-${row.manager_id}`} />
      </RecordPanel>
    </div>
  )
}

function BenchMobTables({ search }: { search: string }) {
  const bench = EXPANDED_RECORDS.bench_mob
  const career = bench.career.filter(row => contains(search, row.player, row.position, managerName(row.top_manager_id), row.bench_points))
  const games = bench.single_games.filter(row => contains(search, row.player, row.position, managerName(row.manager_id), managerName(row.opponent_id), row.season, row.week, row.bench_points))
  const escapes = bench.escape_acts.filter(row => contains(search, managerName(row.manager_id), managerName(row.opponent_id), row.season, row.week, row.regret))
  return (
    <div className="record-panel-grid">
      <RecordPanel title="Bench Mob · all-time totals" detail="Points scored while rostered in a bench slot; IR is excluded.">
        <RankedTable<BenchCareerRecord> rows={career} keyFor={row => row.player} columns={[
          { label: 'Player', render: row => row.player },
          { label: 'Pos', render: row => <span style={{ color: POSITION_COLORS[(row.position === 'DST' ? 'DEF' : row.position) as RecordPosition] ?? '#8d8d8d' }}>{row.position === 'DEF' ? 'D/ST' : row.position}</span> },
          { label: 'Bench Points', align: 'right', render: row => row.bench_points.toFixed(2) },
          { label: 'Bench games', align: 'right', render: row => row.bench_games },
          { label: 'Most with', render: row => managerName(row.top_manager_id) },
        ]} />
      </RecordPanel>
      <RecordPanel title="Bench Mob · single games" detail="The most points ever left sitting, with manager and opponent included.">
        <RankedTable<BenchGameRecord> rows={games} keyFor={(row, index) => `${row.player}-${row.season}-${row.week}-${index}`} columns={[
          { label: 'Player', render: row => row.player },
          { label: 'Manager', render: row => managerName(row.manager_id) },
          { label: 'Opponent', render: row => managerName(row.opponent_id) },
          { label: 'Bench Points', align: 'right', render: row => row.bench_points.toFixed(2) },
          { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
        ]} />
      </RecordPanel>
      <RecordPanel title="Bench escape acts" detail="The most lineup regret a manager survived and still won.">
        <RankedTable<EscapeAct> rows={escapes} keyFor={(row, index) => `${row.manager_id}-${row.season}-${row.week}-${index}`} columns={[
          { label: 'Manager', render: row => <ManagerName id={row.manager_id} /> },
          { label: 'Opponent', render: row => managerName(row.opponent_id) },
          { label: 'Final', align: 'right', render: row => `${row.score.toFixed(2)}–${row.opponent_score.toFixed(2)}` },
          { label: 'Regret survived', align: 'right', render: row => row.regret.toFixed(2) },
          { label: 'When', align: 'right', render: row => <SeasonWeek season={row.season} week={row.week} /> },
        ]} />
      </RecordPanel>
      <RecordPanel title="Perfect-lineup weeks" detail="Every available point captured under the lineup optimizer.">
        <RankedTable rows={bench.perfect_lineups.filter(row => contains(search, managerName(row.manager_id), row.perfect_weeks))} keyFor={row => row.manager_id} columns={[
          { label: 'Manager', render: row => <ManagerName id={row.manager_id} /> },
          { label: 'Perfect weeks', align: 'right', render: row => row.perfect_weeks },
        ]} />
      </RecordPanel>
    </div>
  )
}

function TradeTrees({ search }: { search: string }) {
  const rows: TradeTree[] = EXPANDED_RECORDS.trade_trees.filter(row => contains(search, row.season, row.date, row.total_started_points, ...row.sides.flatMap(side => [managerName(side.manager_id), ...side.players.map(player => player.player)])))
  return (
    <div className="trade-tree-grid">
      {rows.map((trade, index) => (
        <article key={`${trade.season}-${trade.date}`} style={{ border: '1px solid #393939', borderTop: `4px solid ${index < 3 ? '#f1c21b' : '#525252'}`, backgroundColor: '#1c1c1c' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #393939', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div><Eyebrow>{trade.season} · {trade.date}</Eyebrow><h3 style={{ margin: 0, color: '#f4f4f4', fontSize: 16, lineHeight: '22px' }}>Trade tree #{index + 1}</h3></div>
            <div style={{ textAlign: 'right' }}><div style={{ color: '#8d8d8d', fontSize: 12 }}>Produced after trade</div><div style={{ color: '#f4f4f4', fontSize: 20, ...mono }}>{trade.total_started_points.toFixed(2)}</div></div>
          </div>
          <div className="trade-side-grid">
            {trade.sides.map(side => (
              <div key={side.manager_id} style={{ padding: 16, borderRight: '1px solid #393939' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f4f4f4', marginBottom: 10 }}><ManagerName id={side.manager_id} /><span style={mono}>{side.started_points.toFixed(2)}</span></div>
                {side.players.map(player => <div key={player.player} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '6px 0', borderTop: '1px solid #2e2e2e', color: '#c6c6c6', fontSize: 12 }}><span>{player.player}{player.first_week ? ` · from W${player.first_week}` : ''}</span><span style={mono}>{player.started_points.toFixed(2)}</span></div>)}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

function ExpandedRecordIntro({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}><h3 style={{ margin: '0 0 6px', color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>{title}</h3><p style={{ margin: 0, color: '#8d8d8d', fontSize: 12, lineHeight: '16px' }}>{detail}</p></div>
      {children}
    </div>
  )
}

function ExpandedGroup({ group, search }: { group: RecordGroup; search: string }) {
  if (group === 'streaks') return <ExpandedRecordIntro title="Ironman & spiral" detail="The exact boundaries of the league's longest winning and losing runs."><StreakTables search={search} /></ExpandedRecordIntro>
  if (group === 'schedule') return <ExpandedRecordIntro title="Schedule robbery" detail={EXPANDED_RECORDS.meta.schedule}><ScheduleTables search={search} /></ExpandedRecordIntro>
  if (group === 'bench-mob') return <ExpandedRecordIntro title="Bench Mob" detail="Career and single-game bench scoring, plus the wins that survived bad lineup choices."><BenchMobTables search={search} /></ExpandedRecordIntro>
  return <ExpandedRecordIntro title="Trade trees" detail={EXPANDED_RECORDS.meta.trade}><TradeTrees search={search} /></ExpandedRecordIntro>
}

function BuiltRecordMarker() {
  return (
    <section style={{ paddingTop: 48 }}>
      <SectionHeading eyebrow="Tape processed" title="The backlog moved into the record book" detail="Ironman and spiral, schedule robbery, Bench Mob and escape acts, postseason multiplier, trade trees, and Giant Killers are now live data—not placeholders." />
      <div style={{ border: '1px solid #393939', borderLeft: '4px solid #42be65', backgroundColor: '#1c1c1c', padding: 16, color: '#c6c6c6', fontSize: 14, lineHeight: '20px' }}>
        Postseason multiplier and Giant Killers live on the Post-season &amp; Bowls board; the other four are lookup tabs above.
      </div>
    </section>
  )
}

export default function LeagueRecordBook() {
  const [group, setGroup] = useState<RecordGroup>('all-time')
  const [query, setQuery] = useState('')
  const search = query.trim().toLowerCase()
  const highScore = LEAGUE_RECORD_BOOK.teamGame.highest_score[0]
  const lowScore = LEAGUE_RECORD_BOOK.teamGame.lowest_score[0]
  const playerPeak = LEAGUE_RECORD_BOOK.playerGameOverall[0]
  const closest = LEAGUE_RECORD_BOOK.matchup.closest[0]

  const groupContent = useMemo(() => {
    switch (group) {
      case 'all-time': return <AllTimeTables search={search} />
      case 'team-games': return <TeamGameTables search={search} />
      case 'matchups': return <MatchupTables search={search} />
      case 'league-weeks': return <LeagueWeekTables search={search} />
      case 'manager-seasons': return <ManagerSeasonTables search={search} />
      case 'players': return <PlayerTables search={search} />
      case 'positions': return <PositionTables search={search} />
      case 'streaks':
      case 'schedule':
      case 'bench-mob':
      case 'trades': return <ExpandedGroup group={group} search={search} />
    }
  }, [group, search])

  return (
    <div>
      <section style={{ border: '1px solid #393939', backgroundColor: '#1c1c1c', marginBottom: 40 }}>
        <div style={{ padding: '28px 24px 24px', borderTop: '4px solid #f1c21b' }}>
          <Eyebrow>2013–2025 · full season</Eyebrow>
          <h2 style={{ margin: '0 0 12px', maxWidth: 900, color: '#f4f4f4', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 28, lineHeight: '36px', fontWeight: 400 }}>
            Every peak, crater, and statistical crime scene.
          </h2>
          <p style={{ margin: 0, maxWidth: 900, color: '#a8a8a8', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '20px' }}>
            {LEAGUE_RECORD_BOOK.scope}. Search a name, year, player, or score; then use the category rail to answer the argument at hand.
          </p>
        </div>
        <div className="record-hero-stats">
          {[
            ['Seasons', String(LEAGUE_STATS.seasons), 'including two asterisk seasons'],
            ['Matchups', LEAGUE_STATS.gamesPlayed.toLocaleString(), 'regular season + playoffs'],
            ['Started Points', LEAGUE_STATS.pointsScored.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'scored by league teams'],
            ['Players rostered', LEAGUE_STATS.playersRostered.toLocaleString(), 'D/ST units excluded'],
          ].map(([label, value, detail]) => (
            <div key={label} style={{ padding: 16, borderTop: '1px solid #393939', borderRight: '1px solid #393939' }}>
              <div style={{ color: '#8d8d8d', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>{label}</div>
              <div style={{ color: '#f4f4f4', fontSize: 20, lineHeight: '28px', ...mono }}>{value}</div>
              <div style={{ color: '#6f6f6f', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>{detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <SectionHeading eyebrow="Four instant answers" title="The outer edge of the record book" detail="Raw records for quick orientation before the full lookup tables." />
        <div className="oddity-grid">
          {[
            { label: 'Highest team score', value: highScore.points.toFixed(2), detail: `${managerName(highScore.managerId)} · ${seasonLabel(highScore.season)} W${highScore.week}`, color: '#42be65' },
            { label: 'Lowest team score', value: lowScore.points.toFixed(2), detail: `${managerName(lowScore.managerId)} · ${seasonLabel(lowScore.season)} W${lowScore.week}`, color: '#ff8389' },
            { label: 'Best player game', value: playerPeak.points.toFixed(2), detail: `${playerPeak.player} · ${playerPeak.position}`, color: POSITION_COLORS[playerPeak.position] },
            { label: 'Smallest margin', value: closest.margin.toFixed(2), detail: `${managerName(closest.winnerId)} vs ${managerName(closest.loserId)} · ${seasonLabel(closest.season)}`, color: '#f1c21b' },
          ].map(item => (
            <article key={item.label} style={{ backgroundColor: '#262626', borderTop: `4px solid ${item.color}`, padding: 16 }}>
              <div style={{ color: '#8d8d8d', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>{item.label}</div>
              <div style={{ color: '#f4f4f4', fontSize: 28, lineHeight: '36px', ...mono }}>{item.value}</div>
              <div style={{ color: '#c6c6c6', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>{item.detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 56 }}>
        <SectionHeading eyebrow="Lookup desk" title="League-wide records" detail="The same all-time, season, matchup, and player grains used on the season and franchise pages—aggregated across the whole league." />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'stretch', marginBottom: 12 }} className="record-tools">
          <label style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 10, border: '1px solid #525252', backgroundColor: '#262626', padding: '0 12px' }}>
            <span style={{ color: '#8d8d8d', fontSize: 14 }}>⌕</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search manager, player, season, week, or score"
              aria-label="Search league records"
              style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: '#f4f4f4', padding: '11px 0', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 }}
            />
          </label>
          {query && <button onClick={() => setQuery('')} style={{ border: '1px solid #525252', backgroundColor: '#262626', color: '#f4f4f4', padding: '0 16px', cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 }}>Clear</button>}
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 1, marginBottom: 16 }}>
          {RECORD_GROUPS.map(item => (
            <button key={item.id} onClick={() => setGroup(item.id)} style={{
              flex: '0 0 auto', border: '1px solid #393939', borderBottom: `3px solid ${group === item.id ? '#f4f4f4' : '#393939'}`,
              backgroundColor: group === item.id ? '#262626' : '#1c1c1c', color: group === item.id ? '#f4f4f4' : '#a8a8a8',
              padding: '10px 14px', cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14,
            }}>
              {item.label}
            </button>
          ))}
        </div>
        {groupContent}
        <p style={{ margin: '12px 0 0', color: '#8d8d8d', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>
          * 2013 was a half season; 2020 was the COVID season. They remain in the record book and are never smoothed away.
        </p>
      </section>

      <section style={{ marginBottom: 56 }}>
        <SectionHeading eyebrow="Weird tape" title="The biggest single-game aberrations" detail={RECORD_INSIGHT_METHOD.aberration} />
        <AberrationTable search={search} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <SectionHeading
          eyebrow="Position coaching tree"
          title="The Whisperers"
          detail={`Composite percentile: ${RECORD_INSIGHT_METHOD.whisperer.weights.draft}% lower-pick draft value, ${RECORD_INSIGHT_METHOD.whisperer.weights.waiver}% waiver Started Points, ${RECORD_INSIGHT_METHOD.whisperer.weights.lineup}% same-position lineup efficiency. ${RECORD_INSIGHT_METHOD.whisperer.eligibility}`}
        />
        <WhispererBoard />
        <details style={{ border: '1px solid #393939', marginTop: 12, backgroundColor: '#1c1c1c' }}>
          <summary style={{ padding: 14, color: '#c6c6c6', cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 }}>How the Whisperer score works</summary>
          <div style={{ padding: '0 14px 14px', color: '#a8a8a8', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '18px' }}>
            <p><strong style={{ color: '#f4f4f4' }}>Draft:</strong> {RECORD_INSIGHT_METHOD.whisperer.draft}</p>
            <p><strong style={{ color: '#f4f4f4' }}>Waiver:</strong> {RECORD_INSIGHT_METHOD.whisperer.waiver}</p>
            <p><strong style={{ color: '#f4f4f4' }}>Lineup:</strong> {RECORD_INSIGHT_METHOD.whisperer.lineup}</p>
          </div>
        </details>
      </section>

      <BuiltRecordMarker />
      <HallOfFame />

      <style>{`
        .record-hero-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .oddity-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; }
        .record-panel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .whisperer-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .trade-tree-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .trade-side-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .hall-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1055px) {
          .record-hero-stats, .oddity-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .record-panel-grid, .whisperer-grid, .hall-grid { grid-template-columns: 1fr; }
          .trade-tree-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 671px) {
          .record-hero-stats, .oddity-grid, .trade-side-grid { grid-template-columns: 1fr; }
          .record-tools { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
