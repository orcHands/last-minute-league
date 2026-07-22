import { useState } from 'react'
import { SEASONS, getManager } from '../data/league'
import Badge from '../components/Badge'
import { withBase } from '../lib/assetPath'

const BOWLS = [
  {
    id: 'teremana',
    name: 'Teremana Tequila Bowl',
    subtitle: 'Championship',
    rank: '1st–2nd',
    accent: '#f1c21b',
    description: 'The main event. The crown. Thirteen years of champions, four of them named Jay.',
    logoPath: (year: number) => withBase(`images/BowlGame_logos/TeremanaTequilaBowl_logos/TeremanaBowl_${year}.png`),
  },
  {
    id: 'tokyo',
    name: 'Kumho Tires Tokyo Drift Bowl',
    subtitle: '3rd Place',
    rank: '3rd–4th',
    accent: '#4589ff',
    description: 'The race for bronze. More competitive than it gets credit for.',
    logoPath: (year: number) => withBase(`images/BowlGame_logos/TokyoDriftBowl_Logos/TokyoDriftBowl_${year}.png`),
  },
  {
    id: 'wing',
    name: 'Ludacris Presents the Magic City Lemon Pepper Wing Bowl',
    subtitle: 'Consolation',
    rank: '5th–6th',
    accent: '#FF832B',
    description: 'The longest name in fantasy sports. A title worth having.',
    logoPath: (year: number) => withBase(`images/BowlGame_logos/LemonPepperWingBowl_Logos/WingBowl_${year}.png`),
  },
  {
    id: 'voltron',
    name: 'Voltron Global Bowl Hosted by Tyrese Gibson',
    subtitle: '9th Place',
    rank: '9th–10th',
    accent: '#8A3FFC',
    description: 'Rock bottom never looked so branded.',
    logoPath: (year: number) => withBase(`images/BowlGame_logos/VoltronGlobalBowl_Logos/VoltronGlobalBowl_${year}.png`),
  },
]

const LATEST_SEASON = Math.max(...SEASONS.map(s => s.year))

function BowlLogo({ src, alt, size = 64 }: { src: string; alt: string; size?: number }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div
        style={{
          width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#1a1a1a', border: '1px solid #393939', flexShrink: 0, fontSize: size * 0.4,
        }}
        aria-hidden="true"
      >
        🏆
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={() => setError(true)}
    />
  )
}

export default function Postseason() {
  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Post-season & Bowls
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            Four named bowls · 13 seasons of bracket history · 52 Bowl MVPs
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '40px 16px 80px' }}>
        {/* Bowl overview */}
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8d8d8d', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>The four bowls</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, backgroundColor: '#393939', border: '1px solid #393939', marginBottom: 64 }}>
          {BOWLS.map(bowl => (
            <div key={bowl.id} style={{ backgroundColor: '#262626', padding: 24, borderTop: `3px solid ${bowl.accent}`, display: 'flex', gap: 16 }}>
              <BowlLogo src={bowl.logoPath(LATEST_SEASON)} alt={`${bowl.name} logo`} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {bowl.subtitle} · {bowl.rank}
                </div>
                <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 16, color: '#f4f4f4', margin: '0 0 12px', lineHeight: '22px' }}>
                  {bowl.name}
                </h2>
                <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#8d8d8d', margin: 0, lineHeight: '18px' }}>
                  {bowl.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bowl history table */}
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8d8d8d', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Teremana Tequila Bowl history</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 }}>
            <thead>
              <tr style={{ backgroundColor: '#393939' }}>
                {['Year', 'Champion', 'Runner-up', 'Points leader (Letty)', 'Notes'].map(h => (
                  <th key={h} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEASONS.map(s => {
                const champion = getManager(s.champion)
                const runnerUp = getManager(s.runnerUp)
                const letty = getManager(s.lettyWinner)
                return (
                  <tr key={s.year} style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                  >
                    <td style={{ padding: '10px 12px', borderLeft: champion ? `3px solid ${champion.primaryColor}` : undefined, paddingLeft: champion ? 12 : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BowlLogo src={BOWLS[0].logoPath(s.year)} alt={`Teremana Tequila Bowl ${s.year}`} size={28} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{s.year}</span>
                        {s.asterisk && <Badge type="asterisk" size="sm" label="*" />}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: champion?.primaryColor ?? '#f4f4f4' }}>
                        {champion?.teamName}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d' }}>{s.championTeam}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#c6c6c6' }}>{runnerUp?.teamName}</div>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d' }}>{s.runnerUpTeam}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#c6c6c6' }}>{letty?.name}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>{s.pointsLeaderPF.toFixed(2)} pts</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {s.asteriskReason
                        ? <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#8d8d8d', fontStyle: 'italic' }}>{s.asteriskReason}</span>
                        : <span style={{ color: '#525252' }}>—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
