import { useState } from 'react'
import { Link } from 'react-router-dom'
import AssetImage from '../components/AssetImage'
import {
  EXPANDED_RECORDS, RECORD_POSITIONS, getFranchise, getManager,
  type BowlHistoryRow, type PostseasonGame, type PostseasonRecord,
  type RecordPosition,
} from '../data/league'
import { withBase } from '../lib/assetPath'

const mono: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontVariantNumeric: 'tabular-nums',
}

const POSITION_COLORS: Record<string, string> = {
  QB: '#4589ff', RB: '#42be65', WR: '#f1c21b', TE: '#ff832b', DEF: '#8a3ffc', K: '#8d8d8d',
}

const BOWL_ASSETS: Record<string, { folder: string; prefix: string; color: string }> = {
  'Teremana Tequila Bowl': { folder: 'TeremanaTequilaBowl_logos', prefix: 'TeremanaBowl_', color: '#f1c21b' },
  'Kumho Tires Tokyo Drift Bowl': { folder: 'TokyoDriftBowl_Logos', prefix: 'TokyoDriftBowl_', color: '#4589ff' },
  'Ludacris Presents the Magic City Lemon Pepper Wing Bowl': { folder: 'LemonPepperWingBowl_Logos', prefix: 'WingBowl_', color: '#ff832b' },
  'Voltron Global Bowl Hosted by Tyrese Gibson': { folder: 'VoltronGlobalBowl_Logos', prefix: 'VoltronGlobalBowl_', color: '#8a3ffc' },
}

function managerName(id: string | null | undefined): string {
  return id ? getManager(id)?.name ?? id : '—'
}

function franchiseName(id: string | null | undefined): string {
  return id ? getFranchise(id)?.nickname ?? id : '—'
}

function SeasonWeek({ season, week }: { season: number; week?: number }) {
  return (
    <Link to={`/seasons/${season}`} style={{ color: '#78a9ff', textDecoration: 'none', whiteSpace: 'nowrap', ...mono }}>
      {season}{season === 2013 || season === 2020 ? '*' : ''}{week ? ` · W${week}` : ''}
    </Link>
  )
}

function Heading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <div style={{ maxWidth: 900, marginBottom: 20 }}>
      <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>{eyebrow}</div>
      <h2 style={{ margin: '8px 0', color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>{title}</h2>
      <p style={{ margin: 0, color: '#a8a8a8', fontSize: 14, lineHeight: '20px' }}>{detail}</p>
    </div>
  )
}

