import type { AwardFinalist } from '../data/league'
import { getManager } from '../data/league'
import { awardWinnerPhotoUrl } from '../data/seasonAwardPhotos'
import AssetImage from './AssetImage'
import Badge from './Badge'

interface SeasonAwardsGridProps {
  year: number
  awardNames: Record<string, string>
  awardDescriptions: Record<string, string>
  awardsTop5: Record<string, AwardFinalist[]>
  awardsPartial: string[]
}

// Display order matches the mock's reading order (manager-relevant first, then player awards).
const AWARD_ORDER = [
  'mvp', 'letty_ortiz_award', 'bench_whisperer', 'most_improved_player', 'rookie_of_the_year',
  'draft_steal_of_the_year', 'waiver_pickup_of_the_year', 'comeback_of_the_year', 'biggest_blowout',
  'qb_of_the_year', 'rb_of_the_year', 'wr_of_the_year', 'te_of_the_year',
  'dst_of_the_year', 'kicker_of_the_year',
  'offensive_coordinator_of_the_year', 'defensive_coordinator_of_the_year', 'special_teams_coordinator_of_the_year',
]

// Awards whose finalist images used to hotlink an ESPN player headshot (or
// team-DEF logo) -- these are the only ones that need a manually-sourced
// local photo, and only for the rank-1 winner (a rank-1 tie gets two).
// Manager-only awards (bench whisperer, comeback, blowout, the 3 new
// coordinator awards) keep a manager-logo slot at every rank -- that's
// already a local asset with its own fallback, not an ESPN dependency, so
// there's no reason to cut it down to rank 1.
const PHOTO_AWARD_KEYS = new Set([
  'mvp', 'qb_of_the_year', 'rb_of_the_year', 'wr_of_the_year', 'te_of_the_year',
  'dst_of_the_year', 'kicker_of_the_year', 'most_improved_player',
  'waiver_pickup_of_the_year', 'draft_steal_of_the_year', 'rookie_of_the_year',
])

function finalistHeadline(f: AwardFinalist, awardKey: string): { name: string; sub: string } {
  if (f.player) {
    const parts: string[] = []
    if (f.pos) parts.push(f.pos)
    if (f.pts !== undefined) parts.push(`${f.pts.toFixed(2)} pts`)
    // Round 5: show WHY this player ranks where he does. MVP and Rookie rank
    // on dominance (sigma over the position field x share of team scoring);
    // Draft Steal and Waiver rank on value over positional replacement.
    if (f.dominance !== undefined && f.z !== undefined) {
      parts.push(`${f.z.toFixed(2)}σ vs ${f.pos ?? 'position'} field`)
      if (f.share !== undefined) parts.push(`${(f.share * 100).toFixed(0)}% of team`)
    } else if (f.vor !== undefined && f.pickOverall === undefined) {
      parts.push(`${f.vor >= 0 ? '+' : ''}${f.vor.toFixed(0)} over replacement`)
    }
    if (f.delta !== undefined) parts.push(`+${f.delta.toFixed(1)} pts YoY`)
    if (f.pickOverall !== undefined) {
      parts.push(`Pick #${f.pickOverall}`)
      if (f.ptsRank !== undefined && f.draftPool !== undefined) parts.push(`ranked ${f.ptsRank} of ${f.draftPool} on value`)
    }
    return { name: f.player, sub: parts.join(' · ') }
  }
  if (f.teamDef) {
    return { name: f.teamDef, sub: f.pts !== undefined ? `${f.pts.toFixed(2)} pts` : '' }
  }
  if (f.pf !== undefined) {
    // Letty Ortiz Award -- season points leader. Manager-level, so it takes
    // the manager-logo row treatment like bench whisperer / the coordinators.
    const m = getManager(f.manager!)
    const avg = f.pfAvg !== undefined ? ` · ${f.pfAvg.toFixed(2)}/gm` : ''
    return { name: m?.name ?? f.manager ?? '—', sub: `${f.pf.toFixed(2)} pts${avg}` }
  }
  if (f.ppg !== undefined) {
    // coordinator-of-the-year: manager-level slot streaming metric
    const m = getManager(f.manager!)
    // Round 3: Hoss asked to drop the "· N total, N gm" tail -- points per
    // game is the whole metric, and the raw total invites reading it as a
    // volume award. total/games stay in the JSON, just aren't displayed.
    return { name: m?.name ?? f.manager ?? '—', sub: `${f.ppg.toFixed(2)} pts/gm` }
  }
  if (f.manager && f.avgRegret !== undefined) {
    // bench whisperer
    return { name: getManager(f.manager)?.name ?? f.manager, sub: `${f.avgRegret.toFixed(2)} avg regret` }
  }
  if (f.winner) {
    // comeback / blowout
    const w = getManager(f.winner)?.name ?? f.winner
    const l = f.loser ? getManager(f.loser)?.name ?? f.loser : ''
    const outcome = awardKey === 'biggest_blowout' && f.margin !== undefined
      ? `Week ${f.week} · ${w} beat ${l}, margin ${f.margin.toFixed(2)}`
      : awardKey === 'comeback_of_the_year' && f.deficitOverAvg !== undefined
      ? `Week ${f.week} · ${w} overcame a ${f.deficitOverAvg.toFixed(1)}-pt deficit to beat ${l}`
      : `Week ${f.week}`
    return { name: `${w} def. ${l}`, sub: outcome }
  }
  return { name: '—', sub: '' }
}

