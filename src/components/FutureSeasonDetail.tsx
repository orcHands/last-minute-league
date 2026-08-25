import AssetImage from './AssetImage'
import { FUTURE_SEASON, getManager } from '../data/league'
import { bowlLogoUrl } from '../data/bowlAssets'

const mono: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontVariantNumeric: 'tabular-nums',
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{ border: '1px solid #393939', borderLeft: '4px solid #6f6f6f', backgroundColor: '#1c1c1c', padding: 20 }}>
      <div style={{ color: '#f4f4f4', fontSize: 16, lineHeight: '22px', marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#8d8d8d', fontSize: 14, lineHeight: '20px' }}>{detail}</div>
    </div>
  )
}

export default function FutureSeasonDetail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, marginTop: 32 }}>
      <section>
        <div style={{ color: '#f1c21b', fontSize: 12, lineHeight: '16px', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
          Season on deck
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#f4f4f4', fontSize: 28, lineHeight: '36px', fontWeight: 400 }}>2026 league field</h2>
        <p style={{ margin: 0, maxWidth: 900, color: '#a8a8a8', fontSize: 14, lineHeight: '20px' }}>
          Current team identities, division assignments, keeper slots, draft order, and locked bowl sites are official. Scores, standings, awards, and postseason results will remain empty until games are played.
        </p>
      </section>

      <section>
        <h2 style={{ margin: '0 0 4px', color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>The four bowls · locked 2026 sites</h2>
        <p style={{ margin: '0 0 16px', color: '#8d8d8d', fontSize: 12, lineHeight: '16px' }}>Results, attendance, and game-day weather are pending.</p>
        <div className="future-bowl-grid">
          {FUTURE_SEASON.bowls.map(bowl => (
            <article key={bowl.name} style={{ border: '1px solid #393939', borderTop: bowl.role === 'Championship' ? '4px solid #f1c21b' : '4px solid #525252', backgroundColor: '#262626', padding: 20 }}>
              <div style={{ height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <AssetImage
                  src={bowlLogoUrl(bowl.name, FUTURE_SEASON.year) ?? ''}
                  alt={`${bowl.name} 2026 logo`}
                  width={150}
                  height={100}
                  style={{ width: '100%', maxWidth: 150, height: 100 }}
                  fallback={<div aria-hidden="true" style={{ width: 100, height: 100, display: 'grid', placeItems: 'center', border: '1px solid #525252', color: '#8d8d8d', fontSize: 28 }}>🏆</div>}
                />
              </div>
              <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{bowl.role}</div>
              <h3 style={{ margin: '0 0 14px', color: '#f4f4f4', fontSize: 16, lineHeight: '22px', fontWeight: 600 }}>{bowl.name}</h3>
              <div style={{ color: '#c6c6c6', fontSize: 14, lineHeight: '20px' }}>{bowl.venue}</div>
              <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px', marginTop: 2 }}>{bowl.city}, {bowl.state}</div>
              <div style={{ borderTop: '1px solid #393939', marginTop: 16, paddingTop: 12, color: '#6f6f6f', fontSize: 12, lineHeight: '16px' }}>Champion · Runner-up · MVP · Attendance · Weather — pending</div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 16px', color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>2026 divisions</h2>
        <div className="future-division-grid">
          {FUTURE_SEASON.divisions.map((division, divisionIndex) => {
            const accent = divisionIndex === 0 ? '#FF3B30' : '#006FFF'
            return (
              <article key={division.name} style={{ border: '1px solid #393939', borderTop: `4px solid ${accent}`, backgroundColor: '#262626' }}>
                <h3 style={{ margin: 0, padding: 16, borderBottom: '1px solid #393939', color: '#f4f4f4', fontSize: 16, lineHeight: '22px', fontWeight: 600 }}>{division.name}</h3>
                {division.teams.map(entry => {
                  const manager = getManager(entry.managerId)
                  return (
                    <div key={entry.managerId} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) auto', alignItems: 'center', gap: 10, minHeight: 52, padding: '8px 16px', borderBottom: '1px solid #393939' }}>
                      <AssetImage src={manager?.logoSmall ?? ''} alt="" size={28} fallback={<div style={{ width: 28, height: 28, backgroundColor: '#393939' }} />} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#f4f4f4', fontSize: 14, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.teamName}</div>
                        <div style={{ color: '#8d8d8d', fontSize: 12, lineHeight: '16px' }}>{manager?.name ?? entry.managerId}</div>
                      </div>
                      <span style={{ ...mono, color: '#6f6f6f', fontSize: 12 }}>0–0</span>
                    </div>
                  )
                })}
              </article>
            )
          })}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 4px', color: '#f4f4f4', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>2026 draft order</h2>
        <p style={{ margin: '0 0 16px', color: '#8d8d8d', fontSize: 12, lineHeight: '16px' }}>Snake order with traded selections and declared keepers preserved in their actual slots.</p>
        <div className="future-draft-grid">
          {FUTURE_SEASON.draft.map(round => (
            <article key={round.round} style={{ border: '1px solid #393939', backgroundColor: '#262626', minWidth: 0 }}>
              <h3 style={{ ...mono, margin: 0, padding: '10px 12px', borderBottom: '1px solid #393939', backgroundColor: '#393939', color: '#f4f4f4', fontSize: 14, lineHeight: '18px', fontWeight: 400 }}>Round {round.round}</h3>
              {round.picks.map(pick => (
                <div key={`${round.round}-${pick.slot}`} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 8, minHeight: pick.keeper ? 52 : 36, padding: '8px 12px', borderBottom: '1px solid #393939' }}>
                  <span style={{ ...mono, color: '#6f6f6f', fontSize: 12 }}>{pick.slot}.</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#c6c6c6', fontSize: 12, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick.teamName}</div>
                    {pick.keeper && <div style={{ color: '#78a9ff', fontSize: 12, lineHeight: '16px', marginTop: 2 }}>{pick.keeper} · keeper</div>}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section>
        <EmptyState title="Season results have not started" detail="Standings, weekly scoring, power rankings, awards, and both postseason brackets will appear here when the 2026 archive has real results." />
      </section>

      <style>{`
        .future-bowl-grid, .future-division-grid, .future-draft-grid { display: grid; gap: 16px; }
        .future-bowl-grid, .future-draft-grid { grid-template-columns: minmax(0, 1fr); }
        .future-division-grid { grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 672px) {
          .future-bowl-grid, .future-division-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .future-draft-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1056px) {
          .future-bowl-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .future-draft-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  )
}
