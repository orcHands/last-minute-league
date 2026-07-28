import { useMemo, useState } from 'react'
import { MANAGERS, FRANCHISES, getManager } from '../data/league'

type Tab = 'franchise' | 'manager'

interface Row {
  id: string
  label: string
  subLabel: string | null
  color: string
  logoLarge: string | null
  monogram: string
  retired: boolean
  w: number
  l: number
  t: number
  pf: number
  avgPF: number
  pa: number
  avgPA: number
  playoffAppearances: number
  divisionTitles: number
  championships: number
}

type SortKey =
  | 'pct' | 'avgPF' | 'avgPA' | 'delta'
  | 'playoffAppearances' | 'divisionTitles' | 'championships'

function pct(w: number, l: number, t: number): number {
  const games = w + l + t
  return games > 0 ? (w + t * 0.5) / games : 0
}

function buildManagerRows(): Row[] {
  return MANAGERS
    .map((m): Row => ({
      id: m.id,
      label: m.teamName,
      subLabel: m.name,
      color: m.primaryColor,
      logoLarge: m.logoLarge,
      monogram: m.name.slice(0, 2).toUpperCase(),
      retired: !m.active,
      w: m.careerRecord.w,
      l: m.careerRecord.l,
      t: m.careerRecord.t,
      pf: m.careerPF,
      avgPF: m.avgPF,
      pa: m.careerPA,
      avgPA: m.avgPA,
      playoffAppearances: m.playoffAppearances,
      divisionTitles: m.divisionTitles,
      championships: m.championships,
    }))
}

function buildFranchiseRows(): Row[] {
  return FRANCHISES.map((f): Row => {
    const owner = getManager(f.managers[f.managers.length - 1])
    return {
      id: f.id,
      label: f.nickname,
      subLabel: owner?.name ?? null,
      color: owner?.primaryColor ?? '#8d8d8d',
      logoLarge: owner?.logoLarge ?? null,
      monogram: f.nickname.slice(0, 2).toUpperCase(),
      retired: !f.active,
      w: f.allTimeRecord.w,
      l: f.allTimeRecord.l,
      t: f.allTimeRecord.t,
      pf: f.allTimePF,
      avgPF: f.avgPF,
      pa: f.allTimePA,
      avgPA: f.avgPA,
      playoffAppearances: f.playoffAppearances,
      divisionTitles: f.divisionTitles,
      championships: f.championships,
    }
  })
}

