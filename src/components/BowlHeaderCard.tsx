import type { BowlCard } from '../data/league'
import { getManager } from '../data/league'
import { bowlLogoUrl, bowlLogoBoxHeight } from '../data/bowlAssets'
import { bowlMvpPhotoUrl } from '../data/seasonAwardPhotos'
import AssetImage from './AssetImage'

const BOWL_LOGO_TARGET_HEIGHT = 300

interface BowlHeaderCardProps {
  bowl: BowlCard
  year: number
  venue: { venue: string; city: string; state: string; attendance: number } | null
}

export default function BowlHeaderCard({ bowl, year, venue }: BowlHeaderCardProps) {
  const winner = getManager(bowl.winnerManager)
  const loser = getManager(bowl.loserManager)
  if (!winner || !loser) return null

  const [winnerScore, loserScore] = bowl.finalScore.split('-')
  const logo = bowlLogoUrl(bowl.bowl, year)
  const logoBoxHeight = bowlLogoBoxHeight(bowl.bowl, BOWL_LOGO_TARGET_HEIGHT)
  const mvpManager = bowl.mvp ? getManager(bowl.mvp.manager) : null
  const headshot = bowl.mvp ? bowlMvpPhotoUrl(year, bowl.key) : null

  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: logoBoxHeight + 48 }}>
        <AssetImage
          src={logo ?? ''}
          alt={bowl.bowl}
          width={logoBoxHeight * 1.4}
          height={logoBoxHeight}
          style={{ width: '100%', height: logoBoxHeight, maxWidth: logoBoxHeight * 1.4 }}
          fallback={<div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 20, lineHeight: '28px', color: '#c6c6c6', textAlign: 'center' }}>{bowl.bowl}</div>}
        />
      </div>

      <div style={{ padding: '0 16px 12px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#f4f4f4', lineHeight: '18px' }}>
          {bowl.bowlLabel}
        </div>
        {venue && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', marginTop: 6 }}>
            {venue.venue} · {venue.city}, {venue.state}
            <br />
            Attendance {venue.attendance.toLocaleString()}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #393939' }}>
        {[
          { manager: winner, team: bowl.winnerTeam, score: winnerScore, win: true },
          { manager: loser, team: bowl.loserTeam, score: loserScore, win: false },
        ].map(row => (
          <div
            key={row.manager!.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 16px', borderLeft: `3px solid ${row.win ? row.manager!.primaryColor : 'transparent'}`,
              borderBottom: '1px solid #393939',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <AssetImage src={row.manager!.logoSmall} alt={row.manager!.name} size={20} fallback={<div style={{ width: 20, height: 20, backgroundColor: '#393939' }} />} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: row.win ? 600 : 400, fontSize: 14, lineHeight: '18px', color: row.win ? '#f4f4f4' : '#8d8d8d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.manager!.name}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.team}
                </div>
              </div>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, lineHeight: '28px', color: row.win ? '#f4f4f4' : '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
              {Number(row.score).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {bowl.mvp && mvpManager && (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AssetImage
            src={headshot ?? ''}
            alt={bowl.mvp.player}
            size={36}
            fallback={<div style={{ width: 36, height: 36, backgroundColor: '#393939', borderRadius: '50%' }} />}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Most Valuable Player
            </div>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: '#f4f4f4' }}>
              {bowl.mvp.position} {bowl.mvp.player}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: mvpManager.primaryColor }}>
              {mvpManager.name} · {bowl.mvp.points.toFixed(2)} pts
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
