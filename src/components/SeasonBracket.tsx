import type { Bracket, BracketEntry } from '../data/league'
import { getManager } from '../data/league'
import { bowlLogoUrl } from '../data/bowlAssets'
import AssetImage from './AssetImage'

interface SeasonBracketProps {
  bracket: Bracket
  year: number
  title: string
}

function VenueLine({ entry }: { entry: BracketEntry }) {
  if (!entry.venue) return null
  return (
    <div style={{ padding: '6px 12px', backgroundColor: '#1a1a1a', borderTop: '1px solid #393939' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#8d8d8d' }}>
        {entry.venue} · {entry.city}, {entry.state}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6f6f6f' }}>
          {entry.attendance ? `Attendance ${entry.attendance.toLocaleString()}` : ''}
        </span>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11 }}>
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
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: win ? 600 : 400, fontSize: 11, color: win ? '#f4f4f4' : '#8d8d8d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {manager?.name ?? '—'} <span style={{ color: '#6f6f6f' }}>({rank})</span>
        </span>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: win ? '#f4f4f4' : '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
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
        <div style={{ padding: '6px 12px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6f6f6f', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Bye Week
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 10px' }}>
          <AssetImage src={manager?.logoSmall ?? ''} alt={manager?.name ?? ''} size={16} fallback={<div style={{ width: 16, height: 16, backgroundColor: '#393939' }} />} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#c6c6c6' }}>{manager?.name} <span style={{ color: '#6f6f6f' }}>({entry.rank})</span></span>
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
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 10, color: isNamedBowl ? '#f1c21b' : '#8d8d8d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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

export default function SeasonBracket({ bracket, year, title }: SeasonBracketProps) {
  return (
    <div>
      <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, color: '#f4f4f4', margin: '0 0 16px' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {bracket.rounds.map(round => (
          <div key={round.week} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260, flex: '1 1 0' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6f6f6f', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
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
