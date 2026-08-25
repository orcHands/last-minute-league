import type { StandingRowDetail } from '../data/league'
import { divisionKey, getManager } from '../data/league'
import AssetImage from './AssetImage'

interface SeasonDivisionStandingsProps {
  divisions: Record<string, StandingRowDetail[]>
}

const COLS: { label: string; render: (r: StandingRowDetail) => React.ReactNode }[] = [
  {
    label: 'Record (div)',
    render: r => (
      <>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#f4f4f4' }}>{r.wlt}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f' }}>{r.divisionWlt ?? '—'}</div>
      </>
    ),
  },
  {
    label: 'Started pts for',
    render: r => (
      <>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{r.pfTotal.toFixed(2)}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', fontVariantNumeric: 'tabular-nums' }}>{r.pfAvg?.toFixed(2) ?? '—'} avg</div>
      </>
    ),
  },
  {
    label: 'Started pts against',
    render: r => (
      <>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{r.paTotal.toFixed(2)}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', fontVariantNumeric: 'tabular-nums' }}>{r.paAvg?.toFixed(2) ?? '—'} avg</div>
      </>
    ),
  },
  {
    label: 'Bench regret',
    render: r => (
      <>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{r.regretTotal.toFixed(2)}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', fontVariantNumeric: 'tabular-nums' }}>{r.regretAvg?.toFixed(2) ?? '—'} avg</div>
      </>
    ),
  },
]

function DivisionTable({ name, rows }: { name: string; rows: StandingRowDetail[] }) {
  const accent = divisionKey(name) === 'oconnor' ? '#FF3B30' : '#006FFF'
  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', minWidth: 0, flex: '1 1 480px' }}>
      <div style={{ padding: '14px 16px', borderTop: `3px solid ${accent}`, borderBottom: '1px solid #393939' }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: '#f4f4f4' }}>{name}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #393939' }} />
              {COLS.map(c => (
                <th key={c.label} style={{ textAlign: 'right', padding: '8px 12px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #393939', whiteSpace: 'nowrap' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const manager = getManager(r.manager)
              return (
                <tr key={r.team} style={{ borderLeft: `3px solid ${manager?.primaryColor ?? 'transparent'}` }}>
                  <td style={{ padding: '10px 12px', borderBottom: i === rows.length - 1 ? 'none' : '1px solid #2e2e2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#6f6f6f', width: 20, textAlign: 'right' }}>{r.rank}</span>
                      <AssetImage src={manager?.logoSmall ?? ''} alt={manager?.name ?? r.manager} size={22} fallback={<div style={{ width: 22, height: 22, backgroundColor: '#393939' }} />} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: r.playoffs ? '#f4f4f4' : '#c6c6c6' }}>
                          {manager?.name ?? r.manager}
                        </div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
                          {r.team}
                        </div>
                      </div>
                    </div>
                  </td>
                  {COLS.map(c => (
                    <td key={c.label} style={{ padding: '10px 12px', textAlign: 'right', borderBottom: i === rows.length - 1 ? 'none' : '1px solid #2e2e2e' }}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SeasonDivisionStandings({ divisions }: SeasonDivisionStandingsProps) {
  const names = Object.keys(divisions)
  // Brian O'Connor Memorial first, Toretto Family second.
  names.sort((a, b) => {
    const rank = (n: string) => (divisionKey(n) === 'oconnor' ? 0 : divisionKey(n) === 'toretto' ? 1 : 2)
    return rank(a) - rank(b)
  })
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {names.map(name => (
        <DivisionTable key={name} name={name} rows={divisions[name]} />
      ))}
    </div>
  )
}
