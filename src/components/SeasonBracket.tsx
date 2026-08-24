import type { Bracket, BracketEntry } from '../data/league'
import { getManager } from '../data/league'
import { bowlLogoUrl } from '../data/bowlAssets'
import AssetImage from './AssetImage'

interface SeasonBracketProps {
  bracket: Bracket
  year: number
  title: string
  accent?: string
}

function VenueLine({ entry }: { entry: BracketEntry }) {
  if (!entry.venue) return null
  return (
    <div style={{ padding: '6px 12px', backgroundColor: '#1a1a1a', borderTop: '1px solid #393939' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#8d8d8d' }}>
        {entry.venue} · {entry.city}, {entry.state}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f' }}>
          {entry.attendance ? `Attendance ${entry.attendance.toLocaleString()}` : ''}
        </span>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px' }}>
          {entry.indoor ? 'Indoors 🏈' : entry.weather ? `${entry.weather.emoji} ${entry.weather.low}°F ${entry.weather.cond}` : ''}
        </span>
      </div>
    </div>
  )
}

function TeamRow({ managerId, score, rank, win }: { managerId?: string; score?: number; rank?: number; win: boolean }) {
  const manager = managerId ? getManager(managerId) : undefined
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderLeft: `3px solid ${win ? manager?.primaryColor ?? '#525252' : 'transparent'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <AssetImage src={manager?.logoSmall ?? ''} alt={manager?.name ?? ''} size={16} fallback={<div style={{ width: 16, height: 16, backgroundColor: '#393939' }} />} />
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: win ? 600 : 400, fontSize: 14, lineHeight: '18px', color: win ? '#f4f4f4' : '#8d8d8d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {manager?.name ?? '—'} <span style={{ color: '#6f6f6f' }}>({rank})</span>
        </span>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, lineHeight: '22px', color: win ? '#f4f4f4' : '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
        {score?.toFixed(2)}
      </span>
    </div>
  )
}

function BracketCard({ entry, year }: { entry: BracketEntry; year: number }) {
  if (entry.kind === 'bye') {
    const manager = getManager(entry.manager!)
    return (
      <div style={{ backgroundColor: '#1e1e1e', border: '1px dashed #393939', opacity: 0.7 }}>
        <div style={{ padding: '8px 14px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Bye Week
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 10px' }}>
          <AssetImage src={manager?.logoSmall ?? ''} alt={manager?.name ?? ''} size={16} fallback={<div style={{ width: 16, height: 16, backgroundColor: '#393939' }} />} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: '18px', color: '#c6c6c6' }}>{manager?.name} <span style={{ color: '#6f6f6f' }}>({entry.rank})</span></span>
        </div>
      </div>
    )
  }

  const isNamedBowl = entry.terminal && entry.label !== `${Math.min(entry.rank1 ?? 99, entry.rank2 ?? 99)}th Place Game`
  const logo = isNamedBowl ? bowlLogoUrl(entry.label, year) : null
  const s1IsWin = (entry.s1 ?? 0) >= (entry.s2 ?? 0)

  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #393939', display: 'flex', alignItems: 'center', gap: 8, backgroundColor: isNamedBowl ? '#2e2e2e' : 'transparent' }}>
        {logo && <AssetImage src={logo} alt={entry.label} size={18} fallback={null} />}
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: isNamedBowl ? '#f1c21b' : '#8d8d8d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {entry.label}
        </span>
      </div>
      <TeamRow managerId={entry.m1} score={entry.s1} rank={entry.rank1} win={s1IsWin} />
      <div style={{ borderTop: '1px solid #2e2e2e' }} />
      <TeamRow managerId={entry.m2} score={entry.s2} rank={entry.rank2} win={!s1IsWin} />
      <VenueLine entry={entry} />
    </div>
  )
}

// Round 5: the two brackets used to be bare <h3> + a grid of cards, 48px
// apart. Geometrically separate, but they read as ONE continuous field --
// identical column positions, identical card widths, and the "WEEK 14/15/16"
// row repeating immediately under the champions bracket's trailing BYE WEEK
// cards. Each bracket now sits in its own bordered panel with a header bar
// and a top accent, the same card shell the standings and awards use, so the
// boundary is unmistakable. Gold for champions (matches the named-bowl
// accent already used on those cards), cool grey for consolation.
export default function SeasonBracket({ bracket, year, title, accent = '#6f6f6f' }: SeasonBracketProps) {
  return (
    <div style={{ border: '1px solid #393939', backgroundColor: '#1c1c1c', borderTop: `3px solid ${accent}` }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #393939' }}>
        <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: 16 }}>
        {bracket.rounds.map(round => (
          <div key={round.week} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260, flex: '1 1 0' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: '#6f6f6f', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Week {round.week}
            </div>
            {round.entries.map((e, i) => (
              <BracketCard key={i} entry={e} year={year} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
