import { useState } from 'react'
import { getManager } from '../data/league'

interface StandingRow {
  managerId: string
  w: number
  l: number
  pct: number
  pf: number
  championships: number
}

interface StandingsTableProps {
  rows: StandingRow[]
  title?: string
  showRank?: boolean
}

type SortKey = 'pct' | 'w' | 'pf' | 'championships'

function ManagerAvatar({ managerId }: { managerId: string }) {
  const manager = getManager(managerId)
  if (!manager) return null

  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      {/* Accent bar */}
      <div
        style={{
          width: 3,
          height: 28,
          backgroundColor: manager.primaryColor,
          flexShrink: 0,
        }}
      />
      {/* Small logo or monogram */}
      {manager.logoSmall && !imgError ? (
        <img
          src={manager.logoSmall}
          alt=""
          width={20}
          height={20}
          style={{ objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: manager.primaryColor + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              color: manager.primaryColor,
            }}
          >
            {manager.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      {/* Name */}
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: '#f4f4f4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {manager.teamName}
      </span>
      {!manager.active && (
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 11,
            color: '#6f6f6f',
          }}
        >
          (ret.)
        </span>
      )}
    </div>
  )
}

export default function StandingsTable({ rows, title, showRank = true }: StandingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('pct')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const sorted = [...rows].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    return sortDir === 'desc' ? vb - va : va - vb
  })

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
    fontSize: 12,
    lineHeight: '16px',
    color: sortKey === key ? '#f4f4f4' : '#c6c6c6',
    letterSpacing: '0.32em',
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

  const SortIndicator = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span style={{ marginLeft: 4, color: '#f4f4f4' }}>
        {sortDir === 'desc' ? '↓' : '↑'}
      </span>
    ) : null

  return (
    <div style={{ overflow: 'hidden', border: '1px solid #393939' }}>
      {title && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#262626',
            borderBottom: '1px solid #393939',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: '#f4f4f4',
          }}
        >
          {title}
        </div>
      )}

      {/* Horizontal scroll wrapper */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 500 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {showRank && (
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
              )}
              <th
                style={{
                  ...headerStyle('pct'),
                  textAlign: 'left',
                  cursor: 'default',
                  paddingLeft: 16,
                  minWidth: 160,
                }}
              >
                Team
              </th>
              <th
                style={headerStyle('w')}
                onClick={() => toggleSort('w')}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleSort('w')}
              >
                W–L <SortIndicator k="w" />
              </th>
              <th
                style={headerStyle('pct')}
                onClick={() => toggleSort('pct')}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleSort('pct')}
              >
                PCT <SortIndicator k="pct" />
              </th>
              <th
                style={headerStyle('pf')}
                onClick={() => toggleSort('pf')}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleSort('pf')}
              >
                PF <SortIndicator k="pf" />
              </th>
              <th
                style={headerStyle('championships')}
                onClick={() => toggleSort('championships')}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleSort('championships')}
              >
                Rings <SortIndicator k="championships" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.managerId}
                style={{
                  borderBottom: '1px solid #393939',
                  backgroundColor: '#262626',
                  transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#393939'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#262626'
                }}
              >
                {showRank && (
                  <td
                    style={{
                      ...cellMono,
                      textAlign: 'center',
                      color: '#8d8d8d',
                      fontSize: 12,
                      width: 40,
                    }}
                  >
                    {i + 1}
                  </td>
                )}
                <td style={{ padding: '8px 12px 8px 16px', minWidth: 160 }}>
                  <ManagerAvatar managerId={row.managerId} />
                </td>
                <td style={cellMono}>
                  {row.w}–{row.l}
                </td>
                <td style={{ ...cellMono, color: row.pct >= 0.5 ? '#42be65' : '#fa4d56' }}>
                  {(row.pct * 100).toFixed(1)}%
                </td>
                <td style={cellMono}>
                  {row.pf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ ...cellMono, textAlign: 'center' }}>
                  {row.championships > 0 ? (
                    <span style={{ color: '#f1c21b' }}>
                      {'🏆'.repeat(row.championships)}
                    </span>
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
  )
}
