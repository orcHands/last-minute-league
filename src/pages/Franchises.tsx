import { Link } from 'react-router-dom'
import { FRANCHISES, getManager, type Franchise } from '../data/league'
import AssetImage from '../components/AssetImage'

function ordinal(rank: number): string {
  const mod100 = rank % 100
  if (mod100 >= 11 && mod100 <= 13) return `${rank}th`
  if (rank % 10 === 1) return `${rank}st`
  if (rank % 10 === 2) return `${rank}nd`
  if (rank % 10 === 3) return `${rank}rd`
  return `${rank}th`
}

function seasonRange(seasons: number[]): string {
  if (seasons.length === 0) return '—'
  if (seasons.length === 1) return String(seasons[0])
  return `${seasons[0]}–${seasons[seasons.length - 1]}`
}

function franchiseAccent(franchise: Franchise): string {
  const colors = franchise.managers
    .map(id => getManager(id)?.primaryColor)
    .filter((color): color is string => Boolean(color))

  if (colors.length === 0) return '#393939'
  if (colors.length === 1) return colors[0]

  return `linear-gradient(90deg, ${colors
    .map((color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`)
    .join(', ')})`
}

function Monogram({ name, color }: { name: string; color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${color}`,
        backgroundColor: `${color}22`,
      }}
    >
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 20,
        fontWeight: 600,
        color,
      }}>
        {name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

function FranchiseCard({ franchise }: { franchise: Franchise }) {
  const featuredManager = getManager(franchise.managers[franchise.managers.length - 1])
  if (!featuredManager) return null
  const previousManagers = franchise.managerStints
    .slice(0, -1)
    .map(stint => {
      const manager = getManager(stint.managerId)
      return manager
        ? `${manager.name} (${seasonRange(stint.seasons)} · ${manager.homeLocation})`
        : null
    })
    .filter((entry): entry is string => Boolean(entry))
  const isOriginalThree = ['brice', 'carter', 'whitaker'].includes(franchise.id)

  const record = franchise.allTimeRecord.t > 0
    ? `${franchise.allTimeRecord.w}–${franchise.allTimeRecord.l}–${franchise.allTimeRecord.t}`
    : `${franchise.allTimeRecord.w}–${franchise.allTimeRecord.l}`
  const winPct = franchise.winPct.toFixed(3).replace(/^0/, '')

  const achievement = franchise.championships > 0
    ? { label: 'Championships', value: '💍'.repeat(franchise.championships) }
    : {
      label: 'Highest finish',
      value: franchise.bestFinish
        ? `${ordinal(franchise.bestFinish.rank)} · ${franchise.bestFinish.season}`
        : '—',
    }

  const stats = [
    { label: franchise.allTimeRecord.t > 0 ? 'Franchise W–L–T' : 'Franchise W–L', value: `${record} (${winPct})` },
    { label: 'Franchise PPG', value: franchise.avgPF.toFixed(2) },
    achievement,
    { label: 'Division Titles', value: franchise.divisionTitleYears.length > 0 ? franchise.divisionTitleYears.join(', ') : 'None' },
  ]

  return (
    <article
      style={{
        minWidth: 0,
        minHeight: 390,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#262626',
        transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
      }}
      onMouseEnter={event => { event.currentTarget.style.backgroundColor = '#2e2e2e' }}
      onMouseLeave={event => { event.currentTarget.style.backgroundColor = '#262626' }}
    >
      <div aria-hidden="true" style={{ height: 4, flexShrink: 0, background: franchiseAccent(franchise) }} />

      <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {featuredManager.logoLarge ? (
          <AssetImage
            src={featuredManager.logoLarge}
            alt={`${featuredManager.name} logo`}
            size={80}
            fallback={<Monogram name={featuredManager.name} color={featuredManager.primaryColor} />}
          />
        ) : (
          <Monogram name={featuredManager.name} color={featuredManager.primaryColor} />
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12,
            lineHeight: '16px',
            color: '#8d8d8d',
            marginBottom: 4,
          }}>
            {franchise.active ? 'Current manager' : 'Last manager'} · {featuredManager.name}
          </div>
          <h2 style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 20,
            lineHeight: '28px',
            fontWeight: 600,
            color: '#f4f4f4',
            margin: 0,
            overflowWrap: 'anywhere',
          }}>
            {franchise.latestTeamNickname ?? featuredManager.teamName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              lineHeight: '16px',
              color: '#8d8d8d',
            }}>
              {featuredManager.homeLocation}
            </span>
            {!franchise.active && (
              <span style={{
                padding: '2px 8px',
                border: '1px solid #6f6f6f',
                backgroundColor: '#393939',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 12,
                lineHeight: '16px',
                color: '#c6c6c6',
              }}>
                Retired
              </span>
            )}
            {isOriginalThree && (
              <span style={{
                padding: '2px 8px',
                border: '1px solid #f1c21b',
                backgroundColor: '#f1c21b22',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 12,
                lineHeight: '16px',
                color: '#f1c21b',
              }}>
                Original 3
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#393939' }} />

      <div style={{
        padding: '12px 24px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: 24,
      }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ padding: '12px 0', borderBottom: '1px solid #393939', textAlign: 'right' }}>
            <div style={{
              minHeight: 32,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              lineHeight: '16px',
              color: '#8d8d8d',
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16,
              lineHeight: '22px',
              color: '#f4f4f4',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 24px 20px' }}>
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 12,
          lineHeight: '16px',
          color: '#8d8d8d',
          marginBottom: 4,
        }}>
          Previous Managers
        </div>
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          lineHeight: '18px',
          color: previousManagers.length > 0 ? '#c6c6c6' : '#6f6f6f',
        }}>
          {previousManagers.length > 0 ? previousManagers.join(' → ') : 'None'}
        </div>
      </div>

      <Link
        to={`/franchises/${franchise.id}`}
        style={{
          marginTop: 'auto',
          minHeight: 48,
          padding: '0 24px',
          borderTop: '1px solid #393939',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          lineHeight: '18px',
          color: '#78a9ff',
          textDecoration: 'none',
        }}
      >
        <span>View This Franchise</span>
        <span aria-hidden="true" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16 }}>→</span>
      </Link>
    </article>
  )
}

export default function Franchises() {
  const activeCount = FRANCHISES.filter(franchise => franchise.active).length
  const retiredCount = FRANCHISES.length - activeCount
  const rankedFranchises = [...FRANCHISES].sort((a, b) => b.winPct - a.winPct)

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '40px',
            color: '#f4f4f4',
            margin: '0 0 8px',
          }}>
            Franchises
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#8d8d8d', margin: 0 }}>
            {FRANCHISES.length} franchises · {activeCount} active · {retiredCount} retired
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '40px 16px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 1,
          border: '1px solid #393939',
          backgroundColor: '#393939',
        }}>
          {rankedFranchises.map(franchise => <FranchiseCard key={franchise.id} franchise={franchise} />)}
        </div>
      </div>
    </div>
  )
}
