import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  getFranchise, getFranchiseAnalytics, getManager,
  type FranchiseAffinityRow, type FranchiseAllTeam, type FranchiseBenchRegret,
  type FranchiseComebackRecord, type FranchiseDraftPick, type FranchiseGameRecord,
  type FranchisePlayerLeader, type FranchisePosition, type FranchiseRival,
  type FranchiseWaiverPick,
} from '../data/league'

const POSITION_COLORS: Record<FranchisePosition, string> = {
  QB: '#4589ff', RB: '#42be65', WR: '#f1c21b', TE: '#ff832b', DEF: '#8a3ffc', K: '#8d8d8d',
}
const TIER_COLORS = ['#B3995D', '#B0B7BC', '#CD7F32']
const TIER_LABELS = ['First team', 'Second team', 'Third team']

function points(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

function seasons(years: number[]): string {
  if (years.length === 0) return '—'
  if (years.length === 1) return String(years[0])
  return `${years[0]}–${years[years.length - 1]}`
}

function opponentName(id: string | null): string {
  return id ? getFranchise(id)?.nickname ?? id : 'Unknown opponent'
}

function SeasonWeek({ season, week }: { season: number; week: number }) {
  return (
    <Link to={`/seasons/${season}`} style={{ color: '#78a9ff', textDecoration: 'none' }}>
      {season} · Wk {week}
    </Link>
  )
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="franchise-analytics__section-heading">
      <h2>{title}</h2>
      {note && <p>{note}</p>}
    </div>
  )
}

function Panel({ title, note, children, wide = false }: { title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <article className={wide ? 'franchise-analytics__panel franchise-analytics__panel--wide' : 'franchise-analytics__panel'}>
      <div className="franchise-analytics__panel-heading">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </div>
      {children}
    </article>
  )
}

function EmptyRow() {
  return <div className="franchise-analytics__empty">Not enough qualifying history yet.</div>
}

function RankedRows({ children, count }: { children: React.ReactNode; count: number }) {
  return count > 0 ? <ol className="franchise-analytics__ranked">{children}</ol> : <EmptyRow />
}

