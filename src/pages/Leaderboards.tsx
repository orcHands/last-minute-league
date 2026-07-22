import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import {
  PHASE_SPLITS, BENCH_REGRET, MONDAY_NIGHT_MIRACLES, NEMESIS_DATA, FANDOM_DATA, getManager,
} from '../data/league'
import MatchupCard from '../components/MatchupCard'
import collegeAnalysis from '../data/processed/college_analysis.json'
import enemiesAnalysis from '../data/processed/enemies_analysis.json'
import { NFL_TEAM_COLORS } from '../data/build/nflTeamColors'

const BOARDS = [
  { id: 'mnm', label: 'Monday Night Miracle' },
  { id: 'phase', label: 'Drafter vs Closer' },
  { id: 'bench', label: 'Points Left on Bench' },
  { id: 'nemesis', label: 'Nemesis & Rivalries' },
  { id: 'fandom', label: 'Fandom Scorecard' },
  { id: 'recruiting', label: 'Recruiting Board' },
  { id: 'defenses', label: 'NFL Defenses' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: '#8d8d8d',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: '#393939' }} />
    </div>
  )
}

function PhaseBoard() {
  const data = PHASE_SPLITS.map(p => {
    const m = getManager(p.managerId)
    return { ...p, name: m?.name ?? p.managerId, color: m?.primaryColor ?? '#525252' }
  })

  return (
    <div>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#c6c6c6', marginBottom: 32, maxWidth: 680 }}>
        How each manager performs vs the weekly league average across three phases: early (wks 1–5),
        mid (wks 6–10), and late (wks 11+). Jay climbs every phase — the league's clear closer.
        Tommy front-runs and fades.
      </p>

      <div style={{ marginBottom: 32 }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
            barGap={2}
            barCategoryGap="20%"
          >
            <CartesianGrid stroke="#393939" strokeDasharray="0" vertical={false} />
            <ReferenceLine y={0} stroke="#6f6f6f" strokeWidth={1} />
            <XAxis
              dataKey="name"
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={{ stroke: '#393939' }}
              tickLine={false}
              angle={-35}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}`}
              width={40}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#393939', border: '1px solid #525252', borderRadius: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}
              formatter={(value, key) => {
                const n = typeof value === 'number' ? value : Number(value)
                return [`${n > 0 ? '+' : ''}${n.toFixed(1)}`, key === 'earlyVsLeague' ? 'Early' : key === 'midVsLeague' ? 'Mid' : 'Late']
              }}
            />
            <Bar dataKey="earlyVsLeague" name="Early" fill="#4589ff" opacity={0.8} />
            <Bar dataKey="midVsLeague" name="Mid" fill="#78a9ff" opacity={0.8} />
            <Bar dataKey="lateVsLeague" name="Late" fill="#a6c8ff" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          {[
            { color: '#4589ff', label: 'Early (wks 1–5)' },
            { color: '#78a9ff', label: 'Mid (wks 6–10)' },
            { color: '#a6c8ff', label: 'Late (wks 11+)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: l.color }} />
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed table */}
      <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {['Manager', 'Early avg', 'vs Avg', 'Mid avg', 'vs Avg', 'Late avg', 'vs Avg'].map((h, i) => (
                <th key={`${h}-${i}`} style={{
                  fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11,
                  color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase',
                  padding: '10px 12px', textAlign: h === 'Manager' ? 'left' : 'right',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PHASE_SPLITS.map(p => {
              const m = getManager(p.managerId)
              if (!m) return null
              return (
                <tr key={p.managerId}
                  style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <td style={{ padding: '10px 12px', borderLeft: `3px solid ${m.primaryColor}`, paddingLeft: 12 }}>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>
                      {m.name}
                    </span>
                  </td>
                  {[p.earlyAvg, p.earlyVsLeague, p.midAvg, p.midVsLeague, p.lateAvg, p.lateVsLeague].map((v, i) => {
                    const isDelta = i % 2 === 1
                    return (
                      <td key={i} style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 14,
                        fontVariantNumeric: 'tabular-nums',
                        color: isDelta
                          ? v > 0 ? '#42be65' : v < 0 ? '#fa4d56' : '#8d8d8d'
                          : '#f4f4f4',
                      }}>
                        {isDelta ? `${v > 0 ? '+' : ''}${v.toFixed(1)}` : v.toFixed(1)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BenchBoard() {
  const leagueAvg = BENCH_REGRET.reduce((sum, r) => sum + r.avgRegretPerWeek, 0) / (BENCH_REGRET.length || 1)
  const worst = BENCH_REGRET
    .filter(r => r.worstWeek)
    .sort((a, b) => (b.worstWeek?.regret ?? 0) - (a.worstWeek?.regret ?? 0))[0]
  const bestSetter = BENCH_REGRET.slice().sort((a, b) => a.avgRegretPerWeek - b.avgRegretPerWeek)[0]

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 1, backgroundColor: '#393939', border: '1px solid #393939', marginBottom: 32,
      }}>
        {[
          { label: 'League avg regret / wk', value: leagueAvg.toFixed(1), unit: 'pts' },
          {
            label: 'Worst single week ever',
            value: (worst?.worstWeek?.regret ?? 0).toFixed(1),
            unit: `pts (${getManager(worst?.managerId ?? '')?.name ?? '—'}, ${worst?.worstWeek?.season} wk${worst?.worstWeek?.week})`,
          },
          {
            label: 'Best lineup setter',
            value: bestSetter?.avgRegretPerWeek.toFixed(1) ?? '—',
            unit: `pts/wk (${getManager(bestSetter?.managerId ?? '')?.name ?? '—'})`,
          },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#262626', padding: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 28, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d', marginTop: 4 }}>
              {stat.unit}
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {['#', 'Manager', 'Avg regret / wk', 'Worst week — regret', 'Started', 'Optimal'].map(h => (
                <th key={h} style={{
                  fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11,
                  color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase',
                  padding: '10px 12px', textAlign: h === '#' || h === 'Manager' ? 'left' : 'right',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENCH_REGRET.map(row => {
              const m = getManager(row.managerId)
              if (!m) return null
              return (
                <tr key={row.managerId}
                  style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', width: 32 }}>
                    {row.rank}
                  </td>
                  <td style={{ padding: '10px 12px', borderLeft: `3px solid ${m.primaryColor}`, paddingLeft: 12 }}>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>
                      {m.name}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#fa4d56', fontVariantNumeric: 'tabular-nums' }}>
                    {row.avgRegretPerWeek.toFixed(1)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums' }}>
                    {row.worstWeek ? `${row.worstWeek.season} wk${row.worstWeek.week}: ${row.worstWeek.regret.toFixed(1)}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
                    {row.worstWeek ? row.worstWeek.started.toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>
                    {row.worstWeek ? row.worstWeek.optimal.toFixed(1) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NemesisBoard() {
  return (
    <div>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#c6c6c6', marginBottom: 32, maxWidth: 680 }}>
        The opponent who's scored the most on you, all-time. Brice ⇄ Carter is THE rivalry:
        26 meetings, ~3,200 points each way, Carter leads 15–11. pb's nemesis is Brice.
        Brice does not consider pb his nemesis. This asymmetry is noted.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, backgroundColor: '#393939' }}>
        {NEMESIS_DATA.map(n => {
          const m = getManager(n.managerId)
          const nem = getManager(n.nemesisId)
          if (!m || !nem) return null
          return (
            <div key={n.managerId} style={{
              backgroundColor: '#262626',
              padding: 16,
              borderTop: `2px solid ${m.primaryColor}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#f4f4f4' }}>
                    {m.name}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d' }}>
                    Nemesis →
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #393939', paddingLeft: 12 }}>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, color: nem.primaryColor }}>
                    {nem.name}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums' }}>
                    {n.meetings} meetings
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    PTS against
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: '#fa4d56', fontVariantNumeric: 'tabular-nums' }}>
                    {n.ptsAgainst.toFixed(0)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, color: '#8d8d8d', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    H2H record
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>
                    {n.managerRecord.w}–{n.managerRecord.l}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FandomBoard() {
  const verdictLabel = (v: string) => v === 'confirmed' ? '✓ confirmed' : v === 'partial' ? '~ partial' : '✗ busted'
  const verdictColor = (v: string) => v === 'confirmed' ? '#42be65' : v === 'partial' ? '#f1c21b' : '#fa4d56'

  const bearsClaimants = FANDOM_DATA.filter(f => f.claimedTeam === 'Bears')
  const bearsConfirmed = bearsClaimants.filter(f => f.verdict === 'confirmed')

  return (
    <div>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#c6c6c6', marginBottom: 16, maxWidth: 680 }}>
        Do managers actually roster their claimed NFL team's players? {bearsClaimants.length} managers claim Bears fandom.
        Only {bearsConfirmed.map(f => getManager(f.managerId)?.name).join(', ') || 'no one'} actually drafts Bears players.
      </p>
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #393939',
        borderLeft: '3px solid #f1c21b',
        padding: '10px 16px',
        marginBottom: 32,
        maxWidth: 600,
      }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, color: '#f1c21b' }}>
          The Bears Paradox
        </span>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#c6c6c6', marginLeft: 8 }}>
          — {bearsClaimants.length} Bears fans, {bearsConfirmed.length} actual Bears drafter{bearsConfirmed.length === 1 ? '' : 's'}.
        </span>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {['Manager', 'Claimed', 'Actually rosters', 'Verdict', 'Note'].map(h => (
                <th key={h} style={{
                  fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11,
                  color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase',
                  padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FANDOM_DATA.map(row => {
              const m = getManager(row.managerId)
              if (!m) return null
              return (
                <tr key={row.managerId}
                  style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
                >
                  <td style={{ padding: '10px 12px', borderLeft: `3px solid ${m.primaryColor}`, paddingLeft: 12, whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>
                      {m.name}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
                      color: '#c6c6c6', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ width: 10, height: 10, display: 'inline-block', backgroundColor: row.claimedTeamColor }} />
                      {row.claimedTeam}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
                      color: '#c6c6c6', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ width: 10, height: 10, display: 'inline-block', backgroundColor: row.topRosteredColor }} />
                      {row.topRosteredTeam}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                      color: verdictColor(row.verdict), fontWeight: 600,
                    }}>
                      {verdictLabel(row.verdict)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#8d8d8d' }}>
                      {row.note ?? '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CONFERENCE_COLORS: Record<string, string> = {
  SEC: '#FF6B2B', 'Big Ten': '#4589ff', ACC: '#9DFF00', 'Big XII': '#DA1E28',
  'FCS/Other': '#525252', American: '#F1C21B', 'Mountain West': '#8A3FFC',
  MAC: '#42be65', Independent: '#8d8d8d', 'Sun Belt': '#FF832B',
  'C-USA': '#78a9ff', 'Pac-12': '#08bdba',
}

// Current 2024–25 conference alignment (matches About.tsx's stated canon:
// Texas → SEC, Cal/Stanford → ACC).
const SCHOOL_CONFERENCE: Record<string, string> = {
  Alabama: 'SEC', Oklahoma: 'SEC', 'Ohio State': 'Big Ten', California: 'ACC',
  LSU: 'SEC', Georgia: 'SEC', USC: 'Big Ten', Clemson: 'ACC', Miami: 'ACC', Stanford: 'ACC',
}

const conferencesDrafted = collegeAnalysis.league.conferences_drafted as [string, number][]
const conferencesScoring = collegeAnalysis.league.conferences_scoring as [string, number][]
const topSchoolsDrafted = collegeAnalysis.league.top_schools_drafted as [string, number][]
const topSchoolsScoring = collegeAnalysis.league.top_schools_scoring as [string, number][]

function RecruitingBoard() {
  const ptsByConf: Record<string, number> = Object.fromEntries(conferencesScoring)
  const conferences = conferencesDrafted
    .slice(0, 6)
    .map(([name, picks]) => ({
      name,
      picks,
      pts: ptsByConf[name] ?? 0,
      color: CONFERENCE_COLORS[name] ?? '#525252',
    }))
  const maxPicks = Math.max(...conferences.map(c => c.picks))
  const maxPts = Math.max(...conferences.map(c => c.pts))

  const ptsBySchool: Record<string, number> = Object.fromEntries(topSchoolsScoring)
  const topSchools = topSchoolsDrafted.slice(0, 8).map(([school, picks]) => ({
    school,
    conf: SCHOOL_CONFERENCE[school] ?? '—',
    picks,
    pts: Math.round(ptsBySchool[school] ?? 0),
    color: CONFERENCE_COLORS[SCHOOL_CONFERENCE[school]] ?? '#525252',
  }))
  return (
    <div>
      <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#c6c6c6', marginBottom: 32, maxWidth: 680 }}>
        Conference and school affinity across all-time draft picks. SEC-heaviest league overall.
        Alabama is the #1 single school by picks and fantasy points.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#c6c6c6', marginBottom: 16, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            By Conference — Picks
          </div>
          {conferences.map(c => (
            <div key={c.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#c6c6c6' }}>{c.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>{c.picks}</span>
              </div>
              <div style={{ height: 4, backgroundColor: '#393939' }}>
                <div style={{ height: '100%', backgroundColor: c.color, width: `${(c.picks / maxPicks) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#c6c6c6', marginBottom: 16, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            By Conference — Fantasy Pts
          </div>
          {conferences.map(c => (
            <div key={c.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#c6c6c6' }}>{c.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', fontVariantNumeric: 'tabular-nums' }}>{(c.pts / 1000).toFixed(1)}k</span>
              </div>
              <div style={{ height: 4, backgroundColor: '#393939' }}>
                <div style={{ height: '100%', backgroundColor: c.color, width: `${(c.pts / maxPts) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#c6c6c6', marginBottom: 16, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Top Schools
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 400 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {['School', 'Conference', 'Picks', 'Fantasy pts'].map(h => (
                <th key={h} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase', padding: '10px 12px', textAlign: h === 'School' || h === 'Conference' || h === '' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topSchools.map(s => (
              <tr key={s.school} style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
              >
                <td style={{ padding: '10px 12px', borderLeft: `3px solid ${s.color}`, paddingLeft: 12 }}>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>{s.school}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#8d8d8d' }}>{s.conf}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{s.picks}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#c6c6c6', fontVariantNumeric: 'tabular-nums' }}>{s.pts.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DefensesBoard() {
  const best = enemiesAnalysis.nfl_defense_scoring.single_best_game
  const ranking = enemiesAnalysis.nfl_defense_scoring.ranking as [string, number][]
  const defenses = ranking.slice(0, 10).map(([team, pts]) => ({
    team,
    pts,
    color: NFL_TEAM_COLORS[team] ?? '#8d8d8d',
  }))
  return (
    <div>
      <div style={{ marginBottom: 32, backgroundColor: '#1a1a1a', border: '1px solid #393939', borderLeft: '3px solid #E31837', padding: '12px 16px', maxWidth: 480 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: '#c6c6c6' }}>
          Single-game record: <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f1c21b' }}>{best.defense} {best.pts} pts</span>
          <span style={{ color: '#8d8d8d' }}> · {best.started_by} · {best.season} wk{best.week}</span>
        </div>
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #393939' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr style={{ backgroundColor: '#393939' }}>
              {['#', 'Defense', 'Total started pts'].map(h => (
                <th key={h} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#c6c6c6', letterSpacing: '0.32em', textTransform: 'uppercase', padding: '10px 12px', textAlign: h === '#' || h === 'Defense' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defenses.map((d, i) => (
              <tr key={d.team} style={{ borderBottom: '1px solid #393939', backgroundColor: '#262626' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#393939' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#262626' }}
              >
                <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d', width: 32 }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', borderLeft: `3px solid ${d.color}`, paddingLeft: 12 }}>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#f4f4f4' }}>{d.team}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#f4f4f4', fontVariantNumeric: 'tabular-nums' }}>{d.pts.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Leaderboards() {
  const [active, setActive] = useState('mnm')

  const BOARD_CONTENT: Record<string, React.ReactNode> = {
    mnm: (
      <div>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#c6c6c6', marginBottom: 32, maxWidth: 680 }}>
          Comebacks ranked by deficit erased. The Monday Night Miracle isn't a single game — it's a recurring crisis that defines the league's character.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, backgroundColor: '#393939' }}>
          {MONDAY_NIGHT_MIRACLES.map(m => <MatchupCard key={m.id} miracle={m} />)}
        </div>
      </div>
    ),
    phase: <PhaseBoard />,
    bench: <BenchBoard />,
    nemesis: <NemesisBoard />,
    fandom: <FandomBoard />,
    recruiting: <RecruitingBoard />,
    defenses: <DefensesBoard />,
  }

  return (
    <div style={{ backgroundColor: '#161616', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ borderBottom: '1px solid #393939', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: 1904, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, fontSize: 32, lineHeight: '40px', color: '#f4f4f4', margin: '0 0 8px' }}>
            Leaderboards & Records
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: '#8d8d8d', margin: 0 }}>
            Seven named boards. Real numbers, real stories.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1904, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 130px)' }}>
        {/* Sidebar nav */}
        <div style={{ borderRight: '1px solid #393939', padding: '24px 0' }}>
          {BOARDS.map(b => (
            <button
              key={b.id}
              onClick={() => setActive(b.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderLeft: `3px solid ${active === b.id ? '#f4f4f4' : 'transparent'}`,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: active === b.id ? 600 : 400,
                fontSize: 14,
                color: active === b.id ? '#f4f4f4' : '#c6c6c6',
                transition: 'all 150ms cubic-bezier(0.2,0,0.38,0.9)',
                paddingLeft: active === b.id ? 13 : 16,
              }}
              onMouseEnter={e => {
                if (active !== b.id) (e.currentTarget as HTMLElement).style.color = '#f4f4f4'
              }}
              onMouseLeave={e => {
                if (active !== b.id) (e.currentTarget as HTMLElement).style.color = '#c6c6c6'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Board content */}
        <div style={{ padding: '40px 32px 64px' }}>
          <SectionLabel>{BOARDS.find(b => b.id === active)?.label}</SectionLabel>
          {BOARD_CONTENT[active]}
        </div>
      </div>
    </div>
  )
}
