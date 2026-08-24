import type { AllDivision, AllDivisionSlot } from '../data/league'
import { getManager } from '../data/league'

interface AllDivisionTeamsProps {
  allDivision: AllDivision
}

// Round 5 (2026-08-23), Hoss's call: the top border carries the DIVISION
// accent (both O'Conner columns red, both Toretto columns blue) so the
// column reads as "which division" at a glance, and the title text carries
// the TEAM TIER -- gold for first team, silver for second. Two independent
// signals instead of four arbitrary colors.
//
// Gold and silver are taken from existing manager canon rather than invented:
// gold is Ryan's primary (#B3995D), silver is Benedict's primary (#B0B7BC).
// Both clear AA contrast on the #262626 card (gold 6.4:1, silver 9.1:1).
const DIVISION_ACCENT = { oconner: '#FF3B30', toretto: '#006FFF' } as const
const TIER_TEXT = { first: '#B3995D', second: '#B0B7BC' } as const

const COLUMNS: {
  key: 'oconnerFirst' | 'oconnerSecond' | 'torettoFirst' | 'torettoSecond'
  title: string; accent: string; titleColor: string
}[] = [
  { key: 'oconnerFirst', title: "First Team All O'Conner", accent: DIVISION_ACCENT.oconner, titleColor: TIER_TEXT.first },
  { key: 'oconnerSecond', title: "Second Team All O'Conner", accent: DIVISION_ACCENT.oconner, titleColor: TIER_TEXT.second },
  { key: 'torettoFirst', title: 'First Team All Toretto', accent: DIVISION_ACCENT.toretto, titleColor: TIER_TEXT.first },
  { key: 'torettoSecond', title: 'Second Team All Toretto', accent: DIVISION_ACCENT.toretto, titleColor: TIER_TEXT.second },
]

function TeamColumn({ title, accent, titleColor, slots }: { title: string; accent: string; titleColor: string; slots: AllDivisionSlot[] }) {
  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', borderTop: `3px solid ${accent}` }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #393939' }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, lineHeight: '18px', color: titleColor }}>
          {title}
        </span>
      </div>
      <div>
        {slots.map((s, i) => {
          const manager = s.manager ? getManager(s.manager) : undefined
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderBottom: i === slots.length - 1 ? 'none' : '1px solid #2e2e2e' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', width: 40, flexShrink: 0 }}>
                {s.slot}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#f4f4f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.player ?? '—'}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: manager?.primaryColor ?? '#6f6f6f' }}>
                  {manager?.name ?? '—'}
                </div>
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, lineHeight: '18px', color: '#c6c6c6', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
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
      <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '0 0 4px' }}>
        All-Division Teams
      </h2>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', margin: '0 0 16px' }}>
        Total started points across the full season (regular season + playoffs), QB · RB · RB · WR · WR · TE · FLEX · K · DEF. FLEX is the top RB/WR/TE not already on the team.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {COLUMNS.map(col => (
          <TeamColumn key={col.key} title={col.title} accent={col.accent} titleColor={col.titleColor} slots={slotsFor(col.key)} />
        ))}
      </div>
    </div>
  )
}