function AllTeamCard({ team, managerId, inherited }: { team: FranchiseAllTeam; managerId: string; inherited: boolean }) {
  const manager = getManager(managerId)
  const headerColor = inherited ? manager?.primaryColor ?? '#f4f4f4' : TIER_COLORS[team.tier - 1]
  const title = inherited
    ? `All-${manager?.name ?? managerId} team`
    : `${TIER_LABELS[team.tier - 1]} All-${manager?.name ?? managerId}`

  return (
    <article className="franchise-analytics__all-team">
      <div className="franchise-analytics__all-team-header" style={{ color: headerColor, borderTopColor: headerColor }}>
        {title}
      </div>
      <div className="franchise-analytics__lineup-scroll">
        <div className="franchise-analytics__lineup">
          {team.slots.map((slot, index) => (
            <div className="franchise-analytics__lineup-slot" key={`${slot.slot}-${index}`}>
              <span style={{ color: slot.position ? POSITION_COLORS[slot.position] : '#8d8d8d' }}>{slot.slot === 'DEF' ? 'D/ST' : slot.slot}</span>
              <strong>{slot.player?.replace(' - DEF', ' D/ST') ?? '—'}</strong>
              <em>{slot.player ? `${points(slot.points)} pts` : 'No qualifier'}</em>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function PlayerBoard({ title, rows }: { title: string; rows: FranchisePlayerLeader[] }) {
  return (
    <Panel title={title}>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.player}-${index}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{row.player.replace(' - DEF', ' D/ST')}</strong>
              <small>{seasons(row.seasons)} · {row.starts} starts</small>
            </span>
            <span className="franchise-analytics__value">{points(row.points)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function DraftBoard({ title, rows, note = 'Ranked by Started Points above/below positional draft expectation' }: { title: string; rows: FranchiseDraftPick[]; note?: string }) {
  return (
    <Panel title={title} note={note}>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.season}-${row.overall}-${row.player}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{row.player}</strong>
              <small><Link to={`/seasons/${row.season}`}>{row.season}</Link> · Rd {row.round}, pick {row.pick}</small>
            </span>
            <span className="franchise-analytics__value">{points(row.points)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function WaiverBoard({ title, rows, note = 'Genuine waiver/free-agent adds; drafted and traded players excluded' }: { title: string; rows: FranchiseWaiverPick[]; note?: string }) {
  return (
    <Panel title={title} note={note}>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.season}-${row.week}-${row.player}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{row.player}</strong>
              <small><SeasonWeek season={row.season} week={row.week} /> · {row.position} · {row.starts} starts</small>
            </span>
            <span className="franchise-analytics__value">{points(row.points)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function GameBoard({ title, rows, value }: { title: string; rows: FranchiseGameRecord[]; value: (row: FranchiseGameRecord) => string }) {
  return (
    <Panel title={title}>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.season}-${row.week}-${row.opponent_franchise_id}-${index}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{opponentName(row.opponent_franchise_id)}</strong>
              <small><SeasonWeek season={row.season} week={row.week} /> · {row.result}</small>
            </span>
            <span className="franchise-analytics__value">{value(row)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function ComebackBoard({ title, rows }: { title: string; rows: FranchiseComebackRecord[] }) {
  return (
    <Panel title={title} note="Deficit erased after Sunday Night through the final gate">
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.season}-${row.week}-${row.opponent_franchise_id}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{opponentName(row.opponent_franchise_id)}</strong>
              <small><SeasonWeek season={row.season} week={row.week} /></small>
            </span>
            <span className="franchise-analytics__value">{points(row.points_made_up)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function BenchBoard({ rows }: { rows: FranchiseBenchRegret[] }) {
  return (
    <Panel title="Biggest bench regrets" note="Hindsight-optimal legal lineup; result compares that lineup with the opponent" wide>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={`${row.season}-${row.week}-${index}`}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{row.players.join(' + ')}</strong>
              <small><SeasonWeek season={row.season} week={row.week} /> · bench {points(row.bench_points)} · would be {row.optimal_result}</small>
            </span>
            <span className="franchise-analytics__value">+{points(row.regret)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function RivalBoard({ rows }: { rows: FranchiseRival[] }) {
  return (
    <Panel title="Biggest rivals" note="Stakes-weighted meetings, competitive balance, and close scores" wide>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={row.opponent}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{opponentName(row.opponent)}</strong>
              <small>{row.meetings} meetings · {row.w}–{row.l}{row.ties ? `–${row.ties}` : ''} · {row.playoff_meetings} playoff · {row.bowl_meetings} bowl</small>
            </span>
            <span className="franchise-analytics__value">{row.score_100.toFixed(1)}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function AffinityBoard({ title, rows, ppg }: { title: string; rows: FranchiseAffinityRow[]; ppg?: boolean }) {
  return (
    <Panel title={title} note={ppg ? 'Minimum three drafted player-seasons' : undefined}>
      <RankedRows count={rows.length}>
        {rows.map((row, index) => (
          <li key={row.name}>
            <span className="franchise-analytics__rank">{index + 1}</span>
            <span className="franchise-analytics__row-main">
              <strong>{row.name}</strong>
              <small>{row.players} players · {row.starts} starts</small>
            </span>
            <span className="franchise-analytics__value">{ppg ? row.ppg.toFixed(2) : row.players}</span>
          </li>
        ))}
      </RankedRows>
    </Panel>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="franchise-analytics__tooltip">
      <strong>{label}</strong>
      {payload.map((entry: any) => (
        <span key={entry.dataKey} style={{ color: entry.color }}>{entry.name}: {typeof entry.value === 'number' ? points(entry.value) : entry.value}</span>
      ))}
    </div>
  )
}

function FinishTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="franchise-analytics__tooltip">
      <strong>{label}</strong>
      {row.rank !== null && <span style={{ color: payload[0]?.color }}>Finish: {row.rank}</span>}
      <span style={{ color: '#c6c6c6' }}>Trend estimate: {row.expected_rank.toFixed(2)}</span>
    </div>
  )
}

export default function FranchiseAnalytics({ franchiseId, currentManagerId }: { franchiseId: string; currentManagerId: string }) {
  const analytics = getFranchiseAnalytics(franchiseId)
  const currentManager = getManager(currentManagerId)
  if (!analytics || !currentManager) return null

  const inherited = analytics.allTeams.length > 1
  const scoring = analytics.weeklyScoring
  const managerStops = scoring.map((point, index) => ({
    offset: scoring.length <= 1 ? 0 : index / (scoring.length - 1) * 100,
    color: getManager(point.managerId)?.primaryColor ?? currentManager.primaryColor,
  }))
  const finishData = analytics.finishChart.map(point => ({
    ...point,
    finishHeight: point.rank === null ? null : point.field_size + 1 - point.rank,
    expectedHeight: point.field_size + 1 - point.expected_rank,
  }))

  return (
    <section className="franchise-analytics" aria-labelledby="franchise-analytics-title">
      <SectionHeading title="Franchise records & awards" note="Franchise-lifetime numbers · full season including playoffs unless noted" />

      <section>
        <h2 id="franchise-analytics-title" className="franchise-analytics__subheading">All-franchise teams</h2>
        <p className="franchise-analytics__helper">
          {inherited ? 'One lineup for each manager’s seasons in this franchise chain.' : 'First, second, and third teams; every player can occupy only one slot.'}
        </p>
        <div className="franchise-analytics__all-team-stack">
          {analytics.allTeams.flatMap(group => group.teams.map(team => (
            <AllTeamCard key={`${group.managerId}-${team.tier}`} team={team} managerId={group.managerId} inherited={inherited} />
          )))}
        </div>
      </section>

      <section>
        <SectionHeading title="Scoring history" />
        <div className="franchise-analytics__chart-grid">
          <Panel title="Started Points by season and position" note="Flex points are credited to the player’s listed position" wide>
            <div className="franchise-analytics__chart" role="img" aria-label="Stacked bar chart of franchise Started Points by season and position">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.pointsBySeason} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#393939" vertical={false} />
                  <XAxis dataKey="season" stroke="#8d8d8d" tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#8d8d8d" width={54} tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12 }} />
                  {(Object.keys(POSITION_COLORS) as FranchisePosition[]).map(position => (
                    <Bar key={position} dataKey={position} name={position === 'DEF' ? 'D/ST' : position} stackId="points" fill={POSITION_COLORS[position]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Every weekly score" note="Points for, points against, and hindsight-optimal legal lineup" wide>
            <div className="franchise-analytics__chart" role="img" aria-label="Line chart of points for, points against, and optimal points for every franchise week">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoring} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`franchise-manager-gradient-${franchiseId}`} x1="0" y1="0" x2="1" y2="0">
                      {managerStops.flatMap((stop, index) => [
                        <stop key={`${index}-a`} offset={`${Math.max(0, stop.offset - 0.01)}%`} stopColor={stop.color} />,
                        <stop key={`${index}-b`} offset={`${stop.offset}%`} stopColor={stop.color} />,
                      ])}
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#393939" vertical={false} />
                  <XAxis dataKey="index" stroke="#8d8d8d" tick={false} label={{ value: 'Every week played →', fill: '#8d8d8d', fontSize: 12, position: 'insideBottomRight' }} />
                  <YAxis stroke="#8d8d8d" width={46} tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<ChartTooltip />} labelFormatter={(label: any) => { const index = Number(label); const row = scoring[index - 1]; return row ? `${row.season} · Week ${row.week}` : label }} />
                  <Line type="monotone" dataKey="optimal" name="Optimal" stroke="#6f6f6f" strokeDasharray="2 5" strokeWidth={1} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="points_against" name="Points against" stroke="#c6c6c6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="points_for" name="Points for" stroke={`url(#franchise-manager-gradient-${franchiseId})`} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </section>

      <section>
        <SectionHeading title="Rivalries" />
        <div className="franchise-analytics__grid"><RivalBoard rows={analytics.rivals} /></div>
      </section>

      <section>
        <SectionHeading title="Career scoring leaders" note="Started Points produced for this franchise chain" />
        <div className="franchise-analytics__grid">
          <PlayerBoard title="All-time leading scorers" rows={analytics.leaders.overall} />
          {(['QB', 'RB', 'WR', 'TE', 'DEF', 'K'] as FranchisePosition[]).map(position => (
            <PlayerBoard key={position} title={`Top ${position === 'DEF' ? 'D/ST' : position} scorers`} rows={analytics.leaders[position]} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Acquisition department" />
        <div className="franchise-analytics__grid">
          <DraftBoard title="Best draft picks" rows={analytics.draft.best} />
          <DraftBoard title="Worst draft picks" rows={analytics.draft.worst} note="Traded players excluded; ranked by Started Points below positional draft expectation" />
          <WaiverBoard title="Best waiver pickups" rows={analytics.waiver.best} />
          <WaiverBoard title="Worst waiver pickups" rows={analytics.waiver.worst} note="Minimum three games started; drafted and traded players excluded" />
        </div>
      </section>

      <section>
        <SectionHeading title="Game records" />
        <div className="franchise-analytics__grid">
          <GameBoard title="Biggest blowout wins" rows={analytics.games.blowoutWins} value={row => `+${points(row.margin)}`} />
          <GameBoard title="Biggest blowout losses" rows={analytics.games.blowoutLosses} value={row => `−${points(row.margin)}`} />
          <GameBoard title="Closest wins" rows={analytics.games.closestWins} value={row => row.result === 'T' ? 'Tie' : `+${points(row.margin)}`} />
          <GameBoard title="Closest losses" rows={analytics.games.closestLosses} value={row => row.result === 'T' ? 'Tie' : `−${points(row.margin)}`} />
          <ComebackBoard title="Come-from-behind wins" rows={analytics.games.comebackWins} />
          <ComebackBoard title="Come-from-behind losses" rows={analytics.games.comebackLosses} />
          <GameBoard title="Highest combined scores" rows={analytics.games.highestCombined} value={row => points(row.combined)} />
          <GameBoard title="Lowest combined scores" rows={analytics.games.lowestCombined} value={row => points(row.combined)} />
          <BenchBoard rows={analytics.games.benchRegrets} />
        </div>
      </section>

      <section>
        <SectionHeading title="Drafting DNA" note="Drafted player-seasons; starts and Started Points belong to the drafting franchise that season" />
        <div className="franchise-analytics__grid">
          <AffinityBoard title="Most-drafted NFL teams" rows={analytics.affinity.nfl.frequency} />
          <AffinityBoard title="Best NFL-team PPG" rows={analytics.affinity.nfl.ppg} ppg />
          <AffinityBoard title="Most-drafted colleges" rows={analytics.affinity.college.frequency} />
          <AffinityBoard title="Best college PPG" rows={analytics.affinity.college.ppg} ppg />
          <AffinityBoard title="Most-drafted conferences" rows={analytics.affinity.conference.frequency} />
          <AffinityBoard title="Best conference PPG" rows={analytics.affinity.conference.ppg} ppg />
        </div>

        <div className="franchise-analytics__chart-grid franchise-analytics__chart-grid--spaced">
          <Panel title="Draft-round value" note="Average Started Points per franchise-season; league average uses the same basis" wide>
            <div className="franchise-analytics__chart" role="img" aria-label="Bar and line chart comparing franchise and league Started Points by draft round">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.draft.rounds} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#393939" vertical={false} />
                  <XAxis dataKey="round" stroke="#8d8d8d" tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#8d8d8d" width={46} tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<ChartTooltip />} labelFormatter={label => `Round ${label}`} />
                  <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12 }} />
                  <Bar dataKey="franchise" name="Franchise" fill={currentManager.primaryColor} />
                  <Line type="monotone" dataKey="league" name="League average" stroke="#c6c6c6" strokeWidth={2} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Finish by season" note="First place is highest; dotted line extends a simple linear estimate through 2027" wide>
            <div className="franchise-analytics__chart" role="img" aria-label="Bar chart of franchise finish by season with a two-season linear estimate">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={finishData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#393939" vertical={false} />
                  <XAxis dataKey="season" stroke="#8d8d8d" tick={{ fill: '#c6c6c6', fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#8d8d8d" width={46} tick={false} label={{ value: 'Last → First', angle: -90, fill: '#8d8d8d', fontSize: 12 }} />
                  <Tooltip content={<FinishTooltip />} />
                  <Bar dataKey="finishHeight" name="Finish" fill={currentManager.primaryColor} />
                  <Line type="monotone" dataKey="expectedHeight" name="Trend estimate" stroke="#c6c6c6" strokeDasharray="3 4" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </section>

      <p className="franchise-analytics__footnote">2013 was a half season (NFL weeks 7–14). 2020 was the COVID season. Gate-based comeback data is unavailable for 2020 and incomplete for 2024 week 17.</p>

      <style>{`
        .franchise-analytics { padding: 48px 8px 64px; display: flex; flex-direction: column; gap: 56px; overflow: hidden; }
        .franchise-analytics__section-heading { border-bottom: 1px solid #393939; margin-bottom: 24px; }
        .franchise-analytics__section-heading h2, .franchise-analytics__subheading { margin: 0; font: 400 28px/32px 'IBM Plex Sans', sans-serif; color: #f4f4f4; }
        .franchise-analytics__section-heading p, .franchise-analytics__helper { margin: 4px 0 16px; font: 12px/16px 'IBM Plex Sans', sans-serif; color: #8d8d8d; }
        .franchise-analytics__helper { margin-bottom: 20px; }
        .franchise-analytics__all-team-stack { display: flex; flex-direction: column; gap: 16px; }
        .franchise-analytics__all-team { min-width: 0; border: 1px solid #393939; background: #1c1c1c; }
        .franchise-analytics__all-team-header { min-height: 48px; display: flex; align-items: center; padding: 0 20px; border-top: 4px solid; border-bottom: 1px solid #393939; font: 600 16px/22px 'IBM Plex Sans', sans-serif; }
        .franchise-analytics__lineup-scroll { overflow-x: auto; }
        .franchise-analytics__lineup { min-width: 1040px; display: grid; grid-template-columns: repeat(9, minmax(108px, 1fr)); }
        .franchise-analytics__lineup-slot { min-width: 0; min-height: 104px; padding: 16px; border-right: 1px solid #393939; display: flex; flex-direction: column; gap: 4px; }
        .franchise-analytics__lineup-slot:last-child { border-right: 0; }
        .franchise-analytics__lineup-slot span { font: 600 12px/16px 'IBM Plex Sans', sans-serif; }
        .franchise-analytics__lineup-slot strong { font: 600 14px/18px 'IBM Plex Sans', sans-serif; color: #f4f4f4; overflow-wrap: anywhere; }
        .franchise-analytics__lineup-slot em { margin-top: auto; font: normal 12px/16px 'IBM Plex Mono', monospace; color: #8d8d8d; font-variant-numeric: tabular-nums; }
        .franchise-analytics__grid, .franchise-analytics__chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
        .franchise-analytics__chart-grid--spaced { margin-top: 16px; }
        .franchise-analytics__panel { min-width: 0; border: 1px solid #393939; background: #1c1c1c; }
        .franchise-analytics__panel--wide { grid-column: 1 / -1; }
        .franchise-analytics__panel-heading { min-height: 64px; padding: 16px 20px; border-bottom: 1px solid #393939; }
        .franchise-analytics__panel-heading h3 { margin: 0; font: 600 14px/18px 'IBM Plex Sans', sans-serif; color: #f4f4f4; }
        .franchise-analytics__panel-heading p { margin: 4px 0 0; font: 12px/16px 'IBM Plex Sans', sans-serif; color: #8d8d8d; }
        .franchise-analytics__ranked { margin: 0; padding: 0; list-style: none; }
        .franchise-analytics__ranked li { min-height: 64px; display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #2e2e2e; }
        .franchise-analytics__ranked li:last-child { border-bottom: 0; }
        .franchise-analytics__rank { font: 14px/18px 'IBM Plex Mono', monospace; color: #6f6f6f; text-align: right; }
        .franchise-analytics__row-main { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .franchise-analytics__row-main strong { font: 600 14px/18px 'IBM Plex Sans', sans-serif; color: #f4f4f4; overflow-wrap: anywhere; }
        .franchise-analytics__row-main small { font: 12px/16px 'IBM Plex Sans', sans-serif; color: #8d8d8d; }
        .franchise-analytics__row-main a { color: #78a9ff; text-decoration: none; }
        .franchise-analytics__value { font: 14px/18px 'IBM Plex Mono', monospace; color: #f4f4f4; text-align: right; font-variant-numeric: tabular-nums; }
        .franchise-analytics__empty { min-height: 80px; display: flex; align-items: center; padding: 20px; font: 14px/18px 'IBM Plex Sans', sans-serif; color: #8d8d8d; }
        .franchise-analytics__chart { height: 360px; padding: 12px 12px 4px 4px; }
        .franchise-analytics__tooltip { min-width: 132px; display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border: 1px solid #525252; background: #262626; font: 12px/16px 'IBM Plex Mono', monospace; color: #f4f4f4; }
        .franchise-analytics__tooltip strong { font-family: 'IBM Plex Sans', sans-serif; }
        .franchise-analytics__footnote { margin: 0; padding-top: 16px; border-top: 1px solid #393939; font: 12px/16px 'IBM Plex Sans', sans-serif; color: #8d8d8d; }
        @media (min-width: 1584px) { .franchise-analytics__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 1055px) { .franchise-analytics__grid, .franchise-analytics__chart-grid { grid-template-columns: minmax(0, 1fr); } .franchise-analytics__panel--wide { grid-column: auto; } }
        @media (max-width: 671px) { .franchise-analytics { padding-left: 0; padding-right: 0; gap: 48px; } .franchise-analytics__section-heading h2, .franchise-analytics__subheading { font-size: 20px; line-height: 28px; } .franchise-analytics__chart { height: 300px; } .franchise-analytics__ranked li { padding-left: 12px; padding-right: 12px; } }
      `}</style>
    </section>
  )
}