function Table({ headers, children, minWidth = 720, headerAlignments }: { headers: string[]; children: React.ReactNode; minWidth?: number; headerAlignments?: Array<'left' | 'right'> }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
      <table style={{ minWidth, width: '100%', borderCollapse: 'collapse', ...mono }}>
        <thead><tr style={{ backgroundColor: '#262626' }}>{headers.map((header, index) => (
          <th key={`${header}-${index}`} style={{ padding: '9px 12px', borderBottom: '1px solid #393939', color: '#8d8d8d', fontSize: 12, fontWeight: 400, textAlign: headerAlignments?.[index] ?? (index === 0 ? 'left' : 'right'), whiteSpace: 'nowrap' }}>{header}</th>
        ))}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

const cell = (align: 'left' | 'right' = 'right'): React.CSSProperties => ({
  padding: '10px 12px', borderBottom: '1px solid #2e2e2e', color: '#f4f4f4', fontSize: 14, lineHeight: '18px', textAlign: align, whiteSpace: 'nowrap',
})

function RecordTable({ rows, identity }: { rows: PostseasonRecord[]; identity: 'manager' | 'franchise' }) {
  return (
    <Table headers={[identity === 'manager' ? 'Manager' : 'Franchise', 'W–L', 'Win %', 'PPG', 'Started Points']} minWidth={560}>
      {rows.slice(0, 12).map((row, index) => {
        const id = identity === 'manager' ? row.manager_id : row.franchise_id
        return <tr key={id}>
          <td style={cell('left')}><span style={{ color: index < 3 ? '#f1c21b' : '#6f6f6f', marginRight: 10 }}>#{index + 1}</span>{identity === 'manager' ? managerName(id) : franchiseName(id)}</td>
          <td style={cell()}>{row.w}–{row.l}{row.t ? `–${row.t}` : ''}</td>
          <td style={cell()}>{row.win_pct.toFixed(2)}%</td>
          <td style={cell()}>{row.ppg.toFixed(2)}</td>
          <td style={cell()}>{row.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      })}
    </Table>
  )
}

function BowlLogo({ bowl, season }: { bowl: string; season: number }) {
  const asset = BOWL_ASSETS[bowl]
  const src = asset ? withBase(`images/BowlGame_logos/${asset.folder}/${asset.prefix}${season}.png`) : ''
  return (
    <AssetImage
      src={src}
      alt={`${bowl} ${season} logo`}
      width={100}
      height={100}
      fallback={<div style={{ width: 100, height: 100, display: 'grid', placeItems: 'center', backgroundColor: '#262626', fontSize: 32 }}>🏆</div>}
      style={{ objectFit: 'contain' }}
    />
  )
}

function venue(row: BowlHistoryRow): string {
  const location = [row.city, row.state].filter(Boolean).join(', ')
  const attendance = row.attendance === null ? 'Attendance gap' : `${typeof row.attendance === 'number' ? row.attendance.toLocaleString() : row.attendance} attending`
  const weather = row.indoor
    ? 'Indoors'
    : row.weather && row.weather.low !== null && row.weather.low !== undefined
      ? `${row.weather.emoji} ${row.weather.low}°F · ${row.weather.cond}`
      : 'Weather gap'
  return `${row.venue ?? 'Venue gap'} · ${location || 'Location gap'} · ${attendance} · ${weather}`
}

function BowlTable({ name, rows, future }: { name: string; rows: BowlHistoryRow[]; future?: { venues: Array<{ season: number; venue: string; city: string; state: string }>; bids: string[] } }) {
  const accent = BOWL_ASSETS[name]?.color ?? '#f1c21b'
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 12, marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>{name}</h3>
        <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px' }}>{rows.length} games · one logo per season · full venue canon</div>
      </div>
      <Table headers={['Logo / year', 'Champion', 'Runner-up', 'Bowl MVP', 'Stadium · location · attendance · weather']} headerAlignments={['left', 'left', 'left', 'left', 'left']} minWidth={1240}>
        {rows.map(row => (
          <tr key={`${name}-${row.season}`}>
            <td style={{ ...cell('left'), width: 132 }}><BowlLogo bowl={name} season={row.season} /><SeasonWeek season={row.season} /></td>
            <td style={cell('left')}><strong style={{ color: getManager(row.winner_id)?.primaryColor ?? '#f4f4f4' }}>{row.winner_team}</strong><div style={{ color: '#a8a8a8', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>{managerName(row.winner_id)} · <span style={mono}>{row.winner_score.toFixed(2)}</span></div></td>
            <td style={cell('left')}>{row.runner_up_team}<div style={{ color: '#a8a8a8', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>{managerName(row.runner_up_id)} · <span style={mono}>{row.runner_up_score.toFixed(2)}</span></div></td>
            <td style={cell('left')}>{row.mvp ? <>{row.mvp.player}<div style={{ color: '#a8a8a8', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>{row.mvp.position === 'DEF' ? 'D/ST' : row.mvp.position} · <span style={mono}>{row.mvp.points.toFixed(2)} pts</span></div>{row.mvp.side === 'losing team' && <div style={{ marginTop: 4, color: '#ff8389', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 600 }}>Rare · losing-team MVP</div>}</> : '—'}</td>
            <td style={{ ...cell('left'), whiteSpace: 'normal', minWidth: 380, color: '#c6c6c6', fontFamily: "'IBM Plex Sans', sans-serif" }}>{venue(row)}</td>
          </tr>
        ))}
        {future?.venues.map(site => (
          <tr key={`${name}-future-${site.season}`} style={{ backgroundColor: '#1c1c1c' }}>
            <td style={{ ...cell('left'), width: 132 }}><div style={{ color: '#78a9ff', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, marginBottom: 6 }}>Locked future host</div><span style={mono}>{site.season}</span></td>
            <td style={{ ...cell('left'), color: '#6f6f6f' }}>—</td>
            <td style={{ ...cell('left'), color: '#6f6f6f' }}>—</td>
            <td style={{ ...cell('left'), color: '#6f6f6f' }}>—</td>
            <td style={{ ...cell('left'), whiteSpace: 'normal', minWidth: 380, color: '#c6c6c6', fontFamily: "'IBM Plex Sans', sans-serif" }}>{site.venue} · {site.city}, {site.state}</td>
          </tr>
        ))}
      </Table>
      {future && future.bids.length > 0 && (
        <p style={{ margin: '10px 0 0', color: '#a8a8a8', fontSize: 12, lineHeight: '18px' }}>
          Future-game bids on file: <span style={{ color: '#f4f4f4' }}>{future.bids.join(' · ')}</span>. Bids are not locked hosts and are not included in host counts.
        </p>
      )}
    </section>
  )
}

function GameTable({ rows, kind }: { rows: PostseasonGame[]; kind: 'comeback' | 'margin' | 'upset' }) {
  return (
    <Table headers={['Game', 'Final', kind === 'comeback' ? 'Deficit erased' : kind === 'upset' ? 'Seed gap' : 'Margin', 'When']} minWidth={660}>
      {rows.slice(0, 10).map(row => (
        <tr key={`${row.season}-${row.week}-${row.winner_id}-${kind}`}>
          <td style={cell('left')}>{managerName(row.winner_id)} <span style={{ color: '#6f6f6f' }}>over</span> {managerName(row.loser_id)}<div style={{ color: '#8d8d8d', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>{row.label ?? row.bracket}</div></td>
          <td style={cell()}>{row.winner_score.toFixed(2)}–{row.loser_score.toFixed(2)}</td>
          <td style={cell()}>{kind === 'comeback' ? `${row.deficit?.toFixed(2)} after ${row.gate}` : kind === 'upset' ? `${row.winner_seed} over ${row.loser_seed} (+${row.seed_delta})` : row.margin?.toFixed(2)}</td>
          <td style={cell()}><SeasonWeek season={row.season} week={row.week} /></td>
        </tr>
      ))}
    </Table>
  )
}

export default function PostseasonBoard() {
  const post = EXPANDED_RECORDS.postseason
  const [position, setPosition] = useState<RecordPosition>('QB')
  const singleGames = post.single_games_by_position[position]
  const futureHostCounts = new Map(post.future_host_counts.map(row => [row.location, row.games]))
  const hostRows = [
    ...post.host_leaders.map(row => ({ ...row, future: futureHostCounts.get(row.location) ?? 0 })),
    ...post.future_host_counts.filter(row => !post.host_leaders.some(host => host.location === row.location)).map(row => ({ location: row.location, games: 0, future: row.games })),
  ].sort((a, b) => b.games - a.games || b.future - a.future || a.location.localeCompare(b.location))

  return (
    <div>
      <section style={{ border: '1px solid #393939', borderTop: '4px solid #f1c21b', backgroundColor: '#1c1c1c', padding: 24, marginBottom: 48 }}>
        <div style={{ color: '#8d8d8d', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Bracket truth · 2013–2025</div>
        <h2 style={{ margin: '8px 0 12px', color: '#f4f4f4', fontSize: 28, lineHeight: '36px', fontWeight: 400 }}>The postseason record book, with the grudges left in.</h2>
        <p style={{ maxWidth: 920, margin: 0, color: '#a8a8a8', fontSize: 14, lineHeight: '20px' }}>Championship and consolation brackets are tracked separately below. Player totals, opponent names, seed upsets, venue lore, and weather all come from the same games shown on the season pages.</p>
      </section>

      <section style={{ marginBottom: 56 }}>
        <Heading eyebrow="Postseason records" title="Manager and franchise W–L" detail="Win percentage includes every played bracket game. Championship and consolation paths stay separate so a consolation run cannot disguise title-bracket history." />
        <div className="post-four-grid">
          {(['Championship', 'Consolation'] as const).flatMap(bracket => ([
            <section key={`${bracket}-manager`}><h3 style={{ color: '#f4f4f4', fontSize: 16, margin: '0 0 10px' }}>{bracket} · Managers</h3><RecordTable rows={post.manager_records_by_bracket[bracket]} identity="manager" /></section>,
            <section key={`${bracket}-franchise`}><h3 style={{ color: '#f4f4f4', fontSize: 16, margin: '0 0 10px' }}>{bracket} · Franchises</h3><RecordTable rows={post.franchise_records_by_bracket[bracket]} identity="franchise" /></section>,
          ]))}
        </div>
      </section>

      <section style={{ marginBottom: 56 }}>
        <Heading eyebrow="Postseason players" title="All-time totals and the single-game ceiling" detail="Started Points only. Every single-game line names the manager and opponent, because a record without the victim is wasted rivalry fuel." />
        <div className="post-two-grid" style={{ marginBottom: 16 }}>
          <section>
            <h3 style={{ color: '#f4f4f4', fontSize: 16, margin: '0 0 10px' }}>All-time postseason player totals</h3>
            <Table headers={['Player', 'Pos', 'Started Points', 'Starts', 'PPG', 'Most points with']} minWidth={720}>
              {post.player_totals.slice(0, 20).map((row, index) => <tr key={row.player}>
                <td style={cell('left')}><span style={{ color: index < 3 ? '#f1c21b' : '#6f6f6f', marginRight: 8 }}>#{index + 1}</span>{row.player}</td>
                <td style={{ ...cell(), color: POSITION_COLORS[row.position] }}>{row.position === 'DEF' ? 'D/ST' : row.position}</td>
                <td style={cell()}>{row.points.toFixed(2)}</td><td style={cell()}>{row.starts}</td><td style={cell()}>{row.ppg.toFixed(2)}</td><td style={cell('left')}>{managerName(row.top_manager_id)}</td>
              </tr>)}
            </Table>
          </section>
          <section>
            <div style={{ display: 'flex', gap: 1, overflowX: 'auto', marginBottom: 10 }}>
              {RECORD_POSITIONS.map(pos => <button key={pos} onClick={() => setPosition(pos)} style={{ border: '1px solid #393939', borderTop: `3px solid ${position === pos ? POSITION_COLORS[pos] : '#393939'}`, backgroundColor: position === pos ? '#262626' : '#1c1c1c', color: position === pos ? '#f4f4f4' : '#a8a8a8', padding: '9px 14px', cursor: 'pointer', fontSize: 14, ...mono }}>{pos === 'DEF' ? 'D/ST' : pos}</button>)}
            </div>
            <Table headers={['Player', 'Manager', 'Opponent', 'Bracket', 'Points', 'When']} minWidth={760}>
              {singleGames.map((row, index) => <tr key={`${row.season}-${row.week}-${row.player}-${row.manager_id}`}>
                <td style={cell('left')}><span style={{ color: index < 3 ? '#f1c21b' : '#6f6f6f', marginRight: 8 }}>#{index + 1}</span>{row.player}</td>
                <td style={cell('left')}>{managerName(row.manager_id)}</td><td style={cell('left')}>{managerName(row.opponent_id)}</td><td style={cell('left')}>{row.bracket}</td><td style={cell()}>{row.points.toFixed(2)}</td><td style={cell()}><SeasonWeek season={row.season} week={row.week} /></td>
              </tr>)}
            </Table>
          </section>
        </div>
      </section>

      <section style={{ marginBottom: 64 }}>
        <Heading eyebrow="Postseason multiplier" title="Who changes when the bracket starts?" detail="Career regular-season PPG against career postseason PPG. Every listed manager has at least three postseason games; the tails show the biggest rise and fall." />
        <div className="post-two-grid">
          {[['Risers', post.multipliers.slice(0, 10)], ['Fallers', [...post.multipliers].reverse().slice(0, 10)]].map(([title, rows]) => <section key={String(title)}>
            <h3 style={{ color: '#f4f4f4', fontSize: 16, margin: '0 0 10px' }}>{String(title)}</h3>
            <Table headers={['Manager', 'Regular PPG', 'Postseason PPG', 'Delta', 'Post games']} minWidth={620}>
              {(rows as typeof post.multipliers).map(row => <tr key={row.manager_id}><td style={cell('left')}>{managerName(row.manager_id)}</td><td style={cell()}>{row.regular_ppg.toFixed(2)}</td><td style={cell()}>{row.postseason_ppg.toFixed(2)}</td><td style={{ ...cell(), color: row.delta >= 0 ? '#42be65' : '#ff8389' }}>{row.delta > 0 ? '+' : ''}{row.delta.toFixed(2)}</td><td style={cell()}>{row.postseason_games}</td></tr>)}
            </Table>
          </section>)}
        </div>
      </section>

      <section style={{ marginBottom: 64 }}>
        <Heading eyebrow="The four bowls" title="Every champion, runner-up, MVP, stadium, crowd, and forecast" detail="The 100px art is season-specific. Historical team names are preserved here—current team overrides never rewrite old bowl results." />
        {Object.entries(post.bowls).map(([name, rows]) => <BowlTable key={name} name={name} rows={rows} future={post.future_bowls[name]} />)}
      </section>

      <section style={{ marginBottom: 64 }}>
        <Heading eyebrow="Postseason crime scenes" title="Comebacks, margins, upsets, and bad luck" detail="Comebacks use complete gate timelines only; expected wins use each manager's regular-season scoring distribution from that same season." />
        <div className="post-two-grid">
          <section><h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Greatest postseason comebacks</h3><GameTable rows={post.greatest_comebacks} kind="comeback" /></section>
          <section><h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Tightest postseason games</h3><GameTable rows={post.tightest_games} kind="margin" /></section>
          <section><h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Biggest postseason blowouts</h3><GameTable rows={post.biggest_blowouts} kind="margin" /></section>
          <section><h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Biggest seed upsets · Giant killers</h3><GameTable rows={post.upsets} kind="upset" /></section>
          <section>
            <h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Most unlucky in the postseason</h3>
            <Table headers={['Manager', 'Actual wins', 'Expected wins', 'Luck delta', 'Games']} minWidth={580}>
              {post.unlucky.slice(0, 12).map(row => <tr key={row.manager_id}><td style={cell('left')}>{managerName(row.manager_id)}</td><td style={cell()}>{row.actual_wins}</td><td style={cell()}>{row.expected_wins.toFixed(2)}</td><td style={{ ...cell(), color: row.luck_delta < 0 ? '#ff8389' : '#42be65' }}>{row.luck_delta > 0 ? '+' : ''}{row.luck_delta.toFixed(2)}</td><td style={cell()}>{row.games}</td></tr>)}
            </Table>
          </section>
        </div>
      </section>

      <section>
        <Heading eyebrow="Fictional meteorology department" title="Bowl climate, crowds, and host geography" detail="Indoor bowls are excluded from temperature rankings. The outdoor readings and deliberately absurd venues stay exactly as canon records them." />
        <div className="post-four-grid">
          {[['Coldest bowl games', post.coldest_bowls], ['Warmest bowl games', post.warmest_bowls], ['Most attended bowl games', post.most_attended_bowls]].map(([title, rows]) => <section key={String(title)}>
            <h3 style={{ color: '#f4f4f4', fontSize: 16 }}>{String(title)}</h3>
            <Table headers={['Bowl / year', 'Venue', String(title).includes('attended') ? 'Attendance' : 'Low']} minWidth={620}>
              {(rows as BowlHistoryRow[]).map(row => <tr key={`${title}-${row.bowl}-${row.season}`}><td style={{ ...cell('left'), whiteSpace: 'normal', width: 170, maxWidth: 170 }}>{row.bowl}<div><SeasonWeek season={row.season} /></div></td><td style={{ ...cell('left'), whiteSpace: 'normal', minWidth: 260 }}>{row.venue}<div style={{ color: '#8d8d8d', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}>{row.city}, {row.state}</div></td><td style={cell()}>{String(title).includes('attended') ? (typeof row.attendance === 'number' ? row.attendance.toLocaleString() : row.attendance) : `${row.weather?.emoji ?? ''} ${row.weather?.low}°F`}</td></tr>)}
            </Table>
          </section>)}
          <section>
            <h3 style={{ color: '#f4f4f4', fontSize: 16 }}>Most frequent host states / countries</h3>
            <Table headers={['Location', 'Historical bowl games']} minWidth={440}>
              {hostRows.map((row, index) => <tr key={row.location}><td style={cell('left')}><span style={{ color: index < 3 ? '#f1c21b' : '#6f6f6f', marginRight: 8 }}>#{index + 1}</span>{row.location}</td><td style={cell()}>{row.games}{row.future > 0 ? ` (+${row.future} locked)` : ''}</td></tr>)}
            </Table>
          </section>
        </div>
      </section>

      <style>{`
        .post-two-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        .post-four-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
        @media (max-width: 1055px) { .post-two-grid, .post-four-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
