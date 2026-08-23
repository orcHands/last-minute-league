import type { AllDivision, AllDivisionSlot } from '../data/league'
import { getManager } from '../data/league'

interface AllDivisionTeamsProps {
  allDivision: AllDivision
}

// Hoss's call, exact hexes are mine (standard, recognizable named colors —
// deliberately distinct from the division accent colors, #FF3B30 O'Conner /
// #006FFF Toretto, so the two color systems stay legible side by side):
// Bright Red / Dark Red for O'Conner 1st/2nd, Royal Blue / Navy Blue for
// Toretto 1st/2nd.
const COLUMNS: { key: 'oconnerFirst' | 'oconnerSecond' | 'torettoFirst' | 'torettoSecond'; title: string; color: string }[] = [
  { key: 'oconnerFirst', title: "First Team All O'Conner", color: '#FF3B30' },
  { key: 'oconnerSecond', title: "Second Team All O'Conner", color: '#8B0000' },
  { key: 'torettoFirst', title: 'First Team All Toretto', color: '#4169E1' },
  { key: 'torettoSecond', title: 'Second Team All Toretto', color: '#000080' },
]

function TeamColumn({ title, color, slots }: { title: string; color: string; slots: AllDivisionSlot[] }) {
  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', borderTop: `3px solid ${color}` }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #393939' }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, color }}>
          {title}
        </span>
      </div>
      <div>
        {slots.map((s, i) => {
          const manager = s.manager ? getManager(s.manager) : undefined
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderBottom: i === slots.length - 1 ? 'none' : '1px solid #2e2e2e' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6f6f6f', width: 34, flexShrink: 0 }}>
                {s.slot}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#f4f4f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.player ?? '—'}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: manager?.primaryColor ?? '#6f6f6f' }}>
                  {manager?.name ?? '—'}
                </div>
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {s.pts !== null && s.pts !== undefined ? s.pts.toFixed(1) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AllDivisionTeams({ allDivision }: AllDivisionTeamsProps) {
  const slotsFor = (key: typeof COLUMNS[number]['key']): AllDivisionSlot[] => {
    switch (key) {
      case 'oconnerFirst': return allDivision.oconner.firstTeam
      case 'oconnerSecond': return allDivision.oconner.secondTeam
      case 'torettoFirst': return allDivision.toretto.firstTeam
      case 'torettoSecond': return allDivision.toretto.secondTeam
    }
  }
  return (
    <div>
      <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, color: '#f4f4f4', margin: '0 0 4px' }}>
        All-Division Teams
      </h2>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#8d8d8d', margin: '0 0 16px' }}>
        Total started points across the full season (regular season + playoffs), QB · RB · RB · WR · WR · TE · FLEX · K · DEF. FLEX is the top RB/WR/TE not already on the team.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {COLUMNS.map(col => (
          <TeamColumn key={col.key} title={col.title} color={col.color} slots={slotsFor(col.key)} />
        ))}
      </div>
    </div>
  )
}