function AwardCard({ year, awardKey, name, description, finalists, partial }: { year: number; awardKey: string; name: string; description?: string; finalists: AwardFinalist[]; partial: boolean }) {
  const isPhotoAward = PHOTO_AWARD_KEYS.has(awardKey)
  // Rank-1 tie detection: same top value on the metric this award ranks by.
  const metric = (f: AwardFinalist) => f.pts ?? f.ppg ?? f.pf ?? f.delta ?? f.margin ?? f.deficitOverAvg
  const tiedAtOne = isPhotoAward && finalists.length > 1
    && metric(finalists[0]) !== undefined
    && Math.abs((metric(finalists[0]) ?? 0) - (metric(finalists[1]) ?? Infinity)) < 0.005

  return (
    <div style={{ backgroundColor: '#262626', border: '1px solid #393939', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #393939' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#f4f4f4', lineHeight: '18px' }}>
            {name}
          </span>
          {partial && <Badge type="info" label="Winner only" size="sm" />}
        </div>
        {description && (
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 12,
            color: '#8d8d8d', lineHeight: '16px', margin: '6px 0 0',
          }}>
            {description}
          </p>
        )}
      </div>
      <div>
        {finalists.map((f, i) => {
          const { name: fname, sub } = finalistHeadline(f, awardKey)
          const isWinnerSlot = !isPhotoAward || i === 0 || (i === 1 && tiedAtOne)
          const showPhoto = isPhotoAward && isWinnerSlot
          const photoSrc = showPhoto ? awardWinnerPhotoUrl(year, awardKey, tiedAtOne ? i : undefined) : null
          const manager = f.manager ? getManager(f.manager) : f.winner ? getManager(f.winner) : undefined
          const WRAPPING_SUBS = new Set(['comeback_of_the_year', 'biggest_blowout', 'mvp', 'rookie_of_the_year', 'draft_steal_of_the_year', 'waiver_pickup_of_the_year'])
          const suppressManagerPrefix = WRAPPING_SUBS.has(awardKey) && (awardKey === 'comeback_of_the_year' || awardKey === 'biggest_blowout')
          const wrapSub = WRAPPING_SUBS.has(awardKey)
          const isCoWinnerRow = tiedAtOne && i <= 1
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: i === finalists.length - 1 ? 'none' : '1px solid #2e2e2e' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '16px', color: i === 0 || isCoWinnerRow ? '#f1c21b' : '#6f6f6f', width: 14, flexShrink: 0 }}>
                {isCoWinnerRow ? '1' : f.rank}
              </span>
              {!isPhotoAward && (
                <AssetImage src={manager?.logoSmall ?? ''} alt={fname} size={26} fallback={<div style={{ width: 26, height: 26, backgroundColor: '#393939' }} />} />
              )}
              {showPhoto && (
                <AssetImage src={photoSrc ?? ''} alt={fname} size={26} fallback={<div style={{ width: 26, height: 26, backgroundColor: '#393939' }} />} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: i === 0 || isCoWinnerRow ? 600 : 400, fontSize: i === 0 || isCoWinnerRow ? 16 : 14, lineHeight: i === 0 || isCoWinnerRow ? '20px' : '18px', color: i === 0 || isCoWinnerRow ? '#f4f4f4' : '#c6c6c6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fname}
                  </span>
                  {isCoWinnerRow && <Badge type="asterisk" size="sm" label="Co-winner" />}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: manager?.primaryColor ?? '#6f6f6f',
                  whiteSpace: wrapSub ? 'normal' : 'nowrap',
                  overflow: wrapSub ? 'visible' : 'hidden',
                  textOverflow: wrapSub ? 'clip' : 'ellipsis',
                  lineHeight: '16px',
                }}>
                  {manager && !suppressManagerPrefix ? `${manager.name} · ` : ''}{sub}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SeasonAwardsGrid({ year, awardNames, awardDescriptions, awardsTop5, awardsPartial }: SeasonAwardsGridProps) {
  const partialSet = new Set(awardsPartial)
  const keys = AWARD_ORDER.filter(k => awardsTop5[k]?.length)
  return (
    <div>
      <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 20, lineHeight: '28px', color: '#f4f4f4', margin: '0 0 4px' }}>
        Season Awards
      </h3>
      {awardsPartial.length > 0 && (
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: '16px', color: '#8d8d8d', margin: '0 0 16px' }}>
          {awardsPartial.length} of {keys.length} award{awardsPartial.length === 1 ? '' : 's'} {awardsPartial.length === 1 ? 'shows' : 'show'} the confirmed winner only — the underlying data doesn't support a full top-5 yet.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 12, marginTop: awardsPartial.length ? 0 : 16 }}>
        {keys.map(key => (
          <AwardCard key={key} year={year} awardKey={key} name={awardNames[key] ?? key} description={awardDescriptions[key]} finalists={awardsTop5[key]} partial={partialSet.has(key)} />
        ))}
      </div>
    </div>
  )
}
