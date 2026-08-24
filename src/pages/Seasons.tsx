import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SEASONS, getManager, SEASON_DETAIL_YEARS } from '../data/league'
import SeasonDetailBody from '../components/SeasonDetailBody'
import Badge from '../components/Badge'
import AssetImage from '../components/AssetImage'
import { withBase } from '../lib/assetPath'

export default function Seasons() {
  // Selection lives in the URL rather than component state (round 5), so a
  // chosen season is linkable, survives a refresh, and the browser back
  // button steps out of it instead of leaving the page.
  const { year: yearParam } = useParams<{ year: string }>()
  const navigate = useNavigate()
  const selected = yearParam ? Number(yearParam) : null
  const detailRef = useRef<HTMLDivElement>(null)

  const season = selected ? SEASONS.find(s => s.year === selected) : null

  // Thirteen season tiles push the breakdown below the fold, so bring it into
  // view on selection. Respects reduced-motion.
  useEffect(() => {
    if (!selected || !detailRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    detailRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [selected])

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Seasons
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            2013–2025 · 13 seasons · Select a year for details
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '40px 16px 80px' }}>
        {/* Season grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 1,
          backgroundColor: '#393939',
          border: '1px solid #393939',
          marginBottom: 48,
        }}>
          {SEASONS.map(s => {
            const champion = getManager(s.champion)
            const isSelected = selected === s.year
            return (
              <button
                key={s.year}
                onClick={() => navigate(isSelected ? '/seasons' : `/seasons/${s.year}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 20,
                  background: 'none',
                  border: 'none',
                  borderTop: isSelected ? `3px solid ${champion?.primaryColor ?? '#f4f4f4'}` : '3px solid transparent',
                  backgroundColor: isSelected ? '#393939' : '#262626',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms cubic-bezier(0.2,0,0.38,0.9)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#2e2e2e'
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#262626'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 24, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
                    {s.year}
                  </span>
                  {s.asterisk && <Badge type="asterisk" size="sm" label="*" />}
                </div>
                {champion && (
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2 }}>
                      Champion
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: champion.primaryColor }}>
                      {champion.teamName}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#8d8d8d' }}>
                      {s.championTeam}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Points leader
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums' }}>
                    {getManager(s.pointsLeader)?.name} · {s.pointsLeaderPF.toFixed(2)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Season summary + full breakdown, rendered in place under the header */}
        <div ref={detailRef} />
        {season && (() => {
          const champion = getManager(season.champion)
          const runnerUp = getManager(season.runnerUp)
          const third = getManager(season.thirdPlace)
          const consolation = getManager(season.consolation)
          const letty = getManager(season.lettyWinner)
          return (
            <div style={{ border: '1px solid #393939', backgroundColor: '#262626' }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #393939',
                borderTop: `4px solid ${champion?.primaryColor ?? '#f4f4f4'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap',
              }}>
                <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 28, color: '#f4f4f4', margin: 0 }}>
                  {season.year} Season
                </h2>
                {season.asterisk && <Badge type="asterisk" size="md" label={`* ${season.asteriskReason}`} />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
                {[
                  { label: 'Teremana Tequila Bowl', value: champion?.teamName ?? '—', sub: season.championTeam, color: champion?.primaryColor, icon: '🏆' },
                  { label: 'Runner-up', value: runnerUp?.teamName ?? '—', sub: season.runnerUpTeam, color: runnerUp?.primaryColor, icon: '🥈' },
                  { label: 'Tokyo Drift Bowl (3rd)', value: third?.teamName ?? '—', sub: season.thirdPlaceTeam, color: third?.primaryColor, icon: null },
                  { label: 'Wing Bowl (consolation)', value: consolation?.teamName ?? '—', sub: season.consolationTeam, color: consolation?.primaryColor, icon: null },
                  { label: 'Letty Award (PF leader)', value: letty?.teamName ?? '—', sub: `${season.pointsLeaderPF.toFixed(2)} pts`, color: '#f1c21b', icon: <AssetImage src={withBase('images/LettyAward_trophy.png')} alt="Letty Award" size={20} fallback="🏅" /> },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '20px 24px',
                    borderRight: '1px solid #393939',
                    borderBottom: '1px solid #393939',
                    borderLeft: item.color ? `3px solid ${item.color}` : undefined,
                  }}>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: item.color ?? '#f4f4f4', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.icon && <span>{item.icon}</span>}
                      {item.value}
                    </div>
                    {item.sub && (
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d' }}>
                        {item.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )
        })()}

        {season && (
          SEASON_DETAIL_YEARS.includes(season.year)
            ? <SeasonDetailBody year={season.year} />
            : (
              <div style={{ border: '1px solid #393939', backgroundColor: '#262626', padding: 24, marginTop: 32 }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#8d8d8d' }}>
                  Full bowl brackets, standings, and season awards are being built out season by season — {season.year} isn't ready yet.
                </span>
              </div>
            )
        )}
      </div>
    </div>
  )
}
