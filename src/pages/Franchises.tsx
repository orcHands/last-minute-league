import { useState } from 'react'
import { MANAGERS, FRANCHISES, getManager } from '../data/league'
import ManagerCard from '../components/ManagerCard'
import StandingsTable from '../components/StandingsTable'
import { ALL_TIME_STANDINGS } from '../data/league'

type View = 'managers' | 'franchises' | 'standings'

export default function Franchises() {
  const [view, setView] = useState<View>('managers')
  const [filter, setFilter] = useState<'all' | 'active' | 'retired'>('all')

  const visibleManagers = MANAGERS.filter(m => {
    if (filter === 'active') return m.active
    if (filter === 'retired') return !m.active
    return true
  })

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Franchises & Managers
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: '0 0 24px' }}>
            15 franchises · 23 owners · 4 rings for The Dynasty
          </p>

          {/* View/filter controls */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {([
              { v: 'managers', label: 'Managers' },
              { v: 'franchises', label: 'Franchises' },
              { v: 'standings', label: 'All-time standings' },
            ] as { v: View; label: string }[]).map(({ v, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: '1px solid #393939',
                  borderRight: v !== 'standings' ? 'none' : '1px solid #393939',
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: view === v ? 600 : 400,
                  fontSize: 14,
                  color: view === v ? '#f4f4f4' : '#c6c6c6',
                  backgroundColor: view === v ? '#393939' : '#262626',
                  transition: 'all 150ms cubic-bezier(0.2,0,0.38,0.9)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', padding: '40px 16px 80px' }}>
        {view === 'managers' && (
          <div>
            <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
              {(['all', 'active', 'retired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 16px',
                    background: 'none',
                    border: '1px solid #393939',
                    borderRight: f !== 'retired' ? 'none' : '1px solid #393939',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: filter === f ? '#f4f4f4' : '#c6c6c6',
                    backgroundColor: filter === f ? '#393939' : '#262626',
                  }}
                >
                  {f === 'all' ? `All (${MANAGERS.length})` : f === 'active' ? `Active (${MANAGERS.filter(m => m.active).length})` : `Retired (${MANAGERS.filter(m => !m.active).length})`}
                </button>
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 1,
              backgroundColor: '#393939',
              border: '1px solid #393939',
            }}>
              {visibleManagers.map(m => <ManagerCard key={m.id} manager={m} />)}
            </div>
          </div>
        )}

        {view === 'franchises' && (
          <div style={{ display: 'grid', gap: 1, border: '1px solid #393939', backgroundColor: '#393939' }}>
            {FRANCHISES.map(f => {
              const currentOwner = getManager(f.managers[f.managers.length - 1])
              const allOwners = f.managers.map(id => getManager(id)).filter(Boolean)
              return (
                <div
                  key={f.id}
                  style={{
                    backgroundColor: '#262626',
                    padding: '20px 24px',
                    borderLeft: currentOwner ? `3px solid ${currentOwner.primaryColor}` : '3px solid #393939',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 24,
                    alignItems: 'start',
                    transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 16, color: '#f4f4f4', margin: 0 }}>
                        {f.nickname}
                      </h3>
                      {!f.active && (
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#6f6f6f', border: '1px solid #393939', padding: '1px 6px' }}>
                          retired
                        </span>
                      )}
                      {f.championships > 0 && (
                        <span style={{ fontSize: 14 }}>{'🏆'.repeat(f.championships)}</span>
                      )}
                    </div>

                    {/* Ownership timeline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginBottom: 12 }}>
                      {allOwners.map((owner, i) => owner && (
                        <span key={owner.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: 13,
                            color: owner.primaryColor,
                          }}>
                            {owner.name}
                          </span>
                          {i < allOwners.length - 1 && (
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#525252', margin: '0 6px' }}>→</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {f.lore && (
                      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#8d8d8d', margin: 0, fontStyle: 'italic', maxWidth: 600 }}>
                        {f.lore}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, textAlign: 'right', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Record</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
                        {f.allTimeRecord.w}–{f.allTimeRecord.l}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase' }}>All-time PF</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
                        {f.allTimePF.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === 'standings' && (
          <StandingsTable
            rows={ALL_TIME_STANDINGS}
            title="All-time standings — career"
            showRank
          />
        )}
      </div>
    </div>
  )
}
