import { Link } from 'react-router-dom'
import AssetImage from './AssetImage'
import { getFranchiseDetail, getManager, type FranchiseRecordSplit } from '../data/league'

function percent(record: FranchiseRecordSplit): string {
  const games = record.w + record.l + record.t
  return (games > 0 ? record.w / games : 0).toFixed(3).replace(/^0/, '')
}

function recordLabel(record: FranchiseRecordSplit): string {
  const result = record.t > 0
    ? `${record.w}–${record.l}–${record.t}`
    : `${record.w}–${record.l}`
  return `${result} (${percent(record)})`
}

function compactYears(years: number[]): string {
  if (years.length === 0) return '—'
  const ranges: string[] = []
  let start = years[0]
  let end = years[0]

  for (const year of years.slice(1)) {
    if (year === end + 1) {
      end = year
      continue
    }
    ranges.push(start === end ? String(start) : `${start}–${end}`)
    start = year
    end = year
  }
  ranges.push(start === end ? String(start) : `${start}–${end}`)
  return ranges.join(', ')
}

function managerGradient(managerIds: string[]): string {
  const colors = managerIds
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
        width: 'min(300px, 100%)',
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${color}`,
        backgroundColor: `${color}22`,
      }}
    >
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 32,
        lineHeight: '40px',
        fontWeight: 600,
        color,
      }}>
        {name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

function Badge({ children, original = false }: { children: React.ReactNode; original?: boolean }) {
  const color = original ? '#f1c21b' : '#c6c6c6'
  return (
    <span style={{
      minHeight: 24,
      padding: '3px 8px',
      display: 'inline-flex',
      alignItems: 'center',
      border: `1px solid ${original ? '#f1c21b' : '#6f6f6f'}`,
      backgroundColor: original ? '#f1c21b22' : '#393939',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: 12,
      lineHeight: '16px',
      color,
    }}>
      {children}
    </span>
  )
}

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div style={{ minWidth: 0, padding: '20px 0', borderTop: '1px solid #393939' }}>
      <div style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 12,
        lineHeight: '16px',
        color: '#8d8d8d',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 16,
        lineHeight: '22px',
        color: '#f4f4f4',
        fontVariantNumeric: 'tabular-nums',
        overflowWrap: 'anywhere',
      }}>
        {value}
      </div>
    </div>
  )
}

export default function FranchiseDetailBody({ franchiseId }: { franchiseId: string }) {
  const detail = getFranchiseDetail(franchiseId)

  if (!detail) {
    return (
      <div style={{ border: '1px solid #393939', backgroundColor: '#262626', padding: 24 }}>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#c6c6c6', margin: '0 0 16px' }}>
          That franchise could not be found.
        </p>
        <Link to="/franchises" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#78a9ff' }}>
          Back to all franchises
        </Link>
      </div>
    )
  }

  const { franchise, homeVenue } = detail
  const manager = getManager(detail.featuredManagerId)
  if (!manager) return null

  const teamName = franchise.latestTeamNickname ?? manager.teamName
  const championships = detail.championshipYears.length > 0
    ? detail.championshipYears.join(', ')
    : 'None'
  const divisionTitles = detail.divisionTitleYears.length > 0
    ? detail.divisionTitleYears.join(', ')
    : 'None'

  return (
    <article style={{ border: '1px solid #393939', backgroundColor: '#1c1c1c' }}>
      <div aria-hidden="true" style={{ height: 4, background: managerGradient(franchise.managers) }} />

      <div
        className="franchise-detail-hero"
        style={{
          position: 'relative',
          minHeight: 420,
          overflow: 'hidden',
          backgroundColor: '#262626',
          backgroundImage: detail.headerImage
            ? `linear-gradient(90deg, rgba(22,22,22,.92), rgba(22,22,22,.42)), url(${detail.headerImage})`
            : 'linear-gradient(120deg, #262626 0%, #1c1c1c 55%, #262626 100%)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {!detail.headerImage && (
          <div aria-hidden="true" style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.38,
            backgroundImage: 'repeating-linear-gradient(135deg, transparent 0, transparent 48px, #393939 49px, #393939 50px)',
          }} />
        )}

        <div className="franchise-detail-identity" style={{ position: 'relative', zIndex: 1 }}>
          <div className="franchise-detail-logo">
            {manager.logoLarge ? (
              <AssetImage
                src={manager.logoLarge}
                alt={`${teamName} logo`}
                width={300}
                height={300}
                style={{ width: 'min(300px, 100%)', height: 300 }}
                fallback={<Monogram name={teamName} color={manager.primaryColor} />}
              />
            ) : (
              <Monogram name={teamName} color={manager.primaryColor} />
            )}
          </div>

          <div style={{ minWidth: 0, alignSelf: 'end' }}>
            <div style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              lineHeight: '16px',
              color: '#8d8d8d',
              marginBottom: 8,
            }}>
              Franchise · {detail.managerLabel}
            </div>
            <h2 style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 32,
              lineHeight: '40px',
              fontWeight: 400,
              color: '#f4f4f4',
              margin: 0,
              overflowWrap: 'anywhere',
            }}>
              {teamName}
            </h2>
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 20,
              lineHeight: '28px',
              color: manager.primaryColor,
              margin: '4px 0 0',
            }}>
              {manager.fullName}
            </p>
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 14,
              lineHeight: '18px',
              color: '#c6c6c6',
              margin: '20px 0 0',
            }}>
              {homeVenue.city}, {homeVenue.state} · {homeVenue.stadium}{' '}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                ({homeVenue.capacity.toLocaleString('en-US')})
              </span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {!franchise.active && <Badge>Retired</Badge>}
              {detail.originalThree && <Badge original>Original 3</Badge>}
            </div>
          </div>
        </div>

        {!detail.headerImage && (
          <span aria-hidden="true" style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12,
            lineHeight: '16px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6f6f6f',
          }}>
            Header image placeholder
          </span>
        )}
      </div>

      <div className="franchise-detail-stats" style={{ borderTop: '1px solid #393939' }}>
        <Stat label="Years active" value={compactYears(detail.yearsActive)} />
        <Stat label="Regular season W–L" value={recordLabel(detail.regularSeasonRecord)} />
        <Stat label="Playoff W–L" value={recordLabel(detail.playoffRecord)} />
        <Stat label="Championships" value={championships} />
        <Stat label="Division titles" value={divisionTitles} />
      </div>

      <div style={{ borderTop: '1px solid #393939', minHeight: 48, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Link to="/franchises" style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          lineHeight: '18px',
          color: '#78a9ff',
          textDecoration: 'none',
        }}>
          ← All franchises
        </Link>
      </div>

      <style>{`
        .franchise-detail-identity {
          min-height: 420px;
          display: grid;
          grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
          align-items: center;
          gap: 48px;
          padding: 48px;
        }
        .franchise-detail-logo {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .franchise-detail-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 24px;
          padding: 0 24px;
        }
        @media (max-width: 1055px) {
          .franchise-detail-identity {
            gap: 32px;
            padding: 32px;
          }
          .franchise-detail-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 671px) {
          .franchise-detail-identity {
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
            padding: 48px 20px 32px;
          }
          .franchise-detail-logo {
            justify-content: flex-start;
          }
          .franchise-detail-stats {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
            padding: 0 20px;
          }
        }
      `}</style>
    </article>
  )
}
