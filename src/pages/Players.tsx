import aggregations from '../data/processed/aggregations.json'
import bowlMvpsJson from '../data/processed/bowl_mvps.json'
import { normalizeManager } from '../data/managerCanon'

interface BowlMvpEntry {
  season: number
  bowl: string
  winner_manager: string
  mvp: { player: string; position: string; points: number; manager: string }
}

const TEREMANA_BOWL = 'Teremana Tequila Bowl'
const bowlsBySeasonYear = bowlMvpsJson.bowls as unknown as Record<string, Record<string, BowlMvpEntry>>

export default function Players() {
  const topPlayers = aggregations.leaderboard_started.slice(0, 10).map((p, i) => ({
    name: p.player,
    pos: p.pos,
    pts: p.pts,
    note: i === 0 ? 'All-time started points leader' : undefined,
  }))

  const bowlMVPs = Object.keys(bowlsBySeasonYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map(year => {
      const entry = bowlsBySeasonYear[String(year)][TEREMANA_BOWL]
      return {
        season: entry.season,
        bowl: 'Teremana',
        player: entry.mvp.player,
        manager: normalizeManager(entry.mvp.manager),
        pts: entry.mvp.points,
      }
    })

  const posColors: Record<string, string> = {
    QB: '#4589ff', RB: '#42be65', WR: '#f1c21b', TE: '#FF832B', K: '#8d8d8d', DEF: '#8A3FFC', DST: '#8A3FFC',
  }

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Players
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            Started-points leaders · Bowl MVPs · Positional records
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '40px 16px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        {/* All-time started points */}
        <div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8d8d8d', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>All-time started pts</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
          </div>
          <div style={{ border: '1px solid #393939' }}>
            {topPlayers.map((p, i) => (
              <div key={p.name} style={{
                display: 'grid',
                gridTemplateColumns: '32px 24px 1fr auto',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: i < topPlayers.length - 1 ? '1px solid #393939' : undefined,
                backgroundColor: '#262626',
                gap: 12,
                transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', textAlign: 'right' }}>{i + 1}</span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
                  color: posColors[p.pos] ?? '#8d8d8d',
                  border: `1px solid ${posColors[p.pos] ?? '#8d8d8d'}30`,
                  padding: '1px 3px',
                  textAlign: 'center',
                }}>
                  {p.pos}
                </span>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>{p.name}</div>
                  {p.note && <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', fontStyle: 'italic' }}>{p.note}</div>}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: i === 0 ? '#f1c21b' : '#f4f4f4', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                  {p.pts.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bowl MVPs */}
        <div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8d8d8d', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Teremana Bowl MVPs</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
          </div>
          <div style={{ border: '1px solid #393939' }}>
            {bowlMVPs.map((m, i) => (
              <div key={`${m.season}-${m.player}`} style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: i < bowlMVPs.length - 1 ? '1px solid #393939' : undefined,
                backgroundColor: '#262626',
                gap: 12,
                transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>{m.season}</span>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>{m.player}</div>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
                  {m.pts.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#525252', marginTop: 12, fontStyle: 'italic' }}>
            13 Teremana Tequila Bowl MVPs shown · 52 total across all four bowls, full table coming.
          </p>
        </div>
      </div>
    </div>
  )
}
