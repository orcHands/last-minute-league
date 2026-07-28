import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  FRANCHISE_POWER_SERIES, POWER_RANKING_ROWS, POWER_RANKING_MAX_RANK, POWER_RANKING_WEEKS,
} from '../data/league'
import type { FranchisePowerSeries } from '../data/league'

const SEASON_TICKS = (() => {
  const seen = new Set<number>()
  const ticks: { weekIndex: number; season: number }[] = []
  for (const w of POWER_RANKING_WEEKS) {
    if (!seen.has(w.season)) {
      seen.add(w.season)
      ticks.push({ weekIndex: w.weekIndex, season: w.season })
    }
  }
  return ticks
})()
const SEASON_TICK_INDICES = SEASON_TICKS.map(t => t.weekIndex)
const SEASON_BY_TICK = new Map(SEASON_TICKS.map(t => [t.weekIndex, t.season]))

function finalPoint(series: FranchisePowerSeries) {
  return series.points[series.points.length - 1] ?? null
}

function PowerTooltip({ active, payload, label, hoveredId }: any) {
  if (!active || !hoveredId || !payload) return null
  const entry = payload.find((p: any) => p.dataKey === hoveredId)
  if (!entry) return null
  const series = FRANCHISE_POWER_SERIES.find(s => s.franchiseId === hoveredId)
  const point = series?.points.find(p => p.weekIndex === label)
  const weekLabel = POWER_RANKING_WEEKS.find(w => w.weekIndex === label)
  if (!series || !point || !weekLabel) return null

  return (
    <div
      style={{
        backgroundColor: '#393939',
        border: '1px solid #525252',
        padding: '10px 14px',
        fontFamily: "'IBM Plex Sans', sans-serif",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, color: series.color, marginBottom: 2 }}>
        {series.label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d', marginBottom: 8 }}>
        {weekLabel.season} · Week {weekLabel.week}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: '#f4f4f4' }}>
        Rank #{point.rank}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c6c6c6', marginTop: 2 }}>
        {point.wins}-{point.losses}{point.ties > 0 ? `-${point.ties}` : ''} all-play
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8d8d8d' }}>
        {(point.winPct * 100).toFixed(1)}% win rate
      </div>
    </div>
  )
}

function LegendChip({
  series, hovered, onEnter, onLeave,
}: {
  series: FranchisePowerSeries
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const point = finalPoint(series)
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        backgroundColor: hovered ? '#393939' : '#262626',
        border: `1px solid ${hovered ? series.color : '#393939'}`,
        cursor: 'default',
        transition: 'background-color 150ms cubic-bezier(0.2,0,0.38,0.9)',
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: series.color, flexShrink: 0 }} />
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 12, color: '#f4f4f4' }}>
        {series.label}
      </span>
      {point && (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#8d8d8d' }}>
          #{point.rank} · {point.wins}-{point.losses}{point.ties > 0 ? `-${point.ties}` : ''}
        </span>
      )}
      {series.retired && (
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6f6f6f' }}>
          retired {series.retiredAfterSeason}
        </span>
      )}
    </div>
  )
}

export default function PowerRankingChart() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const activeSeries = useMemo(
    () =>
      FRANCHISE_POWER_SERIES
        .filter(s => !s.retired)
        .sort((a, b) => (finalPoint(a)?.rank ?? 999) - (finalPoint(b)?.rank ?? 999)),
    [],
  )
  const retiredSeries = useMemo(
    () =>
      FRANCHISE_POWER_SERIES
        .filter(s => s.retired)
        .sort((a, b) => (finalPoint(a)?.rank ?? 999) - (finalPoint(b)?.rank ?? 999)),
    [],
  )

  return (
    <div>
      <div style={{ backgroundColor: '#262626', border: '1px solid #393939', padding: '20px 20px 8px' }}>
        <ResponsiveContainer width="100%" height={440}>
          <LineChart data={POWER_RANKING_ROWS} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#393939" strokeDasharray="0" horizontal={false} />
            <XAxis
              dataKey="weekIndex"
              type="number"
              domain={[1, POWER_RANKING_ROWS.length]}
              ticks={SEASON_TICK_INDICES}
              tickFormatter={v => String(SEASON_BY_TICK.get(v) ?? '')}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={{ stroke: '#393939' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              domain={[1, POWER_RANKING_MAX_RANK]}
              reversed
              allowDecimals={false}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#8d8d8d' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<PowerTooltip hoveredId={hoveredId} />} />
            {FRANCHISE_POWER_SERIES.map(s => (
              <Line
                key={s.franchiseId}
                dataKey={s.franchiseId}
                stroke={s.color}
                strokeWidth={hoveredId === s.franchiseId ? 4 : 2.5}
                strokeOpacity={hoveredId === null ? 0.7 : hoveredId === s.franchiseId ? 1 : 0.12}
                dot={false}
                type="monotone"
                isAnimationActive={false}
                connectNulls={false}
                onMouseEnter={() => setHoveredId(s.franchiseId)}
                onMouseLeave={() => setHoveredId(null)}
                activeDot={{ r: 4, fill: s.color, stroke: '#161616', strokeWidth: 1 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 11,
            color: '#8d8d8d',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Currently active
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {activeSeries.map(s => (
            <LegendChip
              key={s.franchiseId}
              series={s}
              hovered={hoveredId === s.franchiseId}
              onEnter={() => setHoveredId(s.franchiseId)}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>

        {retiredSeries.length > 0 && (
          <>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 11,
                color: '#8d8d8d',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Retired
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {retiredSeries.map(s => (
                <LegendChip
                  key={s.franchiseId}
                  series={s}
                  hovered={hoveredId === s.franchiseId}
                  onEnter={() => setHoveredId(s.franchiseId)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