function EntityCell({ row }: { row: Row }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div style={{ width: 3, height: 40, backgroundColor: row.color, flexShrink: 0 }} />
      {row.logoLarge && !imgError ? (
        <img
          src={row.logoLarge}
          alt=""
          width={40}
          height={40}
          style={{ objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: row.color + '22',
            border: `1px solid ${row.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, color: row.color }}>
            {row.monogram}
          </span>
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '18px',
            color: '#f4f4f4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.label}
        </div>
        {row.subLabel && (
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              lineHeight: '16px',
              color: '#8d8d8d',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.subLabel}
            {row.retired && <span style={{ marginLeft: 6, color: '#6f6f6f' }}>· retired</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AllTimeStandingsTable() {
  const [tab, setTab] = useState<Tab>('franchise')
  const [sortKey, setSortKey] = useState<SortKey>('pct')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const franchiseRows = useMemo(buildFranchiseRows, [])
  const managerRows = useMemo(buildManagerRows, [])
  const rows = tab === 'franchise' ? franchiseRows : managerRows

  const sorted = useMemo(() => {
    const withDerived = rows.map(r => ({ ...r, _pct: pct(r.w, r.l, r.t), _delta: r.avgPF - r.avgPA }))
    const value = (r: (typeof withDerived)[number]): number => {
      switch (sortKey) {
        case 'pct': return r._pct
        case 'avgPF': return r.avgPF
        case 'avgPA': return r.avgPA
        case 'delta': return r._delta
        case 'playoffAppearances': return r.playoffAppearances
        case 'divisionTitles': return r.divisionTitles
        case 'championships': return r.championships
      }
    }
    return [...withDerived].sort((a, b) => (sortDir === 'desc' ? value(b) - value(a) : value(a) - value(b)))
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const headerStyle = (key: SortKey): React.CSSProperties => ({
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    lineHeight: '16px',
    color: sortKey === key ? '#f4f4f4' : '#c6c6c6',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    padding: '10px 12px',
    textAlign: 'right',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    backgroundColor: '#393939',
    border: 'none',
    outline: 'none',
  })

  const cellMono: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 400,
    fontSize: 14,
    color: '#f4f4f4',
    padding: '10px 12px',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  }

  const cellSub: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 400,
    fontSize: 11,
    color: '#8d8d8d',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 2,
  }

  const SortIndicator = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span style={{ marginLeft: 4, color: '#f4f4f4' }}>{sortDir === 'desc' ? '↓' : '↑'}</span> : null

  const columns: { key: SortKey; label: string }[] = [
    { key: 'pct', label: 'W–L–T' },
    { key: 'avgPF', label: 'Points For' },
    { key: 'avgPA', label: 'Points Against' },
    { key: 'delta', label: 'Delta' },
    { key: 'playoffAppearances', label: 'Playoff Apps' },
    { key: 'divisionTitles', label: 'Div. Titles' },
    { key: 'championships', label: 'Rings' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {([
          { t: 'franchise' as Tab, label: `Franchise (${franchiseRows.length})` },
          { t: 'manager' as Tab, label: `Manager (${managerRows.length})` },
        ]).map(({ t, label }) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px',
              background: 'none',
              border: '1px solid #393939',
              borderRight: t === 'franchise' ? 'none' : '1px solid #393939',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: tab === t ? '#f4f4f4' : '#c6c6c6',
              backgroundColor: tab === t ? '#393939' : '#262626',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ overflow: 'hidden', border: '1px solid #393939' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1040 }}>
            <thead>
              <tr style={{ backgroundColor: '#393939' }}>
                <th
                  style={{
                    ...headerStyle('pct'),
                    width: 40,
                    textAlign: 'center',
                    color: '#8d8d8d',
                    cursor: 'default',
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    ...headerStyle('pct'),
                    textAlign: 'left',
                    cursor: 'default',
                    paddingLeft: 16,
                    minWidth: 220,
                  }}
                >
                  {tab === 'franchise' ? 'Franchise' : 'Manager'}
                </th>
                {columns.map(c => (
                  <th
                    key={c.key}
                    style={headerStyle(c.key)}
                    onClick={() => toggleSort(c.key)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && toggleSort(c.key)}
                  >
                    {c.label} <SortIndicator k={c.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #393939',
                    backgroundColor: '#262626',
                    transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <td style={{ ...cellMono, textAlign: 'center', color: '#8d8d8d', fontSize: 12, width: 40 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '8px 12px 8px 16px', minWidth: 220 }}>
                    <EntityCell row={row} />
                  </td>
                  <td style={{ ...cellMono, color: row._pct >= 0.5 ? '#42be65' : '#fa4d56' }}>
                    {row.w}–{row.l}{row.t > 0 ? `–${row.t}` : ''}
                    <div style={cellSub}>{(row._pct * 100).toFixed(1)}%</div>
                  </td>
                  <td style={cellMono}>
                    {row.avgPF.toFixed(1)} / gm
                    <div style={cellSub}>{row.pf.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </td>
                  <td style={cellMono}>
                    {row.avgPA.toFixed(1)} / gm
                    <div style={cellSub}>{row.pa.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </td>
                  <td style={{ ...cellMono, color: row._delta >= 0 ? '#42be65' : '#fa4d56' }}>
                    {row._delta >= 0 ? '+' : ''}{row._delta.toFixed(1)} / gm
                    <div style={cellSub}>
                      {row.pf - row.pa >= 0 ? '+' : ''}
                      {(row.pf - row.pa).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </td>
                  <td style={cellMono}>{row.playoffAppearances}</td>
                  <td style={cellMono}>
                    {row.divisionTitles > 0 ? row.divisionTitles : <span style={{ color: '#525252' }}>—</span>}
                  </td>
                  <td style={{ ...cellMono, textAlign: 'right' }}>
                    {row.championships > 0 ? (
                      <span style={{ color: '#f1c21b' }}>{'🏆'.repeat(row.championships)}</span>
                    ) : (
                      <span style={{ color: '#525252' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
